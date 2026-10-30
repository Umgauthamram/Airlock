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
  'Reflect',
  'Proxy',
]);

const ALLOWED_NEW_CLASSES = new Set(['Map', 'Set', 'Date']);

const BANNED_PROPERTIES = new Set(['__proto__', 'constructor', 'prototype']);
const BANNED_REFLECTION_METHODS = new Set([
  'getOwnPropertyNames',
  'getOwnPropertyDescriptors',
  'getOwnPropertyDescriptor',
  'getPrototypeOf',
  'setPrototypeOf',
  'defineProperty',
  'defineProperties',
]);
const GLOBAL_PRIMITIVES = new Set([
  'Object',
  'Array',
  'Function',
  'String',
  'Number',
  'Boolean',
  'Symbol',
  'Promise',
  'Map',
  'Set',
  'Date',
  'Math',
  'JSON',
  'RegExp',
  'Error',
]);

function extractPropertyName(propNode: any): string | null {
  if (!propNode) return null;
  if (propNode.type === 'Identifier') {
    return propNode.name;
  }
  if (propNode.type === 'Literal') {
    return String(propNode.value);
  }
  if (propNode.type === 'TemplateLiteral' && propNode.quasis && propNode.quasis.length === 1) {
    return propNode.quasis[0].value?.raw || propNode.quasis[0].value?.cooked || null;
  }
  return null;
}

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

    // Strict loop safety: block infinite loops
    WhileStatement(node: any) {
      if (
        (node.test.type === 'Literal' && Boolean(node.test.value) === true) ||
        (node.test.type === 'Identifier' && node.test.name === 'true')
      ) {
        errors.push({
          line: node.loc.start.line,
          message: "Unbounded 'while(true)' loops are strictly prohibited in agent scripts.",
          code: 'DISALLOWED_INFINITE_LOOP',
        });
      }
    },

    ForStatement(node: any) {
      if (!node.test && !node.init && !node.update) {
        errors.push({
          line: node.loc.start.line,
          message: "Unbounded 'for(;;)' loops are strictly prohibited in agent scripts.",
          code: 'DISALLOWED_INFINITE_LOOP',
        });
      }
    },

    DoWhileStatement(node: any) {
      if (
        (node.test.type === 'Literal' && Boolean(node.test.value) === true) ||
        (node.test.type === 'Identifier' && node.test.name === 'true')
      ) {
        errors.push({
          line: node.loc.start.line,
          message: "Unbounded 'do-while(true)' loops are strictly prohibited in agent scripts.",
          code: 'DISALLOWED_INFINITE_LOOP',
        });
      }
    },

    // Block non-tool await expressions inside loops (e.g. while(true){ await null } or while(true){ await Promise.resolve() })
    AwaitExpression(node: any, ancestors: any[]) {
      const inLoop = ancestors.some(
        (a) =>
          a.type === 'ForStatement' ||
          a.type === 'ForOfStatement' ||
          a.type === 'ForInStatement' ||
          a.type === 'WhileStatement' ||
          a.type === 'DoWhileStatement'
      );

      if (inLoop) {
        // Ensure the awaited expression is actually a tool call: tools.<server>.<tool>(...)
        const arg = node.argument;
        const isToolCall =
          arg &&
          arg.type === 'CallExpression' &&
          arg.callee &&
          arg.callee.type === 'MemberExpression' &&
          arg.callee.object &&
          arg.callee.object.type === 'MemberExpression' &&
          arg.callee.object.object &&
          arg.callee.object.object.type === 'Identifier' &&
          arg.callee.object.object.name === 'tools';

        if (!isToolCall) {
          errors.push({
            line: node.loc.start.line,
            message: "Awaiting non-tool expressions inside loops is prohibited to prevent event-loop starvation.",
            code: 'DISALLOWED_LOOP_AWAIT',
          });
        }
      }
    },

    TaggedTemplateExpression(node: any) {
      errors.push({
        line: node.loc.start.line,
        message: "Tagged template expressions are not permitted.",
        code: 'DISALLOWED_TAGGED_TEMPLATE',
      });
    },

    ImportExpression(node: any) {
      errors.push({
        line: node.loc.start.line,
        message: "Dynamic import() is not permitted in agent scripts.",
        code: 'DISALLOWED_IMPORT',
      });
    },

    // Member expression property checks (prototype traversal and constructor escapes)
    MemberExpression(node: any) {
      const propName = extractPropertyName(node.property);

      // 1. Block any member access to constructor, __proto__, or prototype
      if (propName && BANNED_PROPERTIES.has(propName)) {
        errors.push({
          line: node.loc.start.line,
          message: `Disallowed property access '${propName}'. Prototype traversal and constructor execution are prohibited.`,
          code: 'BANNED_IDENTIFIER',
        });
      }

      // Block reflection methods on Object/Reflect
      if (propName && BANNED_REFLECTION_METHODS.has(propName)) {
        errors.push({
          line: node.loc.start.line,
          message: `Disallowed reflection method '${propName}'. Dynamic property introspection is prohibited.`,
          code: 'BANNED_REFLECTION',
        });
      }

      // 2. Block computed member access on global primitives (e.g. Object['constructor'], Array[x])
      if (
        node.computed &&
        node.object.type === 'Identifier' &&
        GLOBAL_PRIMITIVES.has(node.object.name)
      ) {
        errors.push({
          line: node.loc.start.line,
          message: `Computed property access on global primitive '${node.object.name}' is prohibited.`,
          code: 'BANNED_COMPUTED_PRIMITIVE',
        });
      }

      // Block dynamic expressions in computed property access that attempt key synthesis (e.g. ['con','structor'].join(''), 'con'+'structor')
      if (node.computed) {
        if (node.property.type === 'CallExpression') {
          errors.push({
            line: node.loc.start.line,
            message: "Dynamic computed member access via function call is prohibited.",
            code: 'BANNED_DYNAMIC_COMPUTED',
          });
        } else if (node.property.type === 'BinaryExpression') {
          errors.push({
            line: node.loc.start.line,
            message: "Binary concatenated computed member expressions are prohibited.",
            code: 'BANNED_DYNAMIC_COMPUTED',
          });
        }
      }

      // 3. Block dynamic template literals with expressions inside computed properties (e.g. obj[`${'const' + 'ructor'}`])
      if (
        node.computed &&
        node.property.type === 'TemplateLiteral' &&
        node.property.expressions &&
        node.property.expressions.length > 0
      ) {
        errors.push({
          line: node.loc.start.line,
          message: "Dynamic computed template literals with expressions are not permitted.",
          code: 'DISALLOWED_DYNAMIC_MEMBER',
        });
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
