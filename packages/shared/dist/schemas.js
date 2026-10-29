"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentRecordSchema = exports.AgentStatusSchema = exports.AuditEventSchema = exports.AuditEventTypeSchema = exports.ExecutionResultSchema = exports.ApprovalDocumentSchema = exports.ApprovalStatusSchema = exports.PolicyEvaluationResultSchema = exports.PolicyDocumentSchema = exports.PolicyRuleSchema = exports.PolicyRuleConditionSchema = exports.PolicyActionSchema = exports.AnalysisResultSchema = exports.ExtractedCallSchema = exports.ToolDefinitionSchema = exports.TagStatusSchema = exports.ToolTagSchema = void 0;
const zod_1 = require("zod");
// ==========================================
// Tool Tagging & Catalog Schemas
// ==========================================
exports.ToolTagSchema = zod_1.z.enum([
    'reads_untrusted',
    'reads_private',
    'writes_external',
    'writes_internal',
    'destructive',
]);
exports.TagStatusSchema = zod_1.z.enum(['pending', 'suggested', 'confirmed']);
exports.ToolDefinitionSchema = zod_1.z.object({
    server: zod_1.z.string(),
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    inputSchema: zod_1.z.record(zod_1.z.any()),
    tags: zod_1.z.array(exports.ToolTagSchema).default([]),
    tagStatus: exports.TagStatusSchema.default('pending'),
    suggestedTags: zod_1.z.array(exports.ToolTagSchema).optional(),
    contentHash: zod_1.z.string(),
    updatedAt: zod_1.z.string().datetime().optional(),
});
// ==========================================
// Script Analysis & AST Schemas
// ==========================================
exports.ExtractedCallSchema = zod_1.z.object({
    server: zod_1.z.string(),
    tool: zod_1.z.string(),
    line: zod_1.z.number(),
    column: zod_1.z.number().optional(),
    inLoop: zod_1.z.boolean().default(false),
});
exports.AnalysisResultSchema = zod_1.z.object({
    valid: zod_1.z.boolean(),
    sha256: zod_1.z.string(),
    calls: zod_1.z.array(exports.ExtractedCallSchema),
    uniqueToolKeys: zod_1.z.array(zod_1.z.string()), // formatted as "server.tool"
    tags: zod_1.z.array(exports.ToolTagSchema),
    errors: zod_1.z.array(zod_1.z.object({
        line: zod_1.z.number(),
        message: zod_1.z.string(),
        code: zod_1.z.string().optional(),
    })).default([]),
});
// ==========================================
// Policy Schemas
// ==========================================
exports.PolicyActionSchema = zod_1.z.enum(['allow', 'hold', 'deny']);
exports.PolicyRuleConditionSchema = zod_1.z.object({
    all: zod_1.z.array(exports.ToolTagSchema).optional(),
    any: zod_1.z.array(exports.ToolTagSchema).optional(),
    none: zod_1.z.array(exports.ToolTagSchema).optional(),
    tool_outside_agent_scope: zod_1.z.boolean().optional(),
    write_call_in_loop: zod_1.z.boolean().optional(),
});
exports.PolicyRuleSchema = zod_1.z.object({
    id: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    when: exports.PolicyRuleConditionSchema,
    action: exports.PolicyActionSchema,
    message: zod_1.z.string().optional(),
});
exports.PolicyDocumentSchema = zod_1.z.object({
    version: zod_1.z.number(),
    rules: zod_1.z.array(exports.PolicyRuleSchema),
    default: exports.PolicyActionSchema.default('allow'),
    updatedAt: zod_1.z.string().datetime(),
    updatedBy: zod_1.z.string().optional(),
});
exports.PolicyEvaluationResultSchema = zod_1.z.object({
    decision: exports.PolicyActionSchema,
    version: zod_1.z.number(),
    matchedRules: zod_1.z.array(zod_1.z.string()),
    reasons: zod_1.z.array(zod_1.z.string()),
    flaggedFlows: zod_1.z.array(zod_1.z.string()).default([]),
});
// ==========================================
// Approvals & Execution Schemas
// ==========================================
exports.ApprovalStatusSchema = zod_1.z.enum(['pending', 'approved', 'denied', 'expired']);
exports.ApprovalDocumentSchema = zod_1.z.object({
    id: zod_1.z.string(),
    orgId: zod_1.z.string(),
    agentId: zod_1.z.string(),
    scriptHash: zod_1.z.string(),
    code: zod_1.z.string(),
    intent: zod_1.z.string().optional(),
    flaggedFlows: zod_1.z.array(zod_1.z.string()),
    explanation: zod_1.z.string(),
    status: exports.ApprovalStatusSchema,
    policyVersion: zod_1.z.number(),
    createdAt: zod_1.z.string().datetime(),
    expiresAt: zod_1.z.string().datetime(),
    decidedBy: zod_1.z.string().optional(),
    decidedAt: zod_1.z.string().datetime().optional(),
    decisionNote: zod_1.z.string().optional(),
});
exports.ExecutionResultSchema = zod_1.z.object({
    status: zod_1.z.enum(['completed', 'failed', 'timed_out', 'denied']),
    result: zod_1.z.unknown().optional(),
    logs: zod_1.z.array(zod_1.z.string()).default([]),
    toolCallCount: zod_1.z.number().default(0),
    wallClockMs: zod_1.z.number().default(0),
    error: zod_1.z.string().optional(),
    tokensUsed: zod_1.z.number().optional(),
});
// ==========================================
// Audit Stream Event Schemas
// ==========================================
exports.AuditEventTypeSchema = zod_1.z.enum([
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
exports.AuditEventSchema = zod_1.z.object({
    id: zod_1.z.string(),
    timestamp: zod_1.z.string().datetime(),
    orgId: zod_1.z.string(),
    eventType: exports.AuditEventTypeSchema,
    agentId: zod_1.z.string().optional(),
    userId: zod_1.z.string().optional(),
    scriptHash: zod_1.z.string().optional(),
    approvalId: zod_1.z.string().optional(),
    details: zod_1.z.record(zod_1.z.any()),
});
// ==========================================
// Agent & Auth Schemas
// ==========================================
exports.AgentStatusSchema = zod_1.z.enum(['active', 'suspended']);
exports.AgentRecordSchema = zod_1.z.object({
    id: zod_1.z.string(),
    orgId: zod_1.z.string(),
    name: zod_1.z.string(),
    keyPrefix: zod_1.z.string(), // e.g. "alk_live_a1b2..."
    keyHash: zod_1.z.string(), // SHA-256 of full key
    scopes: zod_1.z.array(zod_1.z.string()).default(['*']), // allowed tool groups or server prefixes
    budgetDailyTokens: zod_1.z.number().default(1_000_000),
    rateLimitPerMin: zod_1.z.number().default(60),
    status: exports.AgentStatusSchema.default('active'),
    createdAt: zod_1.z.string().datetime(),
    lastUsedAt: zod_1.z.string().datetime().optional(),
});
//# sourceMappingURL=schemas.js.map