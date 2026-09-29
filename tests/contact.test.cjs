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
for (const file of ["lib/contact-validation.ts", ...fs.readdirSync(path.join(root, "lib/server")).filter(file => file.endsWith(".ts")).map(file => `lib/server/${file}`), "app/api/contact/route.ts"]) {
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
const storeModule = require(path.join(output, "lib/server/contact-store.js"));
const originalFetch = global.fetch;
const originals = Object.fromEntries(["RESEND_API_KEY", "CONTACT_FROM_EMAIL", "CONTACT_TO_EMAIL", "CONTACT_FORM_SECRET", "CONTACT_RATE_LIMIT_IP_HEADER", "NODE_ENV", "SITE_URL", "VERCEL", "VERCEL_ENV", "UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN", "TURNSTILE_SITE_KEY", "TURNSTILE_SECRET_KEY"].map((key) => [key, process.env[key]]));
const secret = "test-secret-".repeat(5);
process.env.NODE_ENV = "production";
process.env.SITE_URL = "https://woy.test";
process.env.CONTACT_FORM_SECRET = secret;
process.env.RESEND_API_KEY = "re_testOnlyKey";
process.env.CONTACT_FROM_EMAIL = "enquiries@woy.test";
process.env.CONTACT_TO_EMAIL = "team@woy.test";
delete process.env.CONTACT_RATE_LIMIT_IP_HEADER;
process.env.VERCEL = "1";
process.env.VERCEL_ENV = "production";
process.env.UPSTASH_REDIS_REST_URL = "https://security-test.upstash.io";
process.env.UPSTASH_REDIS_REST_TOKEN = "isolated-redis-token";
process.env.TURNSTILE_SITE_KEY = "isolated-widget-key";
process.env.TURNSTILE_SECRET_KEY = "isolated-turnstile-secret";
const redis = new Map();
const usedTokens = new Set();
let redisNow = Date.now(), ipSequence = 1;
let deliveryFetch, verifyFetch, redisFailure = false;
const events = [];
const originalInfo = console.info;
console.info = value => events.push(JSON.parse(value));
function nextIp() { const n = ipSequence++; return `198.18.${Math.floor(n / 250)}.${n % 250 + 1}`; }
// In-memory provider emulator: every EVAL executes synchronously as a single
// transaction, shared by all independently constructed application store clients.
function mockRedis(options) {
  assert.equal(options.redirect, "error");
  assert.equal(options.cache, "no-store");
  assert.ok(options.signal instanceof AbortSignal);
  assert.equal(options.headers.Authorization, "Bearer isolated-redis-token");
  const [command, script, count, key, ...args] = JSON.parse(options.body);
  assert.equal(command, "EVAL"); assert.equal(count, "1");
  assert.match(key, /^woy:contact:v1:production:/);
  let row = redis.get(key);
  if (row && row.expires <= redisNow) { redis.delete(key); row = undefined; }
  let result;
  if (script.startsWith("-- woy-contact-rate-v1")) {
    assert.match(script, /redis.call\('INCR'/);
    if (row && row.count >= Number(args[0])) result = Math.max(1, Math.ceil((row.expires - redisNow) / 1000));
    else { redis.set(key, { count: (row?.count || 0) + 1, expires: row?.expires || redisNow + Number(args[1]) }); result = 0; }
  } else if (script.startsWith("-- woy-contact-begin-v1")) {
    assert.match(script, /redis.call\('TIME'/);
    if (row && row.payload !== args[0]) result = "conflict";
    else if (row?.state === "sent") result = "sent";
    else if (row?.state === "pending" && row.leaseUntil > redisNow) result = "pending";
    else { redis.set(key, { payload: args[0], state: "pending", owner: args[1], leaseUntil: redisNow + Number(args[2]), expires: redisNow + Number(args[3]) }); result = "new"; }
  } else if (script.startsWith("-- woy-contact-finish-v1")) {
    if (row?.owner === args[0] && row?.state === "pending") { row.state = args[1]; row.expires = redisNow + Number(args[2]); result = 1; }
    else result = 0;
  } else throw new Error("Unknown Redis script");
  return Response.json({ result });
}
global.fetch = async (url, options) => {
  if (String(url) === "https://security-test.upstash.io/") {
    if (redisFailure) throw new Error("Private Redis failure detail");
    return mockRedis(options);
  }
  if (String(url) === "https://challenges.cloudflare.com/turnstile/v0/siteverify") return verifyFetch(url, options);
  if (String(url) === "https://api.resend.com/emails") return deliveryFetch(url, options);
  throw new Error("Unmocked network access is forbidden");
};
test.beforeEach(() => {
  redis.clear(); usedTokens.clear(); events.length = 0; redisFailure = false; redisNow = Date.now();
  deliveryFetch = async () => { throw new Error("Unmocked delivery is forbidden"); };
  verifyFetch = async (_url, options) => {
    assert.equal(options.redirect, "error");
    assert.equal(options.body.get("secret"), "isolated-turnstile-secret");
    assert.ok(options.signal instanceof AbortSignal);
    const token = options.body.get("response");
    if (usedTokens.has(token)) return Response.json({ success: false, "error-codes": ["timeout-or-duplicate"] });
    usedTokens.add(token);
    return Response.json({ success: true, action: "contact", hostname: "woy.test", challenge_ts: new Date().toISOString() });
  };
});

test.after(() => {
  global.fetch = originalFetch;
  console.info = originalInfo;
  for (const [key, value] of Object.entries(originals)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  const resolved = path.resolve(output);
  if (path.dirname(resolved) === path.resolve(os.tmpdir()) && path.basename(resolved).startsWith("woy-contact-tests-")) {
    fs.rmSync(resolved, { recursive: true, force: true });
  }
});

function acceptedDelivery(status = 200) {
  return Response.json({ id: "b7e5bc7e-8d08-4dde-ae1e-8cd2ba3dca01" }, { status });
}

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
    headers: { Origin: "https://woy.test", "Content-Type": "application/json", Cookie: customCookie, "x-vercel-forwarded-for": nextIp(), ...headers },
    body: typeof body === "string" ? body : JSON.stringify(Array.isArray(body) ? body : { id: randomUUID(), turnstileToken: randomUUID(), ...body }),
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
  const response = await route.GET(new Request("https://woy.test/api/contact", { headers: { "x-vercel-forwarded-for": nextIp() } }));
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

test("form fails closed when Resend credentials or fixed sender/recipient configuration are missing or invalid", async () => {
  const invalid = {
    RESEND_API_KEY: ["", "invalid", "re_key\r\nInjected", "re_" + "x".repeat(254)],
    CONTACT_FROM_EMAIL: ["", "bad@", "WOY <enquiries@woy.test>", "enquiries@woy.test\r\nBcc: attacker@test.example", '"enquiries"@woy.test'],
    CONTACT_TO_EMAIL: ["", "bad@", "team@woy.test,attacker@test.example", "team@woy.test\nBcc: attacker@test.example", "team;second@woy.test"],
    CONTACT_FORM_SECRET: [""],
  };
  for (const [key, values] of Object.entries(invalid)) {
    const before = process.env[key];
    try {
      for (const value of values) {
        process.env[key] = value;
        assert.equal((await route.GET(new Request("https://woy.test/api/contact"))).status, 503, key);
        assert.equal((await route.POST(request())).status, 503, key);
      }
      delete process.env[key];
      assert.equal((await route.POST(request())).status, 503, key);
    } finally { process.env[key] = before; }
  }
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
  deliveryFetch = async () => { throw new Error("Invalid metadata must not reach delivery"); };
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

test("successful Resend delivery uses fixed mailboxes, normalized content, consent metadata and server-only authentication", async () => {
  const browser = cookie();
  const body = enquiry({ name: "  Test Visitor  ", email: "  visitor@example.test  ", organisation: "  Test Organisation  " });
  let calls = 0;
  deliveryFetch = async (url, options) => {
    calls += 1;
    assert.equal(String(url), "https://api.resend.com/emails");
    assert.equal(options.method, "POST");
    assert.equal(options.headers.Authorization, "Bearer re_testOnlyKey");
    assert.equal(options.headers["Idempotency-Key"], `contact/${body.id}`);
    assert.equal(options.headers["Content-Type"], "application/json");
    assert.equal(options.headers.Accept, "application/json");
    assert.equal(options.redirect, "error");
    assert.equal(options.cache, "no-store");
    assert.ok(options.signal instanceof AbortSignal);
    assert.deepEqual(JSON.parse(options.body), {
      from: "WOY Consulting <enquiries@woy.test>", to: ["team@woy.test"], reply_to: valid.email,
      subject: "New website enquiry | WOY Consulting",
      text: ["New website enquiry", "", `Name: ${valid.name}`, `Email: ${valid.email}`,
        `Organisation: ${valid.organisation}`, "", "Message:", valid.message, "",
        `Enquiry ID: ${body.id}`, "Consent to be contacted: Yes",
        `Privacy notice version: ${validation.PRIVACY_NOTICE_VERSION}`].join("\n"),
    });
    return acceptedDelivery(202);
  };
  const first = await route.POST(request(body, {}, browser));
  assert.equal(first.status, 200);
  const acknowledgement = await first.json();
  assert.equal(acknowledgement.message, "Your enquiry has been received by WOY Consulting.");
  assert.ok(!JSON.stringify(acknowledgement).includes("re_testOnlyKey"));
  assert.ok(!JSON.stringify(acknowledgement).includes("b7e5bc7e-8d08-4dde-ae1e-8cd2ba3dca01"));
  assert.equal((await route.POST(request(body, {}, browser))).status, 200);
  // An unchanged retry keeps its UUID even when the signed browser session changes.
  assert.equal((await route.POST(request(body))).status, 200);
  assert.equal(calls, 1);
});

test("visitor content cannot override fixed email recipients or become HTML or headers", async () => {
  const body = enquiry({
    name: "Reply-To: Different Visitor", email: "visitor+reply@example.test",
    message: "<script>alert('content')</script>\nBcc: attacker@example.test\nPlease discuss our priorities.",
  });
  deliveryFetch = async (_url, options) => {
    const email = JSON.parse(options.body);
    assert.equal(email.from, "WOY Consulting <enquiries@woy.test>");
    assert.deepEqual(email.to, ["team@woy.test"]);
    assert.equal(email.reply_to, body.email);
    assert.equal(email.subject, "New website enquiry | WOY Consulting");
    assert.equal(email.html, undefined);
    assert.equal(email.bcc, undefined);
    assert.equal(email.cc, undefined);
    assert.ok(email.text.includes(body.message));
    return acceptedDelivery();
  };
  assert.equal((await route.POST(request(body))).status, 200);
  for (const field of ["from", "to", "reply_to", "bcc", "subject"]) {
    assert.equal((await route.POST(request(enquiry({ [field]: "attacker@example.test" })))).status, 400);
  }
});

test("maximum-length Unicode messages are accepted within the bounded JSON body", async () => {
  const body = enquiry({ message: "\u0905".repeat(4000), organisation: "" });
  deliveryFetch = async (_url, options) => {
    const email = JSON.parse(options.body);
    assert.ok(email.text.includes(`Message:\n${body.message}`));
    assert.ok(email.text.includes("Organisation: Not provided"));
    return acceptedDelivery();
  };
  assert.ok(Buffer.byteLength(JSON.stringify(body)) > 4096);
  assert.equal((await route.POST(request(body))).status, 200);
});

test("Resend must acknowledge with a valid message ID before the form reports success", async () => {
  const failures = [
    () => new Response("", { status: 202 }),
    () => new Response("not valid JSON", { status: 200 }),
    () => Response.json({}),
    () => Response.json({ id: "not-a-message-uuid", privateDetail: "private provider detail" }),
    () => Response.json({ error: { message: "private provider detail" } }),
    () => Response.json(null),
    () => Response.json({ id: "b7e5bc7e-8d08-4dde-ae1e-8cd2ba3dca01" }, { status: 429 }),
  ];
  for (const response of failures) {
    const body = enquiry();
    deliveryFetch = async () => response();
    const result = await route.POST(request(body));
    assert.equal(result.status, 502);
    const visible = await result.text();
    assert.ok(!visible.includes("private provider detail"));
    assert.ok(!visible.includes("re_testOnlyKey"));
    deliveryFetch = async () => acceptedDelivery();
    assert.equal((await route.POST(request(body))).status, 200, "a failed acknowledgement must not mark the enquiry sent");
  }
  assert.ok(!JSON.stringify(events).includes("private provider detail"));
  assert.ok(!JSON.stringify(events).includes("re_testOnlyKey"));
});

test("concurrent duplicate requests are blocked while delivery is pending", async () => {
  const browser = cookie();
  const body = enquiry();
  let calls = 0;
  let started;
  let finish;
  const entered = new Promise((resolve) => { started = resolve; });
  deliveryFetch = () => { calls += 1; started(); return new Promise((resolve) => { finish = resolve; }); };
  const first = route.POST(request(body, {}, browser));
  await entered;
  assert.equal((await route.POST(request(body, {}, browser))).status, 409);
  finish(acceptedDelivery());
  assert.equal((await first).status, 200);
  assert.equal(calls, 1);
});

test("reusing an acknowledged UUID with altered details rejects rather than falsely acknowledging or resending", async () => {
  const body = enquiry();
  let calls = 0;
  deliveryFetch = async () => { calls += 1; return acceptedDelivery(); };
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
  const keys = [], payloads = [];
  deliveryFetch = async (_url, options) => {
    payloads.push(options.body);
    keys.push(options.headers["Idempotency-Key"]);
    return new Response("private provider detail", { status: 500 });
  };
  const response = await route.POST(request(body, {}, browser));
  assert.equal(response.status, 502);
  assert.ok(!(await response.text()).includes("private provider detail"));
  // Changing details after a failed attempt still requires a fresh submission ID.
  assert.equal((await route.POST(request({ ...body, name: "Another Visitor" }, {}, browser))).status, 409);
  deliveryFetch = async (_url, options) => {
    payloads.push(options.body);
    keys.push(options.headers["Idempotency-Key"]);
    throw new Error("secret network detail");
  };
  const failure = await route.POST(request(body, {}, browser));
  assert.equal(failure.status, 502);
  assert.ok(!(await failure.text()).includes("secret network detail"));
  deliveryFetch = async (_url, options) => {
    payloads.push(options.body);
    keys.push(options.headers["Idempotency-Key"]);
    return acceptedDelivery();
  };
  assert.equal((await route.POST(request(body, {}, browser))).status, 200);
  assert.deepEqual(keys, [body.id, body.id, body.id].map(id => `contact/${id}`));
  assert.equal(new Set(payloads).size, 1, "Resend retries must reuse byte-for-byte identical content");
});

test("request cancellation and the delivery deadline release the lease while keeping Resend retries idempotent", async () => {
  const originalTimeout = AbortSignal.timeout;
  const keepAlive = setTimeout(() => {}, 500);
  try {
    for (const mode of ["request", "deadline"]) {
      const body = enquiry();
      const controller = new AbortController();
      const keys = [], payloads = [], timeoutDurations = [];
      AbortSignal.timeout = milliseconds => {
        timeoutDurations.push(milliseconds);
        return originalTimeout(milliseconds === 15_000 && mode === "deadline" ? 10 : milliseconds);
      };
      deliveryFetch = (_url, options) => {
        keys.push(options.headers["Idempotency-Key"]);
        payloads.push(options.body);
        if (mode === "request") queueMicrotask(() => controller.abort());
        return new Promise((_resolve, reject) => {
          if (options.signal.aborted) reject(options.signal.reason);
          else options.signal.addEventListener("abort", () => reject(options.signal.reason), { once: true });
        });
      };
      const failed = await route.POST(new Request(request(body), { signal: controller.signal }));
      assert.equal(failed.status, 502);
      assert.match((await failed.json()).message, /could not confirm delivery/);
      assert.ok(timeoutDurations.includes(15_000), "provider calls have a 15-second deadline");
      deliveryFetch = async (_url, options) => {
        keys.push(options.headers["Idempotency-Key"]);
        payloads.push(options.body);
        return acceptedDelivery();
      };
      assert.equal((await route.POST(request(body))).status, 200);
      assert.deepEqual(keys, [body.id, body.id].map(id => `contact/${id}`));
      assert.equal(new Set(payloads).size, 1);
    }
  } finally {
    AbortSignal.timeout = originalTimeout;
    clearTimeout(keepAlive);
  }
});

test("case-insensitive enquiry IDs produce one canonical Resend idempotency key", async () => {
  const body = enquiry({ id: randomUUID().toUpperCase() });
  let delivered = 0;
  deliveryFetch = async (_url, options) => {
    delivered++;
    assert.equal(options.headers["Idempotency-Key"], `contact/${body.id.toLowerCase()}`);
    assert.ok(JSON.parse(options.body).text.includes(`Enquiry ID: ${body.id.toLowerCase()}`));
    return acceptedDelivery();
  };
  assert.equal((await route.POST(request(body))).status, 200);
  assert.equal((await route.POST(request({ ...body, id: body.id.toLowerCase() }))).status, 200);
  assert.equal(delivered, 1);
});

test("sender rate limits reject the sixth attempt and expire after their window", async () => {
  const browser = cookie();
  deliveryFetch = async () => acceptedDelivery();
  const headers = { "x-vercel-forwarded-for": nextIp() };
  for (let index = 0; index < 5; index++) assert.equal((await route.POST(request(valid, headers, browser))).status, 200);
  const limited = await route.POST(request(valid, headers, browser));
  assert.equal(limited.status, 429);
  assert.ok(Number(limited.headers.get("retry-after")) > 0);
  assert.equal(await storeModule.getContactStore().consumeRateLimit("expiry-test", 1), 0);
  assert.ok(await storeModule.getContactStore().consumeRateLimit("expiry-test", 1) > 0);
  redisNow += 900_001;
  assert.equal(await storeModule.getContactStore().consumeRateLimit("expiry-test", 1), 0);
});

test("only Vercel platform identity is trusted and IPv6 privacy addresses share their subnet budget", () => {
  const headers = { "x-vercel-forwarded-for": "2001:db8:abcd:12::1", "X-Forwarded-For": "192.0.2.1" };
  const first = security.rateLimitIdentity(request(valid, headers), secret);
  assert.equal(first, security.rateLimitIdentity(request(valid, { ...headers, "X-Forwarded-For": "192.0.2.2", "x-vercel-forwarded-for": "2001:0db8:abcd:0012::999" }), secret));
  assert.notEqual(first, security.rateLimitIdentity(request(valid, { "x-vercel-forwarded-for": "2001:db8:abcd:13::1" }), secret));
  assert.equal(security.normaliseRateLimitIp("::ffff:192.0.2.1"), security.normaliseRateLimitIp("192.0.2.1"));
  for (const bad of ["", "192.0.2.1, 192.0.2.2", "unknown", "192.0.2.1:123", "2001:db8::1%eth0"]) assert.equal(security.rateLimitIdentity(request(valid, { "x-vercel-forwarded-for": bad }), secret), null);
  delete process.env.VERCEL;
  assert.equal(security.rateLimitIdentity(request(valid, headers), secret), null);
  process.env.VERCEL = "1";
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


test("production requires shared store, bot credentials and a trustworthy platform identity", async () => {
  for (const key of ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN", "TURNSTILE_SITE_KEY", "TURNSTILE_SECRET_KEY", "VERCEL"]) {
    const before = process.env[key]; delete process.env[key];
    assert.equal((await route.POST(request())).status, 503, key);
    process.env[key] = before;
  }
  assert.equal((await route.POST(request(enquiry(), { "x-vercel-forwarded-for": "invalid" }))).status, 503);
  const original = process.env.UPSTASH_REDIS_REST_URL;
  for (const url of ["http://security-test.upstash.io", "https://user:pass@security-test.upstash.io", "https://attacker.test", "https://security-test.upstash.io/extra"]) {
    process.env.UPSTASH_REDIS_REST_URL = url;
    assert.equal(storeModule.getContactStore(), null);
  }
  process.env.UPSTASH_REDIS_REST_URL = original;
});

test("new signed cookies do not reset sender limits and GET issuance is independently limited", async () => {
  deliveryFetch = async () => acceptedDelivery(202);
  const headers = { "x-vercel-forwarded-for": nextIp() };
  for (let index = 0; index < 5; index++) assert.equal((await route.POST(request(enquiry(), headers, cookie()))).status, 200);
  assert.equal((await route.POST(request(enquiry(), headers, cookie()))).status, 429);
  for (let index = 0; index < 20; index++) assert.equal((await route.GET(new Request("https://woy.test/api/contact", { headers }))).status, 200);
  const capped = await route.GET(new Request("https://woy.test/api/contact", { headers }));
  assert.equal(capped.status, 429); assert.ok(Number(capped.headers.get("retry-after")) > 0);
});

test("independent store clients share atomic budgets, delivery leases and durable payload bindings", async () => {
  const first = storeModule.getContactStore(), second = storeModule.getContactStore();
  const results = await Promise.all(Array.from({ length: 12 }, (_, index) => (index % 2 ? first : second).consumeRateLimit("shared-budget", 5)));
  assert.equal(results.filter(value => value === 0).length, 5);
  const claims = await Promise.all([first.beginDelivery("shared-id", "payload-a"), second.beginDelivery("shared-id", "payload-a")]);
  assert.equal(claims.filter(value => value.state === "new").length, 1);
  assert.equal(claims.filter(value => value.state === "pending").length, 1);
  const oldLease = claims.find(value => value.state === "new").lease;
  redisNow += storeModule.DELIVERY_LEASE_MS + 1;
  assert.equal((await second.beginDelivery("shared-id", "payload-b")).state, "conflict");
  const replacement = await second.beginDelivery("shared-id", "payload-a");
  assert.equal(replacement.state, "new");
  await first.finishDelivery("shared-id", oldLease, true);
  assert.equal((await first.beginDelivery("shared-id", "payload-a")).state, "pending", "stale lease cannot mark the replacement sent");
  await second.finishDelivery("shared-id", replacement.lease, true);
  assert.equal((await first.beginDelivery("shared-id", "payload-a")).state, "sent");
  redisNow += 60 * 60 * 1000;
  assert.equal((await first.beginDelivery("shared-id", "payload-b")).state, "conflict", "binding survives original 15-minute window");
});

test("Turnstile rejects missing, forged, reused, expired and wrong-action/hostname tokens", async () => {
  let delivered = 0;
  deliveryFetch = async () => { delivered++; return acceptedDelivery(); };
  for (const token of [undefined, "", 42, "x".repeat(2049)]) assert.equal((await route.POST(request(enquiry({ turnstileToken: token })))).status, 422);
  const body = enquiry({ turnstileToken: "single-use-test-token" });
  assert.equal((await route.POST(request(body))).status, 200);
  assert.equal((await route.POST(request(body))).status, 422);
  const good = { success: true, action: "contact", hostname: "woy.test", challenge_ts: new Date().toISOString() };
  for (const result of [{ success: false }, { ...good, action: "login" }, { ...good, hostname: "attacker.test" }, { ...good, challenge_ts: new Date(Date.now() - 301000).toISOString() }, { ...good, challenge_ts: new Date(Date.now() + 60000).toISOString() }]) {
    verifyFetch = async () => Response.json(result);
    assert.equal((await route.POST(request())).status, 422);
  }
  assert.equal(delivered, 1);
});

test("Turnstile or Redis outages fail closed and error events contain no submitted values or provider secrets", async () => {
  let delivered = 0;
  deliveryFetch = async () => { delivered++; return acceptedDelivery(); };
  verifyFetch = async () => { throw new Error("Private Turnstile detail"); };
  assert.equal((await route.POST(request())).status, 503);
  redisFailure = true;
  const response = await route.POST(request());
  assert.equal(response.status, 503);
  assert.equal(delivered, 0);
  assert.match(response.headers.get("x-request-id"), /^[0-9a-f-]{36}$/);
  for (const event of events) {
    assert.deepEqual(Object.keys(event).sort(), ["durationMs", "event", "requestId", "status"]);
    assert.match(event.event, /^contact\.[a-z_]+$/);
  }
  assert.ok(!JSON.stringify(events).includes("visitor@example.test"));
  assert.ok(!JSON.stringify(events).includes("Private"));
  assert.ok(!JSON.stringify(events).includes("isolated-"));
});

test("incoming body deadline and request abort cancel a stalled stream", async () => {
  for (const mode of ["deadline", "abort"]) {
    let cancelled = false;
    const controller = new AbortController();
    const body = new ReadableStream({ start(stream) { stream.enqueue(new TextEncoder().encode("{")); }, cancel() { cancelled = true; } });
    const incoming = new Request("https://woy.test/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body, duplex: "half", signal: controller.signal });
    const result = security.readContactBody(incoming, 20);
    if (mode === "abort") controller.abort();
    await assert.rejects(result, error => error instanceof security.ContactBodyError && error.status === 408);
    assert.equal(cancelled, true);
  }
});


test("ambiguous completion retains the upstream idempotency key after a shared-store outage", async () => {
  const accepted = new Set(), keys = [];
  const body = enquiry();
  deliveryFetch = async (_url, options) => {
    keys.push(options.headers["Idempotency-Key"]);
    accepted.add(options.headers["Idempotency-Key"]);
    redisFailure = true;
    return acceptedDelivery(202);
  };
  const uncertain = await route.POST(request(body));
  assert.equal(uncertain.status, 503);
  assert.match((await uncertain.json()).message, /could not confirm delivery/);
  redisFailure = false;
  assert.equal((await route.POST(request(body))).status, 409, "lease prevents immediate duplicate transmission");
  redisNow += storeModule.DELIVERY_LEASE_MS + 1;
  deliveryFetch = async (_url, options) => {
    keys.push(options.headers["Idempotency-Key"]);
    accepted.add(options.headers["Idempotency-Key"]);
    return acceptedDelivery(202);
  };
  assert.equal((await route.POST(request(body))).status, 200);
  assert.deepEqual(keys, [body.id, body.id].map(id => `contact/${id}`));
  assert.equal(accepted.size, 1, "provider can suppress the ambiguous retry using the unchanged key");
});

test("global delivery budget is a shared backstop across different stable sender identities", async () => {
  let delivered = 0;
  deliveryFetch = async () => { delivered++; return acceptedDelivery(202); };
  for (let index = 0; index < 100; index++) assert.equal((await route.POST(request())).status, 200);
  const response = await route.POST(request());
  assert.equal(response.status, 429);
  assert.match((await response.json()).message, /busy/);
  assert.equal(delivered, 100);
});

test("bounded process memory is available only in nonproduction with no partial Redis configuration", async () => {
  const before = Object.fromEntries(["NODE_ENV", "UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"].map(key => [key, process.env[key]]));
  try {
    process.env.NODE_ENV = "development";
    delete process.env.UPSTASH_REDIS_REST_URL; delete process.env.UPSTASH_REDIS_REST_TOKEN;
    const store = storeModule.getContactStore(); assert.ok(store);
    assert.equal(await store.consumeRateLimit("development-test", 1), 0);
    assert.ok(await store.consumeRateLimit("development-test", 1) > 0);
    process.env.UPSTASH_REDIS_REST_TOKEN = "partial-test-config";
    assert.equal(storeModule.getContactStore(), null);
  } finally { for (const [key, value] of Object.entries(before)) process.env[key] = value; }
});
