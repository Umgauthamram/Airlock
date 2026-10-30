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
import { NebiusTokenFactoryClient } from '@airlock/nebius';
import { StorageAdapter, MemoryStorageAdapter } from './redis.js';
import { executeScriptInSandbox } from './executor.js';

export interface GatewayConfig {
  orgId: string;
  storage?: StorageAdapter;
  policy?: PolicyDocument;
  nebius?: NebiusTokenFactoryClient;
}

export class AirlockGateway {
  public readonly orgId: string;
  public readonly storage: StorageAdapter;
  public policy: PolicyDocument;
  public readonly nebius: NebiusTokenFactoryClient;
  private toolCatalog: ToolDefinition[];
  private toolTagMap: Record<string, ToolTag[]>;

  constructor(config: GatewayConfig) {
    this.orgId = config.orgId;
    this.storage = config.storage || new MemoryStorageAdapter();
    this.policy = config.policy || DEFAULT_POLICY;
    this.nebius = config.nebius || new NebiusTokenFactoryClient();

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
    | ExecutionResult
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

      // Generate human-readable risk explanation with Nemotron Nano via Token Factory
      let explanation = policyResult.reasons.join(' ') || 'Script held by deterministic policy rules.';
      try {
        const nanoResp = await this.nebius.generateCompletion(
          'nano',
          [
            {
              role: 'system',
              content:
                'You are Airlock Security Policy Explainer. Summarize why this script was held for operator review.',
            },
            {
              role: 'user',
              content: `Flagged data flows: ${policyResult.flaggedFlows.join(', ')}.\nCode:\n${code}\nExplain the security risk and why an operator must approve it before execution. Keep it under 2 sentences.`,
            },
          ],
          { maxTokens: 120 }
        );
        if (nanoResp.content && !nanoResp.isFallback) {
          explanation = nanoResp.content;
        }
      } catch {
        // Fall back to deterministic policy reason
      }

      const approvalDoc: ApprovalDocument = {
        id: approvalId,
        orgId: this.orgId,
        agentId: agent.id,
        scriptHash: analysis.sha256,
        code,
        intent,
        flaggedFlows: policyResult.flaggedFlows,
        explanation,
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
  ): Promise<ExecutionResult> {
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

        if (server === 'tavily' && tool === 'web_search') {
          await this.logAuditEvent({
            eventType: 'tavily_search',
            agentId,
            scriptHash: analysis.sha256,
            details: {
              query: args?.query,
              maxResults: args?.maxResults || 5,
              provider: 'Tavily Search API',
            },
          });
        }
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
        error: execResult.error,
      },
    });

    return {
      status: execResult.status,
      result: execResult.result,
      error: execResult.error,
      logs: execResult.logs,
      toolCallCount: execResult.toolCallCount,
      wallClockMs: execResult.wallClockMs,
    };
  }

  // ---------------------------------------------------------------------------
  // Approval Decisions (Human Operator / Admin)
  // ---------------------------------------------------------------------------

  async getApproval(approvalId: string, targetOrgId: string = this.orgId): Promise<ApprovalDocument | null> {
    const raw = await this.storage.get(RedisKeys.approval(targetOrgId, approvalId));
    if (raw) return JSON.parse(raw) as ApprovalDocument;
    const altId = approvalId.includes('_') ? approvalId.replace(/_/g, '-') : approvalId.replace(/-/g, '_');
    const altRaw = await this.storage.get(RedisKeys.approval(targetOrgId, altId));
    return altRaw ? (JSON.parse(altRaw) as ApprovalDocument) : null;
  }

  async getResult(runOrApprovalId: string, targetOrgId: string = this.orgId): Promise<ExecutionResult | null> {
    const raw = await this.storage.get(RedisKeys.result(targetOrgId, runOrApprovalId));
    return raw ? (JSON.parse(raw) as ExecutionResult) : null;
  }

  async decideApproval(
    approvalId: string,
    decision: 'approved' | 'denied',
    decidedBy: string,
    note?: string,
    targetOrgId: string = this.orgId
  ): Promise<{ success: boolean; status: string; result?: any; error?: string }> {
    const approval = await this.getApproval(approvalId, targetOrgId);
    if (!approval) {
      return { success: false, status: 'not_found', error: 'Approval record not found.' };
    }

    // Check expiration (F-08)
    if (approval.expiresAt && new Date(approval.expiresAt).getTime() < Date.now()) {
      approval.status = 'expired';
      await this.storage.set(RedisKeys.approval(targetOrgId, approvalId), JSON.stringify(approval));
      return {
        success: false,
        status: 'expired',
        error: 'Approval has expired and can no longer be approved or executed.',
      };
    }

    if (approval.status !== 'pending') {
      return {
        success: false,
        status: approval.status,
        error: `Approval has already been decided (${approval.status}). Duplicate decisions are prevented.`,
      };
    }

    // Atomic claim lock (F-07) to guard against concurrent approval execution race conditions
    const claimLockKey = `lock:approval:${targetOrgId}:${approvalId}`;
    const claimAcquired = await this.storage.setnx(claimLockKey, decidedBy, 60);
    if (!claimAcquired) {
      return {
        success: false,
        status: 'executing',
        error: 'Approval is currently being decided or executed by another operator request.',
      };
    }

    if (decision === 'denied') {
      approval.status = 'denied';
      approval.decidedBy = decidedBy;
      approval.decidedAt = new Date().toISOString();
      approval.decisionNote = note;

      await this.storage.set(RedisKeys.approval(targetOrgId, approvalId), JSON.stringify(approval));
      await this.logAuditEvent({
        eventType: 'script_denied',
        userId: decidedBy,
        approvalId,
        scriptHash: approval.scriptHash,
        details: { note },
      });
      return { success: true, status: 'denied' };
    }

    // Atomic state transition: mark 'executing' immediately to prevent race conditions & double-spend
    approval.status = 'executing';
    approval.decidedBy = decidedBy;
    approval.decidedAt = new Date().toISOString();
    approval.decisionNote = note;
    await this.storage.set(RedisKeys.approval(targetOrgId, approvalId), JSON.stringify(approval));

    // Execute script once through sandbox
    try {
      const analysis = analyzeScript(approval.code, { knownTagsByTool: this.toolTagMap });
      const runResult = await this.executeAndRecord(approval.code, approval.agentId, analysis);

      // Save result associated with approvalId
      await this.storage.set(
        RedisKeys.result(targetOrgId, approvalId),
        JSON.stringify(runResult),
        86400 // 24 hours TTL
      );

      // Transition to final 'approved' state
      approval.status = 'approved';
      await this.storage.set(RedisKeys.approval(targetOrgId, approvalId), JSON.stringify(approval));

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
    } catch (err: any) {
      approval.status = 'failed';
      await this.storage.set(RedisKeys.approval(targetOrgId, approvalId), JSON.stringify(approval));
      return {
        success: false,
        status: 'failed',
        error: err.message || String(err),
      };
    }
  }

  // ---------------------------------------------------------------------------
  // Nemotron Model-Driven Intelligence (Super, Ultra, Nano)
  // ---------------------------------------------------------------------------

  /**
   * Synthesize an agent execution script from natural language using Nemotron Super.
   */
  async synthesizeScript(
    intent: string,
    toolStubs: string
  ): Promise<{ code: string; tokensUsed: number; reasoning?: string }> {
    const resp = await this.nebius.generateCompletion(
      'super',
      [
        {
          role: 'system',
          content:
            'You are an AI Agent operating within the Airlock Security Gateway. You write executable JavaScript/TypeScript code using only the provided tools.<server>.<tool>(args) interfaces. Never alias or destructure tools. Return ONLY executable code.',
        },
        {
          role: 'user',
          content: `Task Intent: ${intent}\n\nAvailable Tool Stubs:\n${toolStubs}\n\nWrite an execution script to achieve this task:`,
        },
      ],
      { maxTokens: 1024 }
    );

    const code = resp.content.replace(/^```[a-z]*\n/i, '').replace(/\n```$/, '').trim();
    return { code, tokensUsed: resp.usage.totalTokens, reasoning: resp.reasoning };
  }

  /**
   * Rewrite a rejected or held script into a safe, compliant script using Nemotron Ultra.
   */
  async repairScript(
    code: string,
    reasons: string[]
  ): Promise<{ repairedCode: string; explanation: string; tokensUsed: number }> {
    const resp = await this.nebius.generateCompletion(
      'ultra',
      [
        {
          role: 'system',
          content:
            'You are Airlock Security Policy Repair Engine. Analyze the rejected agent script and rewrite it to adhere strictly to zero-trust policy without violating data flows.',
        },
        {
          role: 'user',
          content: `Rejection reasons:\n${reasons.join('\n')}\n\nOriginal Code:\n${code}\n\nRewrite the script safely to remove insecure exfiltration or forbidden syntax:`,
        },
      ],
      { maxTokens: 1024 }
    );

    const repairedCode = resp.content.replace(/^```[a-z]*\n/i, '').replace(/\n```$/, '').trim();
    return {
      repairedCode,
      explanation: resp.reasoning || 'Rewritten with Nemotron Ultra to remove policy violations.',
      tokensUsed: resp.usage.totalTokens,
    };
  }

  /**
   * Suggest semantic tags for tools using Nemotron Nano.
   */
  async suggestToolTags(server: string, name: string, description: string): Promise<ToolTag[]> {
    const resp = await this.nebius.generateCompletion(
      'nano',
      [
        {
          role: 'system',
          content:
            'Classify this tool by semantic risk tags: reads_untrusted, reads_private, writes_external, writes_internal, destructive. Return ONLY a JSON array of matching tags.',
        },
        {
          role: 'user',
          content: `Tool: ${server}.${name}\nDescription: ${description}`,
        },
      ],
      { maxTokens: 60 }
    );

    try {
      const parsed = JSON.parse(resp.content);
      if (Array.isArray(parsed)) return parsed as ToolTag[];
    } catch {
      // Fallback
    }
    return ['reads_untrusted'];
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
    const raw = await this.storage.xrevrange(streamKey, '+', '-', count);
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

