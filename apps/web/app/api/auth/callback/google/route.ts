import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSessionCookie } from '@/lib/auth';
import { Role } from '@airlock/shared';
import { getRedisClient, RedisKeys } from '@/lib/redis';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const authUrl = process.env.AUTH_URL || 'http://localhost:3000';

  const cookieStore = await cookies();
  const savedState = cookieStore.get('airlock_oauth_state')?.value;
  cookieStore.delete('airlock_oauth_state');

  if (!code || !state || state !== savedState) {
    return NextResponse.redirect(`${authUrl}/login?error=invalid_oauth_state`);
  }

  const googleId = process.env.AUTH_GOOGLE_ID;
  const googleSecret = process.env.AUTH_GOOGLE_SECRET;
  const redirectUri = `${authUrl}/api/auth/callback/google`;

  if (!googleId || !googleSecret) {
    return NextResponse.redirect(`${authUrl}/login?error=missing_credentials`);
  }

  try {
    // 1. Exchange authorization code for access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: googleId,
        client_secret: googleSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      return NextResponse.redirect(`${authUrl}/login?error=token_exchange_failed`);
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 2. Fetch authenticated profile
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userRes.ok) {
      return NextResponse.redirect(`${authUrl}/login?error=profile_fetch_failed`);
    }

    const profile = await userRes.json();
    const email = profile.email?.toLowerCase();
    const name = profile.name || email.split('@')[0];
    const orgId = 'main';

    // 3. Determine user role from bootstrap admin list
    const bootstrapAdmins = (process.env.BOOTSTRAP_ADMIN_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const role = bootstrapAdmins.includes(email) ? Role.ADMIN : Role.OPERATOR;

    // 4. Upsert user record in Redis
    try {
      const redis = getRedisClient();
      await redis.set(
        RedisKeys.user(orgId, email),
        JSON.stringify({
          id: email,
          email,
          name,
          role,
          status: 'active',
          updatedAt: new Date().toISOString(),
        })
      );
    } catch {
      // Best-effort in offline dev
    }

    // 5. Create secure session cookie with embedded expiration
    await createSessionCookie({
      userId: email,
      email,
      name,
      orgId,
      role,
      isDemo: false,
      exp: Date.now() + 8 * 60 * 60 * 1000,
    });

    return NextResponse.redirect(`${authUrl}/app`);
  } catch (err) {
    return NextResponse.redirect(`${authUrl}/login?error=oauth_exception`);
  }
}
