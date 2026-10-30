import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';

export async function POST(req: Request) {
  await clearSessionCookie();
  const url = new URL(req.url);
  const redirectUrl = new URL('/login', url.origin);
  return NextResponse.redirect(redirectUrl, { status: 303 });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const confirm = url.searchParams.get('confirm');
  // Require explicit confirm flag so background prefetching by Next.js <Link> cannot invalidate sessions
  if (confirm === '1') {
    await clearSessionCookie();
    return NextResponse.redirect(new URL('/login', url.origin));
  }
  return NextResponse.redirect(new URL('/app', url.origin));
}

