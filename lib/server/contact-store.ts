import "server-only";
import { randomUUID } from "node:crypto";

export const RATE_WINDOW_MS = 15 * 60 * 1000;
export const DELIVERY_RETENTION_MS = 24 * 60 * 60 * 1000;
export const DELIVERY_LEASE_MS = 45_000;
const MAX_ENTRIES = 10_000;
const STORE_TIMEOUT_MS = 3000;

type DeliveryState = "new" | "pending" | "sent" | "conflict" | "full";
export type DeliveryClaim = { state: DeliveryState; lease: string };
export interface ContactStore {
  consumeRateLimit(key: string, maximum: number, windowMs?: number): Promise<number>;
  beginDelivery(key: string, payload: string): Promise<DeliveryClaim>;
  finishDelivery(key: string, lease: string, sent: boolean): Promise<void>;
}
export class ContactStoreError extends Error {
  constructor() { super("Contact security store unavailable"); }
}

// Each operation is a single Redis Lua transaction. Redis TIME avoids clock
// drift between serverless instances; keys contain only keyed digests, never PII.
export const RATE_SCRIPT = `-- woy-contact-rate-v1
local count = tonumber(redis.call('GET', KEYS[1]) or '0')
if count >= tonumber(ARGV[1]) then
  return math.max(1, math.ceil(redis.call('PTTL', KEYS[1]) / 1000))
end
if count == 0 then
  redis.call('SET', KEYS[1], '1', 'PX', ARGV[2])
else
  redis.call('INCR', KEYS[1])
end
return 0`;
export const BEGIN_SCRIPT = `-- woy-contact-begin-v1
local previous = redis.call('HMGET', KEYS[1], 'payload', 'state', 'leaseUntil')
local clock = redis.call('TIME')
local now = tonumber(clock[1]) * 1000 + math.floor(tonumber(clock[2]) / 1000)
if previous[1] then
  if previous[1] ~= ARGV[1] then return 'conflict' end
  if previous[2] == 'sent' then return 'sent' end
  if previous[2] == 'pending' and tonumber(previous[3] or '0') > now then return 'pending' end
end
redis.call('HSET', KEYS[1], 'payload', ARGV[1], 'state', 'pending', 'owner', ARGV[2], 'leaseUntil', now + tonumber(ARGV[3]))
redis.call('PEXPIRE', KEYS[1], ARGV[4])
return 'new'`;
export const FINISH_SCRIPT = `-- woy-contact-finish-v1
local previous = redis.call('HMGET', KEYS[1], 'owner', 'state')
if previous[1] ~= ARGV[1] or previous[2] ~= 'pending' then return 0 end
redis.call('HSET', KEYS[1], 'state', ARGV[2])
redis.call('PEXPIRE', KEYS[1], ARGV[3])
return 1`;

type RedisConfig = { url: URL; token: string };
function redisConfiguration(): RedisConfig | null {
  try {
    const url = new URL(process.env.UPSTASH_REDIS_REST_URL || "");
    const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
    if (!token || url.protocol !== "https:" || !url.hostname.endsWith(".upstash.io") ||
        url.username || url.password || url.port || url.pathname !== "/" || url.search || url.hash) return null;
    return { url, token };
  } catch { return null; }
}

