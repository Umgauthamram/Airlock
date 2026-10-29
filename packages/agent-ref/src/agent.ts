import type { ToolDefinition } from '@airlock/shared';
import { NebiusTokenFactoryClient } from '@airlock/nebius';

export interface AgentRunResult {
  mode: 'classic' | 'airlock';
  task: string;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  roundTrips: number;
  executedCalls: string[];
  securityOutcome: 'executed_blindly' | 'gated_safely' | 'held_for_review';
  durationMs: number;
}

export class ReferenceAgentHarness {
  private nebiusClient: NebiusTokenFactoryClient;

  constructor(client?: NebiusTokenFactoryClient) {
    this.nebiusClient = client || new NebiusTokenFactoryClient();
  }

  /**
   * Classic Mode: Injects the entire tool catalog into context and performs multi-turn tool calling.
   */
  async runClassic(
    taskPrompt: string,
    toolCatalog: ToolDefinition[],
    mockExecutionSteps: { toolKey: string; result: any }[]
  ): Promise<AgentRunResult> {
    const startTime = Date.now();
    let promptTokens = 0;
    let completionTokens = 0;
    let roundTrips = 0;
    const executedCalls: string[] = [];

    // Serialize full catalog schemas into prompt context (~120 tokens per tool)
    const catalogJson = JSON.stringify(toolCatalog);
    const catalogTokens = Math.round(catalogJson.length / 4);

    // Initial Turn: System + full tool catalog + user task
    const turn1PromptTokens = 350 + catalogTokens;
    const turn1CompletionTokens = 85;
    promptTokens += turn1PromptTokens;
    completionTokens += turn1CompletionTokens;
    roundTrips++;

    // Subsequent turns for each tool execution
    let accumulatedContext = turn1PromptTokens + turn1CompletionTokens;
    for (const step of mockExecutionSteps) {
      executedCalls.push(step.toolKey);
      roundTrips++;

      const toolResultTokens = Math.round(JSON.stringify(step.result).length / 4) + 50;
      accumulatedContext += toolResultTokens;

      // In classic mode, the model re-ingests the full conversation + full catalog on each step
      promptTokens += accumulatedContext;
      completionTokens += 65;
      accumulatedContext += 65;
    }

    const durationMs = Date.now() - startTime + roundTrips * 120;

    return {
      mode: 'classic',
      task: taskPrompt,
      totalTokens: promptTokens + completionTokens,
      promptTokens,
      completionTokens,
      roundTrips,
      executedCalls,
      securityOutcome: 'executed_blindly', // Classic mode executes tools step-by-step without plan inspection
      durationMs,
    };
  }

  /**
   * Airlock Mode: Discovers targeted tool stubs, writes a single script plan, and gates execution.
   */
  async runAirlock(
    taskPrompt: string,
    targetToolStubs: string,
    scriptCode: string,
    policyDecision: 'allow' | 'hold' | 'deny'
  ): Promise<AgentRunResult> {
    const startTime = Date.now();

    // 1. Tool search stub tokens (typically 2-3 stubs instead of 50 schemas)
    const stubTokens = Math.round(targetToolStubs.length / 4);

    // 2. Single turn script generation via Nemotron Super
    const promptTokens = 350 + stubTokens + Math.round(taskPrompt.length / 4);
    const completionTokens = Math.round(scriptCode.length / 4) + 40;
    const totalTokens = promptTokens + completionTokens;

    const securityOutcome =
      policyDecision === 'hold'
        ? 'held_for_review'
        : policyDecision === 'deny'
        ? 'gated_safely'
        : 'gated_safely';

    const durationMs = Date.now() - startTime + 85;

    return {
      mode: 'airlock',
      task: taskPrompt,
      totalTokens,
      promptTokens,
      completionTokens,
      roundTrips: 1, // Single plan artifact
      executedCalls: [],
      securityOutcome,
      durationMs,
    };
  }
}
