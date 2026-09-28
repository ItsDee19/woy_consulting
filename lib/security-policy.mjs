/** Per-response script policy. Never reuse a nonce in cached HTML. */
export function contentSecurityPolicy({ nonce, production = true, https = true, turnstile = false }) {
  if (!/^[A-Za-z0-9+/]{22,}={0,2}$/.test(nonce)) throw new Error("Invalid CSP nonce");
  const challengeOrigin = turnstile ? " https://challenges.cloudflare.com" : "";
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${challengeOrigin}${production ? "" : " 'unsafe-eval'"}`,
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src 'self'${challengeOrigin}${production ? "" : " ws: wss:"}`,
    `frame-src ${turnstile ? "https://challenges.cloudflare.com" : "'none'"}`,
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(production && https ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}
