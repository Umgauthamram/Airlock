import Link from 'next/link';

export default function DocsPage() {
  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b border-[#e7e5e4] bg-[#fbfaf8]/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-serif font-bold text-xl tracking-tight text-[#1c1917]">
            Airlock
          </Link>
          <div className="flex items-center gap-4 text-sm font-medium">
            <Link href="/api/auth/demo" className="px-3 py-1.5 bg-[#1c1917] text-[#fafaf9] rounded text-xs">
              Live Demo
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 flex flex-col gap-10">
        <div>
          <span className="text-xs uppercase font-mono tracking-wider text-[#78716c]">Documentation</span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1c1917] mt-1">Connecting an Agent to Airlock</h1>
          <p className="text-sm text-[#57534e] mt-2">
            Airlock exposes a Streamable HTTP Model Context Protocol (MCP) server that acts as a secure reverse proxy for your upstream tools.
          </p>
        </div>

        <section className="flex flex-col gap-4">
          <h2 className="font-serif text-xl font-bold text-[#1c1917]">1. Core Gateway Methods</h2>
          <p className="text-sm text-[#57534e]">
            Instead of presenting hundreds of raw tool definitions directly into the agent prompt, Airlock exposes three lean primitives:
          </p>
          <div className="grid gap-3">
            <div className="p-4 bg-white border border-[#e7e5e4] rounded flex flex-col gap-1">
              <span className="font-mono text-sm font-bold text-[#1c1917]">search_tools(&#123; query: string, limit?: number &#125;)</span>
              <p className="text-xs text-[#57534e]">
                Dynamically searches confirmed upstream tools and returns TypeScript interface stubs, reducing context tokens by up to 90%.
              </p>
            </div>
            <div className="p-4 bg-white border border-[#e7e5e4] rounded flex flex-col gap-1">
              <span className="font-mono text-sm font-bold text-[#1c1917]">run_script(&#123; code: string, intent?: string &#125;)</span>
              <p className="text-xs text-[#57534e]">
                Submits the complete agent plan as executable code. Airlock deterministically parses the AST, evaluates security policy rules, holds exfiltration risks for human operator review, and executes safe code in a sandbox.
              </p>
            </div>
            <div className="p-4 bg-white border border-[#e7e5e4] rounded flex flex-col gap-1">
              <span className="font-mono text-sm font-bold text-[#1c1917]">get_result(&#123; approvalId: string &#125;)</span>
              <p className="text-xs text-[#57534e]">
                Polls for the completion status and return value of an operator-approved held script.
              </p>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-serif text-xl font-bold text-[#1c1917]">2. Client Configuration Example</h2>
          <pre className="p-4 bg-[#1c1917] text-[#fafaf9] rounded text-xs font-mono overflow-x-auto leading-relaxed">
{`// Example Cursor / Claude Desktop / Antigravity MCP Config
{
  "mcpServers": {
    "airlock": {
      "url": "http://localhost:4000/mcp",
      "headers": {
        "Authorization": "Bearer alk_live_YOUR_AGENT_KEY"
      }
    }
  }
}`}
          </pre>
        </section>
      </main>
    </div>
  );
}
