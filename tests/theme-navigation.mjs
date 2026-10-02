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
  { name: "dark on a light device", system: "light", chosen: "dark", width: 1440, extended: true },
  { name: "mobile light on a dark device", system: "dark", chosen: "light", width: 390, extended: true },
  { name: "unavailable browser storage", system: "dark", chosen: "light", width: 1440, blocked: true },
  { name: "consented light theme memory", system: "dark", chosen: "light", width: 1440, remember: true },
  { name: "consented dark theme memory", system: "dark", chosen: "dark", width: 1440, remember: true },
];
const bootstrapScenarios = [
  { name: "fresh visit on a dark device", expected: "light" },
  { name: "remembered dark theme", consent: true, theme: "dark", expected: "dark" },
  { name: "remembered light theme", consent: true, theme: "light", expected: "light" },
  { name: "theme without preference consent", theme: "dark", expected: "light" },
  { name: "theme with preferences refused", consent: false, theme: "dark", expected: "light" },
  { name: "invalid remembered theme", consent: true, theme: "invalid", expected: "light" },
  { name: "malformed preference record", malformed: true, theme: "dark", expected: "light" },
];
const results = [], bootstrapResults = [], errors = [];

try {
  for (const scenario of bootstrapScenarios) {
    const context = await browser.newContext({ colorScheme: "dark", reducedMotion: "reduce" });
    await context.addInitScript(scenario => {
      localStorage.removeItem("woy-cookie-preferences");
      localStorage.removeItem("woy-theme");
      if (typeof scenario.consent === "boolean") {
        localStorage.setItem("woy-cookie-preferences", JSON.stringify({ version: 1, preferences: scenario.consent, updatedAt: new Date().toISOString() }));
      }
      if (scenario.malformed) localStorage.setItem("woy-cookie-preferences", "invalid JSON");
      if (scenario.theme) localStorage.setItem("woy-theme", scenario.theme);
    }, scenario);
    const page = await context.newPage();
    page.on("pageerror", error => errors.push({ scenario: scenario.name, message: error.message }));
    await page.goto(base, { waitUntil: "domcontentloaded" });
    assert.equal(await page.locator("html").getAttribute("data-theme"), scenario.expected, scenario.name);
    await page.getByRole("button", { name: `Switch to ${scenario.expected === "light" ? "dark" : "light"} theme`, exact: true }).waitFor();
    bootstrapResults.push({ scenario: scenario.name, initialTheme: scenario.expected });
    await context.close();
  }
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
    assert.equal(await page.locator("html").getAttribute("data-theme"), "light", "Fresh visits start light regardless of device preference or storage availability");
    await page.getByRole("button", { name: "Essential only", exact: true }).click();
    if (scenario.remember) {
      await page.getByRole("button", { name: "Cookie Policy", exact: true }).click();
      await page.getByRole("checkbox", { name: "Remember my light or dark theme" }).check();
      await page.getByRole("button", { name: "Save preferences", exact: true }).click();
    }
    // Exercise an explicit choice even when light is already the default.
    if (scenario.chosen === "light") await page.getByRole("button", { name: "Switch to dark theme", exact: true }).click();
    await page.getByRole("button", { name: `Switch to ${scenario.chosen} theme`, exact: true }).click();
    const timeOrigin = await page.evaluate(() => performance.timeOrigin);
    const visited = [], scrollChecks = [];
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
      if (mobile) {
        await page.getByRole("dialog", { name: "WOY navigation", exact: true }).waitFor({ state: "hidden" });
        // Let Radix finish restoring focus after the sheet unmounts.
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      }
    };
    const verifyTop = async label => {
      await page.waitForFunction(() => window.scrollY <= 1);
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const scrollY = await page.evaluate(() => window.scrollY);
      assert.ok(scrollY <= 1, `${scenario.name}: ${label} must leave the page at the top, got ${scrollY}`);
      scrollChecks.push({ label, scrollY });
      await verify();
    };
    const scrollAwayFromTop = async () => {
      await page.evaluate(() => window.scrollTo({ top: 600, behavior: "instant" }));
      await page.waitForFunction(() => window.scrollY > 100);
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
      await page.waitForURL(base + "/work/education-transformation");
      await verifyTop("Selected work engagement");
      await page.goBack();
      await page.waitForURL(base + "/work");
      await verify();
      await navigate("Home");
      await page.waitForURL(base + "/#top");
      await verifyTop("Home from selected work");
      await page.locator("#selected-work .case-card").nth(1).click();
      await page.waitForURL(base + "/work/insurance-leadership");
      await verifyTop("Homepage selected engagement");
      await navigate("Leadership & Partners");
      await page.waitForURL(base + "/people");
      await page.locator(".person-card").first().click();
      await page.waitForURL(base + "/people/vipin-tuteja");
      await verify();
    }

    await navigate("Home");
    await page.waitForURL(base + "/#top");
    await page.locator("#selected-work").waitFor();
    await verifyTop("Home from another page");
    const contactLabel = scenario.width <= 850 ? "Let’s talk ↗" : "Let’s talk";
    await navigate(contactLabel);
    await page.waitForURL(base + "/contact#top");
    await page.getByRole("button", { name: "Send enquiry", exact: true }).waitFor();
    await verifyTop("Contact from Home");

    const contactDraft = {
      name: "Navigation check",
      email: "navigation-check@example.test",
      organisation: "Navigation test organisation",
      message: "Keep this unsent enquiry while returning to the top.",
    };
    for (const [field, value] of Object.entries(contactDraft)) {
      await page.locator(`#f-${field}`).fill(value);
    }
    await page.locator("#f-consent").check();
    const verifyContactDraft = async () => {
      for (const [field, value] of Object.entries(contactDraft)) {
        assert.equal(await page.locator(`#f-${field}`).inputValue(), value, `Same-page navigation must preserve ${field}`);
      }
      assert.equal(await page.locator("#f-consent").isChecked(), true, "Same-page navigation must preserve consent");
    };

    await scrollAwayFromTop();
    await navigate(contactLabel);
    await page.waitForURL(base + "/contact#top");
    await verifyTop("Contact navbar CTA on the same URL");
    await verifyContactDraft();
    const footerContact = page.locator("#footer").getByRole("link", { name: "Start a conversation", exact: true });
    for (let attempt = 1; attempt <= 2; attempt++) {
      await footerContact.scrollIntoViewIfNeeded();
      assert.ok(await page.evaluate(() => window.scrollY > 100), "Footer CTA check must start away from the top");
      if (attempt === 2) {
        await footerContact.focus();
        await page.keyboard.press("Enter");
      } else {
        await footerContact.click();
      }
      await page.waitForURL(base + "/contact#top");
      await verifyTop(`Contact footer CTA repeat ${attempt}`);
      await verifyContactDraft();
    }

    await scrollAwayFromTop();
    await navigate("Home");
    await page.waitForURL(base + "/#top");
    await verifyTop("Navbar Home from scrolled contact");
    await navigate("Selected work");
    await page.waitForURL(base + "/work");
    await page.locator(".work-library .case-card").first().waitFor();
    await verify();
    const footerHome = page.getByRole("contentinfo").getByRole("link", { name: "WOY Consulting home", exact: true });
    await footerHome.scrollIntoViewIfNeeded();
    assert.ok(await page.evaluate(() => window.scrollY > 100), "Footer brand Home check must start away from the top");
    await footerHome.click();
    await page.waitForURL(base + "/#top");
    await verifyTop("Footer brand Home from selected work");
    await navigate(contactLabel);
    await page.waitForURL(base + "/contact#top");
    await verifyTop("Contact before reload");
    await page.reload({ waitUntil: "load" });
    assert.equal(await page.locator("html").getAttribute("data-theme"), scenario.remember ? scenario.chosen : "light",
      "Reload uses the consented saved preference, otherwise the light default");
    results.push({ scenario: scenario.name, visited, scrollChecks, reloadTheme: await page.locator("html").getAttribute("data-theme") });
    await context.close();
  }
  assert.deepEqual(errors, []);
  fs.mkdirSync("reports", { recursive: true });
  fs.writeFileSync("reports/theme-navigation.json", JSON.stringify({ bootstrapResults, results, errors }, null, 2));
  console.log(JSON.stringify({ bootstrapScenarios: bootstrapResults.length, scenarios: results.length, navigations: results.reduce((sum, result) => sum + result.visited.length, 0), errors }));
} finally {
  await browser.close();
}
