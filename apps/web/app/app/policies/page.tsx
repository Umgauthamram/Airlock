import { requireSession } from '@/lib/auth';
import { DEFAULT_POLICY } from '@airlock/policy';
import { cleanUnderscores } from '@/lib/format';

export default async function PoliciesPage() {
  await requireSession();
  const policy = DEFAULT_POLICY;

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Deterministic Security Policies</h1>
        <p className="text-sm text-slate-500 mt-1">
          Active version v{policy.version}. Precedence: <strong className="text-rose-700">DENY</strong> &gt;{' '}
          <strong className="text-amber-700">HOLD</strong> &gt; <strong className="text-emerald-700">ALLOW</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column - Policy Rules Table */}
        <div className="md:col-span-8 bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
              <tr>
                <th className="py-3.5 px-5">Rule ID</th>
                <th className="py-3.5 px-5">Trigger Condition</th>
                <th className="py-3.5 px-5">Policy Action</th>
                <th className="py-3.5 px-5">Description & Explanation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {policy.rules.map((rule) => {
                const actionBadge =
                  rule.action === 'deny'
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : rule.action === 'hold'
                    ? 'bg-amber-50 text-amber-900 border-amber-200'
                    : 'bg-emerald-50 text-emerald-900 border-emerald-200';

                return (
                  <tr key={rule.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-5 font-mono font-bold text-slate-900 text-sm">{rule.id}</td>
                    <td className="py-4 px-5 font-mono text-slate-600">
                      <pre className="text-xs bg-slate-50 p-2 rounded-md border border-slate-200">
                        {cleanUnderscores(JSON.stringify(rule.when, null, 1))}
                      </pre>
                    </td>
                    <td className="py-4 px-5">
                      <span className={`px-2.5 py-1 rounded-md uppercase font-bold text-xs border ${actionBadge}`}>
                        {rule.action}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-slate-700">
                      <div className="font-bold text-slate-900">{rule.description}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{rule.message}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Right Column - Policy Precedence & Hierarchy Guide */}
        <div className="md:col-span-4 flex flex-col gap-5 md:sticky md:top-24">
          <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-xs flex flex-col gap-3 text-xs leading-relaxed text-slate-600">
            <h3 className="font-bold text-slate-900 text-sm">Evaluation Precedence</h3>
            <p>
              Security rules are evaluated deterministically in sub-millisecond order. The strictest matching action always wins:
            </p>
            <div className="flex flex-col gap-2 pt-1 font-mono text-xs">
              <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-900 flex items-center justify-between font-semibold">
                <span>1. DENY</span>
                <span className="font-sans text-[11px] font-normal">Immediate rejection</span>
              </div>
              <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between font-semibold">
                <span>2. HOLD</span>
                <span className="font-sans text-[11px] font-normal">Escalate to Operator</span>
              </div>
              <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between font-semibold">
                <span>3. ALLOW</span>
                <span className="font-sans text-[11px] font-normal">Execute in Sandbox</span>
              </div>
            </div>
          </div>

          <div className="p-5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex flex-col gap-2">
            <span className="font-bold text-slate-900">Zero-Trust Script Analysis</span>
            <p>
              Scripts are inspected via static AST parsing prior to execution. If an agent attempts to alter flows or abuse credentials, the execution never starts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
