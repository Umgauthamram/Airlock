import { createHash, randomUUID } from 'node:crypto';
import type {
  AgentRecord,
  AnalysisResult,
  ApprovalDocument,
  AuditEvent,
  ExecutionResult,
  PolicyDocument,
  ToolDefinition,
  ToolTag,
} from '@airlock/shared';
import { RedisKeys } from '@airlock/shared';
import { analyzeScript } from '@airlock/analyzer';
import { evaluatePolicy, DEFAULT_POLICY } from '@airlock/policy';
import { generateFullToolCatalog } from '@airlock/mocks';
import { StorageAdapter, MemoryStorageAdapter } from './redis.js';
import { executeScriptInSandbox } from './executor.js';

export interface GatewayConfig {
  orgId: string;
  storage?: StorageAdapter;
  policy?: PolicyDocument;
}

export class AirlockGateway {
  public readonly orgId: string;
  public readonly storage: StorageAdapter;
  public policy: PolicyDocument;
  private toolCatalog: ToolDefinition[];
  private toolTagMap: Record<string, ToolTag[]>;

  constructor(config: GatewayConfig) {
    this.orgId = config.orgId;
    this.storage = config.storage || new MemoryStorageAdapter();
    this.policy = config.policy || DEFAULT_POLICY;

    // Load tool catalog
    this.toolCatalog = generateFullToolCatalog();
    this.toolTagMap = {};
    for (const tool of this.toolCatalog) {
      this.toolTagMap[`${tool.server}.${tool.name}`] = tool.tags;
    }
  }

  // ---------------------------------------------------------------------------
  // Agent Authentication & Limits
  // ---------------------------------------------------------------------------

  async registerAgentKey(agent: Omit<AgentRecord, 'createdAt'>): Promise<string> {
    const rawKey = `alk_live_${randomUUID().replace(/-/g, '')}${randomUUID().replace(/-/g, '')}`;
    const keyHash = createHash('sha256').update(rawKey).digest('hex');
    const keyPrefix = rawKey.substring(0, 16);

    const record: AgentRecord = {
      ...agent,
      keyPrefix,
      keyHash,
      createdAt: new Date().toISOString(),
    };

    // Store agent record and lookup hash
    await this.storage.set(RedisKeys.agent(this.orgId, agent.id), JSON.stringify(record));
    await this.storage.set(RedisKeys.agentKey(this.orgId, keyHash), agent.id);

    return rawKey;
  }

  async authenticateKey(bearerToken: string): Promise<AgentRecord | null> {
    const key = bearerToken.replace(/^Bearer\s+/i, '').trim();
    if (!key) return null;

    const keyHash = createHash('sha256').update(key).digest('hex');
    const agentId = await this.storage.get(RedisKeys.agentKey(this.orgId, keyHash));
    if (!agentId) return null;

    const rawAgent = await this.storage.get(RedisKeys.agent(this.orgId, agentId));
    if (!rawAgent) return null;

    return JSON.parse(rawAgent) as AgentRecord;
  }

  async isAgentSuspended(agentId: string): Promise<boolean> {
    const flag = await this.storage.get(RedisKeys.killSwitch(this.orgId, agentId));
    return flag === '1';
  }

  async suspendAgent(agentId: string, operatorId = 'operator'): Promise<void> {
    await this.storage.set(RedisKeys.killSwitch(this.orgId, agentId), '1');
    await this.logAuditEvent({
      eventType: 'agent_suspended',
      agentId,
      userId: operatorId,
      details: { reason: 'Kill switch activated by operator' },
    });
  }

  async resumeAgent(agentId: string, operatorId = 'operator'): Promise<void> {
    await this.storage.del(RedisKeys.killSwitch(this.orgId, agentId));
    await this.logAuditEvent({
      eventType: 'agent_resumed',
      agentId,
      userId: operatorId,
      details: { reason: 'Kill switch deactivated by operator' },
    });
  }

  // ---------------------------------------------------------------------------
  // MCP Tools
  // ---------------------------------------------------------------------------

