import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium } from "playwright";
import { mockTurnstile } from "./helpers/turnstile.mjs";

const base = process.env.TEST_BASE_URL || "http://localhost:5173";
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ||
    (process.platform === "win32" ? "C:/Program Files/Google/Chrome/Application/chrome.exe" : undefined),
  headless: true,
});
const report = { pages: [], injectionBlocked: false, errors: [] };
try {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  await context.addInitScript(() => {
    window.securityViolations = [];
    document.addEventListener("securitypolicyviolation", event => {
      window.securityViolations.push({ directive: event.effectiveDirective, blocked: event.blockedURI });
    });
  });
  const page = await context.newPage();
  await mockTurnstile(page);
  page.on("pageerror", error => report.errors.push(error.message));
  const nonces = new Set();
  for (const route of ["/", "/approach", "/contact", "/case-studies", "/practitioners", "/privacy-policy", "/missing-security-check", "/robots.txt-extra", "/api/not-a-route"]) {
    const response = await page.goto(base + route, { waitUntil: "networkidle" });
    assert.equal(response.status(), ["/missing-security-check", "/robots.txt-extra", "/api/not-a-route"].includes(route) ? 404 : 200, route);
    const headers = response.headers();
    const policy = headers["content-security-policy"];
    const nonce = policy.match(/'nonce-([^']+)'/)?.[1];
    assert.ok(nonce && !nonces.has(nonce), "A fresh nonce is generated for every page response");
    nonces.add(nonce);
    assert.doesNotMatch(policy.split(";").find(rule => rule.trim().startsWith("script-src ")), /unsafe-inline|unsafe-eval/);
    assert.match(headers["cache-control"], /no-store/, "Nonce-bearing HTML must not be cached");
    const scripts = await page.locator("script").evaluateAll(elements => elements.map(element => ({ src: element.src, type: element.type, nonce: element.nonce })));
    assert.ok(scripts.length > 0);
    assert.ok(scripts.every(script => script.nonce === nonce), `All server and framework scripts have the response nonce: ${route}`);
    assert.deepEqual(await page.evaluate(() => window.securityViolations), [], `No legitimate script is blocked: ${route}`);
    assert.equal(await page.locator("html").getAttribute("data-theme"), "light");
    report.pages.push({ route, status: response.status(), scripts: scripts.length });
  }
  // Inject into the HTML response, not through CDP evaluation (which is privileged).
  const probe = base + "/?security-probe=1";
  await page.route(probe, async route => {
    const response = await route.fetch();
    const html = await response.text();
    await route.fulfill({ response, body: html.replace("</body>", '<script>window.untrustedInlineExecuted=true</script><button id="untrusted-handler-probe" onclick="window.untrustedHandlerExecuted=true">Security probe</button></body>') });
  });
  await page.goto(probe, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Essential only", exact: true }).click();
  await page.locator("#untrusted-handler-probe").click();
  await page.waitForFunction(() => window.securityViolations.length >= 2);
  assert.equal(await page.evaluate(() => Boolean(window.untrustedInlineExecuted || window.untrustedHandlerExecuted)), false);
  report.injectionBlocked = true;
  // Caller-controlled nonce headers must be replaced, including on prefetch requests.
  const response = await context.request.get(base, { headers: { "x-nonce": "attacker-controlled", "content-security-policy": "script-src * 'unsafe-inline'", "next-router-prefetch": "1" } });
  assert.doesNotMatch(response.headers()["content-security-policy"].split(";").find(rule => rule.trim().startsWith("script-src ")), /attacker-controlled|unsafe-inline/);
  assert.match(response.headers()["content-security-policy"], /'nonce-[^']+'/);
  const api = await context.request.get(base + "/api/contact", { headers: { origin: "https://untrusted.example", "sec-fetch-site": "cross-site" } });
  assert.equal(api.status(), 403);
  assert.match(api.headers()["content-security-policy"], /default-src 'none'/);
  assert.deepEqual(report.errors, []);
  await context.close();
  console.log(`Security browser checks passed for ${report.pages.length} routes; inline injection and handler execution blocked.`);
} finally {
  fs.mkdirSync("reports", { recursive: true });
  fs.writeFileSync("reports/security-browser.json", JSON.stringify(report, null, 2));
  await browser.close();
}
