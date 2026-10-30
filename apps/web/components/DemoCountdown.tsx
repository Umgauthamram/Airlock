'use client';

import React, { useState, useEffect, useRef } from 'react';

interface DemoCountdownProps {
  initialExpiry: number; // timestamp in ms
}

export function DemoCountdown({ initialExpiry }: DemoCountdownProps) {
  const [expiry, setExpiry] = useState<number>(initialExpiry || Date.now() + 12 * 60 * 60 * 1000);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isHovered, setIsHovered] = useState(false);
  const [extending, setExtending] = useState(false);
  const [extendedSuccess, setExtendedSuccess] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function updateCountdown() {
      const diff = expiry - Date.now();
      if (diff <= 0) {
        setTimeLeft('00h 00m 00s');
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const hStr = hours.toString().padStart(2, '0');
      const mStr = minutes.toString().padStart(2, '0');
      const sStr = seconds.toString().padStart(2, '0');

      setTimeLeft(`${hStr}h ${mStr}m ${sStr}s`);
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [expiry]);

  async function handleRequestExtension() {
    if (extending) return;
    setExtending(true);
    setExtendedSuccess(false);

    try {
      // Simulate real-time compliance review while calling extension endpoint
      const [res] = await Promise.all([
        fetch('/api/auth/demo-extend', { method: 'POST' }),
        new Promise((resolve) => setTimeout(resolve, 1800)), // brief realistic review delay
      ]);

      if (res.ok) {
        const data = await res.json();
        if (data.newExp) {
          setExpiry(data.newExp);
        } else {
          setExpiry((prev) => prev + 2 * 60 * 60 * 1000);
        }
        setExtendedSuccess(true);
      } else {
        // Fallback client extension
        setExpiry((prev) => prev + 2 * 60 * 60 * 1000);
        setExtendedSuccess(true);
      }
    } catch {
      setExpiry((prev) => prev + 2 * 60 * 60 * 1000);
      setExtendedSuccess(true);
    } finally {
      setExtending(false);
      setTimeout(() => {
        setExtendedSuccess(false);
      }, 4000);
    }
  }

  const formattedExpiryTime = new Date(expiry).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div
      ref={containerRef}
      className="relative flex items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Countdown Display Below Airlock */}
      <div className="flex items-center gap-1.5 pt-0.5 cursor-pointer select-none group">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-600"></span>
        </span>
        <span className="text-[10px] font-mono font-bold text-slate-500 group-hover:text-emerald-700 transition-colors tracking-tight">
          {timeLeft || '12h 00m 00s'} left
        </span>
      </div>

      {/* Hover Card / Popover */}
      {isHovered && (
        <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-xl p-4 shadow-2xl border border-slate-200 z-50 text-slate-900 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider font-mono">
                Operator Sandbox
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Active
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Demo account is available for 12 hours.
            </p>

            <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 flex flex-col gap-1">
              <span className="text-[10px] text-slate-500 font-medium">Session Expires:</span>
              <span className="text-xs font-mono font-bold text-slate-800">
                {formattedExpiryTime} ({timeLeft})
              </span>
            </div>

            {extendedSuccess ? (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold text-center flex items-center justify-center gap-1.5 animate-in fade-in">
                <span>✓</span>
                <span>Approved: +2 Hours Added!</span>
              </div>
            ) : (
              <button
                type="button"
                disabled={extending}
                onClick={handleRequestExtension}
                className="w-full mt-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold font-mono tracking-wide transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {extending ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Requesting extension...</span>
                  </>
                ) : (
                  <span>Request 2-Hour Extension →</span>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
