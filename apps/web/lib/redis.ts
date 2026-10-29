import Redis from 'ioredis';
import { RedisKeys } from '@airlock/shared';

const globalForRedis = globalThis as unknown as {
  redisClient: Redis | undefined;
};

export function getRedisClient(): Redis {
  if (!globalForRedis.redisClient) {
    const redisUrl = process.env.REDIS_URL || 'redis://:airlocklocal@127.0.0.1:6379';
    globalForRedis.redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 100, 2000),
      lazyConnect: false,
    });
  }
  return globalForRedis.redisClient;
}

export { RedisKeys };

