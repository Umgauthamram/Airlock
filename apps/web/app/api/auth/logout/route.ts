import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';

export async function GET(req: Request) {
  await clearSessionCookie();
  const url = new URL(req.url);
  const redirectUrl = new URL('/login', url.origin);
  return NextResponse.redirect(redirectUrl);
}
