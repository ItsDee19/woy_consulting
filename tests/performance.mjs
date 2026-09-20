import fs from 'node:fs/promises';
import { chromium } from 'playwright';
import lighthouse from 'lighthouse';
import desktopConfig from 'lighthouse/core/config/desktop-config.js';
const base = process.env.TEST_BASE_URL || 'http://localhost:5173/';
const port = Number(process.env.LIGHTHOUSE_PORT || 9223);
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ||
  (process.platform === 'win32' ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : undefined);
await fs.mkdir('reports', {recursive:true});
const browser = await chromium.launch({headless:true, executablePath, args:[`--remote-debugging-port=${port}`]});
try {
  for (const mode of ['mobile','desktop']) {
    console.log(`Measuring ${mode}`);
    const result = await lighthouse(base, {port, output:['json','html'], logLevel:'error', onlyCategories:['performance','accessibility','best-practices','seo']}, mode === 'desktop' ? desktopConfig : undefined);
    await fs.writeFile(`reports/lighthouse-${mode}.report.json`, result.report[0]);
    await fs.writeFile(`reports/lighthouse-${mode}.report.html`, result.report[1]);
    const lhr=result.lhr;
    console.log(JSON.stringify({mode, scores:Object.fromEntries(Object.entries(lhr.categories).map(([k,v])=>[k,Math.round(v.score*100)])),metrics:Object.fromEntries(['first-contentful-paint','largest-contentful-paint','total-blocking-time','cumulative-layout-shift','speed-index'].map(k=>[k,lhr.audits[k].displayValue])),warnings:lhr.runWarnings}));
  }
} finally { await browser.close(); }
