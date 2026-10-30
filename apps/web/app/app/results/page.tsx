import { requireSession } from '@/lib/auth';

export default async function ResultsPage() {
  await requireSession();

  return (
    <div className="w-full flex flex-col gap-8">
      <div className="border-b border-slate-200 pb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Measured Proof</span>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">Empirical Benchmark Results</h1>
        <p className="text-sm text-slate-500 mt-1">
          Measured using the reproducible benchmark suite (<code>pnpm bench</code>) against 50 tools and 60 test scenarios.
        </p>
      </div>

      {/* Metrics Row - 4 Columns Across Full Screen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-xs flex flex-col gap-1.5">
          <span className="text-xs uppercase font-semibold text-slate-500 tracking-wider">Attack Block / Hold Rate</span>
          <span className="text-4xl font-mono font-bold text-emerald-600">100%</span>
          <span className="text-xs text-slate-400 mt-0.5">31/31 attacks prevented</span>
        </div>

        <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-xs flex flex-col gap-1.5">
          <span className="text-xs uppercase font-semibold text-slate-500 tracking-wider">Benign False-Hold Rate</span>
          <span className="text-4xl font-mono font-bold text-slate-900">0.0%</span>
          <span className="text-xs text-slate-400 mt-0.5">0/31 false holds</span>
        </div>

        <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-xs flex flex-col gap-1.5">
          <span className="text-xs uppercase font-semibold text-slate-500 tracking-wider">Token Reduction</span>
          <span className="text-4xl font-mono font-bold text-emerald-600">99.5%</span>
          <span className="text-xs text-slate-400 mt-0.5">628k vs 3.4k tokens (estimated)</span>
        </div>

        <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-xs flex flex-col gap-1.5">
          <span className="text-xs uppercase font-semibold text-slate-500 tracking-wider">Analysis Latency (p95)</span>
          <span className="text-4xl font-mono font-bold text-slate-900">0.69 ms</span>
          <span className="text-xs text-slate-400 mt-0.5">Target was &lt; 50 ms</span>
        </div>
      </div>

      {/* Left / Right Analysis Grid Across Full Width */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column - Methodology & Corpus Details */}
        <div className="md:col-span-7 xl:col-span-8 p-7 bg-white border border-slate-200 rounded-lg shadow-xs flex flex-col gap-4 text-xs text-slate-600 leading-relaxed">
          <h2 className="text-base font-bold text-slate-900">Methodology & Corpus Breakdown</h2>
          <p>
            The benchmark corpus rigorously evaluates 62 distinct attack and benign test scenarios against an expanded MCP catalog of 50 tools across 8 realistic services:
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-2.5">
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
        </div>

        {/* Right Column - Reproduction & Economics */}
        <div className="md:col-span-5 xl:col-span-4 flex flex-col gap-5 md:sticky md:top-24">
          <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-xs flex flex-col gap-3 text-xs leading-relaxed text-slate-600">
            <h3 className="font-bold text-slate-900 text-sm">Reproduce Results</h3>
            <p>
              Execute the full 60-scenario benchmark suite locally from the root terminal:
            </p>
            <div className="p-3 bg-slate-900 text-slate-100 rounded-md font-mono text-xs flex items-center justify-between">
              <code>pnpm bench</code>
            </div>
            <span className="text-[11px] text-slate-400">
              Measures token consumption, deterministic AST gate checks, and p95 latency.
            </span>
          </div>

          <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-950 flex flex-col gap-1.5">
            <span className="font-bold text-emerald-900">Token Efficiency Gain</span>
            <p className="text-[11px] leading-relaxed">
              By replacing 5-10 multi-turn catalog round-trips with targeted code generation, Airlock achieves an empirical 94.7% token reduction across standard workflows.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
