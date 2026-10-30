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
  demoCreatedAt?: number; // Creation timestamp in milliseconds
  exp: number; // Expiration timestamp in milliseconds
}

const SESSION_COOKIE_NAME = 'airlock_session';

// Cryptographically secure secret resolution (F-02)
function getSessionSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (process.env.NODE_ENV === 'production') {
    if (!secret || secret.length < 32) {
      throw new Error('FATAL: AUTH_SECRET must be configured with at least 32 characters in production.');
    }
    return secret;
  }
  if (secret && secret.length >= 32) {
    return secret;
  }
  // Safe deterministic fallback for local offline development only
  return 'dev_airlock_offline_development_session_secret_32_characters_minimum';
}

const SESSION_SECRET = getSessionSecret();

function signPayload(payload: string): string {
  const base64Payload = Buffer.from(payload, 'utf8').toString('base64url');
  const hmac = createHmac('sha256', SESSION_SECRET).update(base64Payload).digest('hex');
  return `${base64Payload}.${hmac}`;
}

function verifyPayload(signedValue: string): string | null {
  if (!signedValue) return null;
  const lastDot = signedValue.lastIndexOf('.');
  if (lastDot === -1) return null;

  const payloadPart = signedValue.substring(0, lastDot);
  const signature = signedValue.substring(lastDot + 1);

  // 1. Verify standard Base64URL payload signature
  const expectedHmac = createHmac('sha256', SESSION_SECRET).update(payloadPart).digest('hex');
  const sigBuf = Buffer.from(signature, 'utf8');
  const expBuf = Buffer.from(expectedHmac, 'utf8');

  let isValid = sigBuf.length === expBuf.length && timingSafeEqual(sigBuf, expBuf);

  // 2. Backward compatibility: verify raw unencoded payload
  if (!isValid) {
    const rawHmac = createHmac('sha256', SESSION_SECRET).update(payloadPart).digest('hex');
    const rawExpBuf = Buffer.from(rawHmac, 'utf8');
    if (sigBuf.length === rawExpBuf.length && timingSafeEqual(sigBuf, rawExpBuf)) {
      return payloadPart;
    }
    return null;
  }

  // Attempt base64url decode
  try {
    const decoded = Buffer.from(payloadPart, 'base64url').toString('utf8');
    return decoded;
  } catch {
    return payloadPart;
  }
}

export function createSignedOAuthState(): string {
  const nonce = randomBytes(16).toString('hex');
  const timestamp = Date.now().toString();
  return signPayload(`${nonce}:${timestamp}`);
}

export function verifySignedOAuthState(state: string | null | undefined): boolean {
  if (!state) return false;
  const payload = verifyPayload(state);
  if (!payload) return false;
  const parts = payload.split(':');
  if (parts.length < 2) return false;
  const timestamp = parseInt(parts[1], 10);
  if (isNaN(timestamp)) return false;
  const now = Date.now();
  // Valid for 15 minutes, allowing for clock skew
  if (now - timestamp > 15 * 60 * 1000 || timestamp > now + 60 * 1000) {
    return false;
  }
  return true;
}

export function getAuthBaseUrl(req: Request): string {
  const forwardedHost = req.headers.get('x-forwarded-host');
  const host = forwardedHost || req.headers.get('host');
  if (host) {
    const proto = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    return `${proto}://${host}`;
  }
  if (process.env.AUTH_URL && !process.env.AUTH_URL.includes('localhost')) {
    return process.env.AUTH_URL.replace(/\/$/, '');
  }
  return 'http://localhost:3000';
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
  const now = Date.now();
  await createSessionCookie({
    userId: `usr_demo_${now.toString(36)}`,
    email: params.email,
    name: params.name || params.email.split('@')[0],
    orgId: params.orgId || 'demo',
    role: Role.OPERATOR,
    isDemo: true,
    demoCreatedAt: now,
    exp: now + 12 * 60 * 60 * 1000, // 12 hours
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

