import { requireSession } from '@/lib/auth';
import { getAgents } from '@/lib/data';
import { hasMinimumRole, Role } from '@airlock/shared';

export default async function AgentsPage() {
  const session = await requireSession();
  const agents = await getAgents(session.orgId);
  const canOperate = hasMinimumRole(session.role, Role.OPERATOR);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#1c1917]">Agent Credentials & Kill Switch</h1>
          <p className="text-sm text-[#78716c] mt-0.5">
            Manage agent API keys, enforce daily token quotas, and instantly suspend compromised agents.
          </p>
        </div>
      </div>

      <div className="bg-white border border-[#e7e5e4] rounded p-6 shadow-xs flex flex-col gap-4">
        <h2 className="font-serif text-lg font-bold text-[#1c1917]">Registered Agent Principals</h2>

        {agents.length === 0 ? (
          <div className="p-8 bg-[#fafaf9] border border-[#e7e5e4] rounded text-center text-xs text-[#78716c]">
            No custom agent keys registered yet for organization {session.orgId}.
            Agents connect using <code className="font-mono bg-[#f5f5f4] px-1 py-0.5 rounded">alk_live_...</code> keys.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fafaf9] border-b border-[#e7e5e4] text-[#78716c] font-mono uppercase">
                <tr>
                  <th className="py-2.5 px-3">Agent Name</th>
                  <th className="py-2.5 px-3">Key Prefix</th>
                  <th className="py-2.5 px-3">Daily Token Budget</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Kill Switch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f5f4]">
                {agents.map((ag) => (
                  <tr key={ag.id}>
                    <td className="py-2.5 px-3 font-semibold text-[#1c1917]">{ag.name}</td>
                    <td className="py-2.5 px-3 font-mono text-[#78716c]">{ag.keyPrefix}...</td>
                    <td className="py-2.5 px-3 font-mono">{ag.budgetDailyTokens.toLocaleString()} tokens</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-mono uppercase border ${
                          ag.status === 'active'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {ag.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {canOperate ? (
                        <button
                          type="button"
                          className="px-3 py-1 rounded text-xs font-medium border border-rose-300 text-rose-900 bg-rose-50 hover:bg-rose-100 transition-colors"
                        >
                          {ag.status === 'active' ? 'Suspend (Kill Switch)' : 'Resume'}
                        </button>
                      ) : (
                        <span className="text-xs text-[#a8a29e]">Read only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

