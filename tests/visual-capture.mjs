// Captures every sitemap route in light/dark × desktop/mobile for before/after comparison.
// The footer and cookie notice are captured separately so expected footer changes stay reviewable.
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const base = process.env.TEST_BASE_URL || "http://localhost:5173";
const labelIndex = process.argv.indexOf("--label");
const label = labelIndex >= 0 ? process.argv[labelIndex + 1] : undefined;
if (!label || label.startsWith("--") || !/^[\w-]+$/.test(label)) {
  throw new Error("Usage: node tests/visual-capture.mjs --label <letters-digits-dashes>");
}
const outDir = path.resolve("reports", "visual", label);
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ||
  (process.platform === "win32" ? "C:/Program Files/Google/Chrome/Application/chrome.exe" : undefined);
const sitemap = await (await fetch(`${base}/sitemap.xml`)).text();
const routes = [...new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]).pathname))].sort();
if (routes.length < 20) throw new Error(`Expected at least 20 sitemap routes, found ${routes.length}.`);

const viewports = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } };
const hideVolatile = "#footer, #cookie-preferences { display: none !important; }";
const fileName = (route, theme, viewport, part = "page") =>
  `${route === "/" ? "home" : route.slice(1).replace(/\//g, "__")}__${part}__${theme}__${viewport}.png`;

async function settle(page, theme) {
  await page.evaluate((next) => {
    document.documentElement.setAttribute("data-theme", next);
    window.dispatchEvent(new Event("woy-theme-changed"));
  }, theme);
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 80));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});
  // Lazy images that never enter the viewport (e.g. off-screen marquee copies) never load, so bound each wait.
  await page.evaluate(() => Promise.all([...document.images].map((image) => image.complete ? null
    : Promise.race([image.decode().catch(() => null), new Promise((resolve) => setTimeout(resolve, 3000))]))));
}

const browser = await chromium.launch({ executablePath, headless: true });
try {
  for (const [viewportName, viewport] of Object.entries(viewports)) {
    for (const theme of ["light", "dark"]) {
      const context = await browser.newContext({ viewport, reducedMotion: "reduce", colorScheme: theme, deviceScaleFactor: 1 });
      const page = await context.newPage();
      for (const route of routes) {
        const response = await page.goto(base + route, { waitUntil: "load" });
        if (response?.status() !== 200) throw new Error(`${route} returned ${response?.status()}`);
        await settle(page, theme);
        console.log(`${viewportName}/${theme} ${route}`);
        await page.screenshot({ path: path.join(outDir, fileName(route, theme, viewportName)), fullPage: true, animations: "disabled", style: hideVolatile });
        if (route === "/") {
          await page.locator("#footer").screenshot({ path: path.join(outDir, fileName(route, theme, viewportName, "footer")), animations: "disabled" });
        }
      }
      await context.close();
    }
  }
} finally {
  await browser.close();
}
console.log(`Captured ${routes.length} routes × 4 variants into ${path.relative(process.cwd(), outDir)}`);
