import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium } from "playwright";

const base = process.env.TEST_BASE_URL || "http://localhost:5173";
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ||
    (process.platform === "win32" ? "C:/Program Files/Google/Chrome/Application/chrome.exe" : undefined),
  headless: true,
});
const scenarios = [
  { name: "light on a dark device", system: "dark", chosen: "light", width: 1440, extended: true },
  { name: "dark on a light device", system: "light", chosen: "dark", width: 1440 },
  { name: "mobile light on a dark device", system: "dark", chosen: "light", width: 390 },
  { name: "unavailable browser storage", system: "dark", chosen: "light", width: 1440, blocked: true },
  { name: "consented theme memory", system: "dark", chosen: "light", width: 1440, remember: true },
];
const results = [], errors = [];

try {
  for (const scenario of scenarios) {
    const context = await browser.newContext({
      viewport: { width: scenario.width, height: 1000 },
      colorScheme: scenario.system,
      reducedMotion: "reduce",
    });
    if (scenario.blocked) {
      await context.addInitScript(() => {
        Object.defineProperty(window, "localStorage", {
          get() { throw new DOMException("Storage unavailable", "SecurityError"); },
        });
      });
    }
    const page = await context.newPage();
    page.on("pageerror", error => errors.push({ scenario: scenario.name, message: error.message }));
    await page.goto(base, { waitUntil: "load" });
    await page.getByRole("button", { name: "Essential only", exact: true }).click();
    if (scenario.remember) {
      await page.getByRole("button", { name: "Cookie preferences", exact: true }).click();
      await page.getByRole("checkbox", { name: "Remember my light or dark theme" }).check();
      await page.getByRole("button", { name: "Save preferences", exact: true }).click();
    }
    await page.getByRole("button", { name: `Switch to ${scenario.chosen} theme`, exact: true }).click();
    const timeOrigin = await page.evaluate(() => performance.timeOrigin);
    const visited = [];
    const verify = async () => {
      assert.equal(await page.locator("html").getAttribute("data-theme"), scenario.chosen, scenario.name);
      assert.equal(await page.evaluate(() => performance.timeOrigin), timeOrigin, "Internal navigation must not reload the document");
      if (!scenario.blocked) {
        assert.equal(await page.evaluate(() => localStorage.getItem("woy-theme")), scenario.remember ? scenario.chosen : null);
      }
      visited.push(new URL(page.url()).pathname + new URL(page.url()).hash);
    };
    const navigate = async label => {
      const mobile = scenario.width <= 850;
      if (mobile) await page.getByRole("button", { name: "Open navigation menu", exact: true }).click();
      const navigation = page.getByRole("navigation", { name: mobile ? "Mobile navigation" : "Main navigation", exact: true });
      await navigation.getByRole("link", { name: label, exact: true }).click();
    };

    await page.locator("#selected-work").getByRole("link", { name: "View all selected work", exact: true }).click();
    await page.waitForURL(base + "/work");
    await page.locator(".work-library .case-card").first().waitFor();
    await verify();
    await page.getByRole("link", { name: "Our collective experience", exact: true }).click();
    await page.waitForURL(base + "/work#collective-experience");
    await verify();
    await page.goBack();
    await page.waitForURL(base + "/work");
    await verify();

    if (scenario.extended) {
      await page.locator(".work-library .case-card").first().focus();
      await page.keyboard.press("Enter");
      await page.waitForURL(base + "/case-studies/education-institution-transformation");
      await verify();
      await page.goBack();
      await page.waitForURL(base + "/work");
      await verify();
      await navigate("Home");
      await page.waitForURL(base + "/");
      await page.locator("#selected-work .case-card").nth(1).click();
      await page.waitForURL(base + "/case-studies/insurance-senior-sales-leadership");
      await verify();
      await navigate("Leadership & Partners");
      await page.waitForURL(base + "/people");
      await page.locator(".person-card").first().click();
      await page.waitForURL(base + "/practitioners#vipin-tuteja");
      await verify();
    }

    await navigate("Home");
    await page.waitForURL(base + "/");
    await page.locator("#selected-work").waitFor();
    await verify();
    await navigate(scenario.width <= 850 ? "Let’s talk ↗" : "Let’s talk");
    await page.waitForURL(base + "/contact");
    await page.getByRole("button", { name: "Send enquiry", exact: true }).waitFor();
    await verify();
    await page.reload({ waitUntil: "load" });
    assert.equal(await page.locator("html").getAttribute("data-theme"), scenario.remember ? scenario.chosen : scenario.system,
      "Theme persistence across reload remains subject to preference consent");
    results.push({ scenario: scenario.name, visited, reloadTheme: await page.locator("html").getAttribute("data-theme") });
    await context.close();
  }
  assert.deepEqual(errors, []);
  fs.mkdirSync("reports", { recursive: true });
  fs.writeFileSync("reports/theme-navigation.json", JSON.stringify({ results, errors }, null, 2));
  console.log(JSON.stringify({ scenarios: results.length, navigations: results.reduce((sum, result) => sum + result.visited.length, 0), errors }));
} finally {
  await browser.close();
}
