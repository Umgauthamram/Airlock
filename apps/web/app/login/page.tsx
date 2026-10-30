'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const showGooglePickerInitial = searchParams.get('google_picker') === '1';

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showGoogleModal, setShowGoogleModal] = useState(showGooglePickerInitial);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Preset quick Google demo accounts
  const googleAccounts = [
    { email: 'alex.developer@gmail.com', name: 'Alex Developer', avatar: 'A', color: 'bg-blue-600' },
    { email: 'security.operator@gmail.com', name: 'Sarah Security', avatar: 'S', color: 'bg-emerald-600' },
  ];

  function handleGoogleSelect(selectedEmail: string, selectedName: string) {
    setShowGoogleModal(false);
    // Forward directly to Demo Request flow with Google identity
    router.push(`/demo-request?email=${encodeURIComponent(selectedEmail)}&name=${encodeURIComponent(selectedName)}&provider=google`);
  }

  function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      setError('Please provide an email address.');
      return;
    }

    setLoading(true);
    // Forward to Demo Request flow
    const displayName = mode === 'signup' ? name || email.split('@')[0] : email.split('@')[0];
    router.push(`/demo-request?email=${encodeURIComponent(email)}&name=${encodeURIComponent(displayName)}&provider=email`);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#080c14] text-slate-100 font-sans antialiased">
      {/* Top Header */}
      <header className="w-full px-8 py-6 border-b border-slate-800 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-mono font-black text-lg tracking-[0.2em] text-white uppercase">AIRLOCK</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
        </Link>
        <div className="flex items-center gap-4 text-xs font-mono">
          <Link href="/quickstart" className="text-slate-400 hover:text-white transition-colors">
            Quick Start
          </Link>
        </div>
      </header>

      {/* Main Authentication Box */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl flex flex-col gap-6">
          <div className="flex flex-col gap-1 text-center">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {mode === 'login' ? 'Sign in to Airlock' : 'Create your Account'}
            </h1>
            <p className="text-xs text-slate-400">
              {mode === 'login'
                ? 'Access your pre-execution security gateway and approval console'
                : 'Get started with an automated 12-hour operator license'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs font-mono">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex-1 py-2 text-center rounded-md font-semibold transition-colors cursor-pointer ${
                mode === 'login' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`flex-1 py-2 text-center rounded-md font-semibold transition-colors cursor-pointer ${
                mode === 'signup' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-md text-xs font-mono">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            {/* Google Authentication Button */}
            <button
              type="button"
              onClick={() => setShowGoogleModal(true)}
              className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 rounded-md text-xs font-medium transition-colors shadow-xs flex items-center justify-center gap-3 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
              <span>{mode === 'login' ? 'Continue with Google' : 'Sign up with Google'}</span>
            </button>

            <div className="relative my-1 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800"></div>
              </div>
              <span className="relative bg-slate-900 px-3 text-[11px] font-mono uppercase tracking-wider text-slate-500">
                or with email
              </span>
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleEmailAuth} className="flex flex-col gap-3 text-xs font-mono">
              {mode === 'signup' && (
                <div className="flex flex-col gap-1">
                  <label htmlFor="name" className="text-slate-300 uppercase tracking-wider text-[11px]">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Chen"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-md text-white outline-none focus:border-emerald-400 placeholder:text-slate-600"
                  />
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label htmlFor="email" className="text-slate-300 uppercase tracking-wider text-[11px]">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@company.com"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-md text-white outline-none focus:border-emerald-400 placeholder:text-slate-600"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="password" className="text-slate-300 uppercase tracking-wider text-[11px]">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-md text-white outline-none focus:border-emerald-400 placeholder:text-slate-600"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold uppercase tracking-wider rounded-md transition-colors cursor-pointer shadow-md disabled:opacity-50"
              >
                {loading
                  ? 'Processing...'
                  : mode === 'login'
                  ? 'Sign In & Request Demo →'
                  : 'Create Account & Request Demo →'}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Interactive Google Account Chooser Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white text-slate-900 rounded-2xl p-6 shadow-2xl flex flex-col gap-5 border border-slate-200">
            {/* Google Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                <span className="font-medium text-sm text-slate-700">Sign in with Google</span>
              </div>
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="text-base font-bold text-slate-900">Choose an account</h3>
              <p className="text-xs text-slate-500">to continue to Airlock Gateway</p>
            </div>

            {/* List of Google Accounts */}
            <div className="flex flex-col divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
              {googleAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleGoogleSelect(acc.email, acc.name)}
                  className="flex items-center gap-3.5 p-3.5 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                >
                  <div className={`w-8 h-8 rounded-full ${acc.color} text-white font-bold text-xs flex items-center justify-center shrink-0`}>
                    {acc.avatar}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-xs text-slate-900 truncate">{acc.name}</span>
                    <span className="text-[11px] text-slate-500 truncate">{acc.email}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Custom Google Account Entry */}
            <div className="flex flex-col gap-2 pt-1 border-t border-slate-100">
              <span className="text-[11px] font-medium text-slate-600">Or enter your Google email:</span>
              <div className="flex flex-col gap-2">
                <input
                  type="email"
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  placeholder="your.google.account@gmail.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs text-slate-900 outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customGoogleEmail) {
                      handleGoogleSelect(customGoogleEmail, customGoogleName || customGoogleEmail.split('@')[0]);
                    }
                  }}
                  disabled={!customGoogleEmail}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-medium text-xs rounded-md transition-colors cursor-pointer"
                >
                  Continue with this Google Account →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080c14] text-white p-12 font-mono">Loading...</div>}>
      <AuthContent />
    </Suspense>
  );
}
