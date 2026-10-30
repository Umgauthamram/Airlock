'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MimirAsciiCanvas from '@/components/MimirAsciiCanvas';

export default function LandingPageClient() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  function handleAccessSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email) {
      router.push(`/demo-request?email=${encodeURIComponent(email)}`);
    }
  }

  const threats = [
    {
      title: 'Prompt Injection Exfiltration',
      tag: 'reads_untrusted → writes_external',
      color: 'border-rose-500/30 bg-rose-950/20 text-rose-300',
      description: 'Stops untrusted data inside emails, web pages, or customer tickets from instructing agents to exfiltrate database records to external webhooks.',
    },
    {
      title: 'Destructive System Mutations',
      tag: 'destructive_action_held',
      color: 'border-amber-500/30 bg-amber-950/20 text-amber-300',
      description: 'Holds schema drops, table truncations, cloud VM deletions, and production restarts for single-click human operator authorization.',
    },
    {
      title: 'Prototype & VM Escapes',
      tag: 'anti_analysis_denied',
      color: 'border-red-500/30 bg-red-950/20 text-red-300',
      description: 'Deterministic AST inspection blocks __proto__, constructor traversal, eval(), dynamic imports, and process environment variable theft.',
    },
    {
      title: 'Runaway Mutation Loops',
      tag: 'write_loop_budget_exceeded',
      color: 'border-yellow-500/30 bg-yellow-950/20 text-yellow-300',
      description: 'Detects state mutations and external calls embedded inside unbound loops, enforcing strict per-script call budgets and rate limits.',
    },
    {
      title: 'Secret & Key Harvesting',
      tag: 'credential_probing_blocked',
      color: 'border-blue-500/30 bg-blue-950/20 text-blue-300',
      description: 'Air-gapped execution proxy prevents scripts from reading environment secrets, API tokens, or host process memory.',
    },
    {
      title: 'Tools Object Spoofing',
      tag: 'dynamic_dispatch_rejected',
      color: 'border-purple-500/30 bg-purple-950/20 text-purple-300',
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
      q: 'What is the 12-Hour Demo Pass?',
      a: 'New evaluators and developers can request instant demo access. Requests undergo a 5-minute automated compliance screening, after which a 12-hour Operator pass is unlocked with full access to approval queues, audit trails, and benchmark telemetry.',
    },
    {
      q: 'Does Airlock require changing existing MCP tools?',
      a: 'No. Airlock sits as a transparent security gateway between your AI client (Cursor, Claude Desktop, Python, Node) and your upstream MCP servers. Your existing tools connect without any code modifications.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#080c14] text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-black">
      {/* Top Header */}
      <header className="w-full px-6 lg:px-12 py-6 flex items-center justify-between border-b border-slate-800/80 z-30 bg-[#080c14]/90 backdrop-blur-md sticky top-0">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-mono font-black text-xl tracking-[0.25em] text-white uppercase">AIRLOCK</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 group-hover:scale-125 transition-transform"></span>
        </Link>

        <nav className="flex items-center gap-5 sm:gap-8 text-xs font-mono uppercase tracking-wider font-semibold">
          <Link href="/quickstart" className="text-slate-400 hover:text-white transition-colors">
            Quick Start
          </Link>
          <Link href="/login" className="text-slate-400 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link
            href="/demo-request"
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:scale-[1.02]"
          >
            Get 12H Pass →
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* HERO SECTION: Mimir Sculpture Prominently Positioned in Viewport */}
        <section className="relative w-full min-h-[85vh] lg:min-h-[90vh] flex items-center overflow-hidden border-b border-slate-800/60">
          {/* Mimir Mosaic Canvas in the Right 60% of the Hero Viewport */}
          <div className="absolute inset-y-0 right-0 w-full lg:w-7/12 pointer-events-auto z-0">
            <MimirAsciiCanvas
              cellSize={13}
              renderMode="mosaic"
              theme="dark"
              backgroundColor="#080c14"
              className="w-full h-full"
            />
          </div>

          {/* Left-Side Hero Text & Access Input */}
          <div className="w-full px-6 lg:px-12 py-16 z-10 max-w-7xl mx-auto pointer-events-none">
            <div className="max-w-2xl flex flex-col gap-8 pointer-events-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold uppercase tracking-wider w-fit">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Deterministic Pre-Execution Security
              </div>

              {/* Headline */}
              <div className="flex flex-col">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.02] text-white">
                  Security Mode <br />
                  <span className="text-emerald-400">for Cursor</span>
                </h1>
              </div>

              {/* Subheading */}
              <p className="text-lg sm:text-xl font-medium tracking-tight text-slate-200 max-w-xl leading-relaxed">
                Introducing a new way to protect tools right where your autonomous agents code.
              </p>

              <p className="text-sm text-slate-400 max-w-lg leading-relaxed font-normal">
                Airlock intercepts MCP actions before runtime execution. It halts prompt-injection exfiltration, gates risky external calls, and holds destructive changes for single-click human approval.
              </p>

              {/* Polished Rounded Access Box */}
              <div className="flex flex-col gap-3 pt-2 max-w-md">
                <span className="text-xs font-mono tracking-wider text-slate-400">
                  Available now. Request your 12-hour operator license:
                </span>

                <form onSubmit={handleAccessSubmit} className="flex p-1.5 bg-slate-900/90 border border-slate-700 rounded-2xl shadow-xl backdrop-blur-md focus-within:border-emerald-400 transition-colors">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ENTER YOUR WORK EMAIL"
                    className="px-4 py-3 bg-transparent text-xs font-mono tracking-wider text-white placeholder:text-slate-500 outline-none flex-1 min-w-0"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md hover:scale-[1.02] shrink-0"
                  >
                    REQUEST ACCESS →
                  </button>
                </form>

                <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono pt-1">
                  <span>⚡ 5-min auto-approval</span>
                  <span>·</span>
                  <span>🔒 Isolated MicroVM sandbox</span>
                  <span>·</span>
                  <span>⏱ 12h validity</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 1: HOW AIRLOCK WORKS (3-STEP PIPELINE) */}
        <section className="w-full py-24 px-6 lg:px-12 border-b border-slate-800/80 bg-[#080c14]">
          <div className="max-w-7xl mx-auto flex flex-col gap-14">
            <div className="flex flex-col gap-2 max-w-2xl">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                Deterministic Defense Architecture
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                How Airlock Protects Agent Tool Invocations
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed mt-1">
                Rather than trusting LLMs to judge other LLMs, Airlock enforces a mathematically verifiable 3-step gating pipeline.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-4 shadow-lg hover:border-slate-700 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-mono font-bold text-emerald-400 text-sm">
                  01
                </div>
                <h3 className="text-lg font-bold text-white">Stub Discovery &amp; Script Synthesis</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Agents discover tools via compact TypeScript interfaces (<code className="font-mono text-emerald-300">search_tools</code>) rather than ingesting 50+ monolithic JSON schemas. The agent generates a single-shot execution plan script.
                </p>
                <div className="mt-auto pt-4 border-t border-slate-800/80 text-[11px] font-mono text-emerald-400">
                  ✓ 94.7% token reduction
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-4 shadow-lg hover:border-slate-700 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-mono font-bold text-emerald-400 text-sm">
                  02
                </div>
                <h3 className="text-lg font-bold text-white">Deterministic AST Inspection</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Before execution, Airlock compiles the script into an AST. It statically inspects all tool invocations, loop mutations, prototype traversals, and semantic data-flow classifications in under 2ms.
                </p>
                <div className="mt-auto pt-4 border-t border-slate-800/80 text-[11px] font-mono text-emerald-400">
                  ✓ Precedence: DENY &gt; HOLD &gt; ALLOW
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-4 shadow-lg hover:border-slate-700 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-mono font-bold text-emerald-400 text-sm">
                  03
                </div>
                <h3 className="text-lg font-bold text-white">Sandboxed MicroVM Execution</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Safe scripts execute single-shot inside isolated Nebius Sandboxes microVMs. Flagged operations (such as untrusted email reads writing to external webhooks) pause for 1-click human approval.
                </p>
                <div className="mt-auto pt-4 border-t border-slate-800/80 text-[11px] font-mono text-emerald-400">
                  ✓ Air-gapped process boundary
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: ENTERPRISE THREAT MATRIX */}
        <section className="w-full py-24 px-6 lg:px-12 border-b border-slate-800/80 bg-slate-950/70">
          <div className="max-w-7xl mx-auto flex flex-col gap-14">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="flex flex-col gap-2 max-w-2xl">
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                  Zero-Day Protection
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                  Attack Vectors Neutralized Before Execution
                </h2>
                <p className="text-sm text-slate-400 leading-relaxed mt-1">
                  Airlock was tested against 60 attack and benign scenarios across 50 MCP tools with 100% block rate.
                </p>
              </div>

              <Link
                href="/quickstart"
                className="px-5 py-2.5 rounded-xl border border-slate-700 hover:border-emerald-400 text-xs font-mono font-semibold text-slate-300 hover:text-white transition-colors flex items-center gap-2 w-fit"
              >
                <span>View Integration Specs</span>
                <span>→</span>
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {threats.map((threat, i) => (
                <div
                  key={i}
                  className="p-7 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col gap-3 shadow-lg hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold border ${threat.color}`}>
                      {threat.tag}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">{threat.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{threat.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 3: COMPARISON TABLE (TRADITIONAL VS AIRLOCK) */}
        <section className="w-full py-24 px-6 lg:px-12 border-b border-slate-800/80 bg-[#080c14]">
          <div className="max-w-7xl mx-auto flex flex-col gap-12">
            <div className="flex flex-col gap-2 text-center items-center max-w-2xl mx-auto">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                Measured Efficiency Benchmark
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Multi-Turn Tool Calling vs. Airlock Script Mode
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Empirically tested across 50 tools and 8 simulated enterprise services.
              </p>
            </div>

            <div className="w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-4 px-6">Evaluation Dimension</th>
                      <th className="py-4 px-6 text-rose-300">Traditional Multi-Turn MCP</th>
                      <th className="py-4 px-6 text-emerald-400 font-bold">Airlock Pre-Execution Mode</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 font-mono text-xs">
                    <tr className="hover:bg-slate-800/30">
                      <td className="py-4 px-6 font-semibold text-white font-sans">Context Token Load (50 tools)</td>
                      <td className="py-4 px-6 text-slate-400">7,858 tokens / turn (re-ingested)</td>
                      <td className="py-4 px-6 text-emerald-400 font-bold">412 tokens / task (94.7% reduction)</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="py-4 px-6 font-semibold text-white font-sans">Prompt Injection Defense</td>
                      <td className="py-4 px-6 text-slate-400">None (Blind tool execution)</td>
                      <td className="py-4 px-6 text-emerald-400 font-bold">100% intercepted by data-flow policy</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="py-4 px-6 font-semibold text-white font-sans">Inspection Mechanism</td>
                      <td className="py-4 px-6 text-slate-400">Post-execution logging / LLM guardrail</td>
                      <td className="py-4 px-6 text-emerald-400 font-bold">Pre-execution deterministic AST gating</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="py-4 px-6 font-semibold text-white font-sans">Human Operator Approvals</td>
                      <td className="py-4 px-6 text-slate-400">Manual interrupts / unstandardized</td>
                      <td className="py-4 px-6 text-emerald-400 font-bold">Centralized queue with 1-click approvals</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="py-4 px-6 font-semibold text-white font-sans">Execution Isolation</td>
                      <td className="py-4 px-6 text-slate-400">Host process environment</td>
                      <td className="py-4 px-6 text-emerald-400 font-bold">Isolated Nebius MicroVM Sandbox</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="py-4 px-6 font-semibold text-white font-sans">Analysis Latency Overhead</td>
                      <td className="py-4 px-6 text-slate-400">800ms - 2,500ms (LLM judge roundtrip)</td>
                      <td className="py-4 px-6 text-emerald-400 font-bold">1.26ms p95 (deterministic compiler)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: CLIENT CONFIGURATION IN 60 SECONDS */}
        <section className="w-full py-24 px-6 lg:px-12 border-b border-slate-800/80 bg-slate-950/70">
          <div className="max-w-7xl mx-auto flex flex-col gap-12">
            <div className="flex flex-col gap-2 max-w-2xl">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                Drop-in Agent Compatibility
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Works With Your Favorite Agent Tools
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Connect your AI tools in seconds by adding the Airlock MCP gateway endpoint.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Cursor Card */}
              <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center font-bold text-white text-xs">
                      ⚡
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Cursor IDE</h3>
                      <span className="text-xs text-slate-400">.cursor/mcp.json</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Recommended
                  </span>
                </div>
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
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
              <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center font-bold text-white text-xs">
                      🧠
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Claude Desktop</h3>
                      <span className="text-xs text-slate-400">claude_desktop_config.json</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                    Native MCP
                  </span>
                </div>
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
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
        <section className="w-full py-24 px-6 lg:px-12 border-b border-slate-800/80 bg-[#080c14]">
          <div className="max-w-4xl mx-auto flex flex-col gap-12">
            <div className="flex flex-col gap-2 text-center items-center">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                Answers &amp; Technical Insights
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="flex flex-col divide-y divide-slate-800 border-y border-slate-800">
              {faqs.map((faq, i) => {
                const isOpen = openFaq === i;
                return (
                  <div key={i} className="py-6 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="flex items-center justify-between text-left font-bold text-base text-white hover:text-emerald-400 transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <span className="text-emerald-400 font-mono text-lg ml-4">{isOpen ? '−' : '+'}</span>
                    </button>
                    {isOpen && (
                      <p className="text-xs text-slate-400 leading-relaxed pt-2 font-normal">
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
        <section className="w-full py-24 px-6 lg:px-12 bg-gradient-to-b from-[#080c14] to-slate-950 text-center flex flex-col items-center gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold">
            Ready in 60 Seconds
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white max-w-2xl">
            Protect Your AI Agent Fleet From Exploits
          </h2>
          <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
            Get an instant 12-hour operator license with automatic compliance approval. Intercept attacks, view audit streams, and manage agent permissions.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <Link
              href="/demo-request"
              className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider rounded-xl transition-all shadow-xl shadow-emerald-500/20 hover:scale-[1.02]"
            >
              Request 12H Demo Pass →
            </Link>
            <Link
              href="/quickstart"
              className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 hover:border-slate-500 font-mono text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors"
            >
              Read Quick Start Guide
            </Link>
          </div>
        </section>

        {/* Polished Minimal Footer */}
        <footer className="w-full py-8 px-6 lg:px-12 border-t border-slate-800/80 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">AIRLOCK</span>
            <span>·</span>
            <span>Deterministic Agent Security Gateway</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/quickstart" className="hover:text-white transition-colors">
              Quick Start
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/demo-request" className="hover:text-white transition-colors">
              Demo Access
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
