'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialEmail = searchParams.get('email') || '';
  const [demoEmail, setDemoEmail] = useState(initialEmail);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const errorParam = searchParams.get('error');

  async function handleDemoRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!demoEmail.trim()) return;

    setLoading(true);
    setError(null);
    setInfoMessage(null);

    try {
      const res = await fetch('/api/auth/demo-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send verification email');
      }

      setIsVerifying(true);
      if (data.devCode) {
        setDevCode(data.devCode);
      }
      setInfoMessage(`Verification code sent to ${demoEmail.trim()}`);
    } catch (err: any) {
      setError(err.message || 'Failed to process demo request');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (!verificationCode.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/demo-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: demoEmail.trim(),
          code: verificationCode.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid verification code');
      }

      router.push(data.redirect || '/app');
    } catch (err: any) {
      setError(err.message || 'Verification failed');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-[#0f172a] font-sans antialiased">
      {/* Top Header */}
      <header className="w-full px-8 py-6 border-b border-slate-200 bg-white flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-mono font-black text-xl tracking-[0.2em] text-[#0f172a] uppercase">AIRLOCK</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
        </Link>
        <div className="flex items-center gap-4 text-xs font-mono">
          <Link href="/quickstart" className="text-slate-600 hover:text-slate-900 transition-colors">
            Quick Start
          </Link>
        </div>
      </header>

      {/* Main Container - Light Mode */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 shadow-xl flex flex-col gap-6">
          <div className="flex flex-col gap-2 text-center items-center">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Access Airlock Platform</h1>
            <p className="text-xs text-slate-500">Sign in with Google or request instant verified demo access</p>
          </div>

          {(error || errorParam) && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-mono">
              {error || (errorParam === 'oauth_error' ? 'Google authentication failed. Please try again.' : errorParam)}
            </div>
          )}

          {infoMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-mono flex flex-col gap-1">
              <span>{infoMessage}</span>
              {devCode && (
                <span className="font-bold text-[11px] text-emerald-900">
                  Dev Code: {devCode}
                </span>
              )}
            </div>
          )}

          {/* OPTION 1: SIGN IN / SIGN UP WITH GOOGLE (REAL REDIRECT) */}
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold">
              Option 1: Google Account
            </span>

            <a
              href="/api/auth/google"
              className="w-full py-3.5 px-5 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold font-mono tracking-wide transition-all shadow-sm flex items-center justify-center gap-3 cursor-pointer hover:scale-[1.01]"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google</span>
            </a>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">or</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          {/* OPTION 2: DEMO REQUEST WITH EMAIL VERIFICATION */}
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold">
              Option 2: Verified Demo Access
            </span>

            {!isVerifying ? (
              <form onSubmit={handleDemoRequest} className="flex flex-col gap-2.5">
                <input
                  type="email"
                  required
                  value={demoEmail}
                  onChange={(e) => setDemoEmail(e.target.value)}
                  placeholder="Enter email (e.g. name@company.com)"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                />
                <button
                  type="submit"
                  disabled={loading || !demoEmail.trim()}
                  className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider rounded-xl transition-all shadow-md hover:scale-[1.01] cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Sending Verification...' : 'Send Verification Code →'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode} className="flex flex-col gap-3 animate-in fade-in">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-slate-700">Enter 6-digit code sent to {demoEmail}:</span>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="123456"
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-emerald-500 rounded-xl text-center text-lg font-mono tracking-[0.4em] font-bold text-slate-900 outline-none focus:bg-white transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || verificationCode.length < 6}
                  className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider rounded-xl transition-all shadow-md hover:scale-[1.01] cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify & Launch Demo →'}
                </button>
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsVerifying(false);
                      setVerificationCode('');
                    }}
                    className="text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    Change email
                  </button>
                  <button
                    type="button"
                    onClick={handleDemoRequest}
                    disabled={loading}
                    className="text-emerald-700 font-semibold hover:underline cursor-pointer"
                  >
                    Resend code
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8fafc] text-slate-800 p-12 font-mono">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