class RedisContactStore implements ContactStore {
  constructor(private readonly config: RedisConfig) {}
  private async evaluate(script: string, key: string, args: string[]): Promise<unknown> {
    const environment = process.env.VERCEL_ENV === "preview" ? "preview" : "production";
    try {
      const response = await fetch(this.config.url, {
        method: "POST", cache: "no-store", redirect: "error", signal: AbortSignal.timeout(STORE_TIMEOUT_MS),
        headers: { Authorization: `Bearer ${this.config.token}`, "Content-Type": "application/json" },
        body: JSON.stringify(["EVAL", script, "1", `woy:contact:v1:${environment}:${key}`, ...args]),
      });
      if (!response.ok) { void response.body?.cancel().catch(() => {}); throw new ContactStoreError(); }
      const data: unknown = await response.json();
      if (!data || typeof data !== "object" || "error" in data || !("result" in data)) throw new ContactStoreError();
      return data.result;
    } catch { throw new ContactStoreError(); }
  }
  async consumeRateLimit(key: string, maximum: number, windowMs = RATE_WINDOW_MS): Promise<number> {
    const result = await this.evaluate(RATE_SCRIPT, `rate:${key}`, [String(maximum), String(windowMs)]);
    if (typeof result !== "number" || !Number.isSafeInteger(result) || result < 0) throw new ContactStoreError();
    return result;
  }
  async beginDelivery(key: string, payload: string): Promise<DeliveryClaim> {
    const lease = randomUUID();
    const state = await this.evaluate(BEGIN_SCRIPT, `delivery:${key}`, [payload, lease, String(DELIVERY_LEASE_MS), String(DELIVERY_RETENTION_MS)]);
    if (state !== "new" && state !== "pending" && state !== "sent" && state !== "conflict") throw new ContactStoreError();
    return { state, lease };
  }
  async finishDelivery(key: string, lease: string, sent: boolean): Promise<void> {
    const result = await this.evaluate(FINISH_SCRIPT, `delivery:${key}`, [lease, sent ? "sent" : "retryable", String(DELIVERY_RETENTION_MS)]);
    if (result !== 0 && result !== 1) throw new ContactStoreError();
  }
}

type Counter = { count: number; expires: number };
type Delivery = { state: "pending" | "sent" | "retryable"; payload: string; lease: string; leaseUntil: number; expires: number };
function prune<T extends { expires: number }>(entries: Map<string, T>, now: number) {
  for (const [key, value] of entries) if (value.expires <= now) entries.delete(key);
}
class DevelopmentContactStore implements ContactStore {
  private counters = new Map<string, Counter>();
  private deliveries = new Map<string, Delivery>();
  async consumeRateLimit(key: string, maximum: number, windowMs = RATE_WINDOW_MS): Promise<number> {
    const now = Date.now();
    prune(this.counters, now);
    const existing = this.counters.get(key);
    if (existing) {
      if (existing.count >= maximum) return Math.max(1, Math.ceil((existing.expires - now) / 1000));
      existing.count += 1;
      return 0;
    }
    if (this.counters.size >= MAX_ENTRIES) return Math.ceil(windowMs / 1000);
    this.counters.set(key, { count: 1, expires: now + windowMs });
    return 0;
  }
  async beginDelivery(key: string, payload: string): Promise<DeliveryClaim> {
    const now = Date.now(), lease = randomUUID();
    prune(this.deliveries, now);
    const previous = this.deliveries.get(key);
    if (previous) {
      if (previous.payload !== payload) return { state: "conflict", lease };
      if (previous.state === "sent") return { state: "sent", lease };
      if (previous.state === "pending" && previous.leaseUntil > now) return { state: "pending", lease };
    } else if (this.deliveries.size >= MAX_ENTRIES) return { state: "full", lease };
    this.deliveries.set(key, { state: "pending", payload, lease, leaseUntil: now + DELIVERY_LEASE_MS, expires: now + DELIVERY_RETENTION_MS });
    return { state: "new", lease };
  }
  async finishDelivery(key: string, lease: string, sent: boolean): Promise<void> {
    const delivery = this.deliveries.get(key);
    if (delivery?.lease === lease && delivery.state === "pending") {
      delivery.state = sent ? "sent" : "retryable";
      delivery.expires = Date.now() + DELIVERY_RETENTION_MS;
    }
  }
}
const developmentStore = new DevelopmentContactStore();
export function getContactStore(): ContactStore | null {
  const redis = redisConfiguration();
  if (redis) return new RedisContactStore(redis);
  // Never silently downgrade a configured, broken store or production deployment.
  if (process.env.NODE_ENV === "production" || process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  return developmentStore;
}
