'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AppNavProps {
  pendingApprovals: number;
}

export function AppNav({ pendingApprovals }: AppNavProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Overview', href: '/app', exact: true },
    { label: 'Approvals', href: '/app/approvals', badge: pendingApprovals },
    { label: 'Audit Trail', href: '/app/audit' },
    { label: 'Agents', href: '/app/agents' },
    { label: 'Tools', href: '/app/tools' },
    { label: 'Policies', href: '/app/policies' },
    { label: 'Benchmark', href: '/app/results' },
    { label: 'Feature Guide', href: '/app/guide' },
  ];

  return (
    <nav className="flex items-center gap-1.5 text-sm">
      {navItems.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname?.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
              isActive
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
            }`}
          >
            <span>{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none ${
                  isActive ? 'bg-amber-500 text-slate-950' : 'bg-amber-600 text-white'
                }`}
              >
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

