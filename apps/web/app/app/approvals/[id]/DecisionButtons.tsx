'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DecisionButtons({ approvalId }: { approvalId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleDecision(decision: 'approved' | 'denied') {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/approvals/${approvalId}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, note }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to apply decision.');
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message || String(err));
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-md text-xs font-medium">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="note" className="text-xs font-semibold text-slate-700">
          Operator Audit Note (Optional)
        </label>
        <input
          id="note"
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Verified target endpoint is legitimate triage webhook"
          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-md text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
          disabled={loading}
        />
      </div>

      <div className="flex flex-col gap-2.5 pt-1">
        <button
          type="button"
          onClick={() => handleDecision('approved')}
          disabled={loading}
          className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold transition-colors cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            'Processing...'
          ) : (
            <>
              <span>✓</span>
              <span>Approve & Execute Once</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleDecision('denied')}
          disabled={loading}
          className="w-full py-2.5 px-4 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-md text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Deny Execution'}
        </button>
      </div>
    </div>
  );
}
