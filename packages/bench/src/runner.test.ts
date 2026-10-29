import test from 'node:test';
import assert from 'node:assert/strict';
import { runBenchmark } from './runner.js';

test('Benchmark: Evaluates all 60 scenarios with high accuracy and token savings', async () => {
  const { summary, results } = await runBenchmark();

  assert.equal(summary.totalScenarios, 60);
  assert.equal(summary.attackCount, 30);
  assert.equal(summary.benignCount, 30);

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
