import { requireSession } from '@/lib/auth';
import { getAuditEvents } from '@/lib/data';

export default async function AuditPage() {
  const session = await requireSession();
  const events = await getAuditEvents(session.orgId, 100);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#1c1917]">Immutable Audit Trail</h1>
          <p className="text-sm text-[#78716c] mt-0.5">
            Append-only Redis Stream recording every request, policy evaluation, approval decision, and sandbox call.
          </p>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="p-12 bg-white border border-[#e7e5e4] rounded text-center text-sm text-[#78716c]">
          No audit stream events recorded yet.
        </div>
      ) : (
        <div className="bg-white border border-[#e7e5e4] rounded overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fafaf9] border-b border-[#e7e5e4] text-[#78716c] font-mono uppercase">
              <tr>
                <th className="py-3 px-4">Event ID / Time</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Script / Approval</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f5f4] font-mono">
              {events.map((evt) => (
                <tr key={evt.id} className="hover:bg-[#fafaf9] transition-colors">
                  <td className="py-3 px-4">
                    <div className="text-[11px] text-[#78716c]">{new Date(evt.timestamp).toLocaleString()}</div>
                    <div className="text-[10px] text-[#a8a29e]">{evt.id}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-[#f5f5f4] text-[#44403c] border border-[#e7e5e4] font-medium text-[11px]">
                      {evt.eventType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#44403c]">{evt.userId || evt.agentId || 'gateway'}</td>
                  <td className="py-3 px-4 text-[11px]">
                    {evt.approvalId && <div className="text-amber-800">{evt.approvalId}</div>}
                    {evt.scriptHash && <div className="text-[#a8a29e]">{evt.scriptHash.slice(0, 12)}...</div>}
                  </td>
                  <td className="py-3 px-4 text-[11px] text-[#57534e] max-w-md truncate">
                    {JSON.stringify(evt.details)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
