import Link from 'next/link';
import { requireSession } from '@/lib/auth';
import { getDashboardStats } from '@/lib/data';
import { AppNav } from '@/components/AppNav';
import { DemoCountdown } from '@/components/DemoCountdown';

export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const stats = await getDashboardStats(session.orgId);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      {/* Full Width Top Navigation */}
      <header className="border-b border-[#e2e8f0] bg-white sticky top-0 z-40 w-full">
        <div className="w-full px-6 lg:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex flex-col justify-center">
              <Link href="/app" className="font-bold text-xl text-[#0f172a] tracking-tight leading-none flex items-center gap-2">
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="32" height="32" rx="7" fill="#0f172a"/>
                  <path d="M16 6L26.5 24.5H5.5L16 6Z" fill="#ffffff"/>
                  <polygon points="16,12.5 21.5,22 10.5,22" fill="#0f172a"/>
                  <circle cx="16" cy="18" r="2" fill="#10b981"/>
                </svg>
                <span>Airlock</span>
              </Link>
              {session.isDemo && (
                <DemoCountdown initialExpiry={session.exp} />
              )}
            </div>

            <AppNav pendingApprovals={stats.pendingApprovals} />
          </div>

          <div className="flex items-center gap-3 text-sm">
            <span className="text-xs text-slate-600 font-medium">{session.email}</span>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Full Width Main Content */}
      <main className="flex-1 w-full px-6 lg:px-10 py-8">{children}</main>
    </div>
  );
}
