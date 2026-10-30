import { randomInt } from 'node:crypto';
import { getRedisClient } from './redis';

// Fallback in-memory map for dev / offline mode
interface VerificationEntry {
  code: string;
  expiresAt: number;
  attempts: number;
}
const memoryCodes = new Map<string, VerificationEntry>();
const memoryRateLimits = new Map<string, { count: number; resetAt: number }>();

export class RateLimitError extends Error {
  constructor(message = 'Rate limit exceeded: Please wait before requesting another verification code.') {
    super(message);
    this.name = 'RateLimitError';
  }
}

/**
 * Check and record rate limit (max 3 requests per 10 minutes per email)
 */
async function checkRateLimit(email: string): Promise<void> {
  const rateKey = `auth:ratelimit:req:${email}`;
  const maxRequests = 3;
  const windowSeconds = 10 * 60; // 10 minutes

  try {
    const redis = getRedisClient();
    const current = await redis.incr(rateKey);
    if (current === 1) {
      await redis.expire(rateKey, windowSeconds);
    }
    if (current > maxRequests) {
      throw new RateLimitError();
    }
    return;
  } catch (err) {
    if (err instanceof RateLimitError) throw err;
    // Fall back to in-memory rate limiting if Redis is unavailable
  }

  const now = Date.now();
  const entry = memoryRateLimits.get(email);
  if (entry && now < entry.resetAt) {
    if (entry.count >= maxRequests) {
      throw new RateLimitError();
    }
    entry.count += 1;
  } else {
    memoryRateLimits.set(email, {
      count: 1,
      resetAt: now + windowSeconds * 1000,
    });
  }
}

export async function createVerificationCode(email: string): Promise<string> {
  const normalizedEmail = email.trim().toLowerCase();

  // Enforce rate limiting
  await checkRateLimit(normalizedEmail);

  // Cryptographically secure 6-digit random code
  const code = randomInt(100000, 1000000).toString();
  const ttlSeconds = 15 * 60; // 15 minutes

  try {
    const redis = getRedisClient();
    await redis.set(
      `auth:verify:${normalizedEmail}`,
      JSON.stringify({ code, attempts: 0 }),
      'EX',
      ttlSeconds
    );
  } catch {
    // Memory fallback
    memoryCodes.set(normalizedEmail, {
      code,
      expiresAt: Date.now() + ttlSeconds * 1000,
      attempts: 0,
    });
  }

  return code;
}

export async function verifyCode(email: string, inputCode: string): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  const cleanInput = inputCode.trim();

  try {
    const redis = getRedisClient();
    const key = `auth:verify:${normalizedEmail}`;
    const raw = await redis.get(key);
    if (raw) {
      const entry: { code: string; attempts: number } = JSON.parse(raw);
      if (entry.attempts >= 5) {
        // Exceeded maximum failed attempts - delete to prevent brute-force
        await redis.del(key);
        return false;
      }

      if (entry.code === cleanInput) {
        await redis.del(key);
        return true;
      } else {
        // Increment attempts
        entry.attempts += 1;
        const ttl = await redis.ttl(key);
        if (ttl > 0) {
          await redis.set(key, JSON.stringify(entry), 'EX', ttl);
        }
        return false;
      }
    }
  } catch {
    // Redis unavailable, check memory
  }

  const mem = memoryCodes.get(normalizedEmail);
  if (mem && Date.now() < mem.expiresAt) {
    if (mem.attempts >= 5) {
      memoryCodes.delete(normalizedEmail);
      return false;
    }

    if (mem.code === cleanInput) {
      memoryCodes.delete(normalizedEmail);
      return true;
    } else {
      mem.attempts += 1;
      return false;
    }
  }

  // Developer convenience code for local manual smoke testing only when explicitly enabled
  if (process.env.ALLOW_DEV_VERIFICATION_CODE === 'true' && process.env.NODE_ENV !== 'production' && cleanInput === '123456') {
    return true;
  }

  return false;
}
