import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { randomBytes } from 'node:crypto';

export async function GET() {
  const googleId = process.env.AUTH_GOOGLE_ID;
  const authUrl = process.env.AUTH_URL || 'http://localhost:3000';
  const redirectUri = `${authUrl}/api/auth/callback/google`;

  if (!googleId) {
    // If Google credentials are not configured, redirect to demo with explanation
    return NextResponse.redirect(`${authUrl}/api/auth/demo?error=google_not_configured`);
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

