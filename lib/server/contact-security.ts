import "server-only";
import { configuredSiteOrigins } from "../site-origin.mjs";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { isIP } from "node:net";

export const CONTACT_COOKIE = "woy_contact";
export const CHALLENGE_LIFETIME_MS = 60 * 60 * 1000;
export const MIN_FORM_TIME_MS = 1500;
const MAX_BODY_BYTES = 32_768;

type Challenge = { id: string; issued: number };
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

/** Vercel overwrites this header at its edge. Never trust it on another host. */
export function trustedClientIp(request: Request): string | null {
  if (process.env.VERCEL !== "1") return null;
  const value = request.headers.get("x-vercel-forwarded-for")?.trim();
  if (!value || value.length > 45 || value.includes("%") || !isIP(value)) return null;
  return isIP(value) === 4 ? value : new URL(`http://[${value}]`).hostname.slice(1, -1);
}

export function normaliseRateLimitIp(ip: string): string {
  if (isIP(ip) === 4) return `v4:${ip}`;
  if (isIP(ip) !== 6) throw new Error("Invalid client address");
  const canonical = new URL(`http://[${ip}]`).hostname.slice(1, -1);
  const [left, right] = canonical.split("::");
  const start = left ? left.split(":") : [];
  const end = right ? right.split(":") : [];
  const groups = right === undefined ? start : [...start, ...Array(8 - start.length - end.length).fill("0"), ...end];
  const parts = groups.map((group) => parseInt(group, 16));
  // IPv4-mapped IPv6 must share the IPv4 budget, not acquire a second identity.
  if (parts.slice(0, 5).every((part) => part === 0) && parts[5] === 0xffff) {
    return `v4:${parts[6] >> 8}.${parts[6] & 255}.${parts[7] >> 8}.${parts[7] & 255}`;
  }
  // Group privacy addresses within a /64 so rotating interface IDs cannot reset limits.
  return `v6:${parts.slice(0, 4).map((part) => part.toString(16)).join(":")}/64`;
}

export function rateLimitIdentity(request: Request, secret: string): string | null {
  const ip = trustedClientIp(request);
  if (ip) return fingerprint(normaliseRateLimitIp(ip), secret);
  return process.env.NODE_ENV === "production" ? null : fingerprint("development-local", secret);
}

export class ContactBodyError extends Error {
  constructor(public status: number) { super("Invalid contact request body"); }
}

export async function readContactBody(request: Request, timeoutMs = 5000): Promise<Record<string, unknown>> {
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type") || "")) throw new ContactBodyError(415);
  const declaredLength = request.headers.get("content-length");
  if (declaredLength && (!/^\d+$/.test(declaredLength) || Number(declaredLength) > MAX_BODY_BYTES)) throw new ContactBodyError(413);
  if (!request.body) throw new ContactBodyError(400);
  if (request.signal.aborted) throw new ContactBodyError(408);
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  let interruptedRead = false;
  let interrupt!: () => void;
  const interrupted = new Promise<never>((_, reject) => {
    interrupt = () => {
      interruptedRead = true;
      reject(new ContactBodyError(408));
      // Do not await cancellation: a hostile stream must not hold the response open.
      void reader.cancel().catch(() => {});
    };
  });
  const deadline = setTimeout(interrupt, timeoutMs);
  request.signal.addEventListener("abort", interrupt, { once: true });
  if (request.signal.aborted) interrupt();
  try {
    while (true) {
      const { value, done } = await Promise.race([reader.read(), interrupted]);
      if (interruptedRead) throw new ContactBodyError(408);
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_BODY_BYTES) {
        void reader.cancel().catch(() => {});
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
    clearTimeout(deadline);
    request.signal.removeEventListener("abort", interrupt);
    reader.releaseLock();
  }
}
