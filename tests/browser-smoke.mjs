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
    const typefaces = await page.evaluate(() => ["body", "main h1", "main input", "main textarea", "header nav a", "header button", "footer h2", "footer a", "footer button"]
      .flatMap(selector => { const element = document.querySelector(selector); return element ? [{ selector, family: getComputedStyle(element).fontFamily, sans: selector.startsWith("header") || selector.startsWith("footer") }] : []; }));
    for (const { selector, family, sans } of typefaces) assert.match(family, sans ? /^Arial/ : /^Georgia/, `Reference typography on ${selector}: ${route}`);
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
    if (route === "/") {
      assert.equal(await page.locator("[data-home-hero] img, [data-hero-background]").count(), 0, "The hero has no background image");
      const eyebrow = page.locator("[data-home-hero]").getByText("Partner-led consulting · Since 2015", { exact: true });
      assert.equal(await eyebrow.locator("span").count(), 0, "Hero label has no leading rule");
      const eyebrowType = await eyebrow.evaluate(el => ({ family: getComputedStyle(el).fontFamily, transform: getComputedStyle(el).textTransform }));
      assert.match(eyebrowType.family, /^Arial/);
      assert.equal(eyebrowType.transform, "uppercase");
      const caption = page.locator("[data-logo-caption]");
      assert.equal((await caption.locator("p").nth(0).textContent()).trim(), "Win Over Yourself.");
      assert.equal((await caption.locator("p").nth(1).textContent()).replace(/\s+/g, " ").trim(), "Growth. Excellence. Agility.");
      const services = meta.schema.filter(node => node["@type"] === "Service");
      assert.equal(services.length, 4, "The four visible expertise areas have matching Service metadata");
      for (const service of services) {
        const serviceUrl = new URL(service.url);
        assert.equal(serviceUrl.pathname, "/");
        assert.equal(await page.locator(serviceUrl.hash).count(), 1, "Service schema points to a real homepage capability");
      }
    }
    if (route === "/case-studies") {
      const list = meta.schema.find(node => node["@type"] === "ItemList");
      const cards = page.locator("[data-case-card]");
      assert.equal(await cards.count(), list.numberOfItems, "Every published case has one card");
      for (const entry of list.itemListElement) {
        const link = cards.getByRole("link", { name: entry.item.name, exact: true });
        assert.equal(await link.getAttribute("href"), new URL(entry.item.url).pathname, "Cards preserve their published case URLs");
        assert.equal(await link.locator("dt").count(), 2, "Each card separates the challenge from its outcome");
      }
      assert.equal(await page.locator("#collective-experience").getByRole("heading", { level: 2 }).count(), 1);
      assert.equal((await page.locator("#collective-experience-title").textContent()).replace(/\s+/g, " ").trim(), "Our collective experience.", "Heading words remain separated when the desktop line break is hidden");
      assert.equal(await page.locator("#collective-experience img").count(), 47, "Full supplied logo roster is visible without a disclosure");
    }
    if (route === "/about") {
      assert.equal(await page.getByRole("heading", { name: "Experience across industries.", exact: true }).count(), 0);
      assert.equal(await page.locator("main img").count(), 0, "The retired About logo section has been removed");
    }
    assert.equal(meta.hrefs.filter(href => href?.startsWith("/expertise")).length, 0, "No links target the retired page");
    if (route === "/faq") {
      const faq = meta.schema.find(node => node["@type"] === "FAQPage");
      assert.ok(faq?.mainEntity?.length >= 6, "FAQ schema has substantive answers");
      for (const item of faq.mainEntity) {
        assert.equal(await page.getByRole("heading", { name: item.name, exact: true }).count(), 1);
        assert.equal(await page.getByText(item.acceptedAnswer.text, { exact: true }).count(), 1);
      }
    }
    assert.equal(await page.getByRole("navigation", { name: "Primary", exact: true }).getByRole("link", { name: "Expertise", exact: true }).count(), 0, "Expertise is absent from the main navigation");
    const navbarAction = page.locator("header").getByRole("link", { name: "Let’s talk", exact: true });
    assert.equal(await navbarAction.getAttribute("href"), "mailto:hello@woyconsulting.com", `Navbar email action: ${route}`);
    const conversationLinks = page.getByRole("link", { name: "Start a conversation", exact: true });
    assert.ok(await conversationLinks.count() >= 1, `Footer email action: ${route}`);
    for (const link of await conversationLinks.all()) assert.equal(await link.getAttribute("href"), "mailto:hello@woyconsulting.com");
    const footer = page.getByRole("contentinfo");
    assert.equal(await footer.getByRole("link", { name: "hello@woyconsulting.com", exact: true }).getAttribute("href"), "mailto:hello@woyconsulting.com");
    assert.equal(await footer.getByRole("link", { name: "Contact", exact: true }).getAttribute("href"), "/contact");
    assert.equal(await footer.getByRole("link", { name: /Made by AvlysAI/ }).getAttribute("href"), "https://avlysai.com/");
    assert.equal(meta.h1, 1, `Heading: ${route}`);
    assert.equal(meta.missingAlt, 0, `Alt: ${route}`);
    meta.hrefs.forEach(href => hrefs.add(new URL(href, base + route).href));
    meta.assets.forEach(src => assets.add(src));
    pages.push({ route, title: meta.title, description: meta.description, status: response.status() });
    for (const theme of ["light", "dark"]) {
      await page.evaluate(theme => document.documentElement.setAttribute("data-theme", theme), theme);
      if (route === "/") {
        const heroSurface = await page.locator("[data-home-hero]").evaluate(el => ({ image: getComputedStyle(el).backgroundImage, color: getComputedStyle(el).backgroundColor }));
        assert.equal(heroSurface.image, "none", `Plain hero in ${theme} mode`);
        assert.equal(heroSurface.color, theme === "light" ? "rgb(251, 249, 247)" : "rgb(14, 16, 19)");
      }
      const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
      if (result.violations.length) accessibility.push({ route, theme, violations: result.violations.map(v => ({ id: v.id, impact: v.impact, description: v.description, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) })) });
    }
    for (const width of [320, 375, 390, 414, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      const size = await page.evaluate(() => ({ content: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth }));
      if (size.content > size.viewport + 1) overflow.push({ route, width, ...size });
      if (route === "/") {
        for (const theme of ["light", "dark"]) {
          await page.evaluate(theme => document.documentElement.setAttribute("data-theme", theme), theme);
          const heroBounds = await page.locator("[data-home-hero]").boundingBox();
          const captionBounds = await page.locator("[data-logo-caption]").boundingBox();
          assert.ok(heroBounds && captionBounds, "Hero and caption have rendered bounds");
          assert.ok(captionBounds.x >= heroBounds.x && captionBounds.x + captionBounds.width <= heroBounds.x + heroBounds.width + 1, `Caption fits at ${width}px in ${theme} mode`);
        }
      }
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    fs.writeFileSync(path.join(reportDir, "browser-progress.json"), JSON.stringify({ pages, jsErrors: errors, accessibility, overflow }, null, 2));
    console.log(`Checked ${route}`);
  }
  assert.equal(new Set(pages.map(page => page.title)).size, pages.length, "Unique page titles");
  assert.equal(new Set(pages.map(page => page.description)).size, pages.length, "Unique page descriptions");
  const sitemap = await (await context.request.get(base + "/sitemap.xml")).text();
  for (const page of pages) assert.ok(sitemap.includes(page.route === "/" ? "<loc>" : page.route + "</loc>"), `Sitemap route: ${page.route}`);
  assert.ok(!sitemap.includes("/expertise</loc>"), "Retired expertise route is excluded from sitemap");
  const expertiseRedirect = await context.request.get(base + "/expertise", { maxRedirects: 0 });
  assert.equal(expertiseRedirect.status(), 308);
  assert.match(expertiseRedirect.headers().location, /\/#expertise$/);
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

  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(base, { waitUntil: "load" });
    await page.getByRole("link", { name: "Explore our philosophy and approach", exact: true }).click();
    await page.waitForURL(base + "/about#philosophy");
    await page.waitForFunction(() => {
      const section = document.getElementById("philosophy");
      const header = document.querySelector("body > header");
      return section && header && section.getBoundingClientRect().top >= header.getBoundingClientRect().bottom - 1 && section.getBoundingClientRect().top < innerHeight;
    });
    assert.equal(await page.locator("#philosophy h3").count(), 3, "About explains all three logo symbols");
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base, { waitUntil: "load" });
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.keyboard.press("Escape");
  assert.equal(await page.getByRole("button", { name: "Open menu" }).evaluate(e => e === document.activeElement), true);
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("navigation", { name: "Mobile", exact: true }).getByRole("link", { name: "Home", exact: true }).click();
  assert.equal(await page.locator("#mobile-nav").count(), 0, "Home closes the mobile menu even on the home route");
  await page.getByRole("button", { name: "Open menu" }).click();
  assert.equal(await page.getByRole("navigation", { name: "Mobile", exact: true }).getByRole("link", { name: "Expertise", exact: true }).count(), 0, "Expertise is absent from the mobile navigation");
  assert.equal(await page.locator("#mobile-nav").getByRole("link", { name: "Let’s talk", exact: true }).getAttribute("href"), "mailto:hello@woyconsulting.com", "Mobile navbar uses the same conversation label and email");
  await page.locator('#mobile-nav a[href="/approach"]').click();
  await page.waitForURL(base + "/approach");
  const explorer = page.locator("[data-approach-explorer]");
  const explorerTabs = explorer.getByRole("tablist", { name: "The four stages of the WOY approach" }).getByRole("tab");
  assert.equal(await explorerTabs.count(), 4);
  await explorerTabs.first().focus();
  const explorerHeight = (await explorer.boundingBox()).height;
  for (const [key, name] of [["ArrowRight", "Define"], ["End", "Deliver"], ["ArrowRight", "Discover"], ["ArrowLeft", "Deliver"], ["Home", "Discover"]]) {
    await page.keyboard.press(key);
    const selected = explorer.getByRole("tab", { selected: true });
    assert.match(await selected.innerText(), new RegExp(name));
    assert.equal(await selected.evaluate(el => document.activeElement === el), true, "Explorer keyboard navigation moves focus");
    assert.equal(await explorer.getByRole("tabpanel").count(), 1, "Only the active explorer panel is exposed");
    assert.equal(await explorer.getByRole("tabpanel").getAttribute("aria-labelledby"), await selected.getAttribute("id"));
    assert.equal(await explorer.locator('[role="tabpanel"][inert]').count(), 3);
    assert.equal((await explorer.boundingBox()).height, explorerHeight, "Changing stage preserves the layout height");
  }
  await explorerTabs.nth(2).click();
  assert.match(await explorer.getByRole("tabpanel").innerText(), /Tailored journey/);
  await explorer.getByRole("button", { name: "Next stage: Deliver", exact: true }).click();
  assert.match(await explorer.getByRole("tabpanel").innerText(), /Capability transfer/);
  await explorer.getByRole("button", { name: "Next stage: Discover", exact: true }).click();
  await explorer.getByRole("button", { name: "Previous stage: Deliver", exact: true }).click();
  assert.match(await explorer.getByRole("tabpanel").innerText(), /Sustained execution/);
  assert.equal(await explorer.getByRole("tabpanel").evaluate(el => getComputedStyle(el).transitionDuration), "0s", "Explorer respects reduced motion");
  await page.screenshot({ path: path.join(reportDir, "approach-mobile.png"), fullPage: true });
  const staticContext = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const staticPage = await staticContext.newPage();
  await staticPage.goto(base + "/approach", { waitUntil: "load" });
  const staticExplorer = staticPage.locator("[data-approach-explorer]");
  assert.equal(await staticExplorer.getByRole("tab").count(), 0, "No inert controls are shown without JavaScript");
  assert.equal(await staticExplorer.getByRole("heading", { level: 3 }).count(), 4, "Every stage remains readable without JavaScript");
  assert.equal(await staticExplorer.getByText("Capability transfer", { exact: true }).isVisible(), true);
  await staticPage.goto(base, { waitUntil: "load" });
  const staticExpertise = staticPage.locator("#expertise details");
  assert.equal(await staticExpertise.first().getAttribute("open"), "", "Expertise is server-rendered with the first area expanded");
  await staticExpertise.nth(1).locator("summary").press("Enter");
  assert.equal(await staticExpertise.nth(1).getAttribute("open"), "", "Expertise works without JavaScript");
  assert.equal(await staticPage.locator("#expertise details[open]").count(), 1);
  await staticContext.close();
  await page.getByRole("contentinfo").getByRole("link", { name: "Back to top", exact: true }).click();
  await page.waitForFunction(() => document.getElementById("main").getBoundingClientRect().top >= 0);
  await page.getByRole("contentinfo").getByRole("link", { name: "Contact", exact: true }).click();
  await page.waitForURL(base + "/contact");
  assert.equal(await page.locator("main").getByRole("link", { name: "hello@woyconsulting.com", exact: true }).getAttribute("href"), "mailto:hello@woyconsulting.com");
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
  await page.goto(base + "/about", { waitUntil: "load" });
  const homeLink = page.getByRole("navigation", { name: "Primary", exact: true }).getByRole("link", { name: "Home", exact: true });
  assert.equal(await homeLink.getAttribute("aria-current"), null);
  await homeLink.click();
  await page.waitForURL(base + "/");
  assert.equal(await homeLink.getAttribute("aria-current"), "page");
  await page.getByRole("contentinfo").getByRole("link", { name: "Expertise", exact: true }).click();
  await page.waitForURL(base + "/#expertise");
  const expertise = page.locator("#expertise details");
  assert.equal(await expertise.count(), 4);
  assert.equal(await expertise.first().getAttribute("open"), "", "Strategy is initially expanded");
  await expertise.first().locator("summary").focus();
  await page.keyboard.press("Enter");
  assert.equal(await expertise.first().getAttribute("open"), null, "An open area can be collapsed with the keyboard");
  await page.keyboard.press("Space");
  assert.equal(await expertise.first().getAttribute("open"), "", "Space also operates the native disclosure");
  for (let index = 1; index < 4; index++) {
    await expertise.nth(index).locator("summary").click();
    assert.equal(await expertise.nth(index).getAttribute("open"), "");
    assert.equal(await page.locator("#expertise details[open]").count(), 1, "One expertise area stays open at a time");
    assert.equal(await expertise.nth(index).locator("li").count(), 3, "Each area offers three concise deliverables");
  }
  for (const slug of ["strategy-growth-execution", "leadership-executive-coaching", "organisation-culture-change", "people-performance-systems",
    "strategy-and-sales-management", "coaching-and-leadership-development", "inclusive-leadership-and-culture",
    "people-and-culture-consulting", "organization-diagnostics-and-restructuring", "hr-capability-and-transformation"]) {
    await page.goto(base + "/#" + slug, { waitUntil: "load" });
    await page.waitForFunction(id => {
      const disclosure = document.getElementById(id)?.closest("details");
      const top = disclosure?.getBoundingClientRect().top;
      return disclosure?.open && top >= 72 && top < 300;
    }, slug);
    assert.equal(await page.locator("#expertise details[open]").count(), 1, `Only the linked area is open: ${slug}`);
  }
  await page.locator("#expertise").getByRole("link", { name: "See our expertise in practice" }).click();
  await page.waitForURL(base + "/case-studies");
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
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.mouse.move(0, 0);
  await page.locator("h1").focus();
  await page.evaluate(() => document.activeElement?.blur());
  const founder = page.locator("#vipin-tuteja");
  const founderImage = founder.locator("img");
  await founderImage.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => getComputedStyle(document.querySelector("#vipin-tuteja img")).filter === "grayscale(1)");
  const profileBounds = await founder.boundingBox();
  await founderImage.hover();
  await page.waitForFunction(() => {
    const style = getComputedStyle(document.querySelector("#vipin-tuteja img"));
    return style.filter === "grayscale(0)" && new DOMMatrix(style.transform).a > 1.04;
  });
  assert.equal((await founder.boundingBox()).height, profileBounds.height, "Portrait zoom does not move profile content");
  await page.mouse.move(0, 0);
  await founder.locator("summary").focus();
  await page.waitForFunction(() => getComputedStyle(document.querySelector("#vipin-tuteja img")).filter === "grayscale(0)");
  await page.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(await founderImage.evaluate(el => getComputedStyle(el).transform), "none", "Portrait respects reduced motion");
  const touchContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "no-preference" });
  const touchPage = await touchContext.newPage();
  await touchPage.goto(base + "/practitioners", { waitUntil: "load" });
  assert.equal(await touchPage.locator("#vipin-tuteja img").evaluate(el => getComputedStyle(el).filter), "none", "Touch devices receive colour portraits without needing hover");
  await touchContext.close();
  const personImages = await page.locator('script[type="application/ld+json"]').evaluateAll(scripts => scripts.flatMap(s => JSON.parse(s.textContent)["@graph"] || []).filter(n => n["@type"] === "Person").map(n => n.image));
  assert.equal(personImages.length, 3);
  assert.ok(personImages.every(Boolean), "All named practitioners have schema portrait references");
  await page.goto(base + "/about", { waitUntil: "load" });
  assert.equal(await page.locator("main details").count(), 0, "About no longer contains the client roster disclosure");
  await page.goto(base + "/case-studies", { waitUntil: "load" });
  await page.getByRole("link", { name: "Our collective experience", exact: true }).click();
  await page.waitForURL(base + "/case-studies#collective-experience");
  const logoWall = page.locator("#collective-experience");
  assert.equal(await logoWall.locator("img").count(), 47);
  assert.match(await logoWall.innerText(), /partner and affiliate platforms/);
  assert.match(await logoWall.innerText(), /do not identify the organisations in the anonymised case studies/);
  await page.locator("[data-case-card] a").first().focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  assert.equal(await page.locator("[data-case-card] a").first().evaluate(el => getComputedStyle(el).outlineStyle), "solid", "Case cards have visible keyboard focus");
  const firstCaseHref = await page.locator("[data-case-card] a").first().getAttribute("href");
  await page.keyboard.press("Enter");
  await page.waitForURL(base + firstCaseHref);
  await page.getByRole("button", { name: "Cookie preferences", exact: true }).click();
  await page.setViewportSize({ width: 320, height: 568 });
  await page.getByRole("button", { name: "Save preferences", exact: true }).scrollIntoViewIfNeeded();
  const saveBounds = await page.getByRole("button", { name: "Save preferences", exact: true }).boundingBox();
  assert.ok(saveBounds && saveBounds.y >= 0 && saveBounds.y + saveBounds.height <= 569, "Cookie action reachable on a small screen");
  await page.screenshot({ path: path.join(reportDir, "cookie-mobile.png") });
  const report = { pages, jsErrors: errors, accessibility, overflow, brokenLinks, checkedLinks: hrefs.size, checkedAssets: assets.size, interactions: "plain light/dark hero, updated philosophy caption and responsive containment, footer email CTAs, Contact and back-to-top navigation, cookie choices, theme memory, Home/footer Expertise navigation; Expertise absent from both navbars, four-area expertise accordion, all current/legacy deep links, keyboard and no-JS disclosures, editorial serif content with sans-serif navbar, footer and rule-free hero label, homepage philosophy link to About anchor clear of sticky navigation, mobile menu/Escape, 4D keyboard/click navigation, practitioner photos/hover/focus/touch/reduced motion/biography disclosure, six case cards with keyboard navigation, collective experience logo wall and removed About roster, Approach explorer keyboard/click/next/previous/wrapping/stable panels/reduced motion/no-JS fallback, validation, unavailable delivery, mocked success/duplicate prevention passed" };
  fs.writeFileSync(path.join(reportDir, "browser-check.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ pages: pages.length, jsErrors: errors.length, accessibility: accessibility.length, overflow: overflow.length, brokenLinks: brokenLinks.length }));
  assert.equal(errors.length, 0, "Browser JS errors");
  assert.equal(accessibility.length, 0, "Accessibility violations (reports/browser-check.json)");
  assert.equal(overflow.length, 0, "Responsive overflow (reports/browser-check.json)");
  assert.equal(brokenLinks.length, 0, "Broken links (reports/browser-check.json)");
} finally {
  await browser.close();
}
