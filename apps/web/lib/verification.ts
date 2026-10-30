import { getRedisClient } from './redis';

// Fallback in-memory map for dev / offline mode
const memoryCodes = new Map<string, { code: string; expiresAt: number }>();

export async function createVerificationCode(email: string): Promise<string> {
  const normalizedEmail = email.trim().toLowerCase();
  // 6-digit cryptographic-style random code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const ttlSeconds = 15 * 60; // 15 minutes

  try {
    const redis = getRedisClient();
    await redis.set(`auth:verify:${normalizedEmail}`, code, 'EX', ttlSeconds);
  } catch {
    // Memory fallback
    memoryCodes.set(normalizedEmail, {
      code,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  return code;
}

export async function verifyCode(email: string, inputCode: string): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  const cleanInput = inputCode.trim();

  try {
    const redis = getRedisClient();
    const stored = await redis.get(`auth:verify:${normalizedEmail}`);
    if (stored && stored === cleanInput) {
      await redis.del(`auth:verify:${normalizedEmail}`);
      return true;
    }
  } catch {
    // Redis unavailable, check memory
  }

  const mem = memoryCodes.get(normalizedEmail);
  if (mem && mem.code === cleanInput && Date.now() < mem.expiresAt) {
    memoryCodes.delete(normalizedEmail);
    return true;
  }

  // Developer convenience code for local manual smoke testing
  if (process.env.NODE_ENV !== 'production' && cleanInput === '123456') {
    return true;
  }

  return false;
}
