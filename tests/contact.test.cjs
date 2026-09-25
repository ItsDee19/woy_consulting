const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const ts = require("typescript");
const { randomUUID } = require("node:crypto");

// Compile the small server surface in isolation; all upstream delivery is mocked.
// "server-only" is a Next build-time boundary, so only that marker is stubbed here.
const output = fs.mkdtempSync(path.join(os.tmpdir(), "woy-contact-tests-"));
const root = path.resolve(__dirname, "..");
fs.mkdirSync(path.join(output, "lib"), { recursive: true });
fs.copyFileSync(path.join(root, "lib/site-origin.mjs"), path.join(output, "lib/site-origin.mjs"));
for (const file of ["lib/contact-validation.ts", "lib/server/contact-security.ts", "app/api/contact/route.ts"]) {
  const destination = path.join(output, file.replace(/\.ts$/, ".js"));
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, ts.transpileModule(fs.readFileSync(path.join(root, file), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText);
}
fs.mkdirSync(path.join(output, "node_modules/server-only"), { recursive: true });
fs.writeFileSync(path.join(output, "node_modules/server-only/index.js"), "");
const validation = require(path.join(output, "lib/contact-validation.js"));
const security = require(path.join(output, "lib/server/contact-security.js"));
const route = require(path.join(output, "app/api/contact/route.js"));
const originalFetch = global.fetch;
const originals = Object.fromEntries(["CONTACT_ENDPOINT", "CONTACT_ENDPOINT_TOKEN", "CONTACT_FORM_SECRET", "CONTACT_RATE_LIMIT_IP_HEADER", "NODE_ENV", "SITE_URL"].map((key) => [key, process.env[key]]));
const secret = "test-secret-".repeat(5);
process.env.NODE_ENV = "production";
process.env.SITE_URL = "https://woy.test";
process.env.CONTACT_FORM_SECRET = secret;
process.env.CONTACT_ENDPOINT = "https://delivery.test/contact";
delete process.env.CONTACT_RATE_LIMIT_IP_HEADER;
global.fetch = async () => { throw new Error("Unmocked external delivery is forbidden in tests"); };

test.after(() => {
  global.fetch = originalFetch;
  for (const [key, value] of Object.entries(originals)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  const resolved = path.resolve(output);
  if (path.dirname(resolved) === path.resolve(os.tmpdir()) && path.basename(resolved).startsWith("woy-contact-tests-")) {
    fs.rmSync(resolved, { recursive: true, force: true });
  }
});

const valid = {
  name: "Test Visitor", email: "visitor@example.test", organisation: "Test Organisation",
  message: "We would like to discuss a leadership development programme.",
  website: "", consent: true, privacyNoticeVersion: validation.PRIVACY_NOTICE_VERSION,
};
function enquiry(overrides = {}) {
  return { ...valid, id: randomUUID(), ...overrides };
}
function cookie(age = 2000) {
  return `${security.CONTACT_COOKIE}=${security.createChallenge(secret, Date.now() - age)}`;
}
function request(body = enquiry(), headers = {}, customCookie = cookie()) {
  return new Request("https://woy.test/api/contact", {
    method: "POST",
    headers: { Origin: "https://woy.test", "Content-Type": "application/json", Cookie: customCookie, ...headers },
    body: typeof body === "string" ? body : JSON.stringify(Array.isArray(body) ? body : { id: randomUUID(), ...body }),
  });
}

test("shared validation accepts international names, optional organisations and multiline messages", () => {
  assert.deepEqual(validation.contactFields, ["name", "email", "organisation", "message"]);
  assert.deepEqual(validation.validateContact({
    name: "अनन्या शर्मा", email: "name+tag@example.co.uk", organisation: "",
    message: "Our priorities:\r\n\tLeadership development and sustained growth.",
  }), {});
  assert.equal(validation.validateContactField("name", "N".repeat(120)), undefined);
  assert.equal(validation.validateContactField("organisation", "अ".repeat(200)), undefined);
  assert.equal(validation.validateContactField("message", "अ".repeat(4000)), undefined);
});

test("shared validation rejects malformed, oversized and disallowed control-character fields", () => {
  for (const [field, values] of Object.entries({
    name: ["", "A", "123", "a".repeat(121), "Name\nInjected"],
    email: ["", "bad@", "bad@example..com", "a@b", "a".repeat(250) + "@example.com", "bad\r@example.com"],
    organisation: [undefined, { toString: () => "Company" }, "a".repeat(201), "Company\nInjected"],
    message: ["", "too short", "          ", "a".repeat(4001), "A message\u0000with null", "A message\u000bwith control"],
  })) {
    for (const value of values) assert.ok(validation.validateContactField(field, value), `${field} should reject ${String(value)}`);
  }
});

test("challenge signatures reject tampering, future issue times, and expiry", () => {
  const token = security.createChallenge(secret, 10_000);
  assert.ok(security.verifyChallenge(token, secret, 11_500));
  assert.equal(security.verifyChallenge(token, "wrong".repeat(10), 11_500), null);
  assert.equal(security.verifyChallenge(token + "0", secret, 11_500), null);
  assert.equal(security.verifyChallenge(token, secret, 9_999), null);
  assert.equal(security.verifyChallenge(token, secret, 10_000 + security.CHALLENGE_LIFETIME_MS), null);
});

test("GET sets a private, secure, same-site essential cookie", async () => {
  const response = await route.GET(new Request("https://woy.test/api/contact"));
  assert.equal(response.status, 200);
  const header = response.headers.get("set-cookie");
  for (const part of ["HttpOnly", "SameSite=Strict", "Secure", "Path=/api/contact", "Max-Age="]) assert.ok(header.includes(part));
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.ok((await response.json()).readyAfterMs <= 1500);
});

test("cross-origin requests, missing Origin, absent cookie and rapid submissions are blocked", async () => {
  assert.equal((await route.GET(new Request("https://woy.test/api/contact", { headers: { "sec-fetch-site": "cross-site" } }))).status, 403);
  assert.equal((await route.POST(request(valid, { Origin: "https://attacker.test" }))).status, 403);
  const missing = request();
  missing.headers.delete("origin");
  assert.equal((await route.POST(missing)).status, 403);
  assert.equal((await route.POST(request(valid, {}, ""))).status, 403);
  const early = await route.POST(request(valid, {}, cookie(0)));
  assert.equal(early.status, 429);
  assert.equal(early.headers.get("retry-after"), "2");
});

test("form reports unavailable rather than success without production delivery configuration", async () => {
  const endpoint = process.env.CONTACT_ENDPOINT;
  for (const value of ["", "http://delivery.test/contact", "https://user:password@delivery.test/contact"]) {
    process.env.CONTACT_ENDPOINT = value;
    assert.equal((await route.GET(new Request("https://woy.test/api/contact"))).status, 503);
    assert.equal((await route.POST(request())).status, 503);
  }
  process.env.CONTACT_ENDPOINT = endpoint;
  delete process.env.CONTACT_FORM_SECRET;
  assert.equal((await route.POST(request())).status, 503);
  process.env.CONTACT_FORM_SECRET = secret;
});

test("JSON size/type checks, malformed bodies, honeypot and strict schema run before delivery", async () => {
  assert.equal((await route.POST(request(valid, { "Content-Type": "text/plain" }))).status, 415);
  assert.equal((await route.POST(request(valid, { "Content-Length": "32769" }))).status, 413);
  assert.equal((await route.POST(request("x".repeat(32769)))).status, 413);
  assert.equal((await route.POST(request("{invalid"))).status, 400);
  assert.equal((await route.POST(request([]))).status, 400);
  assert.equal((await route.POST(request({ ...valid, website: "https://spam.test" }))).status, 400);
  assert.equal((await route.POST(request({ ...valid, extra: "unexpected" }))).status, 400);
  const response = await route.POST(request({ ...valid, email: "invalid" }));
  assert.equal(response.status, 422);
  assert.ok((await response.json()).errors.email);
});

test("consent, current privacy notice and a valid UUID are required before delivery", async () => {
  global.fetch = async () => { throw new Error("Invalid metadata must not reach delivery"); };
  for (const consent of [undefined, false, "true", 1]) {
    const response = await route.POST(request(enquiry({ consent })));
    assert.equal(response.status, 422);
    assert.ok((await response.json()).errors.consent);
  }
  for (const id of [undefined, "", "not-a-uuid", "0".repeat(500), "12345678-1234-4234-7234-123456789012"]) {
    assert.equal((await route.POST(request(enquiry({ id })))).status, 400);
  }
  for (const privacyNoticeVersion of [undefined, "2020-01-01", 20260925]) {
    assert.equal((await route.POST(request(enquiry({ privacyNoticeVersion })))).status, 400);
  }
});

test("successful delivery forwards only normalized fields and consent metadata with server-only authentication", async () => {
  const browser = cookie();
  const body = enquiry({ name: "  Test Visitor  ", organisation: "  Test Organisation  " });
  let calls = 0;
  process.env.CONTACT_ENDPOINT_TOKEN = "server-only-test-token";
  global.fetch = async (url, options) => {
    calls += 1;
    assert.equal(String(url), "https://delivery.test/contact");
    assert.equal(options.headers.Authorization, "Bearer server-only-test-token");
    assert.equal(options.headers["Idempotency-Key"], body.id);
    assert.equal(options.redirect, "error");
    assert.deepEqual(Object.fromEntries(options.body.entries()), {
      name: valid.name, email: valid.email, organisation: valid.organisation, message: valid.message,
      id: body.id, consent: "true", privacyNoticeVersion: validation.PRIVACY_NOTICE_VERSION,
    });
    return new Response("", { status: 202 });
  };
  const first = await route.POST(request(body, {}, browser));
  assert.equal(first.status, 200);
  const acknowledgement = await first.json();
  assert.equal(acknowledgement.message, "Your enquiry has been received by WOY Consulting.");
  assert.ok(!JSON.stringify(acknowledgement).includes("server-only-test-token"));
  assert.equal((await route.POST(request(body, {}, browser))).status, 200);
  // An unchanged retry keeps its UUID even when the signed browser session changes.
  assert.equal((await route.POST(request(body))).status, 200);
  assert.equal(calls, 1);
  delete process.env.CONTACT_ENDPOINT_TOKEN;
});

test("maximum-length Unicode messages are accepted within the bounded JSON body", async () => {
  const body = enquiry({ message: "अ".repeat(4000), organisation: "" });
  global.fetch = async (_url, options) => {
    assert.equal(options.body.get("message"), body.message);
    assert.equal(options.body.get("organisation"), "");
    return new Response("", { status: 200 });
  };
  assert.ok(Buffer.byteLength(JSON.stringify(body)) > 4096);
  assert.equal((await route.POST(request(body))).status, 200);
});

test("concurrent duplicate requests are blocked while delivery is pending", async () => {
  const browser = cookie();
  const body = enquiry();
  let calls = 0;
  let started;
  let finish;
  const entered = new Promise((resolve) => { started = resolve; });
  global.fetch = () => { calls += 1; started(); return new Promise((resolve) => { finish = resolve; }); };
  const first = route.POST(request(body, {}, browser));
  await entered;
  assert.equal((await route.POST(request(body, {}, browser))).status, 409);
  finish(new Response("", { status: 200 }));
  assert.equal((await first).status, 200);
  assert.equal(calls, 1);
});

test("reusing an acknowledged UUID with altered details rejects rather than falsely acknowledging or resending", async () => {
  const body = enquiry();
  let calls = 0;
  global.fetch = async () => { calls += 1; return new Response("", { status: 200 }); };
  assert.equal((await route.POST(request(body))).status, 200);
  for (const change of [{ message: "A different business priority to discuss." }, { email: "another@example.test" }, { organisation: "Other organisation" }]) {
    const conflict = await route.POST(request({ ...body, ...change }));
    assert.equal(conflict.status, 409);
    assert.match((await conflict.json()).message, /different details/);
  }
  assert.equal(calls, 1);
});

test("upstream failures return honest errors, retain the payload binding, and reuse the idempotency key on retry", async () => {
  const browser = cookie();
  const body = enquiry();
  const keys = [];
  global.fetch = async (_url, options) => {
    keys.push(options.headers["Idempotency-Key"]);
    return new Response("private provider detail", { status: 500 });
  };
  const response = await route.POST(request(body, {}, browser));
  assert.equal(response.status, 502);
  assert.ok(!(await response.text()).includes("private provider detail"));
  // Changing details after a failed attempt still requires a fresh submission ID.
  assert.equal((await route.POST(request({ ...body, name: "Another Visitor" }, {}, browser))).status, 409);
  global.fetch = async (_url, options) => {
    keys.push(options.headers["Idempotency-Key"]);
    throw new Error("secret network detail");
  };
  const failure = await route.POST(request(body, {}, browser));
  assert.equal(failure.status, 502);
  assert.ok(!(await failure.text()).includes("secret network detail"));
  global.fetch = async (_url, options) => {
    keys.push(options.headers["Idempotency-Key"]);
    return new Response("", { status: 200 });
  };
  assert.equal((await route.POST(request(body, {}, browser))).status, 200);
  assert.deepEqual(keys, [body.id, body.id, body.id]);
});

test("sender rate limits reject the sixth attempt and expire after their window", async () => {
  const browser = cookie();
  global.fetch = async () => new Response("", { status: 200 });
  for (let index = 0; index < 5; index++) assert.equal((await route.POST(request(valid, {}, browser))).status, 200);
  const limited = await route.POST(request(valid, {}, browser));
  assert.equal(limited.status, 429);
  assert.ok(Number(limited.headers.get("retry-after")) > 0);
  assert.equal(security.consumeRateLimit("expiry-test", 1, 100), 0);
  assert.ok(security.consumeRateLimit("expiry-test", 1, 101) > 0);
  assert.equal(security.consumeRateLimit("expiry-test", 1, 900_100), 0);
});

test("untrusted forwarding headers do not control the sender identity", () => {
  const challenge = security.verifyChallenge(security.createChallenge(secret), secret);
  const first = request(valid, { "X-Forwarded-For": "192.0.2.1" });
  const second = request(valid, { "X-Forwarded-For": "192.0.2.2" });
  assert.equal(security.rateLimitIdentity(first, challenge, secret), security.rateLimitIdentity(second, challenge, secret));
  process.env.CONTACT_RATE_LIMIT_IP_HEADER = "X-Trusted-Client-IP";
  assert.notEqual(security.rateLimitIdentity(request(valid, { "X-Trusted-Client-IP": "192.0.2.1" }), challenge, secret), security.rateLimitIdentity(request(valid, { "X-Trusted-Client-IP": "192.0.2.2" }), challenge, secret));
  delete process.env.CONTACT_RATE_LIMIT_IP_HEADER;
});



test("contact origins share canonical HTTPS normalization and production/preview domain fallbacks", () => {
  const keys = ["SITE_URL", "NEXT_PUBLIC_SITE_URL", "VERCEL_PROJECT_PRODUCTION_URL", "VERCEL_URL"];
  const before = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  const proxied = (origin) => new Request("http://internal-proxy.test/api/contact", { headers: { Origin: origin, "Sec-Fetch-Site": "same-origin" } });
  try {
    for (const key of keys) delete process.env[key];
    process.env.SITE_URL = "http://public.example";
    assert.equal(security.isSameOrigin(proxied("https://public.example"), true), true);
    assert.equal(security.isSameOrigin(proxied("http://public.example"), true), false);
    assert.equal(security.isSameOrigin(proxied("https://attacker.example"), true), false);
    delete process.env.SITE_URL;
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "production.example";
    process.env.VERCEL_URL = "preview.example";
    assert.equal(security.isSameOrigin(proxied("https://production.example"), true), true);
    assert.equal(security.isSameOrigin(proxied("https://preview.example"), true), true);
    process.env.SITE_URL = "https://public.example/not-an-origin";
    assert.equal(security.isSameOrigin(proxied("https://public.example"), true), false);
    assert.equal(security.isSameOrigin(proxied("http://internal-proxy.test"), true), false);
  } finally {
    for (const [key, value] of Object.entries(before)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
