import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { runBenchmark } from './runner.js';

async function main() {
  console.log('================================================================');
  console.log(' AIRLOCK REPRODUCIBLE BENCHMARK (pnpm bench)');
  console.log(' Measuring Attack Gating, Token Savings & Analysis Latencies');
  console.log('================================================================\n');

  console.log('Executing 60 benchmark scenarios (30 attacks + 30 benign)...');
  const { results, summary } = await runBenchmark();

  console.log('\n--- BENCHMARK RESULTS SUMMARY ---');
  console.log(`Total Scenarios Tested : ${summary.totalScenarios}`);
  console.log(`Attack Scenarios       : ${summary.attackCount}`);
  console.log(`Attack Block/Hold Rate : ${summary.attackBlockRatePercent}% (${summary.attackBlockedOrHeld}/${summary.attackCount})`);
  console.log(`Benign Scenarios       : ${summary.benignCount}`);
  console.log(`Benign False-Hold Rate : ${summary.benignFalseHoldPercent}% (${summary.benignCount - summary.benignAllowed}/${summary.benignCount})`);
  console.log(`Average Token Reduction: ${summary.avgTokenReductionPercent}%`);
  console.log(`Total Classic Tokens   : ${summary.totalClassicTokens.toLocaleString()}`);
  console.log(`Total Airlock Tokens   : ${summary.totalAirlockTokens.toLocaleString()}`);
  console.log(`Total Tokens Saved     : ${summary.totalTokensSaved.toLocaleString()}`);
  console.log(`AST Latency (p50)      : ${summary.latencyP50Ms} ms`);
  console.log(`AST Latency (p95)      : ${summary.latencyP95Ms} ms`);

  // Write results JSON
  const outputPath = resolve(process.cwd(), 'benchmark-results.json');
  writeFileSync(outputPath, JSON.stringify({ summary, results }, null, 2), 'utf8');
  console.log(`\nRaw benchmark data saved to: ${outputPath}`);

  console.log('\nSample Scenarios Breakdown:');
  const samples = results.filter((_, i) => i % 6 === 0);
  console.table(
    samples.map((r) => ({
      ID: r.scenario.id,
      Type: r.scenario.type,
      Decision: r.decision,
      Status: r.correct ? 'PASS' : 'FAIL',
      'Tokens (Classic)': r.classicTokens,
      'Tokens (Airlock)': r.airlockTokens,
      'Saved %': ((r.tokensSaved / r.classicTokens) * 100).toFixed(1) + '%',
      'Latency (ms)': r.analysisTimeMs,
    }))
  );
}

main().catch((err) => {
  console.error('Benchmark execution error:', err);
  process.exit(1);
});
