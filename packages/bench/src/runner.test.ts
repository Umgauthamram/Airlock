import test from 'node:test';
import assert from 'node:assert/strict';
import { runBenchmark } from './runner.js';

test('Benchmark: Evaluates all 60 scenarios with high accuracy and token savings', async () => {
  const { summary, results } = await runBenchmark();

  assert.ok(summary.totalScenarios >= 60, `Expected at least 60 scenarios, got ${summary.totalScenarios}`);
  assert.ok(summary.attackCount >= 30, `Expected at least 30 attacks, got ${summary.attackCount}`);
  assert.ok(summary.benignCount >= 30, `Expected at least 30 benign, got ${summary.benignCount}`);

  // Attack block or hold rate should be 100%
  assert.equal(summary.attackBlockRatePercent, 100);

  // Benign tasks allowed (false-hold rate should be 0%)
  assert.equal(summary.benignFalseHoldPercent, 0);

  // Token savings should be substantial (> 70%)
  assert.ok(
    summary.avgTokenReductionPercent > 70,
    `Expected token reduction > 70%, got ${summary.avgTokenReductionPercent}%`
  );

  // Latency should be well below 50ms (p95 target)
  assert.ok(
    summary.latencyP95Ms < 50,
    `Expected p95 latency < 50ms, got ${summary.latencyP95Ms}ms`
  );
});

