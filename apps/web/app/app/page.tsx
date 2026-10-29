import Link from 'next/link';
import { requireSession } from '@/lib/auth';
import { getDashboardStats, getApprovals, getAuditEvents } from '@/lib/data';

export default async function DashboardPage() {
  const session = await requireSession();
  const stats = await getDashboardStats(session.orgId);
  const pendingApprovals = await getApprovals(session.orgId, 'pending');
  const recentEvents = await getAuditEvents(session.orgId, 8);

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time gateway status, held approvals, and audit telemetry</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/app/approvals"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold transition-colors shadow-xs"
          >
            Review Pending ({stats.pendingApprovals})
          </Link>
        </div>
      </div>

      {/* Metrics Row - Full Screen 4 Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 bg-white border border-slate-200 rounded-lg flex flex-col gap-1.5 shadow-xs">
          <span className="text-xs uppercase font-semibold text-slate-500 tracking-wider">Pending Approvals</span>
          <span className="text-3xl font-bold font-mono text-slate-900">{stats.pendingApprovals}</span>
          <span className="text-xs text-slate-400 mt-0.5">Held by deterministic policy</span>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-lg flex flex-col gap-1.5 shadow-xs">
          <span className="text-xs uppercase font-semibold text-slate-500 tracking-wider">Today's Script Runs</span>
          <span className="text-3xl font-bold font-mono text-slate-900">{stats.todayCalls}</span>
          <span className="text-xs text-slate-400 mt-0.5">Processed across agents</span>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-lg flex flex-col gap-1.5 shadow-xs">
          <span className="text-xs uppercase font-semibold text-slate-500 tracking-wider">Tokens Saved</span>
          <span className="text-3xl font-bold font-mono text-emerald-600">
            {stats.tokensSaved.toLocaleString()}
          </span>
          <span className="text-xs text-slate-400 mt-0.5">vs multi-turn catalog tools</span>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-lg flex flex-col gap-1.5 shadow-xs">
          <span className="text-xs uppercase font-semibold text-slate-500 tracking-wider">Avg Added Latency</span>
          <span className="text-3xl font-bold font-mono text-slate-900">{stats.avgAddedLatencyMs} ms</span>
          <span className="text-xs text-slate-400 mt-0.5">Deterministic AST analysis</span>
        </div>
      </div>

      {/* Left / Right Main Grid Across Full Width */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Section - Pending Approvals */}
        <div className="md:col-span-7 xl:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-lg font-bold text-slate-900">Pending Approvals Queue</h2>
            <Link href="/app/approvals" className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline">
              View all approvals →
            </Link>
          </div>

          {pendingApprovals.length === 0 ? (
            <div className="p-12 bg-white border border-slate-200 rounded-lg text-center text-sm text-slate-500">
              No scripts currently waiting for human operator approval.
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
              {pendingApprovals.map((appr) => (
                <div
                  key={appr.id}
                  className="p-5 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors flex flex-col gap-3 shadow-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-mono text-slate-400">{appr.id}</span>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                        {appr.intent || 'Automated agent task'}
                      </h3>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-semibold uppercase rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                      Pending Review
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{appr.explanation}</p>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                    <div className="flex gap-2">
                      {appr.flaggedFlows.map((f, i) => (
                        <span key={i} className="px-2.5 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 font-mono text-xs font-semibold">
                          {f}
                        </span>
                      ))}
                    </div>
                    <Link
                      href={`/app/approvals/${appr.id}`}
                      className="px-3.5 py-1.5 bg-slate-900 text-white rounded-md text-xs font-semibold hover:bg-slate-800 transition-colors"
                    >
                      Inspect & Decide →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Section - Live Audit Feed */}
        <div className="md:col-span-5 xl:col-span-4 flex flex-col gap-4 md:sticky md:top-24">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-lg font-bold text-slate-900">Live Audit Stream</h2>
            <Link href="/app/audit" className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline">
              Full log →
            </Link>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-xs flex flex-col gap-3">
            {recentEvents.length === 0 ? (
              <span className="text-xs text-slate-400">No audit events logged yet.</span>
            ) : (
              recentEvents.map((evt) => (
                <div key={evt.id} className="text-xs flex flex-col gap-1 pb-2.5 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between font-mono text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">{evt.eventType}</span>
                    <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                  </div>
                  {evt.agentId && <span className="text-slate-600">Agent: <strong className="font-mono text-slate-800">{evt.agentId}</strong></span>}
                  {evt.approvalId && <span className="text-slate-600">Approval: <span className="font-mono text-amber-700">{evt.approvalId}</span></span>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
