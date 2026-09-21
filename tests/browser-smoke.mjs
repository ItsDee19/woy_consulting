import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const base = process.env.TEST_BASE_URL || "http://localhost:5173";
const reportDir = path.resolve("reports");
fs.mkdirSync(reportDir, { recursive: true });
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ||
  (process.platform === "win32" ? "C:/Program Files/Google/Chrome/Application/chrome.exe" : undefined);
const browser = await chromium.launch({ executablePath, headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce", colorScheme: "light" });
const page = await context.newPage();
const errors = [], pages = [], brokenLinks = [], accessibility = [], overflow = [];
const hrefs = new Set(), assets = new Set();
page.on("pageerror", error => errors.push({ url: page.url(), message: error.message }));
const manifest = JSON.parse(fs.readFileSync(".next/prerender-manifest.json", "utf8"));
const routes = Object.keys(manifest.routes).filter(route => !route.startsWith("/_") &&
  !/\.[a-z]+$/.test(route) && !route.includes("opengraph-image") && !route.includes("twitter-image"));

try {
  const firstVisit = await page.goto(base, { waitUntil: "load" });
  assert.match(await firstVisit.text(), /id="cookie-preferences"/, "Cookie choice is server-rendered");
  await page.getByRole("button", { name: "Essential only", exact: true }).click();
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  assert.equal(await page.evaluate(() => localStorage.getItem("woy-theme")), null);
  await page.reload({ waitUntil: "load" });
  assert.equal(await page.locator("html").getAttribute("data-theme"), "light");
  assert.equal(await page.locator("#cookie-preferences").isVisible(), false, "Saved choice stays hidden on reload");
  await page.getByRole("button", { name: "Cookie preferences", exact: true }).click();
  await page.getByRole("checkbox", { name: "Remember my light or dark theme" }).check();
  await page.getByRole("button", { name: "Save preferences", exact: true }).click();
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await page.reload({ waitUntil: "load" });
  assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
  await page.getByRole("button", { name: "Switch to light theme" }).click();

  for (const route of routes) {
    const response = await page.goto(base + route, { waitUntil: "load" });
    assert.equal(response.status(), 200, route);
    const meta = await page.evaluate(() => ({
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.getAttribute("content"),
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href"),
      og: document.querySelector('meta[property="og:image"]')?.getAttribute("content"),
      ogUrl: document.querySelector('meta[property="og:url"]')?.getAttribute("content"),
      schema: [...document.querySelectorAll('script[type="application/ld+json"]')].flatMap(script => {
        const value = JSON.parse(script.textContent);
        return value["@graph"] || [value];
      }),
      h1: document.querySelectorAll("h1").length,
      missingAlt: [...document.images].filter(image => !image.hasAttribute("alt")).length,
      hrefs: [...document.querySelectorAll("a[href]")].map(a => a.getAttribute("href")),
      assets: [...document.images].map(image => image.currentSrc || image.src),
    }));
    assert.ok(meta.title && meta.description && meta.canonical && meta.og, `Metadata: ${route}`);
    assert.match(meta.title, /WOY Consulting/, `Branded title: ${route}`);
    assert.equal(meta.title.split("WOY Consulting").length - 1, 1, `Brand appears once: ${route}`);
    assert.equal(new URL(meta.canonical).pathname, route, `Canonical path: ${route}`);
    assert.equal(meta.ogUrl, meta.canonical, `Social canonical agrees: ${route}`);
    assert.equal(meta.schema.filter(node => node["@type"] === "Organization").length, 1, `One organization: ${route}`);
    assert.equal(meta.schema.filter(node => node["@type"] === "WebSite").length, 1, `One website: ${route}`);
    assert.equal(await page.getByRole("button", { name: /(?:Pause|Resume) animations/ }).count(), 0);
    const schemaOrigin = new URL(meta.canonical).origin;
    for (const node of meta.schema) if (node["@id"]) assert.equal(new URL(node["@id"]).origin, schemaOrigin);
    if (route === "/faq") {
      const faq = meta.schema.find(node => node["@type"] === "FAQPage");
      assert.ok(faq?.mainEntity?.length >= 6, "FAQ schema has substantive answers");
      for (const item of faq.mainEntity) {
        assert.equal(await page.getByRole("heading", { name: item.name, exact: true }).count(), 1);
        assert.equal(await page.getByText(item.acceptedAnswer.text, { exact: true }).count(), 1);
      }
    }
    assert.equal(meta.h1, 1, `Heading: ${route}`);
    assert.equal(meta.missingAlt, 0, `Alt: ${route}`);
    meta.hrefs.forEach(href => hrefs.add(new URL(href, base + route).href));
    meta.assets.forEach(src => assets.add(src));
    pages.push({ route, title: meta.title, description: meta.description, status: response.status() });
    for (const theme of ["light", "dark"]) {
      await page.evaluate(theme => document.documentElement.setAttribute("data-theme", theme), theme);
      const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
      if (result.violations.length) accessibility.push({ route, theme, violations: result.violations.map(v => ({ id: v.id, impact: v.impact, description: v.description, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) })) });
    }
    for (const width of [320, 375, 390, 414, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      const size = await page.evaluate(() => ({ content: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth }));
      if (size.content > size.viewport + 1) overflow.push({ route, width, ...size });
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    fs.writeFileSync(path.join(reportDir, "browser-progress.json"), JSON.stringify({ pages, jsErrors: errors, accessibility, overflow }, null, 2));
    console.log(`Checked ${route}`);
  }
  assert.equal(new Set(pages.map(page => page.title)).size, pages.length, "Unique page titles");
  assert.equal(new Set(pages.map(page => page.description)).size, pages.length, "Unique page descriptions");
  const sitemap = await (await context.request.get(base + "/sitemap.xml")).text();
  for (const page of pages) assert.ok(sitemap.includes(page.route === "/" ? "<loc>" : page.route + "</loc>"), `Sitemap route: ${page.route}`);
  for (const href of hrefs) {
    const url = new URL(href);
    if (url.origin !== new URL(base).origin) continue;
    const response = await context.request.get(href);
    if (response.status() >= 400) brokenLinks.push({ href, status: response.status() });
    if (url.hash && response.ok()) {
      const html = await response.text();
      const id = decodeURIComponent(url.hash.slice(1));
      if (!html.includes(`id="${id}"`)) brokenLinks.push({ href, error: "Missing fragment target" });
    }
  }
  for (const src of assets) {
    if (!src.startsWith(base)) continue;
    const response = await context.request.get(src);
    if (!response.ok()) brokenLinks.push({ href: src, status: response.status() });
  }
  for (const url of ["/favicon.ico", "/icon.svg", "/apple-icon.png", "/opengraph-image", "/robots.txt", "/sitemap.xml"]) {
    const response = await context.request.get(base + url);
    assert.equal(response.status(), 200, url);
  }
  const missing = await page.goto(base + "/missing-page-smoke-test", { waitUntil: "load" });
  assert.equal(missing.status(), 404);
  assert.match(await page.title(), /not found/i);
  assert.match(await page.locator('meta[name="robots"]').last().getAttribute("content"), /noindex/);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base, { waitUntil: "load" });
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.keyboard.press("Escape");
  assert.equal(await page.getByRole("button", { name: "Open menu" }).evaluate(e => e === document.activeElement), true);
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.locator('#mobile-nav a[href="/approach"]').click();
  await page.waitForURL(base + "/approach");
  const panels = page.locator('main button[aria-controls^="panel-"]');
  await panels.nth(1).click();
  assert.equal(await page.locator('main button[aria-expanded="true"]').count(), 1);
  await page.goto(base + "/contact", { waitUntil: "load" });
  await page.locator('form button[type="submit"]').click();
  assert.equal(await page.locator('input[aria-invalid="true"]').count(), 3);
  assert.equal(await page.evaluate(() => document.activeElement.id), "f-name");
  for (const [label, value] of [["Full name", "Website Test"], ["Mobile number", "2025550100"], ["Email address", "smoke@example.com"]]) await page.getByLabel(label, { exact: true }).fill(value);
  await page.locator('form button[type="submit"]').click();
  await page.getByRole("status").filter({ hasText: /unavailable|not.*sent|could not/i }).waitFor();
  assert.equal(await page.getByLabel("Full name", { exact: true }).inputValue(), "Website Test");

  // UI success/failure is mocked; never sends an enquiry to an external service.
  let posts = 0;
  await page.route("**/api/contact", async route => {
    if (route.request().method() === "GET") return route.fulfill({ json: { readyAfterMs: 0 } });
    posts++;
    await new Promise(resolve => setTimeout(resolve, 300));
    return route.fulfill({ json: { message: "Sent" } });
  });
  await page.reload({ waitUntil: "load" });
  for (const [label, value] of [["Full name", "Website Test"], ["Mobile number", "2025550100"], ["Email address", "smoke@example.com"]]) await page.getByLabel(label, { exact: true }).fill(value);
  await page.locator("form").evaluate(form => { form.requestSubmit(); form.requestSubmit(); });
  await page.getByRole("status").filter({ hasText: /Thank you/ }).waitFor();
  assert.equal(posts, 1);
  assert.equal(await page.getByLabel("Full name", { exact: true }).inputValue(), "");
  await page.unroute("**/api/contact");
  await page.goto(base, { waitUntil: "load" });
  for (const theme of ["light", "dark"]) {
    await page.evaluate(theme => document.documentElement.setAttribute("data-theme", theme), theme);
    const logo = await page.locator("#woy-sheen stop").evaluateAll(stops => stops.map(stop => getComputedStyle(stop).stopColor));
    assert.deepEqual(logo, ["rgb(205, 20, 33)", "rgb(232, 57, 40)", "rgb(205, 20, 33)"], `Red artwork: ${theme}`);
  }
  await page.evaluate(() => document.documentElement.setAttribute("data-theme", "light"));
  await page.emulateMedia({ reducedMotion: "no-preference" });
  assert.notEqual(await page.locator(".mk-ring").evaluate(el => getComputedStyle(el).animationName), "none", "Logo remains animated");
  await page.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(await page.locator(".mk-ring").evaluate(el => getComputedStyle(el).animationName), "none", "System reduced motion is respected");
  const methodTabs = page.getByRole("tablist", { name: "Explore the four stages of our approach" }).getByRole("tab");
  assert.equal(await methodTabs.count(), 4);
  await methodTabs.first().focus();
  for (const [key, name] of [["ArrowRight", "Define"], ["End", "Deliver"], ["ArrowRight", "Discover"], ["ArrowLeft", "Deliver"], ["Home", "Discover"]]) {
    await page.keyboard.press(key);
    const selected = page.getByRole("tab", { selected: true });
    assert.match(await selected.innerText(), new RegExp(name));
    assert.equal(await selected.evaluate(el => document.activeElement === el), true, "4D keyboard selection moves focus");
    assert.equal(await page.getByRole("tabpanel").count(), 1, "Only the selected stage is exposed");
    assert.equal(await page.getByRole("tabpanel").getAttribute("aria-labelledby"), await selected.getAttribute("id"));
  }
  await methodTabs.nth(2).click();
  assert.match(await page.getByRole("tabpanel").innerText(), /Tailored journey/);
  await methodTabs.first().click();
  await page.locator(".logo-band").scrollIntoViewIfNeeded();
  await page.waitForFunction(() => [...document.querySelectorAll(".logo-band img")].filter(i => { const r=i.getBoundingClientRect(); return r.left < innerWidth && r.right > 0; }).every(i => i.complete && i.naturalWidth > 0));
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: path.join(reportDir, "home-mobile.png"), fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: path.join(reportDir, "home-desktop.png"), fullPage: true });
  await page.goto(base + "/practitioners", { waitUntil: "load" });
  for (const [slug, name] of [["vipin-tuteja", "Vipin"], ["sandeep-bidani", "Sandeep"], ["kannan-swaminathan", "Kannan"]]) {
    const article = page.locator(`#${slug}`);
    const portrait = article.locator("img");
    await portrait.scrollIntoViewIfNeeded();
    await portrait.evaluate(image => image.decode());
    assert.match(await portrait.getAttribute("src"), new RegExp(slug));
    assert.ok(await portrait.evaluate(image => image.naturalWidth > 0));
    const summary = article.locator("summary");
    await summary.focus();
    await page.keyboard.press("Enter");
    assert.equal(await article.locator("details").getAttribute("open"), "");
    assert.match(await article.locator("details").innerText(), new RegExp(name));
    await page.keyboard.press("Enter");
    assert.equal(await article.locator("details").getAttribute("open"), null);
  }
  const personImages = await page.locator('script[type="application/ld+json"]').evaluateAll(scripts => scripts.flatMap(s => JSON.parse(s.textContent)["@graph"] || []).filter(n => n["@type"] === "Person").map(n => n.image));
  assert.equal(personImages.length, 3);
  assert.ok(personImages.every(Boolean), "All named practitioners have schema portrait references");
  await page.goto(base + "/about", { waitUntil: "load" });
  const clientDisclosure = page.locator("main details");
  await clientDisclosure.locator("summary").click();
  assert.equal(await clientDisclosure.getAttribute("open"), "");
  assert.ok(await clientDisclosure.locator("img").count() >= 40, "Full client roster remains reachable");
  await clientDisclosure.locator("summary").click();
  await page.getByRole("button", { name: "Cookie preferences", exact: true }).click();
  await page.setViewportSize({ width: 320, height: 568 });
  await page.getByRole("button", { name: "Save preferences", exact: true }).scrollIntoViewIfNeeded();
  const saveBounds = await page.getByRole("button", { name: "Save preferences", exact: true }).boundingBox();
  assert.ok(saveBounds && saveBounds.y >= 0 && saveBounds.y + saveBounds.height <= 569, "Cookie action reachable on a small screen");
  await page.screenshot({ path: path.join(reportDir, "cookie-mobile.png") });
  const report = { pages, jsErrors: errors, accessibility, overflow, brokenLinks, checkedLinks: hrefs.size, checkedAssets: assets.size, interactions: "cookie choices, theme memory, mobile menu/Escape, 4D keyboard/click navigation, practitioner photos/biography disclosure, client disclosure, accordion, validation, unavailable delivery, mocked success/duplicate prevention passed" };
  fs.writeFileSync(path.join(reportDir, "browser-check.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ pages: pages.length, jsErrors: errors.length, accessibility: accessibility.length, overflow: overflow.length, brokenLinks: brokenLinks.length }));
  assert.equal(errors.length, 0, "Browser JS errors");
  assert.equal(accessibility.length, 0, "Accessibility violations (reports/browser-check.json)");
  assert.equal(overflow.length, 0, "Responsive overflow (reports/browser-check.json)");
  assert.equal(brokenLinks.length, 0, "Broken links (reports/browser-check.json)");
} finally {
  await browser.close();
}
