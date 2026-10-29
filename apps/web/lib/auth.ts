import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { Role, UserRole, hasMinimumRole } from '@airlock/shared';
import { getRedisClient, RedisKeys } from './redis';

export interface UserSession {
  userId: string;
  email: string;
  name: string;
  orgId: string;
  role: UserRole;
  isDemo?: boolean;
}

const SESSION_COOKIE_NAME = 'airlock_session';
const SESSION_SECRET = process.env.AUTH_SECRET || 'airlock_dev_secret_key_minimum_32_characters_12345';

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

export async function createSessionCookie(session: UserSession): Promise<void> {
  const jsonStr = JSON.stringify(session);
  const signed = signPayload(jsonStr);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, signed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 8 * 60 * 60, // 8 hours
    path: '/',
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

    // Freshness check: verify role directly in Redis
    try {
      const redis = getRedisClient();
      const userRaw = await redis.get(RedisKeys.user(session.orgId, session.userId));
      if (userRaw) {
        const userDoc = JSON.parse(userRaw);
        if (userDoc.status === 'deactivated') {
          return null;
        }
        if (userDoc.role) {
          session.role = userDoc.role;
        }
      }
    } catch {
      // If Redis check fails (e.g. offline dev), trust valid signed cookie
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
