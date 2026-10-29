import Link from 'next/link';
import { requireSession } from '@/lib/auth';
import { getDashboardStats } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const stats = await getDashboardStats(session.orgId);

  const roleColors = {
    admin: 'bg-rose-100 text-rose-900 border-rose-300',
    operator: 'bg-amber-100 text-amber-900 border-amber-300',
    viewer: 'bg-stone-100 text-stone-700 border-stone-300',
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfaf8]">
      {/* Top Navigation */}
      <header className="border-b border-[#e7e5e4] bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/app" className="flex items-center gap-2 font-serif font-bold text-xl text-[#1c1917]">
              <span>Airlock</span>
              <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-[#f5f5f4] text-[#78716c]">
                {session.orgId}
              </span>
            </Link>

            <nav className="flex items-center gap-1 text-sm font-medium">
              <Link href="/app" className="px-3 py-1.5 rounded hover:bg-[#f5f5f4] text-[#44403c]">
                Overview
              </Link>
              <Link href="/app/approvals" className="px-3 py-1.5 rounded hover:bg-[#f5f5f4] text-[#44403c] flex items-center gap-2">
                <span>Approvals</span>
                {stats.pendingApprovals > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-xs font-mono bg-amber-600 text-white font-bold">
                    {stats.pendingApprovals}
                  </span>
                )}
              </Link>
              <Link href="/app/audit" className="px-3 py-1.5 rounded hover:bg-[#f5f5f4] text-[#44403c]">
                Audit Trail
              </Link>
              <Link href="/app/agents" className="px-3 py-1.5 rounded hover:bg-[#f5f5f4] text-[#44403c]">
                Agents
              </Link>
              <Link href="/app/tools" className="px-3 py-1.5 rounded hover:bg-[#f5f5f4] text-[#44403c]">
                Tools
              </Link>
              <Link href="/app/policies" className="px-3 py-1.5 rounded hover:bg-[#f5f5f4] text-[#44403c]">
                Policies
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#78716c]">{session.email}</span>
              <span
                className={`text-xs font-mono uppercase px-2 py-0.5 rounded border font-medium ${
                  roleColors[session.role]
                }`}
              >
                {session.role}
              </span>
            </div>
            <Link
              href="/api/auth/logout"
              className="text-xs text-[#78716c] hover:text-[#1c1917] border border-[#e7e5e4] px-2.5 py-1 rounded hover:bg-[#f5f5f4] transition-colors"
            >
              Sign out
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
