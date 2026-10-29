import Link from 'next/link';
import { requireSession } from '@/lib/auth';
import { getApprovals } from '@/lib/data';

export default async function ApprovalsListPage() {
  const session = await requireSession();
  const approvals = await getApprovals(session.orgId);

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Approval Review Queue</h1>
          <p className="text-sm text-slate-500 mt-1">
            Deterministic policy holds scripts with sensitive data flows for human verification before sandbox execution.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-md bg-white border border-slate-200 text-slate-600 shadow-xs">
            Total: {approvals.length}
          </span>
        </div>
      </div>

      {approvals.length === 0 ? (
        <div className="p-16 bg-white border border-slate-200 rounded-lg text-center text-sm text-slate-500 shadow-xs">
          No approvals found in organization {session.orgId}.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs w-full">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
              <tr>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5">Approval ID / Intent</th>
                <th className="py-3.5 px-5">Flagged Risk Flows</th>
                <th className="py-3.5 px-5">Agent</th>
                <th className="py-3.5 px-5">Submitted</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {approvals.map((appr) => {
                const statusBadge =
                  appr.status === 'pending'
                    ? 'bg-amber-50 text-amber-900 border-amber-200'
                    : appr.status === 'approved'
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                    : 'bg-rose-50 text-rose-900 border-rose-200';

                return (
                  <tr key={appr.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-5">
                      <span className={`px-2.5 py-1 rounded-md uppercase font-semibold text-[11px] border ${statusBadge}`}>
                        {appr.status}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <div className="font-bold text-slate-900 text-sm">{appr.intent || 'Agent task'}</div>
                      <div className="font-mono text-slate-400 text-xs mt-0.5">{appr.id}</div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex flex-wrap gap-1.5">
                        {appr.flaggedFlows.map((flow, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 font-mono text-xs font-semibold"
                          >
                            {flow}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-5 font-mono text-slate-700 font-medium">{appr.agentId}</td>
                    <td className="py-4 px-5 text-slate-500">{new Date(appr.createdAt).toLocaleString()}</td>
                    <td className="py-4 px-5 text-right">
                      <Link
                        href={`/app/approvals/${appr.id}`}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold transition-colors inline-block shadow-xs"
                      >
                        Inspect →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
