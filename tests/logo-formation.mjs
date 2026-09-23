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
  const navbarLogo = page.locator("header .logo-window");
  const navbarImage = navbarLogo.getByRole("img", { name: "WOY Consulting", exact: true });
  assert.equal(await navbarImage.getAttribute("src"), "/assets/woy-logo.png", "Navbar reuses the original source artwork");
  const footerLogo = page.getByRole("contentinfo").getByRole("img", { name: "WOY Consulting", exact: true });
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
        guide: center("[data-logo-guide]"), starOutlineCenter: center(".mk-star-outline"), orbit: center(".mk-orbit"),
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
    const origin = { x: 30, y: 30 };
    const measure = selector => {
      const canvas = document.createElement("canvas");
      canvas.width = 260 * scale;
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
      let left = canvas.width;
      let right = -1;
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          if (data[(y * canvas.width + x) * 4 + 3] > 0) {
            top = Math.min(top, y);
            bottom = y;
            left = Math.min(left, x);
            right = Math.max(right, x);
          }
        }
      }
      return { top: origin.y + top / scale, bottom: origin.y + (bottom + 1) / scale, width: (right - left + 1) / scale };
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
    // Sample both visible phases and the hidden reset. A fixed outer guide must
    // remain concentric with the star even during nested outline scaling.
    const centerSamples = [];
    for (const time of [0, 360, 960, 1800, 2600, 3120, 3360, 3720, 3960, 4320, 4680, 5040, 5520, 6000, 6240, 7800, 10080, 10800, 11280, 11640, 11999]) {
      const state = await sample(time);
      for (const [name, center] of [["star", state.star], ["star outline", state.starOutlineCenter], ["rotating orbit", state.orbit]]) {
        const offset = Math.hypot(center.x - state.guide.x, center.y - state.guide.y);
        assert.ok(offset < .02, `${name} stays concentric with the pale guide at ${time}ms and ${width}px (offset ${offset}px)`);
      }
      centerSamples.push({ time, guide: state.guide, star: state.star, outline: state.starOutlineCenter, orbit: state.orbit });
    }
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
    const navbarBounds = await navbarLogo.boundingBox();
    assert.equal(navbarBounds.width, 112);
    assert.equal(navbarBounds.height, 60);
    const footerPainted = await paintedBounds(footerLogo);
    assertAlignedLetters(footerPainted);
    // The supplied reference measures W61px / O45px and Y38px / O45px.
    // Check the optical proportions rather than equating the static W with
    // the narrower, separately approved animated lettering.
    assert.ok(Math.abs(footerPainted.w.width / footerPainted.ring.width - 61 / 45) < .025, "Static W has the reference's broader proportions");
    assert.ok(Math.abs(footerPainted.y.width / footerPainted.ring.width - 38 / 45) < .025, "Static Y has the reference's proportions");
    assert.deepEqual(footerPainted.ring, painted.ring, "Static ring preserves the animated symbol geometry");
    for (const staticLogo of [footerLogo]) {
      assert.match(await staticLogo.locator("text").evaluate(node => getComputedStyle(node).fontFamily), /^Arial/, "Static caption uses the reference sans serif");
      const captionRounding = await staticLogo.locator("text").evaluate(node => Math.abs(node.getBBox().width - 222) * node.getScreenCTM().a);
      assert.ok(captionRounding < 1.1, "Caption tracks across the lockup within one rendered pixel");
    }
    if (width === 390 || width === 1440) {
      await navbarLogo.screenshot({ path: `reports/navbar-logo-${width}.png` });
      await footerLogo.screenshot({ path: `reports/footer-logo-${width}.png` });
    }
    results.push({ width, centerSamples, separated, merging, complete, painted, navbarBounds, footerPainted });
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(await logo.locator(".mk-ring").evaluate(el => getComputedStyle(el).animationName), "none");
  assert.equal(await logo.locator(".mk-star-outline").evaluate(el => getComputedStyle(el).opacity), "0");
  for (const selector of [".mk-ring", ".mk-star-core path", ".mk-needle", ".mk-letters path", ".mk-consulting"]) {
    assert.equal(await logo.locator(selector).first().evaluate(el => getComputedStyle(el).opacity), "1", `Complete reduced-motion mark: ${selector}`);
  }
  assertAlignedLetters(await paintedBounds());
  const reducedCenter = await sample(0);
  assert.ok(Math.hypot(reducedCenter.star.x - reducedCenter.guide.x, reducedCenter.star.y - reducedCenter.guide.y) < .02, "Reduced-motion final symbol retains the guide centre");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.reload({ waitUntil: "load" });
  await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector("[data-logo-formation]").classList.contains("is-paused"));
  assert.ok(await logo.evaluate(el => el.getAnimations({ subtree: true }).every(animation => animation.playState === "paused")), "All tracks pause off screen");
  await logo.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => !document.querySelector("[data-logo-formation]").classList.contains("is-paused"));
  assert.ok(await logo.evaluate(el => el.getAnimations({ subtree: true }).every(animation => animation.playState === "running")), "All tracks resume together");
  fs.writeFileSync("reports/logo-formation.json", JSON.stringify({ results, reducedMotion: true, offscreenPause: true, resume: true }, null, 2));
  console.log("Logo formation: concentric guide and star throughout 21 animation samples at five widths, separate symbols, convergence, complete lockup, aligned letter heights, reference static logo proportions, responsive geometry, reduced motion and off-screen pause passed.");
} finally { await browser.close(); }
