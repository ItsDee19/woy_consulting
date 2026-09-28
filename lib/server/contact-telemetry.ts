import "server-only";
import { randomUUID } from "node:crypto";

type ContactEvent = "challenge_issued" | "origin_rejected" | "configuration_unavailable" | "identity_unavailable" |
  "rate_limited" | "invalid_body" | "invalid_session" | "validation_rejected" | "bot_rejected" |
  "bot_unavailable" | "already_sent" | "delivery_conflict" | "delivery_pending" | "delivery_failed" |
  "delivery_unconfirmed" | "delivery_sent" | "storage_unavailable";

export function contactResponder() {
  const requestId = randomUUID();
  const started = performance.now();
  return (event: ContactEvent, body: Record<string, unknown>, status = 200, headers: Record<string, string> = {}) => {
    // Intentionally no request data, URLs, IPs, provider errors, tokens or enquiry IDs.
    // The hosting platform may retain these minimal operational events in its logs.
    console.info(JSON.stringify({ event: `contact.${event}`, requestId, status, durationMs: Math.round(performance.now() - started) }));
    return Response.json(body, { status, headers: {
      "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", "X-Request-ID": requestId, ...headers,
    } });
  };
}
