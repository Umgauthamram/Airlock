'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function DemoRequestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialEmail = searchParams.get('email') || '';
  const initialName = searchParams.get('name') || '';

  const [email, setEmail] = useState(initialEmail);
  const [name, setName] = useState(initialName);
  const [orgName, setOrgName] = useState('Personal Dev Org');
  const [useCase, setUseCase] = useState('Cursor & Claude MCP Protection');

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Countdown timer state (in milliseconds)
  const [remainingMs, setRemainingMs] = useState(5 * 60 * 1000); // 300,000 ms (5 mins)
  const [isApproved, setIsApproved] = useState(false);

  // Check if an existing request is pending or approved for this email on mount
  useEffect(() => {
    if (!initialEmail) return;

    async function checkStatus() {
      try {
        const res = await fetch(`/api/auth/demo-request?email=${encodeURIComponent(initialEmail)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'approved') {
            setIsApproved(true);
            setTimeout(() => router.push(data.redirect || '/app'), 1200);
          } else if (data.status === 'pending') {
            setIsSubmitted(true);
            setRemainingMs(data.remainingMs || 5 * 60 * 1000);
          }
        }
      } catch {
        // ignore
      }
    }

    checkStatus();
  }, [initialEmail, router]);

  // Handle countdown and polling when submitted
  useEffect(() => {
    if (!isSubmitted || isApproved) return;

    // 1-second interval for local ticker
    const interval = setInterval(() => {
      setRemainingMs((prev) => {
        if (prev <= 1000) {
          // Reached 0: trigger auto-approval check
          checkApproval();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    // 3-second background polling check
    async function checkApproval() {
      try {
        const res = await fetch(`/api/auth/demo-request?email=${encodeURIComponent(email)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'approved') {
            setIsApproved(true);
            clearInterval(interval);
            setTimeout(() => {
              router.push(data.redirect || '/app');
            }, 1000);
          }
        }
      } catch {
        // ignore
      }
    }

    const pollInterval = setInterval(checkApproval, 4000);

    return () => {
      clearInterval(interval);
      clearInterval(pollInterval);
    };
  }, [isSubmitted, isApproved, email, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      setError('Please provide an email address.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/demo-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, orgName, useCase }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit demo request');
      }

      if (data.status === 'approved') {
        setIsApproved(true);
        setTimeout(() => router.push(data.redirect || '/app'), 1200);
      } else {
        setIsSubmitted(true);
        setRemainingMs(data.remainingMs || 5 * 60 * 1000);
      }
    } catch (err: any) {
      setError(err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleFastTrack() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/demo-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, action: 'fast-track' }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'approved') {
        setIsApproved(true);
        setTimeout(() => router.push(data.redirect || '/app'), 800);
      }
    } catch (err: any) {
      setError(err.message || 'Fast-track failed');
    } finally {
      setLoading(false);
    }
  }

  // Format seconds and minutes
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressPercent = Math.min(100, Math.max(0, ((300 - totalSeconds) / 300) * 100));

  return (
    <div className="min-h-screen flex flex-col bg-[#080c14] text-slate-100 font-sans antialiased">
      {/* Top Bar */}
      <header className="w-full px-8 py-6 border-b border-slate-800 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-mono font-black text-lg tracking-[0.2em] text-white uppercase">AIRLOCK</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
        </Link>
        <div className="flex items-center gap-4 text-xs font-mono">
          <Link href="/login" className="text-slate-400 hover:text-white transition-colors">
            Back to Sign In
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl p-8 sm:p-10 shadow-2xl flex flex-col gap-6">
          {!isSubmitted ? (
            /* Phase 1: Request Form */
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-mono text-[11px] font-semibold uppercase tracking-wider w-fit">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  12-Hour Operator Pass
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Request Demo Access</h1>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Submit your details to request an automated 12-hour demo license. Requests undergo an automated 5-minute security screening before access is unlocked.
                </p>
              </div>

              {error && (
                <div className="p-3.5 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-md text-xs font-mono">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-4 text-xs font-mono">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-slate-300 uppercase tracking-wider font-semibold">
                    Work or Google Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com or @gmail.com"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-md text-white text-xs outline-none focus:border-emerald-400 transition-colors placeholder:text-slate-600"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name" className="text-slate-300 uppercase tracking-wider font-semibold">
                    Full Name / Handle
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Mercer"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-md text-white text-xs outline-none focus:border-emerald-400 transition-colors placeholder:text-slate-600"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="orgName" className="text-slate-300 uppercase tracking-wider font-semibold">
                    Organization / Project Name
                  </label>
                  <input
                    id="orgName"
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. Acme AI Labs"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-md text-white text-xs outline-none focus:border-emerald-400 transition-colors placeholder:text-slate-600"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="useCase" className="text-slate-300 uppercase tracking-wider font-semibold">
                    Intended Evaluation Environment
                  </label>
                  <select
                    id="useCase"
                    value={useCase}
                    onChange={(e) => setUseCase(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-md text-white text-xs outline-none focus:border-emerald-400 transition-colors"
                  >
                    <option value="Cursor & Claude MCP Protection">Cursor AI &amp; Claude Desktop MCP Protection</option>
                    <option value="Automated Agent Tool Defense">Autonomous Coding Agent Pre-Execution Inspection</option>
                    <option value="Nebius Token Factory & Nemotron Evaluation">Nebius Token Factory &amp; Nemotron Evaluation</option>
                    <option value="Enterprise Compliance Sandbox">Enterprise Compliance &amp; Audit Trail Review</option>
                  </select>
                </div>
              </div>

              {/* Informational Policy Box */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex flex-col gap-2 text-[11px] text-slate-400">
                <div className="flex items-center justify-between text-slate-300 font-mono font-semibold">
                  <span>Policy Verification</span>
                  <span className="text-emerald-400">Automatic (5 Mins)</span>
                </div>
                <p>
                  Upon submission, Airlock will automatically evaluate your request against sandbox policy. Once approved, you receive full <strong>Operator</strong> privileges valid for <strong>12 hours</strong>.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider rounded-md transition-colors cursor-pointer shadow-lg disabled:opacity-50"
              >
                {loading ? 'Submitting Request...' : 'Submit Demo Request (12-Hour Access) →'}
              </button>
            </form>
          ) : (
            /* Phase 2: Live Countdown & Automatic Approval */
            <div className="flex flex-col items-center text-center gap-6 py-4">
              <div className="flex flex-col items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-semibold uppercase tracking-wider">
                  Automated Review In Progress
                </span>
                <h2 className="text-2xl font-bold text-white mt-1">
                  {isApproved ? 'Access Approved!' : 'Reviewing Demo Access Request'}
                </h2>
                <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                  {isApproved
                    ? 'Your 12-hour operator session has been provisioned. Redirecting to your dashboard...'
                    : `Request registered for ${email}. Airlock automated policy engine will auto-approve this session in 5 minutes.`}
                </p>
              </div>

              {/* Big Animated Circular Countdown Ring */}
              <div className="relative w-44 h-44 flex items-center justify-center my-2">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="6" className="text-slate-800" fill="transparent" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="currentColor"
                    strokeWidth="6"
                    className={`${isApproved ? 'text-emerald-400' : 'text-amber-400'} transition-all duration-1000 ease-linear`}
                    fill="transparent"
                    strokeDasharray={264}
                    strokeDashoffset={264 - (264 * progressPercent) / 100}
                    strokeLinecap="round"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
                  {isApproved ? (
                    <span className="text-xl font-bold text-emerald-400">Ready</span>
                  ) : (
                    <>
                      <span className="text-3xl font-bold text-white tracking-wider">{timeFormatted}</span>
                      <span className="text-[10px] text-slate-500 uppercase mt-0.5">Remaining</span>
                    </>
                  )}
                </div>
              </div>

              {/* Progress Summary Card */}
              <div className="w-full p-4 bg-slate-950 border border-slate-800 rounded-lg flex flex-col gap-2.5 text-left text-xs font-mono">
                <div className="flex justify-between border-b border-slate-900 pb-2">
                  <span className="text-slate-500">Applicant:</span>
                  <span className="text-slate-300 font-semibold">{email}</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-2">
                  <span className="text-slate-500">Session Validity:</span>
                  <span className="text-emerald-400 font-semibold">12 Hours (from approval)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Approval Policy:</span>
                  <span className="text-amber-300 font-semibold">
                    {isApproved ? 'Approved' : 'Auto-approves at 00:00'}
                  </span>
                </div>
              </div>

              {/* Fast-Track Bypass Button for Evaluators */}
              <div className="w-full flex flex-col gap-2 pt-2 border-t border-slate-800">
                <p className="text-[11px] text-slate-500">
                  Testing or evaluating for judging? You can bypass the 5-minute wait queue:
                </p>
                <button
                  type="button"
                  onClick={handleFastTrack}
                  disabled={loading || isApproved}
                  className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 rounded-md font-mono text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span>Fast-Track Instant Approval</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function DemoRequestPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080c14] text-white p-12 font-mono">Loading...</div>}>
      <DemoRequestContent />
    </Suspense>
  );
}
