import { z } from 'zod';
export declare const ToolTagSchema: z.ZodEnum<["reads_untrusted", "reads_private", "writes_external", "writes_internal", "destructive"]>;
export type ToolTag = z.infer<typeof ToolTagSchema>;
export declare const TagStatusSchema: z.ZodEnum<["pending", "suggested", "confirmed"]>;
export type TagStatus = z.infer<typeof TagStatusSchema>;
export declare const ToolDefinitionSchema: z.ZodObject<{
    server: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    inputSchema: z.ZodRecord<z.ZodString, z.ZodAny>;
    tags: z.ZodDefault<z.ZodArray<z.ZodEnum<["reads_untrusted", "reads_private", "writes_external", "writes_internal", "destructive"]>, "many">>;
    tagStatus: z.ZodDefault<z.ZodEnum<["pending", "suggested", "confirmed"]>>;
    suggestedTags: z.ZodOptional<z.ZodArray<z.ZodEnum<["reads_untrusted", "reads_private", "writes_external", "writes_internal", "destructive"]>, "many">>;
    contentHash: z.ZodString;
    updatedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    server: string;
    name: string;
    description: string;
    inputSchema: Record<string, any>;
    tags: ("reads_untrusted" | "reads_private" | "writes_external" | "writes_internal" | "destructive")[];
    tagStatus: "pending" | "suggested" | "confirmed";
    contentHash: string;
    suggestedTags?: ("reads_untrusted" | "reads_private" | "writes_external" | "writes_internal" | "destructive")[] | undefined;
    updatedAt?: string | undefined;
}, {
    server: string;
    name: string;
    description: string;
    inputSchema: Record<string, any>;
    contentHash: string;
    tags?: ("reads_untrusted" | "reads_private" | "writes_external" | "writes_internal" | "destructive")[] | undefined;
    tagStatus?: "pending" | "suggested" | "confirmed" | undefined;
    suggestedTags?: ("reads_untrusted" | "reads_private" | "writes_external" | "writes_internal" | "destructive")[] | undefined;
    updatedAt?: string | undefined;
}>;
export type ToolDefinition = z.infer<typeof ToolDefinitionSchema>;
export declare const ExtractedCallSchema: z.ZodObject<{
    server: z.ZodString;
    tool: z.ZodString;
    line: z.ZodNumber;
    column: z.ZodOptional<z.ZodNumber>;
    inLoop: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    server: string;
    tool: string;
    line: number;
    inLoop: boolean;
    column?: number | undefined;
}, {
    server: string;
    tool: string;
    line: number;
    column?: number | undefined;
    inLoop?: boolean | undefined;
}>;
export type ExtractedCall = z.infer<typeof ExtractedCallSchema>;
export declare const AnalysisResultSchema: z.ZodObject<{
    valid: z.ZodBoolean;
    sha256: z.ZodString;
    calls: z.ZodArray<z.ZodObject<{
        server: z.ZodString;
        tool: z.ZodString;
        line: z.ZodNumber;
        column: z.ZodOptional<z.ZodNumber>;
        inLoop: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        server: string;
        tool: string;
        line: number;
        inLoop: boolean;
        column?: number | undefined;
    }, {
        server: string;
        tool: string;
        line: number;
        column?: number | undefined;
        inLoop?: boolean | undefined;
    }>, "many">;
    uniqueToolKeys: z.ZodArray<z.ZodString, "many">;
    tags: z.ZodArray<z.ZodEnum<["reads_untrusted", "reads_private", "writes_external", "writes_internal", "destructive"]>, "many">;
    errors: z.ZodDefault<z.ZodArray<z.ZodObject<{
        line: z.ZodNumber;
        message: z.ZodString;
        code: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        message: string;
        line: number;
        code?: string | undefined;
    }, {
        message: string;
        line: number;
        code?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    valid: boolean;
    tags: ("reads_untrusted" | "reads_private" | "writes_external" | "writes_internal" | "destructive")[];
    sha256: string;
    calls: {
        server: string;
        tool: string;
        line: number;
        inLoop: boolean;
        column?: number | undefined;
    }[];
    uniqueToolKeys: string[];
    errors: {
        message: string;
        line: number;
        code?: string | undefined;
    }[];
}, {
    valid: boolean;
    tags: ("reads_untrusted" | "reads_private" | "writes_external" | "writes_internal" | "destructive")[];
    sha256: string;
    calls: {
        server: string;
        tool: string;
        line: number;
        column?: number | undefined;
        inLoop?: boolean | undefined;
    }[];
    uniqueToolKeys: string[];
    errors?: {
        message: string;
        line: number;
        code?: string | undefined;
    }[] | undefined;
}>;
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
export declare const PolicyActionSchema: z.ZodEnum<["allow", "hold", "deny"]>;
export type PolicyAction = z.infer<typeof PolicyActionSchema>;
export declare const PolicyRuleConditionSchema: z.ZodObject<{
    all: z.ZodOptional<z.ZodArray<z.ZodEnum<["reads_untrusted", "reads_private", "writes_external", "writes_internal", "destructive"]>, "many">>;
    any: z.ZodOptional<z.ZodArray<z.ZodEnum<["reads_untrusted", "reads_private", "writes_external", "writes_internal", "destructive"]>, "many">>;
    none: z.ZodOptional<z.ZodArray<z.ZodEnum<["reads_untrusted", "reads_private", "writes_external", "writes_internal", "destructive"]>, "many">>;
    tool_outside_agent_scope: z.ZodOptional<z.ZodBoolean>;
    write_call_in_loop: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    all?: ("reads_untrusted" | "reads_private" | "writes_external" | "writes_internal" | "destructive")[] | undefined;
    any?: ("reads_untrusted" | "reads_private" | "writes_external" | "writes_internal" | "destructive")[] | undefined;
    none?: ("reads_untrusted" | "reads_private" | "writes_external" | "writes_internal" | "destructive")[] | undefined;
    tool_outside_agent_scope?: boolean | undefined;
    write_call_in_loop?: boolean | undefined;
}, {
    all?: ("reads_untrusted" | "reads_private" | "writes_external" | "writes_internal" | "destructive")[] | undefined;
    any?: ("reads_untrusted" | "reads_private" | "writes_external" | "writes_internal" | "destructive")[] | undefined;
    none?: ("reads_untrusted" | "reads_private" | "writes_external" | "writes_internal" | "destructive")[] | undefined;
    tool_outside_agent_scope?: boolean | undefined;
    write_call_in_loop?: boolean | undefined;
}>;
export type PolicyRuleCondition = z.infer<typeof PolicyRuleConditionSchema>;
export declare const PolicyRuleSchema: z.ZodObject<{
    id: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    when: z.ZodObject<{
        all: z.ZodOptional<z.ZodArray<z.ZodEnum<["reads_untrusted", "reads_private", "writes_external", "writes_internal", "destructive"]>, "many">>;
        any: z.ZodOptional<z.ZodArray<z.ZodEnum<["reads_untrusted", "reads_private", "writes_external", "writes_internal", "destructive"]>, "many">>;
        none: z.ZodOptional<z.ZodArray<z.ZodEnum<["reads_untrusted", "reads_private", "writes_external", "writes_internal", "destructive"]>, "many">>;
        tool_outside_agent_scope: z.ZodOptional<z.ZodBoolean>;
        write_call_in_loop: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        all?: ("reads_untrusted" | "reads_private" | "writes_external" | "writes_internal" | "destructive")[] | undefined;
        any?: ("reads_untrusted" | "reads_private" | "writes_external" | "writes_internal" | "destructive")[] | undefined;
        none?: ("reads_untrusted" | "reads_private" | "writes_external" | "writes_internal" | "destructive")[] | undefined;
        tool_outside_agent_scope?: boolean | undefined;
        write_call_in_loop?: boolean | undefined;
    }, {
        all?: ("reads_untrusted" | "reads_private" | "writes_external" | "writes_internal" | "destructive")[] | undefined;
        any?: ("reads_untrusted" | "reads_private" | "writes_external" | "writes_internal" | "destructive")[] | undefined;
        none?: ("reads_untrusted" | "reads_private" | "writes_external" | "writes_internal" | "destructive")[] | undefined;
        tool_outside_agent_scope?: boolean | undefined;
        write_call_in_loop?: boolean | undefined;
    }>;
    action: z.ZodEnum<["allow", "hold", "deny"]>;
    message: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    when: {
        all?: ("reads_untrusted" | "reads_private" | "writes_external" | "writes_internal" | "destructive")[] | undefined;
        any?: ("reads_untrusted" | "reads_private" | "writes_external" | "writes_internal" | "destructive")[] | undefined;
        none?: ("reads_untrusted" | "reads_private" | "writes_external" | "writes_internal" | "destructive")[] | undefined;
        tool_outside_agent_scope?: boolean | undefined;
        write_call_in_loop?: boolean | undefined;
    };
    action: "allow" | "hold" | "deny";
    message?: string | undefined;
    description?: string | undefined;
}, {
    id: string;
    when: {
        all?: ("reads_untrusted" | "reads_private" | "writes_external" | "writes_internal" | "destructive")[] | undefined;
        any?: ("reads_untrusted" | "reads_private" | "writes_external" | "writes_internal" | "destructive")[] | undefined;
        none?: ("reads_untrusted" | "reads_private" | "writes_external" | "writes_internal" | "destructive")[] | undefined;
        tool_outside_agent_scope?: boolean | undefined;
        write_call_in_loop?: boolean | undefined;
    };
    action: "allow" | "hold" | "deny";
    message?: string | undefined;
    description?: string | undefined;
}>;
export type PolicyRule = z.infer<typeof PolicyRuleSchema>;
export declare const PolicyDocumentSchema: z.ZodObject<{
    version: z.ZodNumber;
    rules: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        when: z.ZodObject<{
            all: z.ZodOptional<z.ZodArray<z.ZodEnum<["reads_untrusted", "reads_private", "writes_external", "writes_internal", "destructive"]>, "many">>;
            any: z.ZodOptional<z.ZodArray<z.ZodEnum<["reads_untrusted", "reads_private", "writes_external", "writes_internal", "destructive"]>, "many">>;
            none: z.ZodOptional<z.ZodArray<z.ZodEnum<["reads_untrusted", "reads_private", "writes_external", "writes_internal", "destructive"]>, "many">>;
            tool_outside_agent_scope: z.ZodOptional<z.ZodBoolean>;
            write_call_in_loop: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            all?: ("reads_untrusted" | "reads_private" | "writes_external" | "writes_internal" | "destructive")[] | undefined;
            any?: ("reads_untrusted" | "reads_private" | "writes_external" | "writes_internal" | "destructive")[] | undefined;
            none?: ("reads_untrusted" | "reads_private" | "writes_external" | "writes_internal" | "destructive")[] | undefined;
            tool_outside_agent_scope?: boolean | undefined;
            write_call_in_loop?: boolean | undefined;
        }, {
            all?: ("reads_untrusted" | "reads_private" | "writes_external" | "writes_internal" | "destructive")[] | undefined;
            any?: ("reads_untrusted" | "reads_private" | "writes_external" | "writes_internal" | "destructive")[] | undefined;
            none?: ("reads_untrusted" | "reads_private" | "writes_external" | "writes_internal" | "destructive")[] | undefined;
            tool_outside_agent_scope?: boolean | undefined;
            write_call_in_loop?: boolean | undefined;
        }>;
        action: z.ZodEnum<["allow", "hold", "deny"]>;
        message: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        when: {
            all?: ("reads_untrusted" | "reads_private" | "writes_external" | "writes_internal" | "destructive")[] | undefined;
            any?: ("reads_untrusted" | "reads_private" | "writes_external" | "writes_internal" | "destructive")[] | undefined;
            none?: ("reads_untrusted" | "reads_private" | "writes_external" | "writes_internal" | "destructive")[] | undefined;
            tool_outside_agent_scope?: boolean | undefined;
            write_call_in_loop?: boolean | undefined;
        };
        action: "allow" | "hold" | "deny";
        message?: string | undefined;
        description?: string | undefined;
    }, {
        id: string;
        when: {
            all?: ("reads_untrusted" | "reads_private" | "writes_external" | "writes_internal" | "destructive")[] | undefined;
            any?: ("reads_untrusted" | "reads_private" | "writes_external" | "writes_internal" | "destructive")[] | undefined;
            none?: ("reads_untrusted" | "reads_private" | "writes_external" | "writes_internal" | "destructive")[] | undefined;
            tool_outside_agent_scope?: boolean | undefined;
            write_call_in_loop?: boolean | undefined;
        };
        action: "allow" | "hold" | "deny";
        message?: string | undefined;
        description?: string | undefined;
    }>, "many">;
    default: z.ZodDefault<z.ZodEnum<["allow", "hold", "deny"]>>;
    updatedAt: z.ZodString;
    updatedBy: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    updatedAt: string;
    version: number;
    rules: {
        id: string;
        when: {
            all?: ("reads_untrusted" | "reads_private" | "writes_external" | "writes_internal" | "destructive")[] | undefined;
            any?: ("reads_untrusted" | "reads_private" | "writes_external" | "writes_internal" | "destructive")[] | undefined;
            none?: ("reads_untrusted" | "reads_private" | "writes_external" | "writes_internal" | "destructive")[] | undefined;
            tool_outside_agent_scope?: boolean | undefined;
            write_call_in_loop?: boolean | undefined;
        };
        action: "allow" | "hold" | "deny";
        message?: string | undefined;
        description?: string | undefined;
    }[];
    default: "allow" | "hold" | "deny";
    updatedBy?: string | undefined;
}, {
    updatedAt: string;
    version: number;
    rules: {
        id: string;
        when: {
            all?: ("reads_untrusted" | "reads_private" | "writes_external" | "writes_internal" | "destructive")[] | undefined;
            any?: ("reads_untrusted" | "reads_private" | "writes_external" | "writes_internal" | "destructive")[] | undefined;
            none?: ("reads_untrusted" | "reads_private" | "writes_external" | "writes_internal" | "destructive")[] | undefined;
            tool_outside_agent_scope?: boolean | undefined;
            write_call_in_loop?: boolean | undefined;
        };
        action: "allow" | "hold" | "deny";
        message?: string | undefined;
        description?: string | undefined;
    }[];
    default?: "allow" | "hold" | "deny" | undefined;
    updatedBy?: string | undefined;
}>;
export type PolicyDocument = z.infer<typeof PolicyDocumentSchema>;
export declare const PolicyEvaluationResultSchema: z.ZodObject<{
    decision: z.ZodEnum<["allow", "hold", "deny"]>;
    version: z.ZodNumber;
    matchedRules: z.ZodArray<z.ZodString, "many">;
    reasons: z.ZodArray<z.ZodString, "many">;
    flaggedFlows: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    version: number;
    decision: "allow" | "hold" | "deny";
    matchedRules: string[];
    reasons: string[];
    flaggedFlows: string[];
}, {
    version: number;
    decision: "allow" | "hold" | "deny";
    matchedRules: string[];
    reasons: string[];
    flaggedFlows?: string[] | undefined;
}>;
export type PolicyEvaluationResult = z.infer<typeof PolicyEvaluationResultSchema>;
export declare const ApprovalStatusSchema: z.ZodEnum<["pending", "approved", "denied", "expired"]>;
export type ApprovalStatus = z.infer<typeof ApprovalStatusSchema>;
export declare const ApprovalDocumentSchema: z.ZodObject<{
    id: z.ZodString;
    orgId: z.ZodString;
    agentId: z.ZodString;
    scriptHash: z.ZodString;
    code: z.ZodString;
    intent: z.ZodOptional<z.ZodString>;
    flaggedFlows: z.ZodArray<z.ZodString, "many">;
    explanation: z.ZodString;
    status: z.ZodEnum<["pending", "approved", "denied", "expired"]>;
    policyVersion: z.ZodNumber;
    createdAt: z.ZodString;
    expiresAt: z.ZodString;
    decidedBy: z.ZodOptional<z.ZodString>;
    decidedAt: z.ZodOptional<z.ZodString>;
    decisionNote: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    code: string;
    status: "pending" | "approved" | "denied" | "expired";
    id: string;
    flaggedFlows: string[];
    orgId: string;
    agentId: string;
    scriptHash: string;
    explanation: string;
    policyVersion: number;
    createdAt: string;
    expiresAt: string;
    intent?: string | undefined;
    decidedBy?: string | undefined;
    decidedAt?: string | undefined;
    decisionNote?: string | undefined;
}, {
    code: string;
    status: "pending" | "approved" | "denied" | "expired";
    id: string;
    flaggedFlows: string[];
    orgId: string;
    agentId: string;
    scriptHash: string;
    explanation: string;
    policyVersion: number;
    createdAt: string;
    expiresAt: string;
    intent?: string | undefined;
    decidedBy?: string | undefined;
    decidedAt?: string | undefined;
    decisionNote?: string | undefined;
}>;
export type ApprovalDocument = z.infer<typeof ApprovalDocumentSchema>;
export declare const ExecutionResultSchema: z.ZodObject<{
    status: z.ZodEnum<["completed", "failed", "timed_out", "denied"]>;
    result: z.ZodOptional<z.ZodUnknown>;
    logs: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    toolCallCount: z.ZodDefault<z.ZodNumber>;
    wallClockMs: z.ZodDefault<z.ZodNumber>;
    error: z.ZodOptional<z.ZodString>;
    tokensUsed: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    status: "denied" | "completed" | "failed" | "timed_out";
    logs: string[];
    toolCallCount: number;
    wallClockMs: number;
    result?: unknown;
    error?: string | undefined;
    tokensUsed?: number | undefined;
}, {
    status: "denied" | "completed" | "failed" | "timed_out";
    result?: unknown;
    logs?: string[] | undefined;
    toolCallCount?: number | undefined;
    wallClockMs?: number | undefined;
    error?: string | undefined;
    tokensUsed?: number | undefined;
}>;
export type ExecutionResult = z.infer<typeof ExecutionResultSchema>;
export declare const AuditEventTypeSchema: z.ZodEnum<["script_submitted", "policy_evaluated", "script_held", "script_approved", "script_denied", "execution_started", "tool_called", "execution_completed", "agent_suspended", "agent_resumed", "user_login", "admin_action"]>;
export type AuditEventType = z.infer<typeof AuditEventTypeSchema>;
export declare const AuditEventSchema: z.ZodObject<{
    id: z.ZodString;
    timestamp: z.ZodString;
    orgId: z.ZodString;
    eventType: z.ZodEnum<["script_submitted", "policy_evaluated", "script_held", "script_approved", "script_denied", "execution_started", "tool_called", "execution_completed", "agent_suspended", "agent_resumed", "user_login", "admin_action"]>;
    agentId: z.ZodOptional<z.ZodString>;
    userId: z.ZodOptional<z.ZodString>;
    scriptHash: z.ZodOptional<z.ZodString>;
    approvalId: z.ZodOptional<z.ZodString>;
    details: z.ZodRecord<z.ZodString, z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    id: string;
    orgId: string;
    timestamp: string;
    eventType: "script_submitted" | "policy_evaluated" | "script_held" | "script_approved" | "script_denied" | "execution_started" | "tool_called" | "execution_completed" | "agent_suspended" | "agent_resumed" | "user_login" | "admin_action";
    details: Record<string, any>;
    agentId?: string | undefined;
    scriptHash?: string | undefined;
    userId?: string | undefined;
    approvalId?: string | undefined;
}, {
    id: string;
    orgId: string;
    timestamp: string;
    eventType: "script_submitted" | "policy_evaluated" | "script_held" | "script_approved" | "script_denied" | "execution_started" | "tool_called" | "execution_completed" | "agent_suspended" | "agent_resumed" | "user_login" | "admin_action";
    details: Record<string, any>;
    agentId?: string | undefined;
    scriptHash?: string | undefined;
    userId?: string | undefined;
    approvalId?: string | undefined;
}>;
export type AuditEvent = z.infer<typeof AuditEventSchema>;
export declare const AgentStatusSchema: z.ZodEnum<["active", "suspended"]>;
export type AgentStatus = z.infer<typeof AgentStatusSchema>;
export declare const AgentRecordSchema: z.ZodObject<{
    id: z.ZodString;
    orgId: z.ZodString;
    name: z.ZodString;
    keyPrefix: z.ZodString;
    keyHash: z.ZodString;
    scopes: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    budgetDailyTokens: z.ZodDefault<z.ZodNumber>;
    rateLimitPerMin: z.ZodDefault<z.ZodNumber>;
    status: z.ZodDefault<z.ZodEnum<["active", "suspended"]>>;
    createdAt: z.ZodString;
    lastUsedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "active" | "suspended";
    name: string;
    id: string;
    orgId: string;
    createdAt: string;
    keyPrefix: string;
    keyHash: string;
    scopes: string[];
    budgetDailyTokens: number;
    rateLimitPerMin: number;
    lastUsedAt?: string | undefined;
}, {
    name: string;
    id: string;
    orgId: string;
    createdAt: string;
    keyPrefix: string;
    keyHash: string;
    status?: "active" | "suspended" | undefined;
    scopes?: string[] | undefined;
    budgetDailyTokens?: number | undefined;
    rateLimitPerMin?: number | undefined;
    lastUsedAt?: string | undefined;
}>;
export type AgentRecord = z.infer<typeof AgentRecordSchema>;
//# sourceMappingURL=schemas.d.ts.map