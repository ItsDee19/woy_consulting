const assert = require("node:assert/strict");
const test = require("node:test");
const { randomBytes } = require("node:crypto");
const policy = () => import("../lib/security-policy.mjs");

test("production CSP requires a nonce and blocks untrusted inline scripts and handlers", async () => {
  const { contentSecurityPolicy } = await policy();
  const nonce = randomBytes(24).toString("base64");
  const csp = contentSecurityPolicy({ nonce });
  const scripts = csp.split("; ").find(rule => rule.startsWith("script-src "));
  assert.ok(scripts.includes(`'nonce-${nonce}'`));
  assert.ok(scripts.includes("'strict-dynamic'"));
  assert.doesNotMatch(scripts, /unsafe-inline|unsafe-eval/);
  for (const rule of ["script-src-attr 'none'", "base-uri 'none'", "object-src 'none'", "frame-src 'none'", "frame-ancestors 'none'", "upgrade-insecure-requests"]) assert.ok(csp.includes(rule));
});

test("only the configured challenge origin is permitted; local development stays usable", async () => {
  const { contentSecurityPolicy } = await policy();
  const nonce = randomBytes(24).toString("base64");
  const configured = contentSecurityPolicy({ nonce, turnstile: true, https: false });
  assert.ok(configured.includes("frame-src https://challenges.cloudflare.com"));
  assert.doesNotMatch(configured, /upgrade-insecure-requests|unsafe-eval|\*/);
  const development = contentSecurityPolicy({ nonce, production: false, https: false });
  assert.ok(development.includes("'unsafe-eval'"));
  assert.ok(development.includes("ws: wss:"));
});

test("untrusted policy fragments cannot be passed as a nonce", async () => {
  const { contentSecurityPolicy } = await policy();
  for (const nonce of ["", "short", "a'.*; script-src *", "\n".repeat(24)]) assert.throws(() => contentSecurityPolicy({ nonce }), /Invalid CSP nonce/);
});
