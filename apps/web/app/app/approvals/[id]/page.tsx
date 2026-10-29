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

  const statusColors = {
    pending: 'bg-amber-100 text-amber-900 border-amber-300',
    approved: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    denied: 'bg-rose-100 text-rose-900 border-rose-300',
    expired: 'bg-slate-100 text-slate-700 border-slate-300',
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link href="/app/approvals" className="hover:text-slate-900 transition-colors">
              Approvals
            </Link>
            <span>/</span>
            <span className="font-mono text-slate-700">{approval.id}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
            {approval.intent || 'Agent Execution Request'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md border shadow-xs ${
              statusColors[approval.status as keyof typeof statusColors] || statusColors.pending
            }`}
          >
            {approval.status}
          </span>
        </div>
      </div>

      {/* 2-Column Responsive Layout Across Full Screen */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column - Code & Technical Details */}
        <div className="md:col-span-7 xl:col-span-8 flex flex-col gap-6">
          {/* Risk Alert Box */}
          <div className="p-5 bg-amber-50/90 border border-amber-200 rounded-lg flex flex-col gap-2.5 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Policy Alert: Risky Data-Flow Intercepted
              </span>
            </div>
            <p className="text-xs text-amber-950 leading-relaxed font-normal">{approval.explanation}</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {approval.flaggedFlows.map((flow, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded bg-white text-rose-800 border border-rose-200 font-mono text-xs font-semibold shadow-xs"
                >
                  {flow}
                </span>
              ))}
            </div>
          </div>

          {/* Script Code Inspector */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs flex flex-col">
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 border-b border-slate-800 text-slate-300 text-xs">
              <div className="flex items-center gap-2 font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="ml-2 text-slate-400">Inspected Script Source</span>
              </div>
              <span className="font-mono text-slate-500 text-[11px]">
                SHA-256: {approval.scriptHash.slice(0, 20)}...
              </span>
            </div>
            <pre className="p-6 bg-slate-950 text-slate-100 font-mono text-xs leading-relaxed overflow-x-auto">
              <code>{approval.code}</code>
            </pre>
          </div>
        </div>

        {/* Right Column - Decision & Metadata Panel (Sticky on Scroll) */}
        <div className="md:col-span-5 xl:col-span-4 flex flex-col gap-6 md:sticky md:top-24">
          {/* Operator Decision Card */}
          <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-xs flex flex-col gap-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Operator Decision</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review code and approve single-shot sandboxed execution.
              </p>
            </div>

            {approval.status === 'pending' ? (
              canDecide ? (
                <DecisionButtons approvalId={approval.id} />
              ) : (
                <div className="p-3 bg-slate-50 rounded text-xs text-slate-600 border border-slate-200">
                  Your account currently has <strong className="uppercase">Viewer</strong> access. Only Operators or Administrators can approve or deny held scripts.
                </div>
              )
            ) : (
              <div className="flex flex-col gap-2 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <span className="text-slate-700">
                  This script was <strong className="uppercase text-slate-900">{approval.status}</strong> by{' '}
                  <span className="font-mono font-medium">{approval.decidedBy || 'operator'}</span> on{' '}
                  {approval.decidedAt ? new Date(approval.decidedAt).toLocaleString() : 'N/A'}.
                </span>
                {approval.decisionNote && (
                  <span className="text-slate-500 italic mt-1">Audit Note: "{approval.decisionNote}"</span>
                )}
              </div>
            )}
          </div>

          {/* Metadata Card */}
          <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-xs flex flex-col gap-3.5 text-xs">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-400">Request Metadata</h3>
            
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Agent ID</span>
              <span className="font-mono font-semibold text-slate-800">{approval.agentId}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Policy Version</span>
              <span className="font-mono font-semibold text-slate-800">v{approval.policyVersion}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Submitted</span>
              <span className="text-slate-700">{new Date(approval.createdAt).toLocaleString()}</span>
            </div>

            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Expires At</span>
              <span className="text-slate-700">{new Date(approval.expiresAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
