import { performance } from 'node:perf_hooks';
import { analyzeScript } from '@airlock/analyzer';
import { evaluatePolicy, DEFAULT_POLICY } from '@airlock/policy';
import { generateFullToolCatalog } from '@airlock/mocks';
import { ReferenceAgentHarness } from '@airlock/agent-ref';
import { ATTACK_SCENARIOS, BENIGN_SCENARIOS, BenchmarkScenario } from './corpus.js';

export interface ScenarioResult {
  scenario: BenchmarkScenario;
  decision: 'allow' | 'hold' | 'deny';
  correct: boolean;
  analysisTimeMs: number;
  classicTokens: number;
  airlockTokens: number;
  tokensSaved: number;
}

export interface BenchmarkSummary {
  totalScenarios: number;
  attackCount: number;
  benignCount: number;
  attackBlockedOrHeld: number;
  attackBlockRatePercent: number;
  benignAllowed: number;
  benignFalseHoldPercent: number;
  avgTokenReductionPercent: number;
  totalClassicTokens: number;
  totalAirlockTokens: number;
  totalTokensSaved: number;
  latencyP50Ms: number;
  latencyP95Ms: number;
  timestamp: string;
}

export async function runBenchmark(): Promise<{ results: ScenarioResult[]; summary: BenchmarkSummary }> {
  const catalog = generateFullToolCatalog();
  const toolTagMap: Record<string, any> = {};
  for (const t of catalog) {
    toolTagMap[`${t.server}.${t.name}`] = t.tags;
  }

  const harness = new ReferenceAgentHarness();
  const results: ScenarioResult[] = [];
  const latencies: number[] = [];

  const allScenarios = [...ATTACK_SCENARIOS, ...BENIGN_SCENARIOS];

  let attackBlockedOrHeld = 0;
  let benignAllowed = 0;
  let totalClassicTokens = 0;
  let totalAirlockTokens = 0;

  for (const scenario of allScenarios) {
    const t0 = performance.now();
    const analysis = analyzeScript(scenario.code, { knownTagsByTool: toolTagMap });
    const policyResult = evaluatePolicy({
      policy: DEFAULT_POLICY,
      analysis,
      agentScopes: ['*'],
      toolTagMap,
    });
    const t1 = performance.now();
    const durationMs = t1 - t0;
    latencies.push(durationMs);

    const decision = policyResult.decision;
    const isAttack = scenario.type === 'attack';

    let correct = false;
    if (isAttack) {
      // For attacks: either 'deny' (syntax/dynamic tricks) or 'hold' (exfiltration/destructive/loop) is correct prevention
      if (decision === 'deny' || decision === 'hold') {
        attackBlockedOrHeld++;
        correct = true;
      }
    } else {
      // For benign: 'allow' is expected
      if (decision === 'allow') {
        benignAllowed++;
        correct = true;
      }
    }

    // Token comparison
    const classicRun = await harness.runClassic(scenario.taskPrompt, catalog, [
      { toolKey: 'inbox.get_emails', result: { ok: true } },
    ]);

    const airlockRun = await harness.runAirlock(
      scenario.taskPrompt,
      'declare const tools: any;',
      scenario.code,
      decision
    );

    totalClassicTokens += classicRun.totalTokens;
    totalAirlockTokens += airlockRun.totalTokens;

    results.push({
      scenario,
      decision,
      correct,
      analysisTimeMs: parseFloat(durationMs.toFixed(3)),
      classicTokens: classicRun.totalTokens,
      airlockTokens: airlockRun.totalTokens,
      tokensSaved: classicRun.totalTokens - airlockRun.totalTokens,
    });
  }

  // Calculate percentiles
  latencies.sort((a, b) => a - b);
  const p50 = latencies[Math.floor(latencies.length * 0.50)];
  const p95 = latencies[Math.floor(latencies.length * 0.95)];

  const totalTokensSaved = totalClassicTokens - totalAirlockTokens;
  const avgTokenReductionPercent = parseFloat(
    (((totalClassicTokens - totalAirlockTokens) / totalClassicTokens) * 100).toFixed(1)
  );

  const attackBlockRatePercent = parseFloat(
    ((attackBlockedOrHeld / ATTACK_SCENARIOS.length) * 100).toFixed(1)
  );

  const benignFalseHoldCount = BENIGN_SCENARIOS.length - benignAllowed;
  const benignFalseHoldPercent = parseFloat(
    ((benignFalseHoldCount / BENIGN_SCENARIOS.length) * 100).toFixed(1)
  );

  const summary: BenchmarkSummary = {
    totalScenarios: allScenarios.length,
    attackCount: ATTACK_SCENARIOS.length,
    benignCount: BENIGN_SCENARIOS.length,
    attackBlockedOrHeld,
    attackBlockRatePercent,
    benignAllowed,
    benignFalseHoldPercent,
    avgTokenReductionPercent,
    totalClassicTokens,
    totalAirlockTokens,
    totalTokensSaved,
    latencyP50Ms: parseFloat(p50.toFixed(2)),
    latencyP95Ms: parseFloat(p95.toFixed(2)),
    timestamp: new Date().toISOString(),
  };

  return { results, summary };
}

