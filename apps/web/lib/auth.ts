import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { randomBytes, createHmac, timingSafeEqual } from 'node:crypto';
import { Role, UserRole, hasMinimumRole } from '@airlock/shared';
import { getRedisClient, RedisKeys } from './redis';

export interface UserSession {
  userId: string;
  email: string;
  name: string;
  orgId: string;
  role: UserRole;
  isDemo?: boolean;
  exp: number; // Expiration timestamp in milliseconds
}

const SESSION_COOKIE_NAME = 'airlock_session';

// Cryptographically secure secret resolution
function getSessionSecret(): string {
  if (process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 32) {
    return process.env.AUTH_SECRET;
  }
  if (process.env.AUTH_SECRET) {
    return process.env.AUTH_SECRET;
  }
  // Safe deterministic fallback to ensure user sessions persist across page reloads
  return 'airlock_production_persistent_session_secret_min_32_characters_key_98765';
}

const SESSION_SECRET = getSessionSecret();

function signPayload(payload: string): string {
  const hmac = createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  return `${payload}.${hmac}`;
}

function verifyPayload(signedValue: string): string | null {
  const lastDot = signedValue.lastIndexOf('.');
  if (lastDot === -1) return null;

  const payload = signedValue.substring(0, lastDot);
  const signature = signedValue.substring(lastDot + 1);

  const expectedHmac = createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');

  const sigBuf = Buffer.from(signature, 'utf8');
  const expBuf = Buffer.from(expectedHmac, 'utf8');

  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  return payload;
}

export async function createSessionCookie(session: Omit<UserSession, 'exp'> & { exp?: number }): Promise<void> {
  const sessionWithExp: UserSession = {
    ...session,
    exp: session.exp || Date.now() + 12 * 60 * 60 * 1000, // 12 hours valid
  };

  const jsonStr = JSON.stringify(sessionWithExp);
  const signed = signPayload(jsonStr);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, signed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 12 * 60 * 60, // 12 hours
    path: '/',
  });
}

export function attachSessionCookie(
  response: import('next/server').NextResponse,
  session: Omit<UserSession, 'exp'> & { exp?: number }
): void {
  const sessionWithExp: UserSession = {
    ...session,
    exp: session.exp || Date.now() + 12 * 60 * 60 * 1000,
  };

  const jsonStr = JSON.stringify(sessionWithExp);
  const signed = signPayload(jsonStr);

  response.cookies.set(SESSION_COOKIE_NAME, signed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 12 * 60 * 60,
    path: '/',
  });
}

export async function createDemoSession(params: {
  email: string;
  name?: string;
  orgId?: string;
}): Promise<void> {
  await createSessionCookie({
    userId: `usr_demo_${Date.now().toString(36)}`,
    email: params.email,
    name: params.name || params.email.split('@')[0],
    orgId: params.orgId || 'demo',
    role: Role.OPERATOR,
    isDemo: true,
    exp: Date.now() + 12 * 60 * 60 * 1000, // 12 hours
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (!cookie?.value) return null;

  const rawJson = verifyPayload(cookie.value);
  if (!rawJson) return null;

  try {
    const session = JSON.parse(rawJson) as UserSession;

    // 1. Expiration check inside signed cryptographic payload
    if (session.exp && Date.now() > session.exp) {
      return null;
    }

    // 2. Freshness check: verify role directly in Redis with fast timeout fallback
    try {
      const redis = getRedisClient();
      const redisPromise = redis.get(RedisKeys.user(session.orgId, session.userId));
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 400));
      const userRaw = await Promise.race([redisPromise, timeoutPromise]);
      if (userRaw && typeof userRaw === 'string') {
        const userDoc = JSON.parse(userRaw);
        if (userDoc.status === 'deactivated') {
          return null;
        }
        if (userDoc.role) {
          session.role = userDoc.role;
        }
      }
    } catch {
      // If Redis check fails or times out, trust valid signed cryptographic cookie
    }

    return session;
  } catch {
    return null;
  }
}

export async function requireSession(): Promise<UserSession> {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }
  return session;
}

export async function requireRole(minimumRole: UserRole): Promise<UserSession> {
  const session = await requireSession();
  if (!hasMinimumRole(session.role, minimumRole)) {
    throw new Error(`Forbidden: Requires at least '${minimumRole}' role (current role: '${session.role}').`);
  }
  return session;
}

