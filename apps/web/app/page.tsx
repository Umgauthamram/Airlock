'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AsciiVignetteBloom from '@/components/AsciiVignetteBloom';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email) setSubmitted(true);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#e6ece6] text-[#0b3320] selection:bg-[#0b3320] selection:text-white font-sans antialiased">
      {/* Minimal Top Brand Bar */}
      <header className="w-full px-8 lg:px-14 py-8 flex items-center justify-between z-30">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-mono font-black text-xl tracking-[0.25em] text-[#0b3320] uppercase">
            AIRLOCK
          </span>
          <span className="w-2 h-2 rounded-full bg-[#0b3320] group-hover:scale-125 transition-transform"></span>
        </Link>

        <nav className="flex items-center gap-8 text-xs font-mono uppercase tracking-wider font-semibold">
          <Link
            href="/quickstart"
            className="text-[#3b5945] hover:text-[#0b3320] transition-colors"
          >
            Quick Start
          </Link>
          <Link
            href="/login"
            className="text-[#3b5945] hover:text-[#0b3320] transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/api/auth/demo"
            className="px-5 py-2.5 bg-[#0b3320] hover:bg-[#12452c] text-white rounded-none transition-colors shadow-xs"
          >
            Explore Demo →
          </Link>
        </nav>
      </header>

      {/* Main Hero Showcase */}
      <main className="flex-1 flex flex-col justify-between relative overflow-hidden">
        {/* Full-bleed ASCII Canvas on Right Side */}
        <div className="absolute inset-y-0 right-0 w-full lg:w-3/5 z-0 pointer-events-auto">
          <AsciiVignetteBloom
            cellSize={14}
            initialRenderMode="characters"
            theme="light-sage"
            className="w-full h-full"
          />
        </div>

        {/* Hero Left Content Column */}
        <div className="w-full px-8 lg:px-14 pt-8 lg:pt-16 pb-20 z-10 flex flex-col justify-between max-w-7xl mx-auto pointer-events-none">
          <div className="max-w-2xl flex flex-col gap-8 pointer-events-auto">
            {/* Title Block in Dark Forest Green */}
            <div className="flex flex-col">
              <h1 className="text-6xl sm:text-7xl lg:text-[5.5rem] font-bold tracking-[-0.04em] leading-[0.95] text-[#0b3320]">
                Security Mode <br />
                for Cursor
              </h1>
            </div>

            {/* Subtitle */}
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-[#0b3320] max-w-lg leading-snug">
              Introducing a new way to protect tools right where your agents code.
            </p>

            <p className="text-sm text-[#3b5945] max-w-md leading-relaxed font-normal">
              Airlock intercepts MCP actions before execution. It stops prompt-injection exfiltration, gates risky external calls, and holds destructive changes for single-click human approval.
            </p>

            {/* Email / Access Input Box (Exact style from screenshot) */}
            <div className="flex flex-col gap-3 pt-4 max-w-md">
              <span className="text-xs font-mono uppercase tracking-wider text-[#3b5945]">
                Available now for Cursor, Claude &amp; MCP.
              </span>

              {submitted ? (
                <div className="p-4 bg-white border border-[#0b3320] text-xs font-mono text-[#0b3320] flex items-center justify-between">
                  <span>✓ Request recorded. Check your inbox for key access.</span>
                  <Link href="/api/auth/demo" className="underline font-bold">
                    Launch Demo →
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex border border-[#0b3320] bg-white/70 backdrop-blur-xs">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="YOUR EMAIL"
                    className="px-4 py-3.5 bg-transparent text-xs font-mono tracking-wider uppercase text-[#0b3320] placeholder:text-[#6a8070] outline-none flex-1 min-w-0"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3.5 bg-[#0b3320] hover:bg-[#12452c] text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors shrink-0 cursor-pointer"
                  >
                    REQUEST ACCESS
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Floating Right Mockup Overlay (as in the screenshot) */}
        <div className="hidden xl:block absolute right-0 top-1/2 -translate-y-1/2 w-80 translate-x-6 z-20 pointer-events-auto">
          <div className="bg-white border-2 border-[#0b3320] shadow-2xl rounded-l-2xl overflow-hidden flex flex-col">
            <div className="bg-[#fbbf24] px-4 py-3 border-b border-[#0b3320] flex items-center justify-between">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-black">
                Airlock · Gate Alert
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
            </div>
            <div className="p-4 flex flex-col gap-3 text-xs font-mono">
              <div className="p-2.5 bg-amber-50 rounded border border-amber-200 text-amber-900 text-[11px]">
                <strong>HELD:</strong> reads_untrusted &rarr; writes_external
              </div>
              <div className="p-3 bg-slate-900 text-slate-100 rounded text-[11px] leading-relaxed overflow-x-auto">
                <span className="text-slate-400">// Injected payload intercepted</span>
                <br />
                <span className="text-rose-400">await tools.http.post(...)</span>
              </div>
              <div className="flex gap-2 pt-1">
                <Link
                  href="/api/auth/demo"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-center font-bold text-[11px] rounded"
                >
                  Approve
                </Link>
                <Link
                  href="/api/auth/demo"
                  className="px-3 py-2 border border-rose-300 bg-rose-50 text-rose-800 text-center font-bold text-[11px] rounded"
                >
                  Deny
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Value Proposition Grid (Clean Editorial Layout) */}
        <div className="w-full bg-white/70 border-t border-[#ccd8cc] backdrop-blur-md z-10 py-16 px-8 lg:px-14">
          <div className="max-w-7xl mx-auto flex flex-col gap-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#ccd8cc] pb-6">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#415949] font-bold">
                  What Airlock Provides
                </span>
                <h2 className="text-3xl font-bold tracking-tight text-[#0b3320] mt-1">
                  Complete Pre-Execution Defense
                </h2>
              </div>
              <Link
                href="/quickstart"
                className="text-xs font-mono uppercase tracking-wider font-bold text-[#0b3320] hover:underline"
              >
                Read Setup Guide →
              </Link>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              <div className="flex flex-col gap-2.5">
                <span className="text-xs font-mono font-bold text-[#415949]">01 / SHIELD</span>
                <h3 className="text-base font-bold text-[#0b3320]">Prompt Injection Defense</h3>
                <p className="text-xs text-[#3b5945] leading-relaxed">
                  Stops hidden instructions inside emails or scraped documents from exfiltrating data to external webhooks.
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                <span className="text-xs font-mono font-bold text-[#415949]">02 / OPERATOR</span>
                <h3 className="text-base font-bold text-[#0b3320]">Human-in-the-Loop Review</h3>
                <p className="text-xs text-[#3b5945] leading-relaxed">
                  Destructive commands or sensitive transfers pause in a clean approval queue for human verification.
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                <span className="text-xs font-mono font-bold text-[#415949]">03 / KILL SWITCH</span>
                <h3 className="text-base font-bold text-[#0b3320]">Instant Key Revocation</h3>
                <p className="text-xs text-[#3b5945] leading-relaxed">
                  Sub-second suspension of rogue machine keys across all connected servers before harm occurs.
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                <span className="text-xs font-mono font-bold text-[#415949]">04 / EFFICIENCY</span>
                <h3 className="text-base font-bold text-[#0b3320]">94%+ Token Reduction</h3>
                <p className="text-xs text-[#3b5945] leading-relaxed">
                  Replaces heavy multi-turn catalog roundtrips with targeted code generation and sub-millisecond AST gating.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Website Workflow Cards */}
        <div className="w-full bg-[#0b3320] text-white py-16 px-8 lg:px-14 z-10">
          <div className="max-w-7xl mx-auto flex flex-col gap-10">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                Control Plane Navigation
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                What You Can Use Right Now From This Website
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
              <Link
                href="/app/approvals"
                className="p-6 bg-[#0f3d27] border border-[#165437] rounded-none hover:border-emerald-400 transition-colors flex flex-col gap-2"
              >
                <div className="flex justify-between items-center text-emerald-300 font-mono font-bold text-sm">
                  <span>Approvals Queue</span>
                  <span>→</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Inspect held scripts, review flagged data flows, and click <em>Approve &amp; Execute Once</em>.
                </p>
              </Link>

              <Link
                href="/app/audit"
                className="p-6 bg-[#0f3d27] border border-[#165437] rounded-none hover:border-emerald-400 transition-colors flex flex-col gap-2"
              >
                <div className="flex justify-between items-center text-emerald-300 font-mono font-bold text-sm">
                  <span>Immutable Audit Trail</span>
                  <span>→</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Browse append-only stream telemetry recording every agent execution, tool call, and decision.
                </p>
              </Link>

              <Link
                href="/app/agents"
                className="p-6 bg-[#0f3d27] border border-[#165437] rounded-none hover:border-emerald-400 transition-colors flex flex-col gap-2"
              >
                <div className="flex justify-between items-center text-emerald-300 font-mono font-bold text-sm">
                  <span>Agent Kill Switches</span>
                  <span>→</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Manage agent API credentials, monitor daily token budgets, and activate emergency suspensions.
                </p>
              </Link>

              <Link
                href="/app/tools"
                className="p-6 bg-[#0f3d27] border border-[#165437] rounded-none hover:border-emerald-400 transition-colors flex flex-col gap-2"
              >
                <div className="flex justify-between items-center text-emerald-300 font-mono font-bold text-sm">
                  <span>Tool Registry</span>
                  <span>→</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Explore upstream tools with automatic semantic risk tags (<code>reads_untrusted</code>, <code>writes_external</code>).
                </p>
              </Link>

              <Link
                href="/app/policies"
                className="p-6 bg-[#0f3d27] border border-[#165437] rounded-none hover:border-emerald-400 transition-colors flex flex-col gap-2"
              >
                <div className="flex justify-between items-center text-emerald-300 font-mono font-bold text-sm">
                  <span>Security Policies</span>
                  <span>→</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  View deterministic rule tables enforcing strict <code>DENY &gt; HOLD &gt; ALLOW</code> precedence.
                </p>
              </Link>

              <Link
                href="/quickstart"
                className="p-6 bg-[#0f3d27] border border-[#165437] rounded-none hover:border-emerald-400 transition-colors flex flex-col gap-2"
              >
                <div className="flex justify-between items-center text-emerald-300 font-mono font-bold text-sm">
                  <span>Quick Start Guide</span>
                  <span>→</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Step-by-step setup for connecting Cursor, Claude Desktop, Python, or TypeScript agents.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Minimalist Footer */}
      <footer className="border-t border-[#ccd8cc] py-8 px-8 lg:px-14 text-xs font-mono text-[#415949]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>Airlock · Pre-Execution Security Gateway for AI Agents</span>
          <div className="flex gap-6 uppercase">
            <Link href="/" className="hover:text-[#0b3320]">Home</Link>
            <Link href="/quickstart" className="hover:text-[#0b3320]">Quick Start</Link>
            <Link href="/terms" className="hover:text-[#0b3320]">Terms</Link>
            <Link href="/privacy" className="hover:text-[#0b3320]">Privacy</Link>
            <Link href="/login" className="hover:text-[#0b3320]">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
