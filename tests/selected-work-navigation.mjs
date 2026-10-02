import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium } from "playwright";

const base = process.env.TEST_BASE_URL || "http://localhost:5173";
const scenarios = [
  { name: "desktop light", width: 1440, theme: "light", motion: "no-preference" },
  { name: "desktop dark", width: 1440, theme: "dark", motion: "no-preference" },
  { name: "mobile reduced motion", width: 390, theme: "light", motion: "reduce" },
];
const results = [], errors = [];
let failure;
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ||
    (process.platform === "win32" ? "C:/Program Files/Google/Chrome/Application/chrome.exe" : undefined),
});

try {
  for (const scenario of scenarios) {
    const context = await browser.newContext({
      viewport: { width: scenario.width, height: 1000 },
      colorScheme: "light",
      reducedMotion: scenario.motion,
    });
    const page = await context.newPage();
    const checks = [];
    results.push({ scenario: scenario.name, checks });
    page.on("pageerror", error => errors.push({ scenario: scenario.name, message: error.message }));
    try {
      await page.goto(base, { waitUntil: "load" });
      await page.getByRole("button", { name: "Essential only", exact: true }).click();
      if (scenario.theme === "dark") {
        await page.getByRole("button", { name: "Switch to dark theme", exact: true }).click();
      }
      const timeOrigin = await page.evaluate(() => performance.timeOrigin);
      const verifyContinuity = async () => {
        assert.equal(await page.locator("html").getAttribute("data-theme"), scenario.theme,
          `${scenario.name}: internal navigation must preserve the selected theme`);
        assert.equal(await page.evaluate(() => performance.timeOrigin), timeOrigin,
          `${scenario.name}: internal navigation must not reload the document`);
      };
      const settleScroll = async () => page.evaluate(() => new Promise(resolve => {
        let previous = window.scrollY, stableFrames = 0, frames = 0;
        const sample = () => {
          const current = window.scrollY;
          stableFrames = Math.abs(current - previous) < .1 ? stableFrames + 1 : 0;
          previous = current;
          if (stableFrames >= 4 || ++frames >= 120) return resolve(current);
          requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
      }));
      const revealCard = async card => {
        await card.scrollIntoViewIfNeeded();
        const scrollY = await settleScroll();
        assert.ok(scrollY > 400, `${scenario.name}: card navigation must start deep in the page`);
        return scrollY;
      };
      const openCard = async (card, label) => {
        const href = await card.getAttribute("href");
        assert.ok(href, `${label}: card has a destination`);
        const pathname = new URL(href, base).pathname;
        assert.match(pathname, /^\/work\/[^/]+$/);
        await card.click();
        await page.waitForURL(url => url.pathname === pathname);
        await page.locator(`[data-engagement-detail="${pathname.split("/").pop()}"]`).waitFor();
        try {
          await page.waitForFunction(() => window.scrollY <= 1, undefined, { timeout: 6000 });
        } catch {
          assert.fail(`${scenario.name}: ${label} opened ${pathname} at scrollY=${await page.evaluate(() => window.scrollY)}, expected top`);
        }
        const scrollY = await settleScroll();
        assert.ok(scrollY <= 1, `${scenario.name}: ${label} must remain at top, got ${scrollY}`);
        await verifyContinuity();
        checks.push({ label, pathname, scrollY });
        return pathname;
      };
      const verifyRestored = async (pathname, expectedY, label) => {
        await page.waitForURL(url => url.pathname === pathname);
        if (pathname === "/") await page.locator("#selected-work .case-card").first().waitFor();
        else await page.locator(`[data-engagement-detail="${pathname.split("/").pop()}"]`).waitFor();
        try {
          await page.waitForFunction(y => Math.abs(window.scrollY - y) <= 48, expectedY, { timeout: 6000 });
        } catch {
          assert.fail(`${scenario.name}: ${label} restored scrollY=${await page.evaluate(() => window.scrollY)}, expected near ${expectedY}`);
        }
        const scrollY = await settleScroll();
        assert.ok(Math.abs(scrollY - expectedY) <= 48,
          `${scenario.name}: ${label} must preserve history position, got ${scrollY}, expected ${expectedY}`);
        await verifyContinuity();
        checks.push({ label, pathname, scrollY, expectedY });
      };

      assert.equal(await page.locator("#selected-work .case-card").count(), 4,
        "The homepage must expose all four selected-work cards");
      for (let index = 0; index < 4; index++) {
        const homeCard = page.locator("#selected-work .case-card").nth(index);
        const homeY = await revealCard(homeCard);
        const detailPath = await openCard(homeCard, `Homepage card ${index + 1}`);
        let detailY;
        if (index === 0) {
          const relatedCard = page.locator("[data-engagement-detail] .case-card").first();
          detailY = await revealCard(relatedCard);
          await openCard(relatedCard, "Related engagement card");
          await page.goBack();
          await verifyRestored(detailPath, detailY, "Back to previous engagement");
        }
        await page.goBack();
        await verifyRestored("/", homeY, `Back to homepage card ${index + 1}`);
        if (index === 0) {
          await page.goForward();
          await verifyRestored(detailPath, detailY, "Forward restores engagement reading position");
          await page.goBack();
          await verifyRestored("/", homeY, "Back restores homepage again");
        }
      }
    } finally {
      await context.close();
    }
  }
  assert.deepEqual(errors, [], "Navigation must not introduce browser errors");
} catch (error) {
  failure = error instanceof Error ? error.message : String(error);
  throw error;
} finally {
  fs.mkdirSync("reports", { recursive: true });
  fs.writeFileSync("reports/selected-work-navigation.json", JSON.stringify({ results, errors, ...(failure ? { failure } : {}) }, null, 2));
  console.log(JSON.stringify({ scenarios: results.length, checks: results.reduce((sum, result) => sum + result.checks.length, 0), errors, ...(failure ? { failure } : {}) }));
  await browser.close();
}