  /**
   * search_tools: Returns TypeScript stubs for matching confirmed tools.
   */
  searchTools(query: string, limit = 10): string {
    const q = query.toLowerCase().trim();
    const matches = this.toolCatalog
      .filter((t) => t.tagStatus === 'confirmed')
      .filter((t) => !q || t.server.toLowerCase().includes(q) || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
      .slice(0, limit);

    // Format as TypeScript interface stubs
    const stubs = matches.map((t) => {
      const inputType = t.inputSchema?.properties ? Object.keys(t.inputSchema.properties).map((p) => `${p}?: any`).join(', ') : '';
      return `/** ${t.description} (tags: ${t.tags.join(', ')}) */\n${t.server}.${t.name}(args: { ${inputType} }): Promise<any>;`;
    });

    return `declare const tools: {\n  ${stubs.join('\n  ')}\n};`;
  }

  /**
   * run_script: Pre-execution analysis, policy gating, approval holding, sandboxed execution.
   */
  async runScript(
    code: string,
    agent: AgentRecord,
    intent?: string
  ): Promise<
    | { status: 'completed'; result: unknown; logs: string[]; toolCallCount: number; wallClockMs: number }
    | { status: 'held'; approvalId: string; reasons: string[]; flaggedFlows: string[] }
    | { status: 'denied'; reasons: string[] }
    | { status: 'error'; error: string }
  > {
    const startTime = Date.now();

    // 1. Kill Switch Check
    if (await this.isAgentSuspended(agent.id)) {
      return { status: 'denied', reasons: ['Agent is suspended by kill switch.'] };
    }

    // 2. Budget Check & Rate Limit (daily token increment)
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const budgetKey = RedisKeys.budget(this.orgId, agent.id, today);
    const usedCalls = await this.storage.hincrby(budgetKey, 'calls', 1);
    if (usedCalls > 1000) {
      return { status: 'denied', reasons: ['Agent daily request call limit reached.'] };
    }

    // 3. Static AST Analysis
    const analysis: AnalysisResult = analyzeScript(code, {
      knownTagsByTool: this.toolTagMap,
    });

    await this.logAuditEvent({
      eventType: 'script_submitted',
      agentId: agent.id,
      scriptHash: analysis.sha256,
      details: { intent, valid: analysis.valid, extractedCallCount: analysis.calls.length },
    });

    // 4. Policy Evaluation
    const policyResult = evaluatePolicy({
      policy: this.policy,
      analysis,
      agentScopes: agent.scopes,
      toolTagMap: this.toolTagMap,
    });

    await this.logAuditEvent({
      eventType: 'policy_evaluated',
      agentId: agent.id,
      scriptHash: analysis.sha256,
      details: { decision: policyResult.decision, matchedRules: policyResult.matchedRules, flaggedFlows: policyResult.flaggedFlows },
    });

    // 5. Handle DENY
    if (policyResult.decision === 'deny') {
      await this.logAuditEvent({
        eventType: 'script_denied',
        agentId: agent.id,
        scriptHash: analysis.sha256,
        details: { reasons: policyResult.reasons },
      });
      return { status: 'denied', reasons: policyResult.reasons };
    }

    // 6. Handle HOLD (Human-in-the-loop approval needed)
    if (policyResult.decision === 'hold') {
      const approvalId = `appr_${randomUUID().replace(/-/g, '')}`;
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const approvalDoc: ApprovalDocument = {
        id: approvalId,
        orgId: this.orgId,
        agentId: agent.id,
        scriptHash: analysis.sha256,
        code,
        intent,
        flaggedFlows: policyResult.flaggedFlows,
        explanation: policyResult.reasons.join(' ') || 'Script held by deterministic policy rules.',
        status: 'pending',
        policyVersion: this.policy.version,
        createdAt: new Date().toISOString(),
        expiresAt,
      };

      await this.storage.set(RedisKeys.approval(this.orgId, approvalId), JSON.stringify(approvalDoc));

      await this.logAuditEvent({
        eventType: 'script_held',
        agentId: agent.id,
        approvalId,
        scriptHash: analysis.sha256,
        details: { flaggedFlows: policyResult.flaggedFlows, explanation: approvalDoc.explanation },
      });

      return {
        status: 'held',
        approvalId,
        reasons: policyResult.reasons,
        flaggedFlows: policyResult.flaggedFlows,
      };
    }

    // 7. Handle ALLOW (Immediate sandboxed execution)
    return this.executeAndRecord(code, agent.id, analysis);
  }

  /**
   * Internal execution runner with audit logging
   */
  private async executeAndRecord(
    code: string,
    agentId: string,
    analysis: AnalysisResult
  ): Promise<{ status: 'completed'; result: unknown; logs: string[]; toolCallCount: number; wallClockMs: number }> {
    await this.logAuditEvent({
      eventType: 'execution_started',
      agentId,
      scriptHash: analysis.sha256,
      details: {},
    });

    const execResult = await executeScriptInSandbox(code, {
      approvedCalls: analysis.calls,
      isAgentSuspended: () => this.isAgentSuspended(agentId),
      onToolCalled: async (server, tool, args) => {
        await this.logAuditEvent({
          eventType: 'tool_called',
          agentId,
          scriptHash: analysis.sha256,
          details: { server, tool, args },
        });
      },
    });

    await this.logAuditEvent({
      eventType: 'execution_completed',
      agentId,
      scriptHash: analysis.sha256,
      details: {
        status: execResult.status,
        toolCallCount: execResult.toolCallCount,
        wallClockMs: execResult.wallClockMs,
      },
    });

    return {
      status: 'completed',
      result: execResult.result,
      logs: execResult.logs,
      toolCallCount: execResult.toolCallCount,
      wallClockMs: execResult.wallClockMs,
    };
  }

  // ---------------------------------------------------------------------------
  // Approval Decisions (Human Operator / Admin)
  // ---------------------------------------------------------------------------

  async getApproval(approvalId: string): Promise<ApprovalDocument | null> {
    const raw = await this.storage.get(RedisKeys.approval(this.orgId, approvalId));
    return raw ? (JSON.parse(raw) as ApprovalDocument) : null;
  }

  async getResult(runOrApprovalId: string): Promise<ExecutionResult | null> {
    const raw = await this.storage.get(RedisKeys.result(this.orgId, runOrApprovalId));
    return raw ? (JSON.parse(raw) as ExecutionResult) : null;
  }

  async decideApproval(
    approvalId: string,
    decision: 'approved' | 'denied',
    decidedBy: string,
    note?: string
  ): Promise<{ success: boolean; status: string; result?: any; error?: string }> {
    const approval = await this.getApproval(approvalId);
    if (!approval) {
      return { success: false, status: 'not_found', error: 'Approval record not found.' };
    }

    if (approval.status !== 'pending') {
      return {
        success: false,
        status: approval.status,
        error: `Approval has already been decided (${approval.status}). Duplicate decisions are prevented.`,
      };
    }

    approval.status = decision;
    approval.decidedBy = decidedBy;
    approval.decidedAt = new Date().toISOString();
    approval.decisionNote = note;

    if (decision === 'denied') {
      await this.storage.set(RedisKeys.approval(this.orgId, approvalId), JSON.stringify(approval));
      await this.logAuditEvent({
        eventType: 'script_denied',
        userId: decidedBy,
        approvalId,
        scriptHash: approval.scriptHash,
        details: { note },
      });
      return { success: true, status: 'denied' };
    }

    // On Approved: execute script once through sandbox
    const analysis = analyzeScript(approval.code, { knownTagsByTool: this.toolTagMap });
    const runResult = await this.executeAndRecord(approval.code, approval.agentId, analysis);

    // Save result associated with approvalId
    await this.storage.set(
      RedisKeys.result(this.orgId, approvalId),
      JSON.stringify(runResult),
      86400 // 24 hours TTL
    );

    // Update approval status
    await this.storage.set(RedisKeys.approval(this.orgId, approvalId), JSON.stringify(approval));

    await this.logAuditEvent({
      eventType: 'script_approved',
      userId: decidedBy,
      approvalId,
      scriptHash: approval.scriptHash,
      details: { note, toolCallCount: runResult.toolCallCount },
    });

    return {
      success: true,
      status: 'approved',
      result: runResult.result,
    };
  }

  // ---------------------------------------------------------------------------
  // Audit Trail
  // ---------------------------------------------------------------------------

  async logAuditEvent(event: Omit<AuditEvent, 'id' | 'timestamp' | 'orgId'>): Promise<string> {
    const id = `${Date.now()}-${randomUUID().slice(0, 8)}`;
    const fullEvent: AuditEvent = {
      ...event,
      id,
      orgId: this.orgId,
      timestamp: new Date().toISOString(),
    };

    const streamKey = RedisKeys.streamAudit(this.orgId);
    await this.storage.xadd(streamKey, {
      id,
      timestamp: fullEvent.timestamp,
      eventType: fullEvent.eventType,
      agentId: fullEvent.agentId || '',
      userId: fullEvent.userId || '',
      scriptHash: fullEvent.scriptHash || '',
      approvalId: fullEvent.approvalId || '',
      details: JSON.stringify(fullEvent.details),
    });

    return id;
  }

  async getRecentAuditEvents(count = 50): Promise<AuditEvent[]> {
    const streamKey = RedisKeys.streamAudit(this.orgId);
    const raw = await this.storage.xrange(streamKey, '-', '+', count);
    return raw.map((item) => {
      let details = {};
      try {
        details = JSON.parse(item.fields.details || '{}');
      } catch {
        // ignore JSON parse error
      }
      return {
        id: item.fields.id || item.id,
        timestamp: item.fields.timestamp || new Date().toISOString(),
        orgId: this.orgId,
        eventType: item.fields.eventType as any,
        agentId: item.fields.agentId || undefined,
        userId: item.fields.userId || undefined,
        scriptHash: item.fields.scriptHash || undefined,
        approvalId: item.fields.approvalId || undefined,
        details,
      };
    });
  }
}
