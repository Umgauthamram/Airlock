import Link from 'next/link';

export default function QuickstartPage() {
  return (
    <div className="flex-1 flex flex-col w-full bg-[#f8fafc] text-slate-900">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-50 w-full">
        <div className="w-full px-6 lg:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-bold text-xl tracking-tight text-slate-900 flex items-center gap-2">
              <span>Airlock</span>
            </Link>
          </div>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link href="/quickstart" className="text-slate-900 font-semibold border-b-2 border-slate-900 pb-0.5">
              Quick Start
            </Link>
            <Link href="/login" className="text-slate-600 hover:text-slate-900 transition-colors">
              Sign In
            </Link>
            <Link
              href="/api/auth/demo"
              className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors text-xs font-semibold shadow-xs"
            >
              Explore Live Demo
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full px-6 lg:px-12 py-12 flex flex-col gap-12 max-w-7xl mx-auto">
        {/* Page Title */}
        <div className="border-b border-slate-200 pb-6 flex flex-col gap-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Quick Start Guide
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
            Connect any AI agent or Model Context Protocol (MCP) client to Airlock in minutes. Intercept prompt injection attacks, enforce data-flow policies, and protect upstream tools.
          </p>
        </div>

        {/* 1. Add the Airlock Gateway MCP Endpoint */}
        <section className="bg-white border border-slate-200 rounded-xl p-8 shadow-xs flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <span className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-xs">
              1
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Add the Airlock Gateway MCP Endpoint</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Airlock exposes an authenticated, standard Model Context Protocol (MCP) streamable endpoint.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 text-xs text-slate-600 leading-relaxed">
            <div className="flex flex-col gap-3">
              <h3 className="font-bold text-slate-900 text-sm">Endpoint Details</h3>
              <p>
                Point your agent framework or MCP client to the gateway endpoint. The gateway accepts standard JSON-RPC 2.0 requests over HTTP:
              </p>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-xs flex flex-col gap-1.5">
                <span className="text-slate-400 text-[11px] uppercase tracking-wider">Gateway MCP URL</span>
                <span className="text-slate-900 font-bold select-all">
                  https://gateway.airlock.dev/mcp
                </span>
                <span className="text-[11px] text-slate-500 mt-1">
                  Local Dev: <code className="text-slate-700">http://localhost:4000/mcp</code>
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="font-bold text-slate-900 text-sm">Authentication</h3>
              <p>
                Every request requires an agent bearer token in the <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">Authorization</code> header. Generate agent keys in the <strong>Agents</strong> tab of the dashboard:
              </p>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-xs flex flex-col gap-1.5">
                <span className="text-slate-400 text-[11px] uppercase tracking-wider">Authorization Header</span>
                <span className="text-emerald-700 font-semibold select-all">
                  Bearer alk_live_9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d
                </span>
                <span className="text-[11px] text-slate-500 mt-1">
                  Agent keys can be suspended instantly via the emergency kill switch.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Core Gateway Architecture */}
        <section className="bg-white border border-slate-200 rounded-xl p-8 shadow-xs flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <span className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-xs">
              2
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Core Gateway Operations</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                How Airlock replaces blind multi-turn tool calling with compact code generation and zero-trust inspection.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col gap-2.5">
              <span className="font-mono text-xs font-bold text-slate-900">search_tools()</span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dynamically discovers upstream tool definitions and returns concise TypeScript interface stubs, reducing token ingestion by <strong>94%+</strong>.
              </p>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col gap-2.5">
              <span className="font-mono text-xs font-bold text-slate-900">run_script()</span>
              <p className="text-xs text-slate-600 leading-relaxed">
                The agent submits its entire execution plan as a single script. Airlock statically analyzes the AST, extracts data flows, evaluates policy, and runs safe scripts in an isolated sandbox.
              </p>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col gap-2.5">
              <span className="font-mono text-xs font-bold text-slate-900">get_result()</span>
              <p className="text-xs text-slate-600 leading-relaxed">
                If a script contains sensitive data flows (like reading untrusted emails and writing to external sinks), it is held. Once an operator approves it, the agent retrieves the result here.
              </p>
            </div>
          </div>

          <div className="p-5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <strong className="text-amber-900 font-semibold">Policy Precedence: </strong>
              <span>DENY (immediate rejection) &gt; HOLD (operator review) &gt; ALLOW (sandboxed run).</span>
            </div>
            <Link
              href="/app/policies"
              className="text-xs font-bold font-mono text-amber-900 underline hover:text-amber-950"
            >
              View Active Policies →
            </Link>
          </div>
        </section>

        {/* 3. Client Configuration */}
        <section className="bg-white border border-slate-200 rounded-xl p-8 shadow-xs flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <span className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-xs">
              3
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Client Configuration</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Drop these configurations directly into your favorite agent harness or IDE.
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Cursor Configuration */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Cursor (.cursor/mcp.json)</span>
                <span className="text-[11px] font-mono text-slate-400">JSON</span>
              </div>
              <pre className="p-4 bg-slate-950 text-slate-100 rounded-lg font-mono text-xs leading-relaxed overflow-x-auto border border-slate-800">
{`{
  "mcpServers": {
    "airlock": {
      "url": "https://gateway.airlock.dev/mcp",
      "headers": {
        "Authorization": "Bearer alk_live_YOUR_API_KEY"
      }
    }
  }
}`}
              </pre>
            </div>

            {/* Claude Desktop Configuration */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Claude Desktop (claude_desktop_config.json)</span>
                <span className="text-[11px] font-mono text-slate-400">JSON</span>
              </div>
              <pre className="p-4 bg-slate-950 text-slate-100 rounded-lg font-mono text-xs leading-relaxed overflow-x-auto border border-slate-800">
{`{
  "mcpServers": {
    "airlock": {
      "url": "http://localhost:4000/mcp",
      "headers": {
        "Authorization": "Bearer alk_live_YOUR_API_KEY"
      }
    }
  }
}`}
              </pre>
            </div>

            {/* Python / LangChain / CrewAI */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Python (LangChain / CrewAI / Requests)</span>
                <span className="text-[11px] font-mono text-slate-400">Python</span>
              </div>
              <pre className="p-4 bg-slate-950 text-slate-100 rounded-lg font-mono text-xs leading-relaxed overflow-x-auto border border-slate-800">
{`import os, requests

GATEWAY_URL = os.getenv("AIRLOCK_GATEWAY_URL", "http://localhost:4000/mcp")
AGENT_KEY = os.getenv("AIRLOCK_AGENT_KEY", "alk_live_YOUR_KEY")

headers = {
    "Authorization": f"Bearer {AGENT_KEY}",
    "Content-Type": "application/json"
}

# 1. Search for available tools
stubs = requests.post(GATEWAY_URL, json={
    "method": "search_tools",
    "params": {"query": "inbox"}
}, headers=headers).json()

# 2. Run agent script plan
result = requests.post(GATEWAY_URL, json={
    "method": "run_script",
    "params": {
        "code": "const emails = await tools.inbox.get_emails(); return emails.length;",
        "intent": "Count inbound emails"
    }
}, headers=headers).json()`}
              </pre>
            </div>

            {/* Node.js / TypeScript SDK */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Node.js / TypeScript</span>
                <span className="text-[11px] font-mono text-slate-400">TypeScript</span>
              </div>
              <pre className="p-4 bg-slate-950 text-slate-100 rounded-lg font-mono text-xs leading-relaxed overflow-x-auto border border-slate-800">
{`const GATEWAY_URL = "http://localhost:4000/mcp";
const AGENT_KEY = process.env.AIRLOCK_AGENT_KEY!;

// Submit script to Airlock Gateway
const res = await fetch(GATEWAY_URL, {
  method: "POST",
  headers: {
    "Authorization": \`Bearer \${AGENT_KEY}\`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    method: "run_script",
    params: {
      code: "const t = await tools.tickets.list(); return t.length;",
      intent: "Fetch ticket count"
    }
  })
});

const outcome = await res.json();
console.log("Airlock Outcome:", outcome);`}
              </pre>
            </div>
          </div>
        </section>

       
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500 w-full mt-12">
        <div className="w-full px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>Airlock · Pre-execution Security Gateway for AI Agents</span>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-slate-900">Home</Link>
            <Link href="/quickstart" className="hover:text-slate-900">Quick Start</Link>
            <Link href="/login" className="hover:text-slate-900">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

