import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium } from "playwright";

const base = process.env.TEST_BASE_URL || "http://localhost:5173";
const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || (process.platform === "win32" ? "C:/Program Files/Google/Chrome/Application/chrome.exe" : undefined) });
fs.mkdirSync("reports", { recursive: true });
const results = [];
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: "no-preference" });
  await page.goto(base, { waitUntil: "load" });
  await page.getByRole("button", { name: "Essential only", exact: true }).click();
  const logo = page.locator("[data-logo-formation]");
  const navbarLogo = page.locator("header").getByRole("img", { name: "WOY Consulting", exact: true });
  const sample = async time => {
    await logo.evaluate((element, time) => {
      for (const animation of element.getAnimations({ subtree: true })) { animation.pause(); animation.currentTime = time; }
    }, time);
    return logo.evaluate(element => {
      const style = selector => getComputedStyle(element.querySelector(selector));
      const center = selector => {
        const point = new DOMPoint(180, 94).matrixTransform(element.querySelector(selector).getScreenCTM());
        return { x: point.x, y: point.y };
      };
      return {
        circle: center(".mk-ring"), star: center(".mk-star"), compass: center(".mk-compass"),
        outline: Number(style(".mk-star-outline").opacity), core: Number(style(".mk-star-core path").opacity),
        compassDetail: Number(style(".mk-compass-detail").opacity), needle: Number(style(".mk-needle").opacity),
        letters: Number(style(".mk-letters path").opacity), word: Number(style(".mk-consulting").opacity),
        guides: Number(style(".mk-guides").opacity), pulse: Number(style(".mk-lock-pulse").opacity),
        ringDraw: style(".mk-ring").strokeDashoffset, letterDraw: style(".mk-letters path").strokeDashoffset,
        durations: element.getAnimations({ subtree: true }).map(animation => animation.effect.getTiming().duration),
      };
    });
  };
  // Rasterize the live SVG geometry through the browser's stroke renderer so
  // square caps and miter tips count; SVG getBBox() omits them in Chromium.
  const paintedBounds = (target = logo) => target.evaluate(element => {
    const scale = 8;
    const origin = { x: 50, y: 30 };
    const measure = selector => {
      const canvas = document.createElement("canvas");
      canvas.width = 240 * scale;
      canvas.height = 150 * scale;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      context.scale(scale, scale);
      context.translate(-origin.x, -origin.y);
      for (const node of element.querySelectorAll(selector)) {
        const style = getComputedStyle(node);
        context.lineWidth = parseFloat(style.strokeWidth);
        context.lineCap = style.strokeLinecap;
        context.lineJoin = style.strokeLinejoin;
        context.miterLimit = parseFloat(style.strokeMiterlimit);
        const path = new Path2D(node.getAttribute("d") || "");
        if (node.tagName === "circle") {
          path.arc(node.cx.baseVal.value, node.cy.baseVal.value, node.r.baseVal.value, 0, 2 * Math.PI);
        }
        context.stroke(path);
      }
      const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
      let top = canvas.height;
      let bottom = -1;
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          if (data[(y * canvas.width + x) * 4 + 3] > 0) {
            top = Math.min(top, y);
            bottom = y;
            break;
          }
        }
      }
      return { top: origin.y + top / scale, bottom: origin.y + (bottom + 1) / scale };
    };
    return {
      ring: measure(".mk-ring, [data-logo-ring]"),
      w: measure('[data-logo-letter="w"]'),
      y: measure('[data-logo-letter="y"]'),
      strokes: [...element.querySelectorAll(".mk-ring, [data-logo-ring], [data-logo-letter]")].map(node => getComputedStyle(node).strokeWidth),
    };
  });
  const assertAlignedLetters = bounds => {
    for (const letter of ["w", "y"]) {
      assert.ok(Math.abs(bounds[letter].top - bounds.ring.top) <= .25, `${letter.toUpperCase()} cap matches the ring's visible top`);
      assert.ok(Math.abs(bounds[letter].bottom - bounds.ring.bottom) <= .25, `${letter.toUpperCase()} tip matches the ring's visible bottom`);
    }
    assert.ok(bounds.strokes.every(stroke => stroke === bounds.strokes[0]), "Letters retain the ring's stroke weight");
  };
  for (const width of [320, 390, 768, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await logo.scrollIntoViewIfNeeded();
    const before = await logo.boundingBox();
    const separated = await sample(2600);
    assert.ok(separated.circle.x < separated.star.x && separated.star.x < separated.compass.x, "Reference symbols are separate and ordered");
    assert.equal(separated.outline, 1);
    assert.equal(separated.core, 0);
    assert.equal(separated.compassDetail, 1);
    assert.equal(separated.letters, 0);
    assert.ok(separated.durations.length > 10 && separated.durations.every(duration => duration === 12000), "All tracks share one clock");
    if (width === 390 || width === 1440) await logo.screenshot({ path: `reports/logo-separated-${width}.png` });
    const merging = await sample(4500);
    assert.ok(merging.compass.x - merging.circle.x < separated.compass.x - separated.circle.x, "Symbols travel toward one center");
    if (width === 1440) await logo.screenshot({ path: "reports/logo-merging-1440.png" });
    const complete = await sample(7800);
    assert.ok(Math.abs(complete.circle.x - complete.star.x) < .01 && Math.abs(complete.star.x - complete.compass.x) < .01, "All three symbols finish at the same center");
    assert.equal(complete.outline, 0);
    assert.equal(complete.compassDetail, 0);
    assert.equal(complete.core, 1);
    assert.equal(complete.needle, 1);
    assert.equal(complete.letters, 1);
    assert.equal(complete.word, 1);
    assert.equal(complete.guides, 0);
    assert.equal(complete.pulse, 0);
    assert.equal(complete.ringDraw, "0px");
    assert.equal(complete.letterDraw, "0px");
    assert.equal((await logo.boundingBox()).height, before.height, "The formation does not shift layout");
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false);
    if (width === 390 || width === 1440) await logo.screenshot({ path: `reports/logo-complete-${width}.png` });
    const painted = await paintedBounds();
    assertAlignedLetters(painted);
    const navbarPainted = await paintedBounds(navbarLogo);
    assertAlignedLetters(navbarPainted);
    assert.deepEqual(navbarPainted, painted, "Static and animated logos share the same painted geometry");
    if (width === 390 || width === 1440) await navbarLogo.screenshot({ path: `reports/navbar-logo-${width}.png` });
    results.push({ width, separated, merging, complete, painted, navbarPainted });
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(await logo.locator(".mk-ring").evaluate(el => getComputedStyle(el).animationName), "none");
  assert.equal(await logo.locator(".mk-star-outline").evaluate(el => getComputedStyle(el).opacity), "0");
  for (const selector of [".mk-ring", ".mk-star-core path", ".mk-needle", ".mk-letters path", ".mk-consulting"]) {
    assert.equal(await logo.locator(selector).first().evaluate(el => getComputedStyle(el).opacity), "1", `Complete reduced-motion mark: ${selector}`);
  }
  assertAlignedLetters(await paintedBounds());
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.reload({ waitUntil: "load" });
  await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector("[data-logo-formation]").classList.contains("is-paused"));
  assert.ok(await logo.evaluate(el => el.getAnimations({ subtree: true }).every(animation => animation.playState === "paused")), "All tracks pause off screen");
  await logo.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => !document.querySelector("[data-logo-formation]").classList.contains("is-paused"));
  assert.ok(await logo.evaluate(el => el.getAnimations({ subtree: true }).every(animation => animation.playState === "running")), "All tracks resume together");
  fs.writeFileSync("reports/logo-formation.json", JSON.stringify({ results, reducedMotion: true, offscreenPause: true, resume: true }, null, 2));
  console.log("Logo formation: separate symbols, convergence, complete lockup, matching static and animated letter heights including strokes, responsive geometry, reduced motion and off-screen pause passed.");
} finally { await browser.close(); }
