import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="flex-1 max-w-3xl mx-auto px-6 py-12 flex flex-col gap-6">
      <Link href="/" className="text-xs text-[#78716c] hover:text-[#1c1917] underline">
        ← Back to Airlock
      </Link>
      <h1 className="font-serif text-3xl font-bold text-[#1c1917]">Terms of Service (Draft)</h1>
      <p className="text-xs text-[#a8a29e] italic">Last updated: October 29, 2026 · Clearly marked as draft for hackathon demonstration</p>

      <div className="prose text-xs text-[#57534e] flex flex-col gap-4 leading-relaxed">
        <p>
          By using the Airlock pre-execution gateway and demonstration control plane, you agree to evaluate the system in accordance with standard hackathon testing guidelines.
        </p>
        <h2 className="font-serif font-bold text-sm text-[#1c1917]">1. Purpose</h2>
        <p>
          Airlock provides pre-execution inspection of AI agent-written code to prevent unauthorized data exfiltration and destructive actions across MCP tool servers.
        </p>
        <h2 className="font-serif font-bold text-sm text-[#1c1917]">2. Demo Data & Isolation</h2>
        <p>
          Demo mode operates within an isolated tenant environment (<code className="font-mono">org:demo</code>). No production credentials or live user data are shared or exposed.
        </p>
      </div>
    </div>
  );
}
