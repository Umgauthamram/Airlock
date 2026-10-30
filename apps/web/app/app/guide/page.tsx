import { requireSession } from '@/lib/auth';
import { FeatureGuide } from '@/components/FeatureGuide';

export const dynamic = 'force-dynamic';

export default async function GuidePage() {
  const session = await requireSession();

  return (
    <div className="w-full flex flex-col gap-8">
      <div className="border-b border-slate-200 pb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Architecture & Walkthrough
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
          Airlock Platform & Feature Guide
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Comprehensive instructions for operating both production Google Workspace deployments and demo evaluation sandboxes.
        </p>
      </div>

      <FeatureGuide
        isDemo={session.isDemo}
        userEmail={session.email}
        defaultExpanded={true}
      />
    </div>
  );
}
