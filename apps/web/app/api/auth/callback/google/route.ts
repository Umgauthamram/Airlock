import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { attachSessionCookie, createSessionCookie } from '@/lib/auth';
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

  if (!code) {
    return NextResponse.redirect(`${authUrl}/login?error=missing_code`);
  }

  // Verify anti-CSRF state token if cookie was preserved across redirects
  if (savedState && state && state !== savedState) {
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
    if (!profile.email_verified) {
      return NextResponse.redirect(`${authUrl}/login?error=email_not_verified`);
    }

    const email = profile.email?.toLowerCase();
    if (!email) {
      return NextResponse.redirect(`${authUrl}/login?error=missing_email`);
    }

    // Enforce allowed email domain if configured
    const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN?.trim().toLowerCase();
    if (allowedDomain) {
      const emailDomain = email.split('@')[1];
      if (emailDomain !== allowedDomain) {
        return NextResponse.redirect(`${authUrl}/login?error=domain_not_allowed`);
      }
    }

    const name = profile.name || email.split('@')[0];
    const orgId = 'main';

    // Check existing user in Redis to avoid overwriting roles or reactivating deactivated users
    let existingUser: any = null;
    const redis = getRedisClient();
    try {
      const rawUser = await redis.get(RedisKeys.user(orgId, email));
      if (rawUser) {
        existingUser = JSON.parse(rawUser);
      }
    } catch {
      // Best-effort in offline dev
    }

    if (existingUser && existingUser.status === 'deactivated') {
      return NextResponse.redirect(`${authUrl}/login?error=account_deactivated`);
    }

    // Determine user role: preserve existing role, or check bootstrap admin list, or default to operator
    const bootstrapAdmins = (process.env.BOOTSTRAP_ADMIN_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const role = existingUser?.role || (bootstrapAdmins.includes(email) ? Role.ADMIN : Role.OPERATOR);
    const status = existingUser?.status || 'active';

    // Upsert user record in Redis without stomping role/status
    try {
      await redis.set(
        RedisKeys.user(orgId, email),
        JSON.stringify({
          id: email,
          email,
          name: existingUser?.name || name,
          role,
          status,
          createdAt: existingUser?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      );
    } catch {
      // Best-effort in offline dev
    }

    // 5. Create secure session cookie directly on redirect response
    const redirectResponse = NextResponse.redirect(`${authUrl}/app`);
    attachSessionCookie(redirectResponse, {
      userId: email,
      email,
      name,
      orgId,
      role,
      isDemo: false,
      exp: Date.now() + 8 * 60 * 60 * 1000,
    });
    redirectResponse.cookies.delete('airlock_oauth_state');

    return redirectResponse;
  } catch (err) {
    return NextResponse.redirect(`${authUrl}/login?error=oauth_exception`);
  }
}

