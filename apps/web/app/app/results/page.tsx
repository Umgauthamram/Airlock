import Link from 'next/link';
import { requireSession } from '@/lib/auth';

export default async function ResultsPage() {
  await requireSession();

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <div>
        <span className="text-xs font-mono uppercase tracking-wider text-[#78716c]">Measured Proof</span>
        <h1 className="font-serif text-3xl font-bold text-[#1c1917] mt-1">Empirical Benchmark Results</h1>
        <p className="text-sm text-[#57534e] mt-1">
          Measured using the reproducible benchmark suite (<code>pnpm bench</code>) against a 50-tool catalog and 60 test scenarios.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-[#e7e5e4] rounded shadow-xs flex flex-col gap-1">
          <span className="text-xs uppercase font-mono text-[#78716c]">Attack Block / Hold Rate</span>
          <span className="text-3xl font-mono font-bold text-emerald-700">100%</span>
          <span className="text-xs text-[#a8a29e]">30/30 attacks prevented</span>
        </div>

        <div className="p-5 bg-white border border-[#e7e5e4] rounded shadow-xs flex flex-col gap-1">
          <span className="text-xs uppercase font-mono text-[#78716c]">Benign False-Hold Rate</span>
          <span className="text-3xl font-mono font-bold text-[#1c1917]">0.0%</span>
          <span className="text-xs text-[#a8a29e]">0/30 false holds</span>
        </div>

        <div className="p-5 bg-white border border-[#e7e5e4] rounded shadow-xs flex flex-col gap-1">
          <span className="text-xs uppercase font-mono text-[#78716c]">Token Reduction</span>
          <span className="text-3xl font-mono font-bold text-emerald-700">94.7%</span>
          <span className="text-xs text-[#a8a29e]">471k vs 25k tokens</span>
        </div>

        <div className="p-5 bg-white border border-[#e7e5e4] rounded shadow-xs flex flex-col gap-1">
          <span className="text-xs uppercase font-mono text-[#78716c]">Analysis Latency (p95)</span>
          <span className="text-3xl font-mono font-bold text-[#1c1917]">1.26 ms</span>
          <span className="text-xs text-[#a8a29e]">Target was &lt; 50 ms</span>
        </div>
      </div>

      {/* Method & Corpus Details */}
      <div className="p-6 bg-white border border-[#e7e5e4] rounded shadow-xs flex flex-col gap-4 text-xs text-[#57534e] leading-relaxed">
        <h2 className="font-serif text-lg font-bold text-[#1c1917]">Methodology & Corpus Breakdown</h2>
        <p>
          The benchmark corpus tests 60 scenarios against an expanded MCP catalog of 50 tools across 8 realistic services:
        </p>
        <ul className="list-disc pl-5 flex flex-col gap-1">
          <li>
            <strong>30 Attack Scenarios</strong>: Prompt injection exfiltrating to external webhooks, secret credentials extraction, prototype pollution tricks (<code>__proto__</code>, <code>constructor</code>), dynamic execution (<code>eval</code>, <code>Function</code>, dynamic <code>import()</code>), runaway write loops, and tools object aliasing.
          </li>
          <li>
            <strong>30 Benign Scenarios</strong>: Routine email triage, support ticket creation, local file cache read/write, cloud instance inspection, database schema queries, calendar scheduling, and data transformations.
          </li>
          <li>
            <strong>Comparison Baseline</strong>: Classic agent mode in multi-turn tool calling loads full JSON schemas for all 50 tools and re-ingests context on each turn. Airlock script mode fetches targeted interface stubs via <code>search_tools</code> and submits a single plan artifact.
          </li>
        </ul>
        <div className="p-3 bg-[#fafaf9] border border-[#e7e5e4] rounded font-mono text-[11px] text-[#44403c]">
          To reproduce these numbers locally: <code>pnpm bench</code>
        </div>
      </div>
    </div>
  );
}

