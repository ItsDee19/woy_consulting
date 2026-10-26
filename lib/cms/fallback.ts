/**
 * Decides whether a failed Sanity read should be answered from the build snapshot.
 *  - true:  Sanity could not be reached or is temporarily failing — network errors, timeouts, HTTP 429 or 5xx,
 *           and HTTP 402 (Sanity's free plan answers 402 "plan_limit_reached" once a monthly quota is used up).
 *  - false: anything else — an invalid query (HTTP 4xx), a bug in our mapping code, or a non-Error value.
 * Tests load this module in their own realm: use duck-typing, never `instanceof Error`.
 */
const NETWORK_CODES = new Set([
  "ECONNREFUSED", "ECONNRESET", "ENOTFOUND", "EAI_AGAIN", "ETIMEDOUT", "ESOCKETTIMEDOUT",
  "EHOSTUNREACH", "ENETUNREACH", "UND_ERR_CONNECT_TIMEOUT", "UND_ERR_SOCKET",
]);

/** `fetch` wraps the real reason in `cause`; look a few levels down, but never loop on a circular chain. */
const MAX_CAUSE_DEPTH = 5;

function isTransient(error: unknown, depth: number): boolean {
  if (typeof error !== "object" || error === null || typeof (error as { message?: unknown }).message !== "string") return false;
  const { statusCode, code, name, cause } = error as { statusCode?: unknown; code?: unknown; name?: unknown; cause?: unknown };
  if (typeof statusCode === "number") return statusCode === 402 || statusCode === 429 || statusCode >= 500;
  if (typeof code === "string" && NETWORK_CODES.has(code)) return true;
  if (name === "TimeoutError" || name === "AbortError") return true;
  return cause !== undefined && depth < MAX_CAUSE_DEPTH && isTransient(cause, depth + 1);
}

export function shouldUseSnapshot(error: unknown): boolean {
  return isTransient(error, 0);
}
