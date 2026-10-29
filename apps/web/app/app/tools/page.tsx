import { requireSession } from '@/lib/auth';
import { BASE_TOOL_DEFINITIONS } from '@airlock/mocks';

export default async function ToolsPage() {
  await requireSession();
  const tools = BASE_TOOL_DEFINITIONS;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#1c1917]">Upstream Tool Registry</h1>
        <p className="text-sm text-[#78716c] mt-0.5">
          Tools discovered from registered MCP servers with deterministic data-flow classification tags.
        </p>
      </div>

      <div className="bg-white border border-[#e7e5e4] rounded overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#fafaf9] border-b border-[#e7e5e4] text-[#78716c] font-mono uppercase">
            <tr>
              <th className="py-3 px-4">Server / Tool</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Semantic Risk Tags</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f5f5f4]">
            {tools.map((t) => (
              <tr key={`${t.server}.${t.name}`} className="hover:bg-[#fafaf9] transition-colors">
                <td className="py-3 px-4 font-mono font-semibold text-[#1c1917]">
                  {t.server}.{t.name}
                </td>
                <td className="py-3 px-4 text-[#57534e] max-w-sm">{t.description}</td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1">
                    {t.tags.map((tag, i) => {
                      const tagStyle =
                        tag === 'reads_untrusted'
                          ? 'bg-amber-50 text-amber-900 border-amber-200'
                          : tag === 'writes_external'
                          ? 'bg-rose-50 text-rose-900 border-rose-200'
                          : tag === 'destructive'
                          ? 'bg-red-100 text-red-950 border-red-300'
                          : 'bg-[#f5f5f4] text-[#44403c] border-[#e7e5e4]';
                      return (
                        <span key={i} className={`px-2 py-0.5 rounded font-mono text-[10px] border ${tagStyle}`}>
                          {tag}
                        </span>
                      );
                    })}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono uppercase text-[10px]">
                    {t.tagStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
