'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PrismaHero } from '@/components/ui/prisma-hero';

export default function LandingPageClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const threats = [
    {
      title: 'Prompt Injection Exfiltration',
      tag: 'reads untrusted → writes external',
      color: 'border-rose-200 bg-rose-50 text-rose-700',
      description: 'Stops untrusted data inside emails, web pages, or customer tickets from instructing agents to exfiltrate database records to external webhooks.',
    },
    {
      title: 'Destructive System Mutations',
      tag: 'destructive action held',
      color: 'border-amber-200 bg-amber-50 text-amber-800',
      description: 'Holds schema drops, table truncations, cloud VM deletions, and production restarts for single-click human operator authorization.',
    },
    {
      title: 'Prototype & VM Escapes',
      tag: 'anti_analysis_denied',
      color: 'border-red-200 bg-red-50 text-red-700',
      description: 'Deterministic AST inspection blocks __proto__, constructor traversal, eval(), dynamic imports, and process environment variable theft.',
    },
    {
      title: 'Runaway Mutation Loops',
      tag: 'write_loop_budget_exceeded',
      color: 'border-yellow-200 bg-yellow-50 text-yellow-800',
      description: 'Detects state mutations and external calls embedded inside unbound loops, enforcing strict per-script call budgets and rate limits.',
    },
    {
      title: 'Secret & Key Harvesting',
      tag: 'credential_probing_blocked',
      color: 'border-blue-200 bg-blue-50 text-blue-700',
      description: 'Air-gapped execution proxy prevents scripts from reading environment secrets, API tokens, or host process memory.',
    },
    {
      title: 'Tools Object Spoofing',
      tag: 'dynamic_dispatch_rejected',
      color: 'border-purple-200 bg-purple-50 text-purple-700',
      description: 'Prevents aliasing or destructuring tools objects to hide sensitive operations from static data-flow classification.',
    },
  ];

  const faqs = [
    {
      q: 'Why not use LLM-based guardrails or prompt filters?',
      a: 'LLM guardrails add 500-1500ms of latency, cost significant tokens, and can be jailbroken by novel adversarial prompts. Airlock uses deterministic Abstract Syntax Tree (AST) analysis that executes in < 2ms with mathematical certainty — if code violates security policy, it never runs.',
    },
    {
      q: 'How does Airlock save 94.7% in token costs?',
      a: 'In traditional multi-turn tool calling, agents load full JSON schemas for 50+ tools on every turn (7,800+ tokens). Airlock provides a search_tools introspection endpoint where agents retrieve compact TypeScript interfaces, write a single-shot execution script, and execute it in one turn.',
    },
    {
      q: 'What happens when a sensitive script is Held?',
      a: 'The script pauses before any tools are invoked. The exact inspected TypeScript code, risk explanation, and flagged data flows appear in the real-time Operator Approvals Queue. Human operators can review and click "Approve & Execute Once" or "Deny".',
    },
    {
      q: 'How does the allocated demo mode work?',
      a: 'Each evaluator signing in with their Google account receives an instantly provisioned demo environment with full access to the live approval review queue, audit stream telemetry, and microVM sandbox isolation.',
    },
    {
      q: 'Does Airlock require changing existing MCP tools?',
      a: 'No. Airlock sits as a transparent security gateway between your AI client (Cursor, Claude Desktop, Python, Node) and your upstream MCP servers. Your existing tools connect without any code modifications.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* 21st.dev Prisma Hero Component */}
      <PrismaHero
        title="AIRLOCK"
        onGoogleLogin={() => {
          window.location.href = '/api/auth/google';
        }}
        onDemoRequest={async (demoEmail) => {
          setLoading(true);
          try {
            const res = await fetch('/api/auth/google', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: demoEmail }),
            });
            const data = await res.json();
            if (res.ok && data.redirect) {
              router.push(data.redirect);
            } else {
              router.push(`/login?email=${encodeURIComponent(demoEmail)}`);
            }
          } catch {
            router.push(`/login?email=${encodeURIComponent(demoEmail)}`);
          }
        }}
        navItems={[
          { label: "Pipeline", href: "#pipeline" },
          { label: "Quick Start", href: "/quickstart" },
          { label: "Sign In", href: "/login" },
        ]}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* SECTION 1: HOW AIRLOCK WORKS (3-STEP PIPELINE) */}
        <section id="pipeline" className="w-full py-24 px-6 lg:px-12 border-b border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto flex flex-col gap-14">
            <div className="flex flex-col gap-2 max-w-2xl">
              
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
                How Airlock Protects Agent Tool Invocations
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed mt-1">
                Rather than trusting LLMs to judge other LLMs, Airlock enforces a mathematically verifiable 3-step gating pipeline.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-4 shadow-sm hover:border-slate-300 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-emerald-200 border border-emerald-300 flex items-center justify-center font-mono font-bold text-emerald-900 text-sm">
                  01
                </div>
                <h3 className="text-lg font-bold text-slate-900">Stub Discovery &amp; Script Synthesis</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Agents discover tools via compact TypeScript interfaces (<code className="font-mono text-emerald-900 bg-emerald-200 px-1 py-0.5 rounded">search_tools</code>) rather than ingesting 50+ monolithic JSON schemas. The agent generates a single-shot execution plan script.
                </p>
                <div className="mt-auto pt-4 border-t border-slate-200 text-[11px] font-mono text-emerald-600 font-semibold">
                  ✓ 94.7% token reduction
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-4 shadow-sm hover:border-slate-300 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-emerald-200 border border-emerald-300 flex items-center justify-center font-mono font-bold text-emerald-900 text-sm">
                  02
                </div>
                <h3 className="text-lg font-bold text-slate-900">Deterministic AST Inspection</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Before execution, Airlock compiles the script into an AST. It statically inspects all tool invocations, loop mutations, prototype traversals, and semantic data-flow classifications in under 2ms.
                </p>
                <div className="mt-auto pt-4 border-t border-slate-200 text-[11px] font-mono text-emerald-600 font-semibold">
                  ✓ Precedence: DENY &gt; HOLD &gt; ALLOW
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-4 shadow-sm hover:border-slate-300 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-emerald-200 border border-emerald-300 flex items-center justify-center font-mono font-bold text-emerald-900 text-sm">
                  03
                </div>
                <h3 className="text-lg font-bold text-slate-900">Sandboxed MicroVM Execution</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Safe scripts execute single-shot inside isolated Nebius Sandboxes microVMs. Flagged operations (such as untrusted email reads writing to external webhooks) pause for 1-click human approval.
                </p>
                <div className="mt-auto pt-4 border-t border-slate-200 text-[11px] font-mono text-emerald-600 font-semibold">
                  ✓ Air-gapped process boundary
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: ENTERPRISE THREAT MATRIX */}
        <section className="w-full py-24 px-6 lg:px-12 border-b border-slate-200 bg-slate-50/70">
          <div className="max-w-7xl mx-auto flex flex-col gap-14">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="flex flex-col gap-2 max-w-2xl">
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 font-bold">
                  Zero-Day Protection
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
                  Attack Vectors Neutralized Before Execution
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed mt-1">
                  Airlock was tested against 60 attack and benign scenarios across 50 MCP tools with 100% block rate.
                </p>
              </div>

              <Link
                href="/quickstart"
                className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:border-emerald-500 text-xs font-mono font-semibold text-slate-700 hover:text-slate-900 transition-colors flex items-center gap-2 w-fit shadow-xs"
              >
                <span>View Integration Specs</span>
                <span>→</span>
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {threats.map((threat, i) => (
                <div
                  key={i}
                  className="p-7 rounded-2xl bg-white border border-slate-200 flex flex-col gap-3 shadow-sm hover:border-slate-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold border ${threat.color}`}>
                      {threat.tag}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{threat.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{threat.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 3: COMPARISON TABLE (TRADITIONAL VS AIRLOCK) */}
        <section className="w-full py-24 px-6 lg:px-12 border-b border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto flex flex-col gap-12">
            <div className="flex flex-col gap-2 text-center items-center max-w-2xl mx-auto">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 font-bold">
                Measured Efficiency Benchmark
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
                Multi-Turn Tool Calling vs. Airlock Script Mode
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Empirically tested across 50 tools and 8 simulated enterprise services.
              </p>
            </div>

            <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-4 px-6">Evaluation Dimension</th>
                      <th className="py-4 px-6 text-rose-600">Traditional Multi-Turn MCP</th>
                      <th className="py-4 px-6 text-emerald-600 font-bold">Airlock Pre-Execution Mode</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono text-xs">
                    <tr className="hover:bg-slate-50/70">
                      <td className="py-4 px-6 font-semibold text-slate-900 font-sans">Context Token Load (50 tools)</td>
                      <td className="py-4 px-6 text-slate-600">7,858 tokens / turn (re-ingested)</td>
                      <td className="py-4 px-6 text-emerald-600 font-bold">412 tokens / task (94.7% reduction)</td>
                    </tr>
                    <tr className="hover:bg-slate-50/70">
                      <td className="py-4 px-6 font-semibold text-slate-900 font-sans">Prompt Injection Defense</td>
                      <td className="py-4 px-6 text-slate-600">None (Blind tool execution)</td>
                      <td className="py-4 px-6 text-emerald-600 font-bold">100% intercepted by data-flow policy</td>
                    </tr>
                    <tr className="hover:bg-slate-50/70">
                      <td className="py-4 px-6 font-semibold text-slate-900 font-sans">Inspection Mechanism</td>
                      <td className="py-4 px-6 text-slate-600">Post-execution logging / LLM guardrail</td>
                      <td className="py-4 px-6 text-emerald-600 font-bold">Pre-execution deterministic AST gating</td>
                    </tr>
                    <tr className="hover:bg-slate-50/70">
                      <td className="py-4 px-6 font-semibold text-slate-900 font-sans">Human Operator Approvals</td>
                      <td className="py-4 px-6 text-slate-600">Manual interrupts / unstandardized</td>
                      <td className="py-4 px-6 text-emerald-600 font-bold">Centralized queue with 1-click approvals</td>
                    </tr>
                    <tr className="hover:bg-slate-50/70">
                      <td className="py-4 px-6 font-semibold text-slate-900 font-sans">Execution Isolation</td>
                      <td className="py-4 px-6 text-slate-600">Host process environment</td>
                      <td className="py-4 px-6 text-emerald-600 font-bold">Isolated Nebius MicroVM Sandbox</td>
                    </tr>
                    <tr className="hover:bg-slate-50/70">
                      <td className="py-4 px-6 font-semibold text-slate-900 font-sans">Analysis Latency Overhead</td>
                      <td className="py-4 px-6 text-slate-600">800ms - 2,500ms (LLM judge roundtrip)</td>
                      <td className="py-4 px-6 text-emerald-600 font-bold">1.26ms p95 (deterministic compiler)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: CLIENT CONFIGURATION IN 60 SECONDS */}
        <section className="w-full py-24 px-6 lg:px-12 border-b border-slate-200 bg-slate-50/70">
          <div className="max-w-7xl mx-auto flex flex-col gap-12">
            <div className="flex flex-col gap-2 max-w-2xl">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 font-bold">
                Drop-in Agent Compatibility
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
                Works With Your Favorite Agent Tools
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Connect your AI tools in seconds by adding the Airlock MCP gateway endpoint.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Cursor Card */}
              <div className="p-8 rounded-2xl bg-white border border-slate-200 flex flex-col gap-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-800 text-xs">
                      ⚡
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Cursor IDE</h3>
                      <span className="text-xs text-slate-500">.cursor/mcp.json</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold bg-emerald-200 text-emerald-900 border border-emerald-300">
                    Recommended
                  </span>
                </div>
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto leading-relaxed">
{`{
  "mcpServers": {
    "airlock": {
      "url": "https://gateway.airlock.dev/mcp",
      "headers": {
        "Authorization": "Bearer alk_live_YOUR_KEY"
      }
    }
  }
}`}
                </pre>
              </div>

              {/* Claude Desktop Card */}
              <div className="p-8 rounded-2xl bg-white border border-slate-200 flex flex-col gap-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-800 text-xs">
                      🧠
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Claude Desktop</h3>
                      <span className="text-xs text-slate-500">claude_desktop_config.json</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    Native MCP
                  </span>
                </div>
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto leading-relaxed">
{`{
  "mcpServers": {
    "airlock": {
      "command": "npx",
      "args": ["-y", "@airlock/mcp-client", "--gateway", "https://gateway.airlock.dev/mcp"]
    }
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: FREQUENTLY ASKED QUESTIONS */}
        <section className="w-full py-24 px-6 lg:px-12 border-b border-slate-200 bg-white">
          <div className="max-w-4xl mx-auto flex flex-col gap-12">
            <div className="flex flex-col gap-2 text-center items-center">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 font-bold">
                Answers &amp; Technical Insights
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="flex flex-col divide-y divide-slate-200 border-y border-slate-200">
              {faqs.map((faq, i) => {
                const isOpen = openFaq === i;
                return (
                  <div key={i} className="py-6 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="flex items-center justify-between text-left font-bold text-base text-slate-900 hover:text-emerald-600 transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <span className="text-emerald-600 font-mono text-lg ml-4">{isOpen ? '−' : '+'}</span>
                    </button>
                    {isOpen && (
                      <p className="text-xs text-slate-600 leading-relaxed pt-2 font-normal">
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FINAL CALL TO ACTION */}
        <section className="w-full py-24 px-6 lg:px-12 bg-slate-50 border-b border-slate-200 text-center flex flex-col items-center gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-200 border border-emerald-300 text-emerald-900 text-xs font-mono font-semibold">
            Ready in 60 Seconds
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 max-w-2xl">
            Protect Your AI Agent Fleet From Exploits
          </h2>
          <p className="text-sm text-slate-600 max-w-xl leading-relaxed">
            Get instant operator access with automatic compliance approval. Intercept attacks, view audit streams, and manage agent permissions.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <a
              href="/api/auth/google"
              className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider rounded-xl transition-all shadow-md hover:scale-[1.02]"
            >
              Sign in with Google →
            </a>
            <Link
              href="/quickstart"
              className="px-8 py-3.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 hover:border-slate-400 font-mono text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors shadow-xs"
            >
              Read Quick Start Guide
            </Link>
          </div>
        </section>

        {/* Polished Minimal Footer */}
        <footer className="w-full py-8 px-6 lg:px-12 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">AIRLOCK</span>
            <span>·</span>
            <span>Deterministic Agent Security Gateway</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/quickstart" className="hover:text-slate-900 transition-colors">
              Quick Start
            </Link>
            <Link href="/privacy" className="hover:text-slate-900 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-slate-900 transition-colors">
              Terms
            </Link>
            <Link href="/login" className="hover:text-slate-900 transition-colors">
              Demo Access
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
