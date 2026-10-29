import Link from 'next/link';
import { requireSession } from '@/lib/auth';
import { getApprovals } from '@/lib/data';

export default async function ApprovalsListPage() {
  const session = await requireSession();
  const approvals = await getApprovals(session.orgId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#1c1917]">Approval Review Queue</h1>
        <p className="text-sm text-[#78716c] mt-0.5">
          Deterministic policy holds scripts with sensitive data flows for human verification before sandbox execution.
        </p>
      </div>

      {approvals.length === 0 ? (
        <div className="p-12 bg-white border border-[#e7e5e4] rounded text-center text-sm text-[#78716c]">
          No approvals found in organization {session.orgId}.
        </div>
      ) : (
        <div className="bg-white border border-[#e7e5e4] rounded overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fafaf9] border-b border-[#e7e5e4] text-[#78716c] font-mono uppercase">
              <tr>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Approval ID / Intent</th>
                <th className="py-3 px-4">Flagged Risk Flows</th>
                <th className="py-3 px-4">Agent</th>
                <th className="py-3 px-4">Submitted</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f5f4]">
              {approvals.map((appr) => {
                const statusBadge =
                  appr.status === 'pending'
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : appr.status === 'approved'
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : 'bg-rose-100 text-rose-900 border-rose-300';

                return (
                  <tr key={appr.id} className="hover:bg-[#fafaf9] transition-colors">
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded font-mono uppercase text-[11px] border font-medium ${statusBadge}`}>
                        {appr.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#1c1917]">{appr.intent || 'Agent task'}</div>
                      <div className="font-mono text-[#78716c] text-[11px]">{appr.id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {appr.flaggedFlows.map((flow, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 font-mono text-[10px]"
                          >
                            {flow}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[#44403c]">{appr.agentId}</td>
                    <td className="py-3 px-4 text-[#78716c]">{new Date(appr.createdAt).toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/app/approvals/${appr.id}`}
                        className="px-3 py-1 bg-[#1c1917] text-[#fafaf9] rounded text-xs font-medium hover:bg-[#292524] transition-colors inline-block"
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
