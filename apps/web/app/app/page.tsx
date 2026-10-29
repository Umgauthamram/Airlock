import Link from 'next/link';
import { requireSession } from '@/lib/auth';
import { getDashboardStats, getApprovals, getAuditEvents } from '@/lib/data';

export default async function DashboardPage() {
  const session = await requireSession();
  const stats = await getDashboardStats(session.orgId);
  const pendingApprovals = await getApprovals(session.orgId, 'pending');
  const recentEvents = await getAuditEvents(session.orgId, 6);

  return (
    <div className="flex flex-col gap-8">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#1c1917]">System Overview</h1>
          <p className="text-sm text-[#78716c] mt-0.5">Real-time gateway status, held approvals, and audit telemetry</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/app/approvals"
            className="px-4 py-2 bg-[#1c1917] text-[#fafaf9] rounded text-sm font-medium hover:bg-[#292524] transition-colors shadow-xs"
          >
            Review Pending ({stats.pendingApprovals})
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-[#e7e5e4] rounded flex flex-col gap-1 shadow-xs">
          <span className="text-xs uppercase font-mono text-[#78716c]">Pending Approvals</span>
          <span className="text-3xl font-mono font-bold text-[#1c1917]">{stats.pendingApprovals}</span>
          <span className="text-xs text-[#a8a29e] mt-1">Held by deterministic policy</span>
        </div>

        <div className="p-5 bg-white border border-[#e7e5e4] rounded flex flex-col gap-1 shadow-xs">
          <span className="text-xs uppercase font-mono text-[#78716c]">Today's Script Runs</span>
          <span className="text-3xl font-mono font-bold text-[#1c1917]">{stats.todayCalls}</span>
          <span className="text-xs text-[#a8a29e] mt-1">Processed across agents</span>
        </div>

        <div className="p-5 bg-white border border-[#e7e5e4] rounded flex flex-col gap-1 shadow-xs">
          <span className="text-xs uppercase font-mono text-[#78716c]">Tokens Saved</span>
          <span className="text-3xl font-mono font-bold text-emerald-700">
            {stats.tokensSaved.toLocaleString()}
          </span>
          <span className="text-xs text-[#a8a29e] mt-1">vs multi-turn catalog tools</span>
        </div>

        <div className="p-5 bg-white border border-[#e7e5e4] rounded flex flex-col gap-1 shadow-xs">
          <span className="text-xs uppercase font-mono text-[#78716c]">Avg Added Latency</span>
          <span className="text-3xl font-mono font-bold text-[#1c1917]">{stats.avgAddedLatencyMs} ms</span>
          <span className="text-xs text-[#a8a29e] mt-1">Deterministic AST analysis</span>
        </div>
      </div>

      {/* Main Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Approvals Queue */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#e7e5e4] pb-2">
            <h2 className="font-serif text-lg font-bold text-[#1c1917]">Pending Approvals</h2>
            <Link href="/app/approvals" className="text-xs text-[#78716c] hover:text-[#1c1917] underline">
              View all
            </Link>
          </div>

          {pendingApprovals.length === 0 ? (
            <div className="p-8 bg-white border border-[#e7e5e4] rounded text-center text-sm text-[#78716c]">
              No scripts currently waiting for human approval.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {pendingApprovals.map((appr) => (
                <div
                  key={appr.id}
                  className="p-5 bg-white border border-[#e7e5e4] rounded hover:border-[#d6d3d1] transition-colors flex flex-col gap-3 shadow-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-mono text-[#78716c]">{appr.id}</span>
                      <h3 className="text-sm font-semibold text-[#1c1917] mt-0.5">
                        {appr.intent || 'Automated agent task'}
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 text-xs font-mono uppercase rounded bg-amber-100 text-amber-900 border border-amber-300">
                      Pending Review
                    </span>
                  </div>

                  <p className="text-xs text-[#57534e] line-clamp-2">{appr.explanation}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-[#f5f5f4] text-xs">
                    <div className="flex gap-2">
                      {appr.flaggedFlows.map((f, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 font-mono text-[11px]">
                          {f}
                        </span>
                      ))}
                    </div>
                    <Link
                      href={`/app/approvals/${appr.id}`}
                      className="px-3 py-1 bg-[#1c1917] text-white rounded text-xs font-medium hover:bg-[#292524]"
                    >
                      Inspect & Decide →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Audit Feed */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#e7e5e4] pb-2">
            <h2 className="font-serif text-lg font-bold text-[#1c1917]">Live Audit Stream</h2>
            <Link href="/app/audit" className="text-xs text-[#78716c] hover:text-[#1c1917] underline">
              Explorer
            </Link>
          </div>

          <div className="p-4 bg-white border border-[#e7e5e4] rounded flex flex-col gap-3">
            {recentEvents.length === 0 ? (
              <span className="text-xs text-[#78716c]">No audit events logged yet.</span>
            ) : (
              recentEvents.map((evt) => (
                <div key={evt.id} className="text-xs flex flex-col gap-1 pb-2 border-b border-[#f5f5f4] last:border-0 last:pb-0">
                  <div className="flex items-center justify-between font-mono text-[11px] text-[#78716c]">
                    <span>{evt.eventType}</span>
                    <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                  </div>
                  {evt.agentId && <span className="text-[#44403c]">Agent: {evt.agentId}</span>}
                  {evt.approvalId && <span className="text-[#44403c]">Approval: {evt.approvalId}</span>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
