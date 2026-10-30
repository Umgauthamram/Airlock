'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import MimirAsciiCanvas from '@/components/MimirAsciiCanvas';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light-sage'>('dark');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email) setSubmitted(true);
  }

  const isDark = theme === 'dark';
  const pageBg = isDark ? '#080c14' : '#e6ece6';
  const textColor = isDark ? 'text-slate-100' : 'text-[#0b3320]';
  const subtextColor = isDark ? 'text-slate-400' : 'text-[#3b5945]';
  const headingColor = isDark ? 'text-white' : 'text-[#0b3320]';
  const borderCol = isDark ? 'border-slate-800' : 'border-[#ccd8cc]';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans antialiased transition-colors duration-300 ${textColor} ${
        isDark ? 'selection:bg-emerald-500 selection:text-black' : 'selection:bg-[#0b3320] selection:text-white'
      }`}
      style={{ backgroundColor: pageBg }}
    >
      {/* Minimal Top Brand Bar */}
      <header className="w-full px-8 lg:px-14 py-8 flex items-center justify-between z-30">
        <Link href="/" className="flex items-center gap-2 group">
          <span
            className={`font-mono font-black text-xl tracking-[0.25em] uppercase ${
              isDark ? 'text-white' : 'text-[#0b3320]'
            }`}
          >
            AIRLOCK
          </span>
          <span
            className={`w-2 h-2 rounded-full ${
              isDark ? 'bg-emerald-400' : 'bg-[#0b3320]'
            } group-hover:scale-125 transition-transform`}
          ></span>
        </Link>

        <nav className="flex items-center gap-6 sm:gap-8 text-xs font-mono uppercase tracking-wider font-semibold">
          {/* Mimir Palette Theme Switcher */}
          <button
            type="button"
            onClick={() => setTheme(isDark ? 'light-sage' : 'dark')}
            className={`px-3 py-1.5 rounded border text-[11px] font-mono transition-colors flex items-center gap-1.5 ${
              isDark
                ? 'border-slate-700 bg-slate-900/80 text-slate-300 hover:text-white hover:border-slate-500'
                : 'border-[#0b3320]/30 bg-white/70 text-[#0b3320] hover:bg-white'
            }`}
            title="Toggle Mimir dark / light aesthetic"
          >
            <span>{isDark ? '🌙 MIMIR DARK' : '☀️ SAGE LIGHT'}</span>
          </button>

          <Link
            href="/quickstart"
            className={`${isDark ? 'text-slate-400 hover:text-white' : 'text-[#3b5945] hover:text-[#0b3320]'} transition-colors`}
          >
            Quick Start
          </Link>
          <Link
            href="/login"
            className={`${isDark ? 'text-slate-400 hover:text-white' : 'text-[#3b5945] hover:text-[#0b3320]'} transition-colors`}
          >
            Sign In
          </Link>
          <Link
            href="/api/auth/demo"
            className={`px-5 py-2.5 rounded-none transition-colors shadow-xs ${
              isDark ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold' : 'bg-[#0b3320] hover:bg-[#12452c] text-white'
            }`}
          >
            Explore Demo →
          </Link>
        </nav>
      </header>

      {/* Main Hero Showcase */}
      <main className="flex-1 flex flex-col justify-between relative overflow-hidden">
        {/* Full-bleed Mimir Mosaic ASCII Canvas on Right Side with Seamless Edge */}
        <div className="absolute inset-y-0 right-0 w-full lg:w-3/5 z-0 pointer-events-auto">
          <MimirAsciiCanvas
            cellSize={13}
            renderMode="mosaic"
            theme={theme}
            backgroundColor={pageBg}
            className="w-full h-full"
          />
        </div>

        {/* Hero Left Content Column */}
        <div className="w-full px-8 lg:px-14 pt-8 lg:pt-16 pb-20 z-10 flex flex-col justify-between max-w-7xl mx-auto pointer-events-none">
          <div className="max-w-2xl flex flex-col gap-8 pointer-events-auto">
            {/* Title Block */}
            <div className="flex flex-col">
              <h1 className={`text-6xl sm:text-7xl lg:text-[5.5rem] font-bold tracking-[-0.04em] leading-[0.95] ${headingColor}`}>
                Security Mode <br />
                for Cursor
              </h1>
            </div>

            {/* Subtitle */}
            <p className={`text-xl sm:text-2xl font-bold tracking-tight max-w-lg leading-snug ${headingColor}`}>
              Introducing a new way to protect tools right where your agents code.
            </p>

            <p className={`text-sm max-w-md leading-relaxed font-normal ${subtextColor}`}>
              Airlock intercepts MCP actions before execution. It stops prompt-injection exfiltration, gates risky external calls, and holds destructive changes for single-click human approval.
            </p>

            {/* Email / Access Input Box (Exact style from screenshot) */}
            <div className="flex flex-col gap-3 pt-4 max-w-md">
              <span className={`text-xs font-mono tracking-wider ${subtextColor}`}>
                Available soon. Be first to get access.
              </span>

              {submitted ? (
                <div
                  className={`p-4 border text-xs font-mono flex items-center justify-between ${
                    isDark
                      ? 'bg-slate-900 border-emerald-500/50 text-emerald-300'
                      : 'bg-white border-[#0b3320] text-[#0b3320]'
                  }`}
                >
                  <span>✓ Request recorded. Check your inbox for key access.</span>
                  <Link href="/api/auth/demo" className="underline font-bold">
                    Launch Demo →
                  </Link>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className={`flex border ${
                    isDark
                      ? 'border-slate-700 bg-slate-900/60 backdrop-blur-xs'
                      : 'border-[#0b3320] bg-white/70 backdrop-blur-xs'
                  }`}
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="YOUR EMAIL"
                    className={`px-4 py-3.5 bg-transparent text-xs font-mono tracking-wider uppercase outline-none flex-1 min-w-0 ${
                      isDark
                        ? 'text-white placeholder:text-slate-500'
                        : 'text-[#0b3320] placeholder:text-[#6a8070]'
                    }`}
                  />
                  <button
                    type="submit"
                    className={`px-6 py-3.5 text-xs font-mono font-bold uppercase tracking-wider transition-colors shrink-0 cursor-pointer ${
                      isDark
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                        : 'bg-[#0b3320] hover:bg-[#12452c] text-white'
                    }`}
                  >
                    REQUEST ACCESS
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Floating Right Mockup Overlay */}
        <div className="hidden xl:block absolute right-0 top-1/2 -translate-y-1/2 w-80 translate-x-6 z-20 pointer-events-auto">
          <div
            className={`border-2 shadow-2xl rounded-l-2xl overflow-hidden flex flex-col ${
              isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-[#0b3320] text-[#0b3320]'
            }`}
          >
            <div
              className={`px-4 py-3 border-b flex items-center justify-between ${
                isDark ? 'bg-amber-400/90 border-slate-700 text-black' : 'bg-[#fbbf24] border-[#0b3320] text-black'
              }`}
            >
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider">
                Airlock · Gate Alert
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
            </div>
            <div className="p-4 flex flex-col gap-3 text-xs font-mono">
              <div
                className={`p-2.5 rounded border text-[11px] ${
                  isDark ? 'bg-amber-950/60 border-amber-800 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <strong>HELD:</strong> reads_untrusted &rarr; writes_external
              </div>
              <div
                className={`p-3 rounded text-[11px] leading-relaxed overflow-x-auto ${
                  isDark ? 'bg-black border border-slate-800 text-slate-200' : 'bg-slate-900 text-slate-100'
                }`}
              >
                <span className="text-slate-400">// Injected payload intercepted</span>
                <br />
                <span className="text-rose-400">await tools.http.post(...)</span>
              </div>
              <div className="flex gap-2 pt-1">
                <Link
                  href="/api/auth/demo"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-center font-bold text-[11px] rounded transition-colors"
                >
                  Approve
                </Link>
                <Link
                  href="/api/auth/demo"
                  className={`px-3 py-2 border text-center font-bold text-[11px] rounded transition-colors ${
                    isDark ? 'border-rose-800 bg-rose-950/50 text-rose-300' : 'border-rose-300 bg-rose-50 text-rose-800'
                  }`}
                >
                  Deny
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Value Proposition Grid */}
        <div
          className={`w-full border-t backdrop-blur-md z-10 py-16 px-8 lg:px-14 ${
            isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-white/70 border-[#ccd8cc]'
          }`}
        >
          <div className="max-w-7xl mx-auto flex flex-col gap-12">
            <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b pb-6 ${borderCol}`}>
              <div>
                <span
                  className={`text-xs font-mono uppercase tracking-widest font-bold ${
                    isDark ? 'text-emerald-400' : 'text-[#415949]'
                  }`}
                >
                  What Airlock Provides
                </span>
                <h2 className={`text-3xl font-bold tracking-tight mt-1 ${headingColor}`}>
                  Complete Pre-Execution Defense
                </h2>
              </div>
              <Link
                href="/quickstart"
                className={`text-xs font-mono uppercase tracking-wider font-bold hover:underline ${
                  isDark ? 'text-emerald-400' : 'text-[#0b3320]'
                }`}
              >
                Read Setup Guide →
              </Link>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              <div className="flex flex-col gap-2.5">
                <span className={`text-xs font-mono font-bold ${isDark ? 'text-emerald-400' : 'text-[#415949]'}`}>
                  01 / SHIELD
                </span>
                <h3 className={`text-base font-bold ${headingColor}`}>Prompt Injection Defense</h3>
                <p className={`text-xs leading-relaxed ${subtextColor}`}>
                  Stops hidden instructions inside emails or scraped documents from exfiltrating data to external webhooks.
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                <span className={`text-xs font-mono font-bold ${isDark ? 'text-emerald-400' : 'text-[#415949]'}`}>
                  02 / OPERATOR
                </span>
                <h3 className={`text-base font-bold ${headingColor}`}>Human-in-the-Loop Review</h3>
                <p className={`text-xs leading-relaxed ${subtextColor}`}>
                  Destructive commands or sensitive transfers pause in a clean approval queue for human verification.
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                <span className={`text-xs font-mono font-bold ${isDark ? 'text-emerald-400' : 'text-[#415949]'}`}>
                  03 / KILL SWITCH
                </span>
                <h3 className={`text-base font-bold ${headingColor}`}>Instant Key Revocation</h3>
                <p className={`text-xs leading-relaxed ${subtextColor}`}>
                  Sub-second suspension of rogue machine keys across all connected servers before harm occurs.
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                <span className={`text-xs font-mono font-bold ${isDark ? 'text-emerald-400' : 'text-[#415949]'}`}>
                  04 / EFFICIENCY
                </span>
                <h3 className={`text-base font-bold ${headingColor}`}>94%+ Token Reduction</h3>
                <p className={`text-xs leading-relaxed ${subtextColor}`}>
                  Replaces heavy multi-turn catalog roundtrips with targeted code generation and sub-millisecond AST gating.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Website Workflow Cards */}
        <div
          className={`w-full py-16 px-8 lg:px-14 z-10 ${
            isDark ? 'bg-slate-900 border-t border-slate-800' : 'bg-[#0b3320] text-white'
          }`}
        >
          <div className="max-w-7xl mx-auto flex flex-col gap-10">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                Control Plane Navigation
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                What You Can Use Right Now From This Website
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
              <Link
                href="/app/approvals"
                className={`p-6 border transition-colors flex flex-col gap-2 ${
                  isDark
                    ? 'bg-slate-950/80 border-slate-800 hover:border-emerald-400 text-slate-300'
                    : 'bg-[#0f3d27] border-[#165437] hover:border-emerald-400 text-slate-300'
                }`}
              >
                <div className="flex justify-between items-center text-emerald-300 font-mono font-bold text-sm">
                  <span>Approvals Queue</span>
                  <span>→</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Inspect held scripts, review flagged data flows, and click <em>Approve &amp; Execute Once</em>.
                </p>
              </Link>

              <Link
                href="/app/audit"
                className={`p-6 border transition-colors flex flex-col gap-2 ${
                  isDark
                    ? 'bg-slate-950/80 border-slate-800 hover:border-emerald-400 text-slate-300'
                    : 'bg-[#0f3d27] border-[#165437] hover:border-emerald-400 text-slate-300'
                }`}
              >
                <div className="flex justify-between items-center text-emerald-300 font-mono font-bold text-sm">
                  <span>Immutable Audit Trail</span>
                  <span>→</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Browse append-only stream telemetry recording every agent execution, tool call, and decision.
                </p>
              </Link>

              <Link
                href="/app/agents"
                className={`p-6 border transition-colors flex flex-col gap-2 ${
                  isDark
                    ? 'bg-slate-950/80 border-slate-800 hover:border-emerald-400 text-slate-300'
                    : 'bg-[#0f3d27] border-[#165437] hover:border-emerald-400 text-slate-300'
                }`}
              >
                <div className="flex justify-between items-center text-emerald-300 font-mono font-bold text-sm">
                  <span>Agent Kill Switches</span>
                  <span>→</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Monitor active agent keys, daily token consumption budgets, and test instantaneous suspension.
                </p>
              </Link>

              <Link
                href="/app/policies"
                className={`p-6 border transition-colors flex flex-col gap-2 ${
                  isDark
                    ? 'bg-slate-950/80 border-slate-800 hover:border-emerald-400 text-slate-300'
                    : 'bg-[#0f3d27] border-[#165437] hover:border-emerald-400 text-slate-300'
                }`}
              >
                <div className="flex justify-between items-center text-emerald-300 font-mono font-bold text-sm">
                  <span>Active Policies</span>
                  <span>→</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Review deterministic rule hierarchy (DENY &gt; HOLD &gt; ALLOW) and customize data flow classifications.
                </p>
              </Link>

              <Link
                href="/app/tools"
                className={`p-6 border transition-colors flex flex-col gap-2 ${
                  isDark
                    ? 'bg-slate-950/80 border-slate-800 hover:border-emerald-400 text-slate-300'
                    : 'bg-[#0f3d27] border-[#165437] hover:border-emerald-400 text-slate-300'
                }`}
              >
                <div className="flex justify-between items-center text-emerald-300 font-mono font-bold text-sm">
                  <span>Discovered MCP Tools</span>
                  <span>→</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Explore 50+ classified tools across Gmail, Stripe, Postgres, AWS, and Cloudflare.
                </p>
              </Link>

              <Link
                href="/app/results"
                className={`p-6 border transition-colors flex flex-col gap-2 ${
                  isDark
                    ? 'bg-slate-950/80 border-slate-800 hover:border-emerald-400 text-slate-300'
                    : 'bg-[#0f3d27] border-[#165437] hover:border-emerald-400 text-slate-300'
                }`}
              >
                <div className="flex justify-between items-center text-emerald-300 font-mono font-bold text-sm">
                  <span>Empirical Benchmark</span>
                  <span>→</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Inspect measured token reductions (94.7%), attack catch rates (100%), and sub-2ms analysis timings.
                </p>
              </Link>
            </div>
          </div>
        </div>

        {/* Minimal Footer */}
        <footer
          className={`w-full py-8 px-8 lg:px-14 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono z-10 ${
            isDark ? 'bg-slate-950 border-slate-800 text-slate-500' : 'bg-[#e6ece6] border-[#ccd8cc] text-[#415949]'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="font-bold">AIRLOCK</span>
            <span>·</span>
            <span>Deterministic Agent Security</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/quickstart" className="hover:underline">
              Quick Start
            </Link>
            <Link href="/privacy" className="hover:underline">
              Privacy
            </Link>
            <Link href="/terms" className="hover:underline">
              Terms
            </Link>
            <Link href="/request-access" className="hover:underline">
              Request Access
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
