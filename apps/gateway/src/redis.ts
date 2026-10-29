import Redis from 'ioredis';
import { RedisKeys } from '@airlock/shared';

export interface StorageAdapter {
  isAvailable(): boolean;
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
  hget(key: string, field: string): Promise<string | null>;
  hincrby(key: string, field: string, increment: number): Promise<number>;
  xadd(stream: string, fields: Record<string, string>): Promise<string>;
  xrange(stream: string, start?: string, end?: string, count?: number): Promise<{ id: string; fields: Record<string, string> }[]>;
  close(): Promise<void>;
}

// In-memory fallback adapter for testing and offline environments
export class MemoryStorageAdapter implements StorageAdapter {
  private kv = new Map<string, string>();
  private hashes = new Map<string, Map<string, number>>();
  private streams = new Map<string, { id: string; fields: Record<string, string> }[]>();

  isAvailable(): boolean {
    return true;
  }

  async get(key: string): Promise<string | null> {
    return this.kv.get(key) || null;
  }

  async set(key: string, value: string): Promise<void> {
    this.kv.set(key, value);
  }

  async del(key: string): Promise<void> {
    this.kv.delete(key);
  }

  async hget(key: string, field: string): Promise<string | null> {
    const hash = this.hashes.get(key);
    const val = hash?.get(field);
    return val !== undefined ? String(val) : null;
  }

  async hincrby(key: string, field: string, increment: number): Promise<number> {
    if (!this.hashes.has(key)) {
      this.hashes.set(key, new Map());
    }
    const hash = this.hashes.get(key)!;
    const current = hash.get(field) || 0;
    const next = current + increment;
    hash.set(field, next);
    return next;
  }

  async xadd(stream: string, fields: Record<string, string>): Promise<string> {
    if (!this.streams.has(stream)) {
      this.streams.set(stream, []);
    }
    const list = this.streams.get(stream)!;
    const id = `${Date.now()}-${list.length}`;
    list.push({ id, fields });
    return id;
  }

  async xrange(stream: string, start = '-', end = '+', count = 100): Promise<{ id: string; fields: Record<string, string> }[]> {
    const list = this.streams.get(stream) || [];
    return list.slice(0, count);
  }

  async close(): Promise<void> {
    this.kv.clear();
    this.hashes.clear();
    this.streams.clear();
  }
}

// Live Redis adapter (Redis Cloud / Redis Stack)
export class RedisStorageAdapter implements StorageAdapter {
  private client: Redis;
  private connected = false;

  constructor(redisUrl: string) {
    this.client = new Redis(redisUrl, {
      maxRetriesPerRequest: 2,
      retryStrategy: (times) => (times > 3 ? null : Math.min(times * 100, 1000)),
      lazyConnect: true,
    });

    this.client.on('connect', () => {
      this.connected = true;
    });
    this.client.on('error', () => {
      this.connected = false;
    });
  }

  async init(): Promise<boolean> {
    try {
      await this.client.connect();
      this.connected = true;
      return true;
    } catch {
      this.connected = false;
      return false;
    }
  }

  isAvailable(): boolean {
    return this.connected;
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async hget(key: string, field: string): Promise<string | null> {
    return this.client.hget(key, field);
  }

  async hincrby(key: string, field: string, increment: number): Promise<number> {
    return this.client.hincrby(key, field, increment);
  }

  async xadd(stream: string, fields: Record<string, string>): Promise<string> {
    const args: string[] = [];
    for (const [k, v] of Object.entries(fields)) {
      args.push(k, typeof v === 'string' ? v : JSON.stringify(v));
    }
    return this.client.xadd(stream, '*', ...args) as Promise<string>;
  }

  async xrange(stream: string, start = '-', end = '+', count = 100): Promise<{ id: string; fields: Record<string, string> }[]> {
    const raw = await this.client.xrange(stream, start, end, 'COUNT', count);
    return raw.map(([id, entries]: [string, string[]]) => {
      const fields: Record<string, string> = {};
      for (let i = 0; i < entries.length; i += 2) {
        fields[entries[i]] = entries[i + 1];
      }
      return { id, fields };
    });
  }

  async close(): Promise<void> {
    await this.client.quit();
  }
}
