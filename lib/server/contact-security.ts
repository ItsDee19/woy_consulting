import "server-only";
import { configuredSiteOrigins } from "../site-origin.mjs";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const CONTACT_COOKIE = "woy_contact";
export const CHALLENGE_LIFETIME_MS = 60 * 60 * 1000;
export const MIN_FORM_TIME_MS = 1500;
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ENTRIES = 10_000;
const MAX_BODY_BYTES = 32_768;

type Challenge = { id: string; issued: number };
type Counter = { count: number; expires: number };
type Delivery = { state: "pending" | "sent" | "retryable"; payload: string; expires: number };
// Intentionally bounded, process-local state. A multi-instance deployment must
// also configure its edge/WAF rate limits or replace this with a shared store.
const counters = new Map<string, Counter>();
const deliveries = new Map<string, Delivery>();
const developmentSecret = randomBytes(32).toString("hex");

export function getContactSecret(): string | null {
  const configured = process.env.CONTACT_FORM_SECRET;
  if (configured && configured.length >= 32) return configured;
  return process.env.NODE_ENV === "production" ? null : developmentSecret;
}

export function fingerprint(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function createChallenge(secret: string, now = Date.now()): string {
  const body = Buffer.from(JSON.stringify({ id: randomBytes(24).toString("hex"), issued: now })).toString("base64url");
  return `${body}.${fingerprint(body, secret)}`;
}

export function verifyChallenge(token: string | undefined, secret: string, now = Date.now()): Challenge | null {
  if (!token || token.length > 256) return null;
  const [body, signature, extra] = token.split(".");
  if (extra || !body || !signature || !/^[a-f0-9]{64}$/.test(signature)) return null;
  const expected = Buffer.from(fingerprint(body, secret), "hex");
  if (!timingSafeEqual(expected, Buffer.from(signature, "hex"))) return null;
  try {
    const parsed: unknown = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!parsed || typeof parsed !== "object" || !("id" in parsed) || !("issued" in parsed)) return null;
    if (typeof parsed.id !== "string" || !/^[a-f0-9]{48}$/.test(parsed.id) || typeof parsed.issued !== "number") return null;
    if (!Number.isSafeInteger(parsed.issued) || parsed.issued > now || now - parsed.issued >= CHALLENGE_LIFETIME_MS) return null;
    return { id: parsed.id, issued: parsed.issued };
  } catch {
    return null;
  }
}

export function readChallengeCookie(request: Request): string | undefined {
  return request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${CONTACT_COOKIE}=`))?.slice(CONTACT_COOKIE.length + 1);
}

export function isSameOrigin(request: Request, requireOrigin: boolean): boolean {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") return false;
  const origin = request.headers.get("origin");
  if (!origin) return !requireOrigin;
  const allowed = [new URL(request.url).origin];
  try {
    allowed.push(...configuredSiteOrigins(process.env));
  } catch {
    // Invalid site configuration must not create a partial origin allowlist.
    return false;
  }
  return allowed.includes(origin);
}

function prune<T extends { expires: number }>(entries: Map<string, T>, now: number) {
  for (const [key, value] of entries) {
    if (value.expires <= now) entries.delete(key);
  }
}

export function consumeRateLimit(key: string, maximum: number, now = Date.now()): number {
  prune(counters, now);
  const existing = counters.get(key);
  if (existing) {
    if (existing.count >= maximum) return Math.max(1, Math.ceil((existing.expires - now) / 1000));
    existing.count += 1;
    return 0;
  }
  if (counters.size >= MAX_ENTRIES) return Math.ceil(WINDOW_MS / 1000);
  counters.set(key, { count: 1, expires: now + WINDOW_MS });
  return 0;
}

export function beginDelivery(key: string, payload: string, now = Date.now()): "new" | "pending" | "sent" | "conflict" | "full" {
  prune(deliveries, now);
  const previous = deliveries.get(key);
  if (previous) {
    if (previous.payload !== payload) return "conflict";
    if (previous.state !== "retryable") return previous.state;
    previous.state = "pending";
    previous.expires = now + WINDOW_MS;
    return "new";
  }
  if (deliveries.size >= MAX_ENTRIES) return "full";
  deliveries.set(key, { state: "pending", payload, expires: now + WINDOW_MS });
  return "new";
}

export function finishDelivery(key: string, sent: boolean) {
  const delivery = deliveries.get(key);
  if (delivery) {
    // Retain the payload binding after failure so retries cannot reuse an ID
    // for a different enquiry. A shared upstream idempotency key also protects
    // retries beyond this process-local cache when the provider supports it.
    delivery.state = sent ? "sent" : "retryable";
    delivery.expires = Date.now() + WINDOW_MS;
  }
}

export function rateLimitIdentity(request: Request, challenge: Challenge, secret: string): string {
  // Only configure this header when a trusted reverse proxy overwrites it on
  // every request. Arbitrary client-supplied X-Forwarded-For is not trusted.
  const header = process.env.CONTACT_RATE_LIMIT_IP_HEADER;
  const trustedIp = header ? request.headers.get(header)?.trim() : undefined;
  return fingerprint(trustedIp && trustedIp.length <= 256 ? `ip:${trustedIp}` : `browser:${challenge.id}`, secret);
}

export class ContactBodyError extends Error {
  constructor(public status: number) { super("Invalid contact request body"); }
}

export async function readContactBody(request: Request): Promise<Record<string, unknown>> {
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type") || "")) throw new ContactBodyError(415);
  const declaredLength = request.headers.get("content-length");
  if (declaredLength && (!/^\d+$/.test(declaredLength) || Number(declaredLength) > MAX_BODY_BYTES)) throw new ContactBodyError(413);
  if (!request.body) throw new ContactBodyError(400);
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new ContactBodyError(413);
      }
      chunks.push(value);
    }
    const body: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new ContactBodyError(400);
    return body as Record<string, unknown>;
  } catch (error) {
    if (error instanceof ContactBodyError) throw error;
    throw new ContactBodyError(400);
  } finally {
    reader.releaseLock();
  }
}
