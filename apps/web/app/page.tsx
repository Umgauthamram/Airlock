import Link from 'next/link';
import VignetteBloomCanvas from '@/components/VignetteBloomCanvas';

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col w-full bg-[#f8fafc] text-slate-900">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-50 w-full">
        <div className="w-full px-6 lg:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-bold text-xl tracking-tight text-slate-900 flex items-center gap-2">
              <span>Airlock</span>
              <span className="text-xs font-mono font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                Gateway
              </span>
            </Link>
          </div>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link href="/quickstart" className="text-slate-600 hover:text-slate-900 transition-colors">
              Quick Start
            </Link>
            <Link href="/login" className="text-slate-600 hover:text-slate-900 transition-colors">
              Sign In
            </Link>
            <Link
              href="/api/auth/demo"
              className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors text-xs font-semibold shadow-xs"
            >
              Explore Live Demo
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 w-full px-6 lg:px-12 py-16 flex flex-col gap-20 max-w-7xl mx-auto">
        <section className="flex flex-col items-center text-center max-w-4xl mx-auto gap-6 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-medium text-slate-700 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Security Gateway for AI Agents &amp; MCP Tools</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.15]">
            Prevent autonomous AI agents from leaking data or running destructive commands.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
            Airlock sits in front of your Model Context Protocol tools. Instead of letting agents blindly execute multi-turn calls, it intercepts execution plans, stops prompt-injection exfiltration, and requires operator approval for sensitive actions.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
            <Link
              href="/api/auth/demo"
              className="px-6 py-3 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
            >
              Explore Live Demo (Operator Access)
            </Link>
            <Link
              href="/quickstart"
              className="px-6 py-3 border border-slate-300 bg-white text-slate-800 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
            >
              Quick Start Guide →
            </Link>
          </div>
        </section>

        {/* Centerpiece: Vignette Bloom Canvas2D Raster */}
        <section className="w-full flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="font-semibold uppercase tracking-wider text-slate-400">
              Interactive Execution &amp; Inspection Lens
            </span>
            <span>Render Mode: Vignette Bloom (21st.dev Canvas2D)</span>
          </div>
          <VignetteBloomCanvas
            cellSize={16}
            initialRenderMode="mosaic"
            className="w-full shadow-xl"
          />
        </section>

        {/* Section: What Airlock Provides */}
        <section className="flex flex-col gap-8 pt-6">
          <div className="text-center max-w-2xl mx-auto flex flex-col gap-2">
            <span className="text-xs uppercase font-mono font-bold tracking-wider text-sky-600">
              Platform Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              What Airlock Provides
            </h2>
            <p className="text-sm text-slate-500">
              Core security mechanisms engineered specifically for autonomous agent workflows.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 font-bold text-lg">
                🛡️
              </div>
              <h3 className="font-bold text-base text-slate-900">Prompt Injection Shield</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Stops hidden prompt injection inside emails, web pages, or tickets from tricking the agent into exfiltrating confidential data to external sinks.
              </p>
            </div>

            <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-bold text-lg">
                👤
              </div>
              <h3 className="font-bold text-base text-slate-900">Human Operator Queue</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Risky or destructive operations pause in a real-time queue. Human operators review the script, inspect flagged data flows, and approve with one click.
              </p>
            </div>

            <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-lg">
                ⚡
              </div>
              <h3 className="font-bold text-base text-slate-900">Instant Kill Switch</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Instantly revoke or suspend machine agent API keys in sub-second time across all your connected servers if an agent exhibits runaway behavior.
              </p>
            </div>

            <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 font-bold text-lg">
                📜
              </div>
              <h3 className="font-bold text-base text-slate-900">Immutable Audit Trail</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every request, policy evaluation, approval decision, and sandbox call is logged into a verifiable, append-only stream for compliance and debugging.
              </p>
            </div>
          </div>
        </section>

        {/* Section: How It Is Beneficial */}
        <section className="p-8 sm:p-10 bg-slate-900 text-white rounded-2xl flex flex-col gap-8 shadow-sm">
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase font-mono font-bold tracking-wider text-emerald-400">
              Proven Value
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Why Teams Put Airlock in Front of MCP Tools
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-xs text-slate-300 leading-relaxed">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-bold text-white">For Security &amp; Compliance</span>
              <p>
                Complete peace of mind. Autonomous agents cannot access external networks or execute deletions without meeting deterministic policy rules and operator verification.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-bold text-white">For Developers &amp; Platform Teams</span>
              <p>
                <strong>94%+ token reduction</strong>. Instead of sending 50+ tool schemas on every single turn, agents fetch concise TypeScript stubs and submit a single executable plan.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-bold text-white">Zero Performance Overhead</span>
              <p>
                Deterministic AST parsing and policy evaluation complete in <strong>0.83ms (p95)</strong>, adding virtually zero latency to your agent pipelines.
              </p>
            </div>
          </div>
        </section>

        {/* Section: What You Can Use Directly From This Website */}
        <section className="flex flex-col gap-8">
          <div className="text-center max-w-2xl mx-auto flex flex-col gap-2">
            <span className="text-xs uppercase font-mono font-bold tracking-wider text-sky-600">
              Interactive Web App
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              What You Can Do Right Now in the Web App
            </h2>
            <p className="text-sm text-slate-500">
              Experience the complete operator and security workflow directly from your browser.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              href="/app/approvals"
              className="p-6 bg-white border border-slate-200 rounded-xl hover:border-slate-400 transition-colors shadow-xs flex flex-col gap-2.5 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                  Approvals Queue
                </span>
                <span className="text-xs text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Review held scripts, inspect the exact code generated by the agent, see policy alerts, and click <em>Approve &amp; Execute Once</em>.
              </p>
            </Link>

            <Link
              href="/app/audit"
              className="p-6 bg-white border border-slate-200 rounded-xl hover:border-slate-400 transition-colors shadow-xs flex flex-col gap-2.5 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                  Audit Trail
                </span>
                <span className="text-xs text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Explore the immutable event stream recording every request, policy evaluation, approval decision, and sandbox call.
              </p>
            </Link>

            <Link
              href="/app/agents"
              className="p-6 bg-white border border-slate-200 rounded-xl hover:border-slate-400 transition-colors shadow-xs flex flex-col gap-2.5 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                  Agent Kill Switch
                </span>
                <span className="text-xs text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Manage machine agent API keys, check daily token budgets, and activate emergency kill switches to suspend rogue keys instantly.
              </p>
            </Link>

            <Link
              href="/app/tools"
              className="p-6 bg-white border border-slate-200 rounded-xl hover:border-slate-400 transition-colors shadow-xs flex flex-col gap-2.5 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                  Tool Registry
                </span>
                <span className="text-xs text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Browse discovered upstream tools from your MCP servers with automatic semantic risk tags (<code>reads_untrusted</code>, <code>writes_external</code>).
              </p>
            </Link>

            <Link
              href="/app/policies"
              className="p-6 bg-white border border-slate-200 rounded-xl hover:border-slate-400 transition-colors shadow-xs flex flex-col gap-2.5 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                  Security Policies
                </span>
                <span className="text-xs text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Inspect active deterministic rules with strict evaluation precedence (<code>DENY</code> &gt; <code>HOLD</code> &gt; <code>ALLOW</code>).
              </p>
            </Link>

            <Link
              href="/app/results"
              className="p-6 bg-white border border-slate-200 rounded-xl hover:border-slate-400 transition-colors shadow-xs flex flex-col gap-2.5 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                  Benchmark Proof
                </span>
                <span className="text-xs text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Review reproducible benchmark results across 60 scenarios: 100% attack block rate, 0% false holds, and 94.7% token reduction.
              </p>
            </Link>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="p-8 sm:p-10 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="flex flex-col gap-1.5">
            <h3 className="text-xl font-bold text-slate-900">Get Started with Airlock</h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Connect Cursor, Claude Desktop, or your own agents in under two minutes.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/quickstart"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
            >
              Quick Start Guide →
            </Link>
            <Link
              href="/api/auth/demo"
              className="px-5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-semibold transition-colors shadow-xs"
            >
              Launch Demo
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500 w-full mt-12">
        <div className="w-full px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>Airlock · Pre-execution Security Gateway for AI Agents</span>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-slate-900">Home</Link>
            <Link href="/quickstart" className="hover:text-slate-900">Quick Start</Link>
            <Link href="/terms" className="hover:text-slate-900">Terms</Link>
            <Link href="/privacy" className="hover:text-slate-900">Privacy</Link>
            <Link href="/login" className="hover:text-slate-900">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
