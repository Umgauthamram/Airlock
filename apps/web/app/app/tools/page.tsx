import { requireSession } from '@/lib/auth';
import { BASE_TOOL_DEFINITIONS } from '@airlock/mocks';
import { cleanUnderscores, formatFlowTag } from '@/lib/format';

export default async function ToolsPage() {
  await requireSession();
  const tools = BASE_TOOL_DEFINITIONS;

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Upstream Tool Registry</h1>
          <p className="text-sm text-slate-500 mt-1">
            Tools discovered from registered MCP servers with deterministic data-flow classification tags.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-md bg-white border border-slate-200 text-slate-600 shadow-xs">
            Discovered Tools: {tools.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column - Tools Table */}
        <div className="md:col-span-8 bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
              <tr>
                <th className="py-3.5 px-5">Server / Tool</th>
                <th className="py-3.5 px-5">Description</th>
                <th className="py-3.5 px-5">Semantic Risk Tags</th>
                <th className="py-3.5 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tools.map((t) => (
                <tr key={`${t.server}.${t.name}`} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-5 font-mono font-bold text-slate-900">
                    {cleanUnderscores(t.server)}.{cleanUnderscores(t.name)}
                  </td>
                  <td className="py-4 px-5 text-slate-600 max-w-md">{t.description}</td>
                  <td className="py-4 px-5">
                    <div className="flex flex-wrap gap-1.5">
                      {t.tags.map((tag, i) => {
                        const tagStyle =
                          tag.includes('untrusted')
                            ? 'bg-amber-50 text-amber-900 border-amber-200'
                            : tag.includes('external')
                            ? 'bg-rose-50 text-rose-900 border-rose-200'
                            : tag === 'destructive'
                            ? 'bg-red-50 text-red-900 border-red-300 font-bold'
                            : 'bg-slate-100 text-slate-700 border-slate-200';
                        return (
                          <span key={i} className={`px-2.5 py-0.5 rounded-md font-mono text-xs border ${tagStyle}`}>
                            {formatFlowTag(tag)}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono uppercase text-[11px] font-semibold">
                      {cleanUnderscores(t.tagStatus)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Column - Semantic Risk Tag Legend */}
        <div className="md:col-span-4 flex flex-col gap-5 md:sticky md:top-24">
          <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-xs flex flex-col gap-3.5 text-xs text-slate-600">
            <h3 className="font-bold text-slate-900 text-sm">Semantic Tag Classification</h3>
            <p className="leading-relaxed">
              Tools are tagged by their data-flow risks. Deterministic policy inspects these tags in agent scripts:
            </p>
            <div className="flex flex-col gap-2.5 pt-1">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                <span className="font-mono font-bold text-amber-900 text-xs">reads-untrusted</span>
                <p className="text-[11px] text-amber-950 mt-0.5">Ingests untrusted user input, email bodies, or external web contents.</p>
              </div>
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-md">
                <span className="font-mono font-bold text-rose-900 text-xs">writes-external</span>
                <p className="text-[11px] text-rose-950 mt-0.5">Transmits payloads across network boundaries or external sinks.</p>
              </div>
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <span className="font-mono font-bold text-red-900 text-xs">destructive</span>
                <p className="text-[11px] text-red-950 mt-0.5">Deletes resources or triggers irreversible mutations.</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                <span className="font-mono font-bold text-slate-800 text-xs">reads-private</span>
                <p className="text-[11px] text-slate-700 mt-0.5">Accesses confidential customer records or system secrets.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
