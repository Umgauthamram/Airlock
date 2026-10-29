import { requireSession } from '@/lib/auth';
import { getAgents } from '@/lib/data';
import { hasMinimumRole, Role } from '@airlock/shared';

export default async function AgentsPage() {
  const session = await requireSession();
  const agents = await getAgents(session.orgId);
  const canOperate = hasMinimumRole(session.role, Role.OPERATOR);

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Agent Credentials & Kill Switch</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage machine agent API keys, enforce daily token limits, and trigger instant kill switches.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column - Agents List */}
        <div className="md:col-span-7 xl:col-span-8 bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Registered Machine Principals</h2>
            <span className="text-xs text-slate-400 font-mono">Count: {agents.length}</span>
          </div>

          {agents.length === 0 ? (
            <div className="p-12 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs text-slate-500">
              No custom agent keys registered yet for organization {session.orgId}.
              Agents authenticate with secret <code className="font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-700">alk_live_...</code> keys.
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Agent Name</th>
                    <th className="py-3 px-4">Key Prefix</th>
                    <th className="py-3 px-4">Daily Token Budget</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Kill Switch</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {agents.map((ag) => (
                    <tr key={ag.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{ag.name}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">{ag.keyPrefix}...</td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700">{ag.budgetDailyTokens.toLocaleString()} tokens</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase border ${
                            ag.status === 'active'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}
                        >
                          {ag.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {canOperate ? (
                          <button
                            type="button"
                            className="px-3 py-1.5 rounded-md text-xs font-semibold border border-rose-200 text-rose-800 bg-rose-50 hover:bg-rose-100 transition-colors shadow-xs"
                          >
                            {ag.status === 'active' ? 'Suspend (Kill Switch)' : 'Resume'}
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">Read only</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column - Kill Switch Overview */}
        <div className="md:col-span-5 xl:col-span-4 flex flex-col gap-5 md:sticky md:top-24">
          <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-xs flex flex-col gap-3 text-xs leading-relaxed text-slate-600">
            <h3 className="font-bold text-slate-900 text-sm">Emergency Kill Switch</h3>
            <p>
              When an agent key is suspended by an Operator or Admin, all subsequent MCP requests (<code className="font-mono">search_tools</code>, <code className="font-mono">run_script</code>) are denied within 1 second.
            </p>
            <div className="p-3 bg-amber-50 rounded-md border border-amber-200 text-amber-900 text-[11px]">
              Every suspension or reactivation action is recorded in the immutable audit stream.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
