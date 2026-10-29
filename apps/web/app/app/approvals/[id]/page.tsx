import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import { getApprovalById } from '@/lib/data';
import { hasMinimumRole, Role } from '@airlock/shared';
import DecisionButtons from './DecisionButtons';

export default async function ApprovalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  const { id } = await params;
  const approval = await getApprovalById(session.orgId, id);

  if (!approval) {
    notFound();
  }

  const canDecide = hasMinimumRole(session.role, Role.OPERATOR);

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#e7e5e4] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/app/approvals" className="text-xs text-[#78716c] hover:text-[#1c1917] underline">
              ← Approvals
            </Link>
            <span className="text-xs text-[#a8a29e]">/</span>
            <span className="font-mono text-xs text-[#57534e]">{approval.id}</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#1c1917] mt-1">
            {approval.intent || 'Agent Execution Request'}
          </h1>
        </div>

        <span
          className={`px-3 py-1 text-xs font-mono uppercase rounded border font-medium ${
            approval.status === 'pending'
              ? 'bg-amber-100 text-amber-900 border-amber-300'
              : approval.status === 'approved'
              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
              : 'bg-rose-100 text-rose-900 border-rose-300'
          }`}
        >
          {approval.status}
        </span>
      </div>

      {/* Flagged Flow Risk Alert */}
      <div className="p-4 bg-amber-50/80 border border-amber-300 rounded flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-600"></span>
          <span className="font-mono text-xs uppercase font-bold text-amber-900">
            Policy Alert: Flagged Data Flows
          </span>
        </div>
        <p className="text-xs text-amber-900 leading-relaxed">{approval.explanation}</p>
        <div className="flex flex-wrap gap-2 mt-1">
          {approval.flaggedFlows.map((flow, i) => (
            <span key={i} className="px-2.5 py-0.5 rounded bg-white text-rose-900 border border-rose-300 font-mono text-xs font-semibold">
              {flow}
            </span>
          ))}
        </div>
      </div>

      {/* Script Source Code Inspector */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-mono text-[#78716c]">Inspected Script Source</span>
          <span className="text-xs font-mono text-[#a8a29e]">SHA-256: {approval.scriptHash.slice(0, 16)}...</span>
        </div>
        <pre className="p-4 bg-[#1c1917] text-[#fafaf9] rounded border border-[#292524] text-xs font-mono overflow-x-auto leading-relaxed">
          {approval.code}
        </pre>
      </div>

      {/* Decision Section */}
      <div className="p-6 bg-white border border-[#e7e5e4] rounded flex flex-col gap-4 shadow-xs">
        <h2 className="font-serif text-lg font-bold text-[#1c1917]">Operator Decision</h2>

        {approval.status === 'pending' ? (
          canDecide ? (
            <DecisionButtons approvalId={approval.id} />
          ) : (
            <div className="p-3 bg-[#f5f5f4] rounded text-xs text-[#78716c]">
              Your account currently has <span className="font-mono font-bold">Viewer</span> access. Only Operators or Administrators can approve or deny held scripts.
            </div>
          )
        ) : (
          <div className="flex flex-col gap-1 text-xs">
            <span className="text-[#57534e]">
              This script was <strong className="uppercase">{approval.status}</strong> by{' '}
              <span className="font-mono">{approval.decidedBy || 'operator'}</span> on{' '}
              {approval.decidedAt ? new Date(approval.decidedAt).toLocaleString() : 'N/A'}.
            </span>
            {approval.decisionNote && (
              <span className="text-[#78716c] italic mt-1">Note: "{approval.decisionNote}"</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
