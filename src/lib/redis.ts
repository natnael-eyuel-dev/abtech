import { Redis as UpstashRedis } from "@upstash/redis";

export type RedisLike = {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, options?: { ex?: number }) => Promise<unknown>;
  del: (key: string) => Promise<unknown>;
  incr: (key: string) => Promise<number>;
  expire: (key: string, seconds: number) => Promise<number>;
  ttl: (key: string) => Promise<number>;
};

type MemoryEntry = { value: string; expiresAt: number | null };

declare global {
  var __memoryRedisStorage: Map<string, MemoryEntry> | undefined;
}

const memoryStorage: Map<string, MemoryEntry> =
  global.__memoryRedisStorage ?? new Map<string, MemoryEntry>();
global.__memoryRedisStorage = memoryStorage;

const nowMs = () => Date.now();
const isExpired = (entry: MemoryEntry) =>
  entry.expiresAt !== null && entry.expiresAt <= nowMs();

const memoryRedis: RedisLike = {
  get: async (key) => {
    const entry = memoryStorage.get(key);
    if (!entry) return null;
    if (isExpired(entry)) {
      memoryStorage.delete(key);
      return null;
    }
    return entry.value;
  },
  set: async (key, value, options) => {
    const expiresAt =
      typeof options?.ex === "number" ? nowMs() + options.ex * 1000 : null;
    memoryStorage.set(key, { value, expiresAt });
    return "OK";
  },
  del: async (key) => {
    memoryStorage.delete(key);
    return 1;
  },
  incr: async (key) => {
    const existing = await memoryRedis.get(key);
    const current = Number.parseInt(existing ?? "0", 10);
    const next = Number.isFinite(current) ? current + 1 : 1;
    await memoryRedis.set(key, String(next));
    return next;
  },
  expire: async (key, seconds) => {
    const entry = memoryStorage.get(key);
    if (!entry) return 0;
    entry.expiresAt = nowMs() + seconds * 1000;
    memoryStorage.set(key, entry);
    return 1;
  },
  ttl: async (key) => {
    const entry = memoryStorage.get(key);
    if (!entry) return -2; // Redis: key does not exist
    if (isExpired(entry)) {
      memoryStorage.delete(key);
      return -2;
    }
    if (entry.expiresAt === null) return -1; // Redis: no expire
    return Math.max(0, Math.ceil((entry.expiresAt - nowMs()) / 1000));
  },
};

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const hasUpstash = Boolean(upstashUrl && upstashToken);

const upstashRedis: RedisLike | null = hasUpstash
  ? (() => {
      const client = new UpstashRedis({
        url: upstashUrl!,
        token: upstashToken!,
      });

      const wrapped: RedisLike = {
        get: async (key) => {
          const v = await client.get<string>(key);
          return v ?? null;
        },
        set: async (key, value, options) => {
          // @upstash/redis uses `set(key, value, { ex })`
          return await (client as any).set(
            key,
            value,
            options?.ex ? { ex: options.ex } : undefined,
          );
        },
        del: async (key) => await client.del(key),
        incr: async (key) => await client.incr(key),
        expire: async (key, seconds) => await client.expire(key, seconds),
        ttl: async (key) => await client.ttl(key),
      };

      return wrapped;
    })()
  : null;

const redis: RedisLike = upstashRedis ?? memoryRedis;
export default redis;

export const redisConfigured = Boolean(upstashRedis);
export const redisProvider: "upstash" | "memory" = upstashRedis ? "upstash" : "memory";