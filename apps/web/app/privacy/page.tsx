import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="flex-1 max-w-3xl mx-auto px-6 py-12 flex flex-col gap-6">
      <Link href="/" className="text-xs text-[#78716c] hover:text-[#1c1917] underline">
        ← Back to Airlock
      </Link>
      <h1 className="font-serif text-3xl font-bold text-[#1c1917]">Privacy Policy (Draft)</h1>
      <p className="text-xs text-[#a8a29e] italic">Last updated: October 29, 2026 · Clearly marked as draft for hackathon demonstration</p>

      <div className="prose text-xs text-[#57534e] flex flex-col gap-4 leading-relaxed">
        <h2 className="font-serif font-bold text-sm text-[#1c1917]">1. Data Collection & Audit Streams</h2>
        <p>
          Airlock records metadata, script hashes, policy evaluation outcomes, and timestamps in an append-only Redis Stream. Tool arguments are subject to pattern redaction, and raw tool output payloads are not stored in audit logs.
        </p>
        <h2 className="font-serif font-bold text-sm text-[#1c1917]">2. Key Security</h2>
        <p>
          Agent API keys (<code className="font-mono">alk_live_...</code>) are hashed with SHA-256 upon generation. Plaintext keys are shown only once and cannot be retrieved from storage.
        </p>
      </div>
    </div>
  );
}
