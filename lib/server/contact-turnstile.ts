import "server-only";
import { configuredSiteOrigins } from "../site-origin.mjs";
import { trustedClientIp } from "./contact-security";

export function hasTurnstileConfiguration(): boolean {
  return Boolean(process.env.TURNSTILE_SITE_KEY?.trim() && process.env.TURNSTILE_SECRET_KEY?.trim());
}

export async function verifyTurnstile(request: Request, token: unknown): Promise<"valid" | "invalid" | "unavailable"> {
  if (!hasTurnstileConfiguration()) {
    return process.env.NODE_ENV !== "production" && !process.env.TURNSTILE_SITE_KEY && !process.env.TURNSTILE_SECRET_KEY ? "valid" : "unavailable";
  }
  if (typeof token !== "string" || !token || token.length > 2048 || token.trim() !== token) return "invalid";
  try {
    const form = new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY!.trim(), response: token });
    const ip = trustedClientIp(request);
    if (ip) form.set("remoteip", ip);
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST", body: form, cache: "no-store", redirect: "error",
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(5000)]),
    });
    if (!response.ok) { void response.body?.cancel().catch(() => {}); return "unavailable"; }
    const result: unknown = await response.json();
    if (!result || typeof result !== "object") return "unavailable";
    // Siteverify is authoritative for signature, expiration and single use.
    // Bind accepted results to this widget action and this website as well.
    if (!("success" in result) || result.success !== true || !("action" in result) || result.action !== "contact" ||
        !("hostname" in result) || typeof result.hostname !== "string" ||
        !("challenge_ts" in result) || typeof result.challenge_ts !== "string") return "invalid";
    const hostnames = new Set([new URL(request.url).hostname, ...configuredSiteOrigins(process.env).map((origin) => new URL(origin).hostname)]);
    const issued = Date.parse(result.challenge_ts), age = Date.now() - issued;
    return hostnames.has(result.hostname.toLowerCase()) && Number.isFinite(issued) && age >= -30_000 && age <= 300_000 ? "valid" : "invalid";
  } catch { return "unavailable"; }
}
