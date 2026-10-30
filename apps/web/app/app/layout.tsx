import Link from 'next/link';
import { requireSession } from '@/lib/auth';
import { getDashboardStats } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const stats = await getDashboardStats(session.orgId);

  const roleColors = {
    admin: 'bg-rose-50 text-rose-700 border-rose-200',
    operator: 'bg-amber-50 text-amber-800 border-amber-200',
    viewer: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      {/* Full Width Top Navigation */}
      <header className="border-b border-[#e2e8f0] bg-white sticky top-0 z-40 w-full">
        <div className="w-full px-6 lg:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/app" className="flex items-center gap-2 font-bold text-xl text-[#0f172a] tracking-tight">
              <span>Airlock</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                {session.orgId}
              </span>
            </Link>

            <nav className="flex items-center gap-1 text-sm font-medium">
              <Link href="/app" className="px-3.5 py-2 rounded-md hover:bg-slate-100 text-slate-700 transition-colors">
                Overview
              </Link>
              <Link href="/app/approvals" className="px-3.5 py-2 rounded-md hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-2">
                <span>Approvals</span>
                {stats.pendingApprovals > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-600 text-white leading-none">
                    {stats.pendingApprovals}
                  </span>
                )}
              </Link>
              <Link href="/app/audit" className="px-3.5 py-2 rounded-md hover:bg-slate-100 text-slate-700 transition-colors">
                Audit Trail
              </Link>
              <Link href="/app/agents" className="px-3.5 py-2 rounded-md hover:bg-slate-100 text-slate-700 transition-colors">
                Agents
              </Link>
              <Link href="/app/tools" className="px-3.5 py-2 rounded-md hover:bg-slate-100 text-slate-700 transition-colors">
                Tools
              </Link>
              <Link href="/app/policies" className="px-3.5 py-2 rounded-md hover:bg-slate-100 text-slate-700 transition-colors">
                Policies
              </Link>
              <Link href="/app/results" className="px-3.5 py-2 rounded-md hover:bg-slate-100 text-slate-700 transition-colors">
                Benchmark
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2.5">
              <span className="text-xs text-slate-600 font-medium">{session.email}</span>
              <span
                className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                  roleColors[session.role]
                }`}
              >
                {session.role}
              </span>
            </div>
            <Link
              href="/api/auth/logout"
              className="text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded-md hover:bg-slate-50 transition-colors"
            >
              Sign out
            </Link>
          </div>
        </div>
      </header>

      {/* Full Width Main Content */}
      <main className="flex-1 w-full px-6 lg:px-10 py-8">{children}</main>
    </div>
  );
}
