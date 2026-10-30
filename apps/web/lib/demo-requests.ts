import { getRedisClient } from './redis';

export interface DemoRequest {
  id: string;
  email: string;
  name: string;
  orgName: string;
  useCase: string;
  status: 'pending' | 'approved' | 'expired';
  requestedAt: number; // ms timestamp
  autoApprovesAt: number; // ms timestamp (+5 minutes)
  approvedAt?: number; // ms timestamp
  expiresAt?: number; // ms timestamp (+12 hours from approval)
}

const FIVE_MINUTES_MS = 5 * 60 * 1000;
const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

// In-memory fallback map for demo requests if Redis is offline
const memoryDemoRequests = new Map<string, DemoRequest>();

function getStorageKey(email: string): string {
  return `airlock:demo_request:${email.trim().toLowerCase()}`;
}

export async function createDemoRequest(params: {
  email: string;
  name?: string;
  orgName?: string;
  useCase?: string;
}): Promise<DemoRequest> {
  const normalizedEmail = params.email.trim().toLowerCase();
  const now = Date.now();
  const id = `req_${now.toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

  const req: DemoRequest = {
    id,
    email: normalizedEmail,
    name: params.name?.trim() || normalizedEmail.split('@')[0],
    orgName: params.orgName?.trim() || 'Demo Team',
    useCase: params.useCase?.trim() || 'Cursor MCP Security Evaluation',
    status: 'pending',
    requestedAt: now,
    autoApprovesAt: now + FIVE_MINUTES_MS,
  };

  const redis = getRedisClient();
  const key = getStorageKey(normalizedEmail);
  try {
    await redis.set(key, JSON.stringify(req));
  } catch {
    // Redis unavailable, use memory map
  }
  memoryDemoRequests.set(normalizedEmail, req);

  return req;
}

export async function getDemoRequest(email: string): Promise<DemoRequest | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const key = getStorageKey(normalizedEmail);
  const redis = getRedisClient();

  let req: DemoRequest | null = null;
  try {
    const raw = await redis.get(key);
    if (raw) req = JSON.parse(raw);
  } catch {
    // fallback
  }

  if (!req) {
    req = memoryDemoRequests.get(normalizedEmail) || null;
  }

  if (!req) return null;

  const now = Date.now();

  // Automatic 5-minute approval condition check
  if (req.status === 'pending' && now >= req.autoApprovesAt) {
    req.status = 'approved';
    req.approvedAt = now;
    req.expiresAt = now + TWELVE_HOURS_MS;

    try {
      await redis.set(key, JSON.stringify(req));
    } catch {
      // fallback
    }
    memoryDemoRequests.set(normalizedEmail, req);
  }

  // 12-hour expiration check
  if (req.status === 'approved' && req.expiresAt && now > req.expiresAt) {
    req.status = 'expired';
    try {
      await redis.set(key, JSON.stringify(req));
    } catch {
      // fallback
    }
    memoryDemoRequests.set(normalizedEmail, req);
  }

  return req;
}

export async function approveDemoRequest(email: string): Promise<DemoRequest | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const req = await getDemoRequest(normalizedEmail);
  if (!req) return null;

  const now = Date.now();
  req.status = 'approved';
  req.approvedAt = now;
  req.expiresAt = now + TWELVE_HOURS_MS;

  const key = getStorageKey(normalizedEmail);
  const redis = getRedisClient();
  try {
    await redis.set(key, JSON.stringify(req));
  } catch {
    // fallback
  }
  memoryDemoRequests.set(normalizedEmail, req);

  return req;
}
