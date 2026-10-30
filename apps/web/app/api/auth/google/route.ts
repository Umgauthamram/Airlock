import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { randomBytes } from 'node:crypto';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get('mode') || 'login';
  const googleId = process.env.AUTH_GOOGLE_ID;
  const authUrl = process.env.AUTH_URL || 'http://localhost:3000';
  const redirectUri = `${authUrl}/api/auth/callback/google`;

  if (!googleId) {
    // When live Google Client ID is not configured, redirect to login with notification
    return NextResponse.redirect(`${authUrl}/login?google_picker=1&mode=${mode}`);
  }

  const state = randomBytes(16).toString('hex');
  const cookieStore = await cookies();
  cookieStore.set('airlock_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 10 * 60, // 10 minutes
    path: '/',
  });

  const params = new URLSearchParams({
    client_id: googleId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'online',
    prompt: 'select_account',
  });

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}
