import type {
  AnalysisResult,
  PolicyAction,
  PolicyDocument,
  PolicyEvaluationResult,
  PolicyRule,
  ToolTag,
} from '@airlock/shared';

export const DEFAULT_POLICY: PolicyDocument = {
  version: 1,
  rules: [
    {
      id: 'R1',
      description: 'Untrusted read and external write data flow',
      when: { all: ['reads_untrusted', 'writes_external'] },
      action: 'hold',
      message: 'Script reads untrusted external data and writes to an external endpoint.',
    },
    {
      id: 'R2',
      description: 'Private read and external write exfiltration risk',
      when: { all: ['reads_private', 'writes_external'] },
      action: 'hold',
      message: 'Script reads private internal records and writes to an external sink.',
    },
    {
      id: 'R3',
      description: 'Destructive tool operation',
      when: { any: ['destructive'] },
      action: 'hold',
      message: 'Script invokes a potentially irreversible destructive tool.',
    },
    {
      id: 'R4',
      description: 'Tool outside agent scope',
      when: { tool_outside_agent_scope: true },
      action: 'deny',
      message: 'Script invokes tools not permitted by the agent credentials scope.',
    },
    {
      id: 'R5',
      description: 'Write or destructive action inside loop',
      when: { write_call_in_loop: true },
      action: 'hold',
      message: 'Script performs write or destructive calls inside a loop context.',
    },
  ],
  default: 'allow',
  updatedAt: new Date().toISOString(),
  updatedBy: 'system',
};

export interface EvaluatePolicyOptions {
  policy?: PolicyDocument;
  analysis: AnalysisResult;
  agentScopes?: string[]; // e.g. ["*"] or ["inbox.*"]
  toolTagMap?: Record<string, ToolTag[]>; // "server.tool" -> tags
}

export function evaluatePolicy(options: EvaluatePolicyOptions): PolicyEvaluationResult {
  const policy = options.policy || DEFAULT_POLICY;
  const analysis = options.analysis;
  const scopes = options.agentScopes || ['*'];
  const toolTagMap = options.toolTagMap || {};

  // If analysis itself found syntax or AST errors, policy fails closed with deny
  if (!analysis.valid) {
    return {
      decision: 'deny',
      version: policy.version,
      matchedRules: ['PARSE_ERROR'],
      reasons: analysis.errors.map((e) => `Line ${e.line}: ${e.message}`),
      flaggedFlows: [],
    };
  }

  const scriptTags = new Set<ToolTag>(analysis.tags);
  // Also collect tags directly from toolTagMap for every extracted call
  for (const call of analysis.calls) {
    const key = `${call.server}.${call.tool}`;
    const tags = toolTagMap[key] || [];
    for (const t of tags) {
      scriptTags.add(t);
    }
  }

  // Check agent scope violations
  const isOutOfScope = analysis.calls.some((call) => {
    const fullKey = `${call.server}.${call.tool}`;
    const serverWildcard = `${call.server}.*`;
    return !scopes.some((scope) => scope === '*' || scope === fullKey || scope === serverWildcard);
  });

  // Check write/destructive in loop
  const hasWriteInLoop = analysis.calls.some((call) => {
    if (!call.inLoop) return false;
    const key = `${call.server}.${call.tool}`;
    const tags = toolTagMap[key] || [];
    return tags.some((t) => t === 'writes_external' || t === 'writes_internal' || t === 'destructive');
  });

  const matchedRules: PolicyRule[] = [];
  const flaggedFlows: string[] = [];

  for (const rule of policy.rules) {
    let matches = true;

    if (rule.when.all && rule.when.all.length > 0) {
      const hasAll = rule.when.all.every((t) => scriptTags.has(t));
      if (!hasAll) matches = false;
      else if (rule.when.all.includes('reads_untrusted') && rule.when.all.includes('writes_external')) {
        flaggedFlows.push('reads_untrusted -> writes_external');
      } else if (rule.when.all.includes('reads_private') && rule.when.all.includes('writes_external')) {
        flaggedFlows.push('reads_private -> writes_external');
      }
    }

    if (matches && rule.when.any && rule.when.any.length > 0) {
      const hasAny = rule.when.any.some((t) => scriptTags.has(t));
      if (!hasAny) matches = false;
      else if (rule.when.any.includes('destructive') && scriptTags.has('destructive')) {
        flaggedFlows.push('destructive_call');
      }
    }

    if (matches && rule.when.none && rule.when.none.length > 0) {
      const hasNone = rule.when.none.every((t) => !scriptTags.has(t));
      if (!hasNone) matches = false;
    }

    if (matches && rule.when.tool_outside_agent_scope === true) {
      if (!isOutOfScope) matches = false;
      else flaggedFlows.push('out_of_scope_tool');
    }

    if (matches && rule.when.write_call_in_loop === true) {
      if (!hasWriteInLoop) matches = false;
      else flaggedFlows.push('write_in_loop');
    }

    if (matches) {
      matchedRules.push(rule);
    }
  }

  // Precedence: DENY > HOLD > ALLOW
  let finalDecision: PolicyAction = policy.default || 'allow';
  if (matchedRules.some((r) => r.action === 'deny')) {
    finalDecision = 'deny';
  } else if (matchedRules.some((r) => r.action === 'hold')) {
    finalDecision = 'hold';
  } else if (matchedRules.some((r) => r.action === 'allow')) {
    finalDecision = 'allow';
  }

  const reasons = matchedRules
    .map((r) => r.message || r.description || `Matched rule ${r.id}`)
    .filter(Boolean);

  return {
    decision: finalDecision,
    version: policy.version,
    matchedRules: matchedRules.map((r) => r.id),
    reasons,
    flaggedFlows,
  };
}
