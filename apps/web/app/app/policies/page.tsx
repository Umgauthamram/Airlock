import { requireSession } from '@/lib/auth';
import { DEFAULT_POLICY } from '@airlock/policy';

export default async function PoliciesPage() {
  await requireSession();
  const policy = DEFAULT_POLICY;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#1c1917]">Deterministic Security Policies</h1>
          <p className="text-sm text-[#78716c] mt-0.5">
            Active version {policy.version}. Precedence: <strong className="text-rose-700">DENY</strong> &gt;{' '}
            <strong className="text-amber-700">HOLD</strong> &gt; <strong className="text-emerald-700">ALLOW</strong>.
          </p>
        </div>
      </div>

      <div className="bg-white border border-[#e7e5e4] rounded overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#fafaf9] border-b border-[#e7e5e4] text-[#78716c] font-mono uppercase">
            <tr>
              <th className="py-3 px-4">Rule ID</th>
              <th className="py-3 px-4">Condition</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Description / Operator Message</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f5f5f4]">
            {policy.rules.map((rule) => {
              const actionBadge =
                rule.action === 'deny'
                  ? 'bg-rose-100 text-rose-900 border-rose-300'
                  : rule.action === 'hold'
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-emerald-100 text-emerald-900 border-emerald-300';

              return (
                <tr key={rule.id} className="hover:bg-[#fafaf9] transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#1c1917]">{rule.id}</td>
                  <td className="py-3 px-4 font-mono text-[#57534e]">
                    <pre className="text-[11px] bg-[#fafaf9] p-1.5 rounded border border-[#e7e5e4]">
                      {JSON.stringify(rule.when, null, 1)}
                    </pre>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded font-mono uppercase text-[11px] border font-bold ${actionBadge}`}>
                      {rule.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#44403c]">
                    <div className="font-semibold">{rule.description}</div>
                    <div className="text-xs text-[#78716c] mt-0.5">{rule.message}</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
