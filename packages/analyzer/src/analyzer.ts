import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { createHash } from 'node:crypto';
import type { AnalysisResult, ExtractedCall } from '@airlock/shared';

// Banned keywords & sensitive identifiers
const BANNED_IDENTIFIERS = new Set([
  'eval',
  'Function',
  'require',
  'import',
  'export',
  'globalThis',
  'self',
  'window',
  'process',
  'constructor',
  '__proto__',
  'prototype',
]);

const ALLOWED_NEW_CLASSES = new Set(['Map', 'Set', 'Date']);

export interface AnalyzerOptions {
  knownTagsByTool?: Record<string, string[]>; // e.g. "inbox.get_emails" -> ["reads_untrusted"]
}

export function analyzeScript(code: string, options: AnalyzerOptions = {}): AnalysisResult {
  const errors: { line: number; message: string; code?: string }[] = [];
  const calls: ExtractedCall[] = [];
  const uniqueToolKeys = new Set<string>();

  // Compute normalized SHA-256 hash
  const sha256 = createHash('sha256').update(code.trim()).digest('hex');

  let ast: acorn.Program;
  try {
    ast = acorn.parse(code, {
      ecmaVersion: 'latest',
      sourceType: 'module',
      locations: true,
      allowReturnOutsideFunction: true,
      allowAwaitOutsideFunction: true,
    }) as acorn.Program;
  } catch (err: any) {
    const line = err.loc ? err.loc.line : 1;
    return {
      valid: false,
      sha256,
      calls: [],
      uniqueToolKeys: [],
      tags: [],
      errors: [{ line, message: `Syntax error: ${err.message}`, code: 'SYNTAX_ERROR' }],
    };
  }

  // Walk the AST with loop tracking and syntax restrictions
  walk.ancestor(ast, {
    // 1. Variable declaration restrictions
    VariableDeclaration(node: any) {
      if (node.kind === 'var') {
        errors.push({
          line: node.loc.start.line,
          message: "'var' is not allowed. Use 'const' or 'let'.",
          code: 'DISALLOWED_VAR',
        });
      }
    },

    // 2. Disallowed syntax constructs
    ThisExpression(node: any) {
      errors.push({
        line: node.loc.start.line,
        message: "'this' expression is not permitted.",
        code: 'DISALLOWED_THIS',
      });
    },

    ClassDeclaration(node: any) {
      errors.push({
        line: node.loc.start.line,
        message: "Class declarations are not permitted in agent scripts.",
        code: 'DISALLOWED_CLASS',
      });
    },

    WithStatement(node: any) {
      errors.push({
        line: node.loc.start.line,
        message: "'with' statements are not permitted.",
        code: 'DISALLOWED_WITH',
      });
    },

    TaggedTemplateExpression(node: any) {
      errors.push({
        line: node.loc.start.line,
        message: "Tagged template expressions are not permitted.",
        code: 'DISALLOWED_TAGGED_TEMPLATE',
      });
    },

    // Member expression property checks (e.g. prototype traversal)
    MemberExpression(node: any) {
      if (!node.computed && node.property.type === 'Identifier') {
        const propName = node.property.name;
        if (propName === '__proto__' || propName === 'constructor' || propName === 'prototype') {
          errors.push({
            line: node.loc.start.line,
            message: `Disallowed property access '${propName}'. Prototype traversal is prohibited.`,
            code: 'BANNED_IDENTIFIER',
          });
        }
      }
    },

    LabeledStatement(node: any) {
      errors.push({
        line: node.loc.start.line,
        message: "Labeled statements are not permitted.",
        code: 'DISALLOWED_LABELS',
      });
    },

    // 3. New expression restrictions (only Map, Set, Date)
    NewExpression(node: any) {
      if (node.callee.type !== 'Identifier' || !ALLOWED_NEW_CLASSES.has(node.callee.name)) {
        errors.push({
          line: node.loc.start.line,
          message: `'new' is only allowed for ${Array.from(ALLOWED_NEW_CLASSES).join(', ')}.`,
          code: 'DISALLOWED_NEW',
        });
      }
    },

    // 4. Function generator & getter/setter restrictions
    FunctionDeclaration(node: any) {
      if (node.generator) {
        errors.push({
          line: node.loc.start.line,
          message: "Generator functions are not permitted.",
          code: 'DISALLOWED_GENERATOR',
        });
      }
    },
    FunctionExpression(node: any) {
      if (node.generator) {
        errors.push({
          line: node.loc.start.line,
          message: "Generator functions are not permitted.",
          code: 'DISALLOWED_GENERATOR',
        });
      }
    },

    // 5. Banned Identifiers check
    Identifier(node: any, ancestors: any[]) {
      const name = node.name;

      if (BANNED_IDENTIFIERS.has(name)) {
        // Prototype pollution identifiers are banned unconditionally everywhere
        const isPrototypeProperty = name === '__proto__' || name === 'constructor' || name === 'prototype';
        
        // For other banned identifiers, only allowed if it's an innocent property name (e.g. obj.window)
        const parent = ancestors[ancestors.length - 2];
        const isSafeProperty = !isPrototypeProperty && parent && parent.type === 'MemberExpression' && parent.property === node && !parent.computed;

        if (!isSafeProperty) {
          errors.push({
            line: node.loc.start.line,
            message: `Disallowed identifier '${name}'. Dynamic execution, environment inspection, and prototype manipulation are prohibited.`,
            code: 'BANNED_IDENTIFIER',
          });
        }
      }

      // 6. The 'tools' rule enforcement:
      // 'tools' can ONLY be used as tools.<server>.<tool>(...)
      if (name === 'tools') {
        const parent = ancestors[ancestors.length - 2];
        const grandParent = ancestors[ancestors.length - 3];
        const greatGrandParent = ancestors[ancestors.length - 4];

        const isServerAccess = parent && parent.type === 'MemberExpression' && parent.object === node && !parent.computed && parent.property.type === 'Identifier';
        const isToolAccess = grandParent && grandParent.type === 'MemberExpression' && grandParent.object === parent && !grandParent.computed && grandParent.property.type === 'Identifier';
        const isCallCallee = greatGrandParent && greatGrandParent.type === 'CallExpression' && greatGrandParent.callee === grandParent;

        if (!isServerAccess || !isToolAccess || !isCallCallee) {
          errors.push({
            line: node.loc.start.line,
            message: "The 'tools' object cannot be aliased, passed, destructured, or indexed dynamically. Must be called directly: tools.<server>.<tool>(...).",
            code: 'INVALID_TOOLS_USAGE',
          });
        }
      }
    },

    // 7. Tool Call Extraction
    CallExpression(node: any, ancestors: any[]) {
      const callee = node.callee;
      if (
        callee.type === 'MemberExpression' &&
        !callee.computed &&
        callee.property.type === 'Identifier' &&
        callee.object.type === 'MemberExpression' &&
        !callee.object.computed &&
        callee.object.property.type === 'Identifier' &&
        callee.object.object.type === 'Identifier' &&
        callee.object.object.name === 'tools'
      ) {
        const server = callee.object.property.name;
        const tool = callee.property.name;
        const toolKey = `${server}.${tool}`;

        // Determine if call is inside a loop
        const inLoop = ancestors.some(
          (a) =>
            a.type === 'ForStatement' ||
            a.type === 'ForOfStatement' ||
            a.type === 'ForInStatement' ||
            a.type === 'WhileStatement' ||
            a.type === 'DoWhileStatement'
        );

        calls.push({
          server,
          tool,
          line: node.loc.start.line,
          column: node.loc.start.column,
          inLoop,
        });

        uniqueToolKeys.add(toolKey);
      }
    },
  });

  // Collect union of tags from known tool catalog
  const tagsSet = new Set<string>();
  if (options.knownTagsByTool) {
    for (const key of uniqueToolKeys) {
      const toolTags = options.knownTagsByTool[key] || [];
      for (const t of toolTags) {
        tagsSet.add(t);
      }
    }
  }

  return {
    valid: errors.length === 0,
    sha256,
    calls,
    uniqueToolKeys: Array.from(uniqueToolKeys),
    tags: Array.from(tagsSet) as any,
    errors,
  };
}
