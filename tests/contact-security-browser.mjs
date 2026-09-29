import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright';
import { mockTurnstile } from './helpers/turnstile.mjs';

// Run against a local server with TURNSTILE_SITE_KEY set. Every Cloudflare script
// and /api/contact request is intercepted; this suite sends no real enquiry.
const base = process.env.TEST_BASE_URL || 'http://localhost:5174';
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || (process.platform === 'win32' ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : undefined), headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, reducedMotion: 'reduce', colorScheme: 'light' });
const page = await context.newPage();
const errors = [], violations = [], submissions = [], layouts = [];
let result = 'failure';
page.on('pageerror', error => errors.push(error.message));
await page.addInitScript(() => {
  window.__cspFailures = [];
  document.addEventListener('securitypolicyviolation', event => window.__cspFailures.push({ directive: event.violatedDirective, blocked: event.blockedURI }));
});
const mock = await mockTurnstile(page, { failFirstLoad: true });
await page.route('**/api/contact', route => {
  if (route.request().method() === 'GET') return route.fulfill({ json: { readyAfterMs: 0 } });
  submissions.push(route.request().postDataJSON());
  if (result === 'failure') return route.fulfill({ status: 502, json: { message: 'Your enquiry could not be received. Please try again later.' } });
  return route.fulfill({ json: { message: 'Your enquiry has been received.' } });
});
async function completeCheck() {
  await page.getByRole('button', { name: 'Complete security check', exact: true }).click();
  await page.getByText('Security check complete.', { exact: true }).waitFor();
}
try {
  const response = await page.goto(base + '/contact', { waitUntil: 'load' });
  const csp = response.headers()['content-security-policy'];
  assert.ok(csp?.includes("'strict-dynamic'"), 'Test uses the real strict production CSP');
  assert.ok(!csp.match(/script-src[^;]*'unsafe-inline'/), 'Script policy rejects arbitrary inline scripts');
  assert.equal(await page.locator('#f-security').count(), 1, 'Start the local test server with TURNSTILE_SITE_KEY configured; the browser mocks all external checks.');
  await page.getByRole('button', { name: 'Essential only', exact: true }).click();
  await page.getByText('The security check could not load.', { exact: false }).waitFor();
  await page.locator('#f-name').fill('Security UI Test');
  await page.locator('#f-email').fill('visitor@example.test');
  await page.locator('#f-message').fill('A mocked enquiry used only to validate the local contact interface.');
  await page.locator('#f-consent').check();
  await page.getByRole('button', { name: 'Retry security check', exact: true }).click();
  await page.getByRole('button', { name: 'Complete security check', exact: true }).waitFor();
  assert.equal(mock.scriptRequests(), 2, 'Failed external load can be retried');
  assert.equal(await page.locator('#f-name').inputValue(), 'Security UI Test', 'Retry keeps entered data');
  assert.equal(await page.locator('script[data-woy-turnstile]').count(), 1, 'Only one successful script remains');
  const nonce = await page.locator('script[data-woy-turnstile]').evaluate(el => el.nonce);
  assert.ok(nonce && csp.includes(`'nonce-${nonce}'`), 'External script uses this document nonce');
  const send = page.getByRole('button', { name: 'Send enquiry', exact: true });
  await send.click();
  assert.equal(submissions.length, 0, 'No request without a security token');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'f-security');
  await completeCheck();
  await page.evaluate(() => window.__turnstileTest.expire());
  await page.getByText('Your security check has expired.', { exact: false }).waitFor();
  await send.click();
  assert.equal(submissions.length, 0, 'Expired tokens cannot submit');
  await page.getByRole('button', { name: 'Retry security check', exact: true }).click();
  await completeCheck();
  await send.click();
  await page.getByRole('alert').filter({ hasText: 'could not be received' }).waitFor();
  assert.equal(submissions.length, 1);
  const firstId = submissions[0].id;
  const firstToken = submissions[0].turnstileToken;
  assert.equal(await page.locator('#f-name').inputValue(), 'Security UI Test');
  await send.click();
  assert.equal(submissions.length, 1, 'Used token is cleared after failed delivery');
  await completeCheck();
  await send.click();
  await page.getByRole('alert').filter({ hasText: 'could not be received' }).waitFor();
  assert.equal(submissions[1].id, firstId, 'Unchanged retry preserves idempotency key');
  assert.notEqual(submissions[1].turnstileToken, firstToken, 'Retry uses a fresh single-use token');
  for (const mode of ['light', 'dark']) {
    if (await page.locator('html').getAttribute('data-theme') !== mode) await page.getByRole('button', { name: `Switch to ${mode} theme`, exact: true }).click();
    for (const width of [320, 390, 700, 768, 1080, 1440, 2560]) {
      await page.setViewportSize({ width, height: 1100 });
      await page.waitForTimeout(450);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, `No overflow at ${mode}/${width}`);
      const config = await page.evaluate(() => window.__turnstileTest.configs.at(-1));
      assert.equal(config.theme, mode);
      assert.equal(config.action, 'contact');
      assert.equal(config.responseField, false);
      const securityWidth = await page.locator('#f-security').evaluate(el => el.getBoundingClientRect().width);
      assert.equal(config.size, securityWidth < 300 ? 'compact' : 'flexible');
      layouts.push({ mode, width, size: config.size });
    }
  }
  await page.evaluate(() => window.__turnstileTest.fail());
  await page.getByRole('button', { name: 'Retry security check', exact: true }).click();
  await completeCheck();
  result = 'success';
  await send.click();
  await page.getByRole('status').filter({ hasText: 'Enquiry received' }).waitFor();
  assert.equal(await page.evaluate(() => window.__turnstileTest.active()), 0, 'Widget removed after success');
  await page.getByRole('button', { name: 'Send another enquiry', exact: true }).click();
  await page.getByRole('button', { name: 'Complete security check', exact: true }).waitFor();
  const loadsBeforeNavigation = mock.scriptRequests();
  await page.getByRole('navigation', { name: 'Main navigation', exact: true }).getByRole('link', { name: 'Home', exact: true }).click();
  await page.waitForURL(base + '/#top');
  await page.waitForFunction(() => window.__turnstileTest.active() === 0);
  assert.equal(await page.evaluate(() => window.__turnstileTest.active()), 0, 'Widget removed on route change');
  await page.getByRole('navigation', { name: 'Main navigation', exact: true }).getByRole('link', { name: /Let.*talk/ }).click();
  await page.waitForURL(base + '/contact#top');
  await page.getByRole('button', { name: 'Complete security check', exact: true }).waitFor();
  assert.equal(mock.scriptRequests(), loadsBeforeNavigation, 'Client navigation reuses the script');
  assert.equal(await page.evaluate(() => window.__turnstileTest.maxActive), 1, 'No duplicate widgets');
  violations.push(...await page.evaluate(() => window.__cspFailures));
  assert.deepEqual(violations, [], 'No CSP violations');
  assert.deepEqual(errors, [], 'No browser errors');
  fs.mkdirSync('reports', { recursive: true });
  fs.writeFileSync('reports/contact-security-browser.json', JSON.stringify({ submissions: submissions.length, layouts, violations, errors, scriptRequests: mock.scriptRequests() }, null, 2));
  console.log(JSON.stringify({ submissions: submissions.length, layouts: layouts.length, violations, errors, scriptRequests: mock.scriptRequests() }));
} finally { await browser.close(); }
