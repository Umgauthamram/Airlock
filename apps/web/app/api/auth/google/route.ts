import { NextResponse } from 'next/server';
import { createSignedOAuthState, getAuthBaseUrl } from '@/lib/auth';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get('mode') || 'login';
  const googleId = process.env.AUTH_GOOGLE_ID;
  const authUrl = getAuthBaseUrl(req);
  const redirectUri = `${authUrl}/api/auth/callback/google`;

  if (!googleId) {
    // When live Google Client ID is not configured, redirect to login with notification
    return NextResponse.redirect(`${authUrl}/login?google_picker=1&mode=${mode}`);
  }

  // Create cryptographically signed and timestamped state token
  const state = createSignedOAuthState();

  const params = new URLSearchParams({
    client_id: googleId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'online',
    prompt: 'select_account',
  });

  const response = NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );

  // Set the anti-CSRF state cookie directly on the outgoing HTTP redirect response
  response.cookies.set('airlock_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 10 * 60, // 10 minutes
    path: '/',
  });

  return response;
}
