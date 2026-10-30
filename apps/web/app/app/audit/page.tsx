import { requireSession } from '@/lib/auth';
import { getAuditEvents } from '@/lib/data';
import { cleanUnderscores, formatEventType } from '@/lib/format';
import { ClientTimestamp } from '@/components/ClientTimestamp';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AuditPage() {
  const session = await requireSession();
  const events = await getAuditEvents(session.orgId, 100);

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Immutable Audit Trail</h1>
          <p className="text-sm text-slate-500 mt-1">
            Append-only Redis Stream recording every request, policy evaluation, approval decision, and sandbox call.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-md bg-white border border-slate-200 text-slate-600 shadow-xs">
            Events: {events.length}
          </span>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="p-16 bg-white border border-slate-200 rounded-lg text-center text-sm text-slate-500 shadow-xs">
          No audit stream events recorded yet.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs w-full">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
              <tr>
                <th className="py-3.5 px-5">Timestamp / Event ID</th>
                <th className="py-3.5 px-5">Event Type</th>
                <th className="py-3.5 px-5">Actor</th>
                <th className="py-3.5 px-5">Target</th>
                <th className="py-3.5 px-5">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              {events.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-5">
                    <div className="text-slate-800 font-medium font-sans">
                      <ClientTimestamp timestamp={evt.timestamp} />
                    </div>
                    <div className="text-slate-400 text-[11px] mt-0.5">{cleanUnderscores(evt.id)}</div>
                  </td>
                  <td className="py-4 px-5">
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200 font-semibold text-[11px] inline-block font-sans">
                      {formatEventType(evt.eventType)}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-slate-700 font-semibold">{cleanUnderscores(evt.userId || evt.agentId || 'gateway')}</td>
                  <td className="py-4 px-5">
                    {evt.approvalId && <div className="text-amber-700 font-semibold">{cleanUnderscores(evt.approvalId)}</div>}
                    {evt.scriptHash && <div className="text-slate-400 text-[11px]">{evt.scriptHash.slice(0, 16)}...</div>}
                  </td>
                  <td className="py-4 px-5 text-slate-600 max-w-xl truncate font-sans text-xs">
                    {cleanUnderscores(JSON.stringify(evt.details))}
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
