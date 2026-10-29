import { z } from 'zod';

// ==========================================
// Tool Tagging & Catalog Schemas
// ==========================================

export const ToolTagSchema = z.enum([
  'reads_untrusted',
  'reads_private',
  'writes_external',
  'writes_internal',
  'destructive',
]);
export type ToolTag = z.infer<typeof ToolTagSchema>;

export const TagStatusSchema = z.enum(['pending', 'suggested', 'confirmed']);
export type TagStatus = z.infer<typeof TagStatusSchema>;

export const ToolDefinitionSchema = z.object({
  server: z.string(),
  name: z.string(),
  description: z.string(),
  inputSchema: z.record(z.any()),
  tags: z.array(ToolTagSchema).default([]),
  tagStatus: TagStatusSchema.default('pending'),
  suggestedTags: z.array(ToolTagSchema).optional(),
  contentHash: z.string(),
  updatedAt: z.string().datetime().optional(),
});
export type ToolDefinition = z.infer<typeof ToolDefinitionSchema>;

// ==========================================
// Script Analysis & AST Schemas
// ==========================================

export const ExtractedCallSchema = z.object({
  server: z.string(),
  tool: z.string(),
  line: z.number(),
  column: z.number().optional(),
  inLoop: z.boolean().default(false),
});
export type ExtractedCall = z.infer<typeof ExtractedCallSchema>;

export const AnalysisResultSchema = z.object({
  valid: z.boolean(),
  sha256: z.string(),
  calls: z.array(ExtractedCallSchema),
  uniqueToolKeys: z.array(z.string()), // formatted as "server.tool"
  tags: z.array(ToolTagSchema),
  errors: z.array(
    z.object({
      line: z.number(),
      message: z.string(),
      code: z.string().optional(),
    })
  ).default([]),
});
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

// ==========================================
// Policy Schemas
// ==========================================

export const PolicyActionSchema = z.enum(['allow', 'hold', 'deny']);
export type PolicyAction = z.infer<typeof PolicyActionSchema>;

export const PolicyRuleConditionSchema = z.object({
  all: z.array(ToolTagSchema).optional(),
  any: z.array(ToolTagSchema).optional(),
  none: z.array(ToolTagSchema).optional(),
  tool_outside_agent_scope: z.boolean().optional(),
  write_call_in_loop: z.boolean().optional(),
});
export type PolicyRuleCondition = z.infer<typeof PolicyRuleConditionSchema>;

export const PolicyRuleSchema = z.object({
  id: z.string(),
  description: z.string().optional(),
  when: PolicyRuleConditionSchema,
  action: PolicyActionSchema,
  message: z.string().optional(),
});
export type PolicyRule = z.infer<typeof PolicyRuleSchema>;

export const PolicyDocumentSchema = z.object({
  version: z.number(),
  rules: z.array(PolicyRuleSchema),
  default: PolicyActionSchema.default('allow'),
  updatedAt: z.string().datetime(),
  updatedBy: z.string().optional(),
});
export type PolicyDocument = z.infer<typeof PolicyDocumentSchema>;

export const PolicyEvaluationResultSchema = z.object({
  decision: PolicyActionSchema,
  version: z.number(),
  matchedRules: z.array(z.string()),
  reasons: z.array(z.string()),
  flaggedFlows: z.array(z.string()).default([]),
});
export type PolicyEvaluationResult = z.infer<typeof PolicyEvaluationResultSchema>;

// ==========================================
// Approvals & Execution Schemas
// ==========================================

export const ApprovalStatusSchema = z.enum(['pending', 'approved', 'denied', 'expired']);
export type ApprovalStatus = z.infer<typeof ApprovalStatusSchema>;

export const ApprovalDocumentSchema = z.object({
  id: z.string(),
  orgId: z.string(),
  agentId: z.string(),
  scriptHash: z.string(),
  code: z.string(),
  intent: z.string().optional(),
  flaggedFlows: z.array(z.string()),
  explanation: z.string(),
  status: ApprovalStatusSchema,
  policyVersion: z.number(),
  createdAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  decidedBy: z.string().optional(),
  decidedAt: z.string().datetime().optional(),
  decisionNote: z.string().optional(),
});
export type ApprovalDocument = z.infer<typeof ApprovalDocumentSchema>;

export const ExecutionResultSchema = z.object({
  status: z.enum(['completed', 'failed', 'timed_out', 'denied']),
  result: z.unknown().optional(),
  logs: z.array(z.string()).default([]),
  toolCallCount: z.number().default(0),
  wallClockMs: z.number().default(0),
  error: z.string().optional(),
  tokensUsed: z.number().optional(),
});
export type ExecutionResult = z.infer<typeof ExecutionResultSchema>;

// ==========================================
// Audit Stream Event Schemas
// ==========================================

export const AuditEventTypeSchema = z.enum([
  'script_submitted',
  'policy_evaluated',
  'script_held',
  'script_approved',
  'script_denied',
  'execution_started',
  'tool_called',
  'execution_completed',
  'agent_suspended',
  'agent_resumed',
  'user_login',
  'admin_action',
]);
export type AuditEventType = z.infer<typeof AuditEventTypeSchema>;

export const AuditEventSchema = z.object({
  id: z.string(),
  timestamp: z.string().datetime(),
  orgId: z.string(),
  eventType: AuditEventTypeSchema,
  agentId: z.string().optional(),
  userId: z.string().optional(),
  scriptHash: z.string().optional(),
  approvalId: z.string().optional(),
  details: z.record(z.any()),
});
export type AuditEvent = z.infer<typeof AuditEventSchema>;

// ==========================================
// Agent & Auth Schemas
// ==========================================

export const AgentStatusSchema = z.enum(['active', 'suspended']);
export type AgentStatus = z.infer<typeof AgentStatusSchema>;

export const AgentRecordSchema = z.object({
  id: z.string(),
  orgId: z.string(),
  name: z.string(),
  keyPrefix: z.string(), // e.g. "alk_live_a1b2..."
  keyHash: z.string(), // SHA-256 of full key
  scopes: z.array(z.string()).default(['*']), // allowed tool groups or server prefixes
  budgetDailyTokens: z.number().default(1_000_000),
  rateLimitPerMin: z.number().default(60),
  status: AgentStatusSchema.default('active'),
  createdAt: z.string().datetime(),
  lastUsedAt: z.string().datetime().optional(),
});
export type AgentRecord = z.infer<typeof AgentRecordSchema>;
