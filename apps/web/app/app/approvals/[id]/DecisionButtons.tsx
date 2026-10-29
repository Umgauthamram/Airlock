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
        <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded text-xs">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="note" className="text-xs font-mono text-[#78716c]">
          Audit Decision Note (Optional)
        </label>
        <input
          id="note"
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Verified target endpoint is legitimate triage webhook"
          className="px-3 py-2 border border-[#d6d3d1] rounded text-xs bg-[#fafaf9] focus:outline-none focus:border-[#1c1917]"
          disabled={loading}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => handleDecision('approved')}
          disabled={loading}
          className="px-5 py-2.5 bg-emerald-700 text-white rounded text-xs font-semibold hover:bg-emerald-800 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Approve & Execute Once'}
        </button>

        <button
          type="button"
          onClick={() => handleDecision('denied')}
          disabled={loading}
          className="px-5 py-2.5 border border-rose-300 bg-rose-50 text-rose-900 rounded text-xs font-semibold hover:bg-rose-100 transition-colors cursor-pointer disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Deny Execution'}
        </button>
      </div>
    </div>
  );
}

