import Link from 'next/link';

export default function RequestAccessPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-[#e7e5e4] rounded-lg p-8 shadow-xs flex flex-col gap-6 text-center">
        <h1 className="font-serif font-bold text-2xl text-[#1c1917]">Access Restricted</h1>
        <p className="text-sm text-[#57534e] leading-relaxed">
          Airlock is currently invite-only for production organizations. If your administrator has invited your Google email address, please ensure you sign in with that exact address.
        </p>
        <div className="p-4 bg-[#fbfaf8] border border-[#e7e5e4] rounded text-xs text-[#78716c] text-left flex flex-col gap-1">
          <span className="font-mono font-medium text-[#1c1917]">Evaluating the demo?</span>
          <span>You can test all operator features, approval queues, and attack scenarios using the isolated demo org.</span>
        </div>
        <div className="flex flex-col gap-3">
          <Link
            href="/api/auth/demo"
            className="w-full py-2.5 px-4 bg-[#1c1917] text-[#fafaf9] rounded text-sm font-medium hover:bg-[#292524] transition-colors"
          >
            Enter Demo Mode
          </Link>
          <Link href="/login" className="text-xs text-[#78716c] hover:text-[#1c1917] underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

