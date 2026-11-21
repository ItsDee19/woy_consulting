# Sanity CMS, Batch 1: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** WOY staff can edit case studies and people, and publish documents, in a hosted Sanity Studio. Every existing page must look exactly as it does today.

**Architecture:**
- A standalone Studio in `studio/` (Sanity 6, hosted by Sanity) writes to a public `production` dataset.
- The Next.js 16 site reads published content through `lib/cms/`. Each getter runs a GROQ query, caches it with `unstable_cache` under the tag `sanity`, and maps the result to the shapes the components already use.
- A signed webhook expires the cache.
- A build-time snapshot answers when Sanity is unreachable and nothing is cached.
- Sanity images and files are served from the site's own origin through a `/cms-assets/*` rewrite that only reaches this project. The Content-Security-Policy stays unchanged.

**Tech stack:** Next.js 16.3 (App Router), React 19, TypeScript. On the site: `@sanity/client` 8 and `@sanity/webhook` 4. In the Studio: `sanity` 6.18 and `@sanity/orderable-document-list` 2. Tooling: Node's built-in test runner, Playwright (already installed), `pixelmatch` and `pngjs` for screenshot comparison.

**Spec:** `docs/superpowers/specs/2026-10-11-sanity-cms-design.md`. This plan implements Batch 1: §2, §4, §5 (Batch 1 types), §6 (Batch 1 changes), §7, §8, §9 (Batch 1 types), §10 and §12. Task 12 brings the spec in line with the refinements made here.

## Global Constraints

- Node: `>=22.19.0` at the root (`package.json` engines). The Studio needs `>=22.12` (requirement of `sanity` 6.18).
- Site dependencies: `@sanity/client@^8.9.0` and `@sanity/webhook@^4.0.4`. Don't install `next-sanity`; it pulls in the whole Studio as a dependency.
- Studio dependencies: `sanity@^6.18.0`, `@sanity/orderable-document-list@^2.0.26`, `react@^19.2.3`, `react-dom@^19.2.3` and `styled-components@^6.1.15`.
- Sanity settings:
  - Dataset `production`, public.
  - API version `2026-10-01`.
  - Site client: `useCdn: false`, `perspective: "published"`, `maxRetries: 2`.
- **Document IDs use hyphens, never dots.** Dotted IDs are hidden from public reads, for example `caseStudy-insurance-leadership`.
- **`lib/security-policy.mjs` must not change.** No new script, style, connect, frame or image origins.
- **Images:**
  - Raw `<img>` elements and download links use the same-origin `/cms-assets/images|files/<file>` paths.
  - `next/image` uses absolute `https://cdn.sanity.io/images/<projectId>/production/...` URLs. `images.remotePatterns` allows only this project and dataset.
- **Caching:** `unstable_cache` with tag `"sanity"` and `revalidate: 300`. The webhook calls `revalidateTag("sanity", { expire: 0 })`.
- **Secrets:** none committed. `SANITY_REVALIDATE_SECRET` lives only in `.env.local` and Vercel, is at least 32 characters, and is never printed.
- **Tests** load TypeScript through `tests/helpers/load-ts.cjs`, which compiles in the same realm. **Never use `instanceof Error`** in code under test. Use duck-typing instead.
- **Steps marked 👤 OWNER** need the repository owner: a sign-in, a browser approval, or a written contribution. Stop and ask; never enter passwords or secret values on the owner's behalf.
- Every commit message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Commands are written for Git Bash on Windows. Paths are relative to the repository root unless a step says otherwise.

## Review Focus

These inputs and conditions aren't covered by the spec's tests but are the most likely to hurt a real person. Each one is pinned by a test in the task named.

1. **No resources published yet**, which is the situation at launch. `/resources` must show a friendly empty state rather than a blank grid. *(Task 8, empty-state render test.)*
2. **An editor publishes a minimal case study:** no older-page fields, no document, Sanity returning `null` for empty lists, and fewer than four featured items. Both page sets must render through the fallbacks, and the homepage must show only the featured ones that exist. *(Task 5, mapper tests.)*
3. **A person added without the older-page "highlight" fields or a separate older photo.** `/practitioners` must render without the highlight block instead of crashing on `proof.label`. *(Task 5 mapper test, plus the Task 7 page guard.)*
4. **Awkward document files:** spaces or non-ASCII characters in the name, no extension, a size of 0 or `null`. The download link must stay same-origin and correctly encoded, and the size label must never read "0 B" or "NaN". *(Task 2, `toFileDownload` and `formatFileSize` tests.)*
5. **The webhook receiving garbage:** a wrong method, no signature, a bad signature, an oversized body or no secret configured. Each must be rejected without revalidating or echoing the input. *(Task 9.)*

---

## File structure

**Studio** (`studio/`, a standalone npm package, excluded from the site's typecheck, lint and build)

| File | Responsibility |
|---|---|
| `studio/package.json`, `studio/tsconfig.json` | Studio package and TypeScript config |
| `studio/project.ts` | Public project ID and dataset constants (mirrors `lib/sanity/project.mjs`) |
| `studio/sanity.config.ts`, `studio/sanity.cli.ts` | Studio and CLI config, including `studioHost: "woy-consulting"` |
| `studio/structure.ts` | Sidebar: case studies and people (drag to reorder), resources |
| `studio/schemaTypes/{index,documentAttachment,caseStudy,person,resource}.ts` | Content model |
| `studio/scripts/import-current-content.ts` | One-off idempotent import from today's TypeScript content |

**Site**

| File | Responsibility |
|---|---|
| `lib/sanity/project.mjs` | Public IDs, API version, the loopback-only test override. Used by Next config, scripts and the client. |
| `lib/sanity/client.ts` | Server-only `@sanity/client` instance |
| `lib/cms/queries.mjs` | All GROQ queries (site and snapshot) |
| `lib/cms/raw.ts`, `lib/cms/types.ts` | Raw query result types, and the types components consume |
| `lib/cms/assets.ts` | Pure helpers: asset paths, hotspot to object-position, downloads, file sizes |
| `lib/cms/map-case-studies.ts`, `lib/cms/map-people.ts`, `lib/cms/map-resources.ts` | Pure mappers from raw results to component shapes |
| `lib/cms/fallback.ts` | `shouldUseSnapshot(error)`. 👤 OWNER contribution. |
| `lib/cms/source.ts` | `loadQuery(name)`: `unstable_cache`, plus snapshot fallback |
| `lib/cms/content.ts` | Server-only getters used by pages |
| `scripts/cms-snapshot.mjs` | Writes `lib/cms/snapshot.generated.json` (git-ignored) |
| `scripts/cms-create-secret.mjs` | Adds `SANITY_REVALIDATE_SECRET` to `.env.local` without printing it |
| `scripts/cms-revalidate.mjs` | Local helper that sends a signed revalidate request |
| `app/api/revalidate/route.ts` | Webhook receiver |
| `app/resources/page.tsx`, `app/resources/resources.module.css` | Documents page |
| `components/DownloadButton.tsx` | Same-origin download link |
| `tests/helpers/load-ts.cjs` | Same-realm TypeScript loader for tests |
| `tests/cms-*.test.cjs` | Unit, parity, snapshot and webhook tests |
| `tests/visual-capture.mjs`, `tests/visual-compare.mjs` | Screenshot baseline and comparison |

**Modified**

- `next.config.mjs`, `proxy.ts`, `package.json`, `.gitignore`, `.env.example`, `tsconfig.json`, `eslint.config.mjs`
- Content consumers:
  - `app/work/*`
  - `app/case-studies/*`
  - `app/people/*`
  - `app/practitioners/page.tsx`
  - `app/expertise/page.tsx`
  - `app/faq/page.tsx`
  - `app/sitemap.ts`
  - `components/recreation/{Site,WorkFilter}.tsx`
  - `components/work/EngagementPage.tsx`
  - `components/people/ProfilePage.tsx`
  - `components/{SelectedWorkSection,LeadershipSection,Footer}.tsx`
- Data and helpers: `lib/{structured-data,faq,content,recreation-content}.ts`
- Tests: `tests/{structured-data.test.cjs,browser-smoke.mjs}`
- Docs: `README.md`, `docs/editing-guide.md` (new)
- **Deleted:** `lib/people-profiles.ts`

---

### Task 0: Unblock npm and capture the visual baseline

**Files:**
- Create: `tests/visual-capture.mjs`, `tests/visual-compare.mjs`
- Modify: `package.json` (dev dependencies and scripts)

**Interfaces:**
- Produces: `npm run test:visual:capture -- --label <name>`, which writes `reports/visual/<name>/*.png`. `npm run test:visual:compare -- <baseline> <candidate>` exits 1 on any unexplained difference.

- [ ] **Step 1: 👤 OWNER: let npm run.** The Semgrep Guardian hook blocks `npm` until it's signed in. Either finish the Semgrep sign-in in the browser tab it opens, or turn the plugin off for this project. To check, run:

```bash
npm --version
```
Expected: a version number, not `Not logged into Semgrep Guardian`.

- [ ] **Step 2: Install from the lockfile and add the comparison libraries**

```bash
npm ci
npm install --save-dev pixelmatch@^7.1.0 pngjs@^7.0.0
```

- [ ] **Step 3: Write `tests/visual-capture.mjs`**

```js
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
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => Promise.all([...document.images].map((image) => image.complete ? null : image.decode().catch(() => null))));
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
```

- [ ] **Step 4: Write `tests/visual-compare.mjs`**

```js
// Compares two capture folders pixel by pixel; writes diff images for anything that differs.
import fs from "node:fs";
import path from "node:path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

const [baselineLabel, candidateLabel] = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
if (!baselineLabel || !candidateLabel) throw new Error("Usage: node tests/visual-compare.mjs <baseline> <candidate> [--allow <file-prefix>]...");
const allowed = process.argv.flatMap((arg, index, all) => all[index - 1] === "--allow" ? [arg] : []);
const root = path.resolve("reports", "visual");
const baselineDir = path.join(root, baselineLabel);
const candidateDir = path.join(root, candidateLabel);
const diffDir = path.join(root, `diff-${baselineLabel}-vs-${candidateLabel}`);
fs.rmSync(diffDir, { recursive: true, force: true });
fs.mkdirSync(diffDir, { recursive: true });

const isAllowed = (file) => allowed.some((prefix) => file.startsWith(prefix));
const baselineFiles = fs.readdirSync(baselineDir).filter((file) => file.endsWith(".png"));
const candidateFiles = new Set(fs.readdirSync(candidateDir).filter((file) => file.endsWith(".png")));
const failures = [];

for (const file of baselineFiles) {
  if (isAllowed(file)) continue;
  if (!candidateFiles.has(file)) { failures.push(`${file}: missing from ${candidateLabel}`); continue; }
  const before = PNG.sync.read(fs.readFileSync(path.join(baselineDir, file)));
  const after = PNG.sync.read(fs.readFileSync(path.join(candidateDir, file)));
  if (before.width !== after.width || before.height !== after.height) {
    failures.push(`${file}: size ${before.width}×${before.height} → ${after.width}×${after.height}`);
    continue;
  }
  const diff = new PNG({ width: before.width, height: before.height });
  const changed = pixelmatch(before.data, after.data, diff.data, before.width, before.height, { threshold: 0.1 });
  if (changed > 0) {
    fs.writeFileSync(path.join(diffDir, file), PNG.sync.write(diff));
    failures.push(`${file}: ${changed} pixels differ`);
  }
}
for (const file of candidateFiles) {
  if (!baselineFiles.includes(file) && !isAllowed(file)) failures.push(`${file}: new in ${candidateLabel}`);
}

if (failures.length) {
  console.error(`Visual differences (${failures.length}). Diff images: ${path.relative(process.cwd(), diffDir)}`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`No visual differences across ${baselineFiles.length} screenshots.`);
}
```

- [ ] **Step 5: Add the scripts to `package.json` `"scripts"`**

```json
"test:visual:capture": "node tests/visual-capture.mjs",
"test:visual:compare": "node tests/visual-compare.mjs",
```

- [ ] **Step 6: Build, start the production server and capture the baseline**

```bash
npm run build
npm start -- -p 5173
```

Run the server in the background, and in another shell:

```bash
npm run test:visual:capture -- --label baseline
```

Expected: `Captured <N> routes × 4 variants into reports/visual/baseline`, with N ≥ 20. Stop the server afterwards.

- [ ] **Step 7: Prove the comparison works.** Compare the baseline against itself:

```bash
npm run test:visual:compare -- baseline baseline
```

Expected: `No visual differences across <4N+4> screenshots.`

- [ ] **Step 8: Commit.** `reports/` is git-ignored, so the screenshots stay local.

```bash
git add tests/visual-capture.mjs tests/visual-compare.mjs package.json package-lock.json
git commit -m "test: add visual baseline capture and pixel comparison

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 1: Sanity project and Studio with the Batch 1 content model

**Files:**
- Create:
  - `studio/package.json`, `studio/tsconfig.json`, `studio/project.ts`, `studio/sanity.config.ts`, `studio/sanity.cli.ts`, `studio/structure.ts`
  - `studio/schemaTypes/index.ts`, `studio/schemaTypes/documentAttachment.ts`, `studio/schemaTypes/caseStudy.ts`, `studio/schemaTypes/person.ts`, `studio/schemaTypes/resource.ts`
  - `lib/sanity/project.mjs`, `tests/cms-config.test.cjs`
- Modify: `tsconfig.json`, `eslint.config.mjs`, `.gitignore`

**Interfaces:**
- Produces:
  - Project ID constants: `SANITY_PROJECT_ID`, `SANITY_DATASET`, `SANITY_API_VERSION` and `SANITY_API_HOST`, from `lib/sanity/project.mjs`.
  - Document types `caseStudy`, `person` and `resource`, plus the object type `documentAttachment`. Field names are exactly as written below. Later queries depend on them.

- [ ] **Step 1: 👤 OWNER: create or sign in to a Sanity account** at https://www.sanity.io/login. With the owner's go-ahead, Claude can then drive the browser; any terms acceptance stays with the owner.

- [ ] **Step 2: Scaffold the Studio package.** Create `studio/package.json`:

```json
{
  "name": "woy-studio",
  "private": true,
  "version": "1.0.0",
  "description": "Sanity Studio for the WOY Consulting website",
  "engines": { "node": ">=22.12" },
  "scripts": {
    "dev": "sanity dev",
    "build": "sanity build",
    "deploy": "sanity deploy",
    "typecheck": "tsc --noEmit",
    "import:dry": "sanity exec scripts/import-current-content.ts --with-user-token -- --dry-run",
    "import": "sanity exec scripts/import-current-content.ts --with-user-token"
  }
}
```

Then install:

```bash
cd studio
npm install sanity@^6.18.0 @sanity/orderable-document-list@^2.0.26 react@^19.2.3 react-dom@^19.2.3 styled-components@^6.1.15
npm install --save-dev typescript@^5.7.3 @types/react@^19.0.7
cd ..
```

- [ ] **Step 3: 👤 OWNER: log the CLI in, then create the project.** The owner completes the browser sign-in:

```bash
cd studio
npx sanity login
npx sanity init --bare -y --project-name "WOY Consulting" --dataset production --visibility public
cd ..
```

- Expected: the last command prints the new project ID (lowercase letters and digits) and `production`.
- If it reports that an organisation is required, create the project at https://www.sanity.io/manage instead: name "WOY Consulting", dataset `production`, public. Copy the project ID from the project page.

- [ ] **Step 4: Allow the local Studio origin**

```bash
cd studio && npx sanity cors add http://localhost:3333 --credentials && cd ..
```

- [ ] **Step 5: Write the shared public constants.** In `lib/sanity/project.mjs`, replace `PROJECT_ID_FROM_STEP_3` with the ID from Step 3. Do the same in `studio/project.ts` in Step 6.

```js
/**
 * Public Sanity identifiers — not secrets. The dataset is public, so reads need no token.
 * Shared by next.config.mjs, the snapshot script and the server client.
 */
export const SANITY_PROJECT_ID = process.env.SANITY_PROJECT_ID || "PROJECT_ID_FROM_STEP_3";
export const SANITY_DATASET = process.env.SANITY_DATASET || "production";
export const SANITY_API_VERSION = "2026-10-01";

if (!/^[a-z0-9]{4,32}$/.test(SANITY_PROJECT_ID)) throw new Error("SANITY_PROJECT_ID must be a Sanity project ID.");
if (!/^[a-z0-9][a-z0-9_-]{0,63}$/.test(SANITY_DATASET)) throw new Error("SANITY_DATASET is not a valid dataset name.");

/**
 * Test-only: CMS_TEST_UNREACHABLE=1 points the API at a closed loopback port to simulate an outage.
 * It can only break reads; it cannot redirect them anywhere else.
 */
export const SANITY_API_HOST = process.env.CMS_TEST_UNREACHABLE === "1" ? "http://127.0.0.1:9" : undefined;
```

- [ ] **Step 6: Write the Studio config files**

`studio/project.ts`:
```ts
// Public identifiers — keep in sync with lib/sanity/project.mjs (tests/cms-config.test.cjs checks this).
export const projectId = "PROJECT_ID_FROM_STEP_3";
export const dataset = "production";
```

`studio/sanity.cli.ts`:
```ts
import { defineCliConfig } from "sanity/cli";
import { dataset, projectId } from "./project";

export default defineCliConfig({
  api: { projectId, dataset },
  studioHost: "woy-consulting",
});
```

`studio/sanity.config.ts`:
```ts
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { dataset, projectId } from "./project";
import { schemaTypes } from "./schemaTypes";
import { structure } from "./structure";

export default defineConfig({
  name: "woy",
  title: "WOY Consulting",
  projectId,
  dataset,
  plugins: [structureTool({ structure })],
  schema: { types: schemaTypes },
});
```

`studio/structure.ts`:
```ts
import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";
import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S, context) =>
  S.list()
    .title("Website content")
    .items([
      orderableDocumentListDeskItem({ type: "caseStudy", title: "Case studies", S, context }),
      orderableDocumentListDeskItem({ type: "person", title: "People", S, context }),
      S.documentTypeListItem("resource").title("Resources"),
    ]);
```

`studio/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "Preserve",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve"
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 7: Write the schema types**

`studio/schemaTypes/documentAttachment.ts`:
```ts
import { defineField, defineType } from "sanity";

export const PUBLIC_UPLOAD_WARNING =
  "Anything uploaded here can be downloaded by anyone, even before you publish. Never upload confidential material.";

export const documentAttachment = defineType({
  name: "documentAttachment",
  title: "Downloadable document",
  type: "object",
  fields: [
    defineField({
      name: "file",
      title: "File",
      type: "file",
      description: PUBLIC_UPLOAD_WARNING,
      options: { accept: ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx" },
    }),
    defineField({
      name: "label",
      title: "Button label",
      type: "string",
      description: "Optional. Leave empty for the standard label.",
      validation: (rule) => rule.max(40),
    }),
  ],
  validation: (rule) =>
    rule.custom((value: { file?: { asset?: unknown }; label?: string } | undefined) =>
      value?.label && !value.file?.asset ? "Upload a file, or clear the button label." : true),
});
```

`studio/schemaTypes/caseStudy.ts`:
```ts
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { defineArrayMember, defineField, defineType } from "sanity";

const older = "older";

export const caseStudy = defineType({
  name: "caseStudy",
  title: "Case study",
  type: "document",
  orderings: [orderRankOrdering],
  fieldsets: [{
    name: older,
    title: "Older case-study page (/case-studies)",
    description: "Optional. Any field left empty reuses the matching main field above.",
    options: { collapsible: true, collapsed: true },
  }],
  fields: [
    orderRankField({ type: "caseStudy" }),
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => [rule.required(), rule.max(110).warning("Long titles may wrap awkwardly.")] }),
    defineField({ name: "slug", title: "Web address", type: "slug", description: "The part after /work/. Changing it changes the page address.", options: { source: "title", maxLength: 80 }, validation: (rule) => rule.required() }),
    defineField({ name: "industry", title: "Industry", type: "string", description: "Also used by the industry filter on Selected work.", validation: (rule) => [rule.required(), rule.max(40).warning()] }),
    defineField({ name: "summary", title: "Summary", type: "text", rows: 3, validation: (rule) => [rule.required(), rule.max(220).warning("Long summaries make the cards uneven.")] }),
    defineField({
      name: "coverText", title: "Cover text", type: "text", rows: 2,
      description: "Two short lines on the coloured cover. Press Enter between the lines.",
      validation: (rule) => [
        rule.required(),
        rule.custom((value?: string) => value && value.split("\n").length > 2 ? "Use at most two lines." : true),
      ],
    }),
    defineField({ name: "strap", title: "Strap line", type: "string", description: "Shown at the bottom of the cover, e.g. “Strategy · Governance · Culture”.", validation: (rule) => [rule.required(), rule.max(70).warning()] }),
    defineField({
      name: "theme", title: "Cover colour", type: "string",
      options: { list: [{ title: "Mist", value: "mist" }, { title: "Navy", value: "navy" }, { title: "Charcoal", value: "charcoal" }, { title: "Silver", value: "silver" }], layout: "radio", direction: "horizontal" },
      initialValue: "mist", validation: (rule) => rule.required(),
    }),
    defineField({ name: "featured", title: "Show on the homepage", type: "boolean", description: "The first four featured case studies, in list order, appear on the homepage.", initialValue: false }),
    defineField({ name: "context", title: "The context", type: "text", rows: 4, validation: (rule) => rule.required() }),
    defineField({ name: "focus", title: "Engagement focus", type: "array", of: [defineArrayMember({ type: "string" })], validation: (rule) => [rule.required().min(1), rule.max(6).warning()] }),
    defineField({
      name: "work", title: "The work", type: "array",
      of: [defineArrayMember({
        name: "workItem", type: "object",
        fields: [
          defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
          defineField({ name: "text", title: "Text", type: "text", rows: 3, validation: (rule) => rule.required() }),
        ],
        preview: { select: { title: "title", subtitle: "text" } },
      })],
      validation: (rule) => [rule.required().min(1), rule.max(6).warning()],
    }),
    defineField({ name: "resultsHeading", title: "Results heading", type: "string", description: "e.g. “What the engagement delivered”.", validation: (rule) => rule.required() }),
    defineField({ name: "results", title: "Results", type: "array", of: [defineArrayMember({ type: "string" })], validation: (rule) => [rule.required().min(1), rule.max(6).warning()] }),
    defineField({ name: "takeaway", title: "Takeaway", type: "text", rows: 2, validation: (rule) => [rule.required(), rule.max(160).warning()] }),
    defineField({ name: "document", title: "Downloadable document (optional)", type: "documentAttachment" }),
    defineField({ name: "legacySlug", title: "Older page address", type: "slug", fieldset: older, description: "The part after /case-studies/. Keep existing values so old links keep working." }),
    defineField({ name: "olderTitle", title: "Title", type: "string", fieldset: older }),
    defineField({ name: "olderIndustry", title: "Industry", type: "string", fieldset: older }),
    defineField({ name: "headline", title: "Headline", type: "text", rows: 2, fieldset: older }),
    defineField({ name: "olderContext", title: "The situation", type: "text", rows: 4, fieldset: older }),
    defineField({ name: "edge", title: "WOY’s role", type: "array", of: [defineArrayMember({ type: "string" })], fieldset: older }),
    defineField({ name: "framework", title: "Engagement design", type: "array", of: [defineArrayMember({ type: "string" })], fieldset: older }),
    defineField({ name: "outcomes", title: "What changed", type: "array", of: [defineArrayMember({ type: "string" })], fieldset: older }),
    defineField({ name: "olderOrder", title: "Position on the older page", type: "number", fieldset: older, validation: (rule) => rule.integer().min(1) }),
  ],
  preview: { select: { title: "title", subtitle: "industry" } },
});
```

`studio/schemaTypes/person.ts`:
```ts
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { defineArrayMember, defineField, defineType } from "sanity";

const older = "older";

export const person = defineType({
  name: "person",
  title: "Person",
  type: "document",
  orderings: [orderRankOrdering],
  fieldsets: [{
    name: older,
    title: "Older practitioners page (/practitioners)",
    description: "Optional. Empty fields reuse the main fields; the highlight box is hidden unless all three highlight fields are filled.",
    options: { collapsible: true, collapsed: true },
  }],
  fields: [
    orderRankField({ type: "person" }),
    defineField({ name: "name", title: "Name", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "slug", title: "Web address", type: "slug", description: "The part after /people/. Changing it changes the page address.", options: { source: "name", maxLength: 80 }, validation: (rule) => rule.required() }),
    defineField({ name: "role", title: "Role", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "group", title: "Group on Leadership & Partners", type: "string",
      options: { list: [{ title: "Our Leadership", value: "leadership" }, { title: "Our Partners", value: "partner" }], layout: "radio" },
      initialValue: "leadership", validation: (rule) => rule.required(),
    }),
    defineField({ name: "portrait", title: "Portrait", type: "image", description: "Click the crop icon and drag the focal point onto the face; profile pages frame the photo around it.", options: { hotspot: true }, validation: (rule) => rule.required() }),
    defineField({ name: "introduction", title: "Introduction", type: "text", rows: 3, validation: (rule) => [rule.required(), rule.max(200).warning()] }),
    defineField({ name: "biography", title: "Biography", type: "array", description: "One entry per paragraph.", of: [defineArrayMember({ type: "text", rows: 4 })], validation: (rule) => rule.required().min(1) }),
    defineField({ name: "experience", title: "Previous organisations", type: "array", of: [defineArrayMember({ type: "string" })] }),
    defineField({ name: "focus", title: "Focus line", type: "string", description: "One line under the name on the Leadership & Partners page.", validation: (rule) => [rule.required(), rule.max(80).warning()] }),
    defineField({ name: "linkedin", title: "LinkedIn profile", type: "url", validation: (rule) => rule.uri({ scheme: ["https"] }) }),
    defineField({ name: "document", title: "Downloadable document (optional)", type: "documentAttachment" }),
    defineField({ name: "olderRole", title: "Role", type: "string", fieldset: older }),
    defineField({ name: "lede", title: "Short introduction", type: "text", rows: 2, fieldset: older }),
    defineField({ name: "olderBio", title: "Biography", type: "array", of: [defineArrayMember({ type: "text", rows: 4 })], fieldset: older }),
    defineField({ name: "expertise", title: "Areas of focus", type: "array", of: [defineArrayMember({ type: "string" })], fieldset: older }),
    defineField({ name: "olderPhoto", title: "Photo", type: "image", options: { hotspot: true }, fieldset: older }),
    defineField({ name: "highlightLabel", title: "Highlight: label", type: "string", fieldset: older }),
    defineField({ name: "highlightDetail", title: "Highlight: detail", type: "string", fieldset: older }),
    defineField({ name: "highlightBackground", title: "Highlight: background line", type: "string", fieldset: older }),
  ],
  preview: { select: { title: "name", subtitle: "role", media: "portrait" } },
});
```

`studio/schemaTypes/resource.ts`:
```ts
import { defineField, defineType } from "sanity";
import { PUBLIC_UPLOAD_WARNING } from "./documentAttachment";

export const resource = defineType({
  name: "resource",
  title: "Resource",
  type: "document",
  orderings: [{ title: "Newest first", name: "dateDesc", by: [{ field: "date", direction: "desc" }] }],
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => [rule.required(), rule.max(110).warning()] }),
    defineField({ name: "description", title: "Short description", type: "text", rows: 3, validation: (rule) => rule.max(240) }),
    defineField({
      name: "category", title: "Category", type: "string",
      options: { list: ["Brochure", "Whitepaper", "Report", "Other"], layout: "radio", direction: "horizontal" },
      initialValue: "Brochure", validation: (rule) => rule.required(),
    }),
    defineField({ name: "file", title: "File", type: "file", description: PUBLIC_UPLOAD_WARNING, options: { accept: ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx" }, validation: (rule) => rule.required() }),
    defineField({ name: "date", title: "Date", type: "date", initialValue: () => new Date().toISOString().slice(0, 10), validation: (rule) => rule.required() }),
    defineField({ name: "coverImage", title: "Cover image (optional)", type: "image", options: { hotspot: true } }),
  ],
  preview: {
    select: { title: "title", category: "category", date: "date", media: "coverImage" },
    prepare: ({ title, category, date, media }) => ({ title, subtitle: [category, date].filter(Boolean).join(" · "), media }),
  },
});
```

`studio/schemaTypes/index.ts`:
```ts
import { caseStudy } from "./caseStudy";
import { documentAttachment } from "./documentAttachment";
import { person } from "./person";
import { resource } from "./resource";

export const schemaTypes = [documentAttachment, caseStudy, person, resource];
```

- [ ] **Step 8: Keep the Studio out of the site's tooling and ignore its build output**

`tsconfig.json`: change `"exclude"` to:
```json
"exclude": ["node_modules", "_legacy", "reports", "studio"]
```

`eslint.config.mjs`: change the `globalIgnores` line to:
```js
globalIgnores([".next/**", "out/**", "build/**", "_legacy/**", "next-env.d.ts", "reports/**", "studio/**"]),
```

Append to `.gitignore`:
```gitignore

# Sanity Studio (separate package) and the generated CMS snapshot
/studio/node_modules
/studio/dist
/studio/.sanity
/lib/cms/snapshot.generated.json
```

- [ ] **Step 9: Write the failing config test**, `tests/cms-config.test.cjs`:

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("site and Studio point at the same public Sanity project and dataset", () => {
  const site = read("lib/sanity/project.mjs");
  const studio = read("studio/project.ts");
  const siteId = /SANITY_PROJECT_ID \|\| "([a-z0-9]+)"/.exec(site)?.[1];
  const studioId = /projectId = "([a-z0-9]+)"/.exec(studio)?.[1];
  assert.ok(siteId && siteId !== "PROJECT_ID_FROM_STEP_3", "Replace the project ID placeholder");
  assert.equal(studioId, siteId);
  assert.match(studio, /dataset = "production"/);
  assert.match(site, /SANITY_DATASET \|\| "production"/);
});

test("the outage simulation can only target a closed loopback port", () => {
  assert.match(read("lib/sanity/project.mjs"), /CMS_TEST_UNREACHABLE === "1" \? "http:\/\/127\.0\.0\.1:9" : undefined/);
});
```

- [ ] **Step 10: Run the tests, the Studio checks and a local Studio**

```bash
node --test tests/cms-config.test.cjs
cd studio && npx tsc --noEmit && npx sanity schema validate && cd ..
```

- Expected: both tests pass, `tsc` prints nothing, and the schema validation reports no errors.
- Then run `cd studio && npm run dev` and open http://localhost:3333. You should see "Case studies", "People" and "Resources" in the sidebar, and the "Older …" fieldsets should be collapsed. Stop the server.

- [ ] **Step 11: Commit**

```bash
git add studio/package.json studio/package-lock.json studio/tsconfig.json studio/project.ts studio/sanity.cli.ts studio/sanity.config.ts studio/structure.ts studio/schemaTypes lib/sanity/project.mjs tests/cms-config.test.cjs tsconfig.json eslint.config.mjs .gitignore
git commit -m "feat(cms): add Sanity Studio with case study, person and resource types

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Pure asset helpers and the shared test loader

**Files:**
- Create: `tests/helpers/load-ts.cjs`, `lib/cms/raw.ts`, `lib/cms/types.ts`, `lib/cms/assets.ts`, `tests/cms-assets.test.cjs`

**Interfaces:**
- Produces:
  - `loadTs(file: string, imports?: Record<string, unknown>)` (tests only)
  - `cmsAssetPath(url: string): string`
  - `hotspotFromObjectPosition(position: string): { x: number; y: number }`
  - `objectPositionFromHotspot(hotspot?: { x: number; y: number } | null): string`
  - `toFileDownload(file: NonNullable<RawFile>, label: string): CmsDownload`
  - `toDownload(attachment: RawAttachment | null | undefined, fallbackLabel: string): CmsDownload | undefined`
  - `formatFileSize(bytes: number): string`
  - The types listed below.

- [ ] **Step 1: Write `tests/helpers/load-ts.cjs`**

```js
// Compiles a TypeScript module and loads it in THIS realm, so assert.deepStrictEqual and
// prototypes behave normally. Pass every relative or aliased import in `imports`.
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

const root = path.resolve(__dirname, "..", "..");

function loadTs(file, imports = {}) {
  const filename = path.join(root, file);
  const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    fileName: filename,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const compiled = new Module(filename, module);
  compiled.filename = filename;
  compiled.paths = Module._nodeModulePaths(path.dirname(filename));
  const requireOriginal = compiled.require.bind(compiled);
  compiled.require = (specifier) => (Object.hasOwn(imports, specifier) ? imports[specifier] : requireOriginal(specifier));
  compiled._compile(output, filename);
  return compiled.exports;
}

module.exports = { loadTs, root };
```

- [ ] **Step 2: Write the types.** First `lib/cms/raw.ts`:

```ts
/** Shapes returned by the GROQ queries in lib/cms/queries.mjs. Sanity returns null for missing values. */
export type RawFile = { url: string; originalFilename: string | null; extension: string | null; size: number | null } | null;
export type RawImage = {
  url: string;
  originalFilename: string | null;
  width: number;
  height: number;
  hotspot?: { x: number; y: number } | null;
} | null;
export type RawAttachment = { label?: string | null; file?: RawFile } | null;

export type RawCaseStudy = {
  slug: string; title: string; industry: string; summary: string; coverText: string; strap: string; theme: string;
  featured?: boolean | null; context: string; focus?: string[] | null; work?: { title: string; text: string }[] | null;
  resultsHeading: string; results?: string[] | null; takeaway: string; document?: RawAttachment;
  legacySlug?: string | null; olderTitle?: string | null; olderIndustry?: string | null; headline?: string | null;
  olderContext?: string | null; edge?: string[] | null; framework?: string[] | null; outcomes?: string[] | null;
  olderOrder?: number | null;
};

export type RawPerson = {
  slug: string; name: string; role: string; group?: string | null; portrait: NonNullable<RawImage>;
  introduction: string; biography?: string[] | null; experience?: string[] | null; focus: string;
  linkedin?: string | null; document?: RawAttachment;
  olderRole?: string | null; lede?: string | null; olderBio?: string[] | null; expertise?: string[] | null;
  olderPhoto?: RawImage; highlightLabel?: string | null; highlightDetail?: string | null; highlightBackground?: string | null;
};

export type RawResource = {
  id: string; title: string; description?: string | null; category?: string | null; date: string;
  file: RawFile; cover?: RawImage;
};
```

Then `lib/cms/types.ts`:

```ts
/** Shapes the components consume. They mirror the pre-CMS TypeScript data exactly, plus optional downloads. */
export type CmsDownload = { href: string; label: string; fileName: string; extension: string; size: number };

export type Engagement = {
  slug: string; industry: string; title: string; cover: string; strap: string; theme: string; summary: string;
  context: string; focus: string[]; work: { title: string; text: string }[]; resultTitle: string; results: string[];
  takeaway: string; featured?: boolean; download?: CmsDownload;
};

export type CaseStudyBrief = {
  slug: string; industry: string; title: string; headline: string; context: string;
  edge: string[]; framework: string[]; outcomes: string[]; download?: CmsDownload;
};

export type PersonProfile = {
  slug: string; name: string; role: string; portrait: string; imagePosition: string;
  introduction: string; biography: string[]; experience: string[]; download?: CmsDownload;
};

export type PersonListing = { slug: string; name: string; role: string; category: "leadership" | "partner"; focus: string; image: string };

export type PractitionerHighlight = { label: string; detail: string; background: string };

export type Practitioner = {
  slug: string; name: string; initials: string; role: string; lede: string; bio: string[]; expertise: string[];
  linkedin: string | null; photo: string | null; highlight?: PractitionerHighlight;
};

export type Resource = {
  id: string; title: string; description: string; category: string; date: string; download: CmsDownload;
  cover?: { src: string; width: number; height: number };
};
```

- [ ] **Step 3: Write the failing tests**, `tests/cms-assets.test.cjs`:

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const { loadTs } = require("./helpers/load-ts.cjs");

const assets = loadTs("lib/cms/assets.ts");
const image = "https://cdn.sanity.io/images/abc123xy/production/6f1e2d-1200x800.jpg";
const file = "https://cdn.sanity.io/files/abc123xy/production/9a8b7c.pdf";

test("Sanity asset URLs become same-origin /cms-assets paths", () => {
  assert.equal(assets.cmsAssetPath(image), "/cms-assets/images/6f1e2d-1200x800.jpg");
  assert.equal(assets.cmsAssetPath(file), "/cms-assets/files/9a8b7c.pdf");
  for (const hostile of ["https://evil.test/images/a/b/c.jpg", "http://cdn.sanity.io/images/a/production/c.jpg", "https://cdn.sanity.io/images/abc/production/../x.jpg", "https://cdn.sanity.io/images/abc/production/a/b.jpg", "/cms-assets/images/x.jpg"]) {
    assert.throws(() => assets.cmsAssetPath(hostile), /Unexpected Sanity asset URL/, hostile);
  }
});

test("object-position and hotspots round-trip without floating-point noise", () => {
  for (const position of ["50% 26%", "52% 15%", "48% 8%", "50% 0%", "100% 100%"]) {
    assert.equal(assets.objectPositionFromHotspot(assets.hotspotFromObjectPosition(position)), position);
  }
  assert.deepEqual(assets.hotspotFromObjectPosition("50% 26%"), { x: 0.5, y: 0.26 });
  assert.equal(assets.objectPositionFromHotspot(null), "50% 50%");
  assert.throws(() => assets.hotspotFromObjectPosition("center top"), /Unsupported object-position/);
});

test("downloads stay same-origin, encode awkward names and survive missing metadata", () => {
  const download = assets.toFileDownload({ url: file, originalFilename: "WOY Brochure – 2026 (final).pdf", extension: "PDF", size: 1_572_864 }, "Download");
  assert.equal(download.href, "/cms-assets/files/9a8b7c.pdf?dl=WOY%20Brochure%20%E2%80%93%202026%20(final).pdf");
  assert.deepEqual({ ...download, href: undefined }, { href: undefined, label: "Download", fileName: "WOY Brochure – 2026 (final).pdf", extension: "pdf", size: 1_572_864 });
  const bare = assets.toFileDownload({ url: file, originalFilename: null, extension: null, size: null }, "Download");
  assert.equal(bare.fileName, "document");
  assert.equal(bare.extension, "file");
  assert.equal(bare.size, 0);
  assert.equal(assets.toDownload(null, "x"), undefined);
  assert.equal(assets.toDownload({ label: "Read", file: null }, "x"), undefined);
  assert.equal(assets.toDownload({ label: "  ", file: { url: file, originalFilename: "a.pdf", extension: "pdf", size: 10 } }, "Fallback").label, "Fallback");
});

test("file sizes read naturally and never show zero or NaN", () => {
  assert.equal(assets.formatFileSize(0), "");
  assert.equal(assets.formatFileSize(Number.NaN), "");
  assert.equal(assets.formatFileSize(-5), "");
  assert.equal(assets.formatFileSize(900), "900 B");
  assert.equal(assets.formatFileSize(2048), "2 KB");
  assert.equal(assets.formatFileSize(1_572_864), "1.5 MB");
});
```

- [ ] **Step 4: Run them to see them fail**

```bash
node --test tests/cms-assets.test.cjs
```
Expected: FAIL with `ENOENT … lib/cms/assets.ts`.

- [ ] **Step 5: Implement `lib/cms/assets.ts`**

```ts
import type { RawAttachment, RawFile } from "./raw";
import type { CmsDownload } from "./types";

const CDN_ASSET = /^https:\/\/cdn\.sanity\.io\/(images|files)\/[a-z0-9]+\/[a-z0-9][a-z0-9_-]*\/([A-Za-z0-9_-]+(?:\.[A-Za-z0-9]+)?)$/;

/** Same-origin path served by the /cms-assets rewrite in next.config.mjs (this project and dataset only). */
export function cmsAssetPath(url: string): string {
  const match = CDN_ASSET.exec(url);
  if (!match) throw new Error(`Unexpected Sanity asset URL: ${url}`);
  return `/cms-assets/${match[1]}/${match[2]}`;
}

/** Sanity hotspots store fractions; CSS object-position uses percentages. */
export function hotspotFromObjectPosition(position: string): { x: number; y: number } {
  const match = /^(\d+(?:\.\d+)?)% (\d+(?:\.\d+)?)%$/.exec(position.trim());
  if (!match) throw new Error(`Unsupported object-position: ${position}`);
  return { x: Number(match[1]) / 100, y: Number(match[2]) / 100 };
}

const percent = (fraction: number) => `${Math.round(fraction * 1_000_000) / 10_000}%`;

export function objectPositionFromHotspot(hotspot?: { x: number; y: number } | null): string {
  return hotspot ? `${percent(hotspot.x)} ${percent(hotspot.y)}` : "50% 50%";
}

export function toFileDownload(file: NonNullable<RawFile>, label: string): CmsDownload {
  const extension = (file.extension ?? "").toLowerCase();
  const fileName = file.originalFilename?.trim() || "document";
  return {
    href: `${cmsAssetPath(file.url)}?dl=${encodeURIComponent(fileName)}`,
    label,
    fileName,
    extension: /^[a-z0-9]{1,8}$/.test(extension) ? extension : "file",
    size: Math.max(0, file.size ?? 0),
  };
}

export function toDownload(attachment: RawAttachment | undefined, fallbackLabel: string): CmsDownload | undefined {
  if (!attachment?.file?.url) return undefined;
  return toFileDownload(attachment.file, attachment.label?.trim() || fallbackLabel);
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
```

- [ ] **Step 6: Run the tests to see them pass**

```bash
node --test tests/cms-assets.test.cjs
```
Expected: 4 passing.

- [ ] **Step 7: Commit**

```bash
git add tests/helpers/load-ts.cjs tests/cms-assets.test.cjs lib/cms/raw.ts lib/cms/types.ts lib/cms/assets.ts
git commit -m "feat(cms): add asset, hotspot and download helpers

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Import today's case studies and people into Sanity

**Files:**
- Modify:
  - `lib/content.ts`: add an exported `practitionerHighlights`
  - `app/practitioners/page.tsx`: use `practitionerHighlights`
  - `lib/recreation-content.ts`: export `peopleListingDetails`
- Create: `studio/scripts/import-current-content.ts`

**Interfaces:**
- Consumes: `hotspotFromObjectPosition` (Task 2), and the schemas from Task 1.
- Produces: published documents with these IDs:
  - `caseStudy-education-transformation`, `caseStudy-insurance-leadership`, `caseStudy-consultative-selling`, `caseStudy-automotive-alignment`, `caseStudy-entrepreneurial-mindset`, `caseStudy-medical-technology-leadership`
  - `person-vipin-tuteja`, `person-sandeep-bidani`, `person-kannan-swaminathan`

- [ ] **Step 1: Move the practitioner highlights into `lib/content.ts`** so the import and parity checks can read them. In `app/practitioners/page.tsx`, delete the `experience` record (lines 16–32). Append to `lib/content.ts`, after `practitioners`:

```ts
/** The highlight box on /practitioners. Migrated to Sanity in batch 1, then removed from this file. */
export const practitionerHighlights: Record<string, { label: string; detail: string; background: string }> = {
  "vipin-tuteja": {
    label: "Business leadership",
    detail: "Strategy, execution and P&L ownership",
    background: "Xerox · American Express · Ricoh · Samsung",
  },
  "sandeep-bidani": {
    label: "HR & culture",
    detail: "Organisation change across global teams",
    background: "KPMG · American Express · IBM",
  },
  "kannan-swaminathan": {
    label: "Executive coaching",
    detail: "Coaching for CXOs and senior leaders",
    background: "ICF Professional Certified Coach",
  },
};
```

In `app/practitioners/page.tsx`:
- change the import to `import { practitioners, practitionerHighlights } from "@/lib/content";`
- change `const proof = experience[p.slug];` to `const proof = practitionerHighlights[p.slug];`

In `lib/recreation-content.ts`, change `const peopleListingDetails` to `export const peopleListingDetails`.

Then check nothing else changed:

```bash
npm run typecheck && npm test
```
Expected: both pass. This is a pure move.

- [ ] **Step 2: Write `studio/scripts/import-current-content.ts`**

```ts
/**
 * One-off import of the batch 1 content that lives in lib/*.ts today.
 * Run from studio/: `npm run import:dry` (prints, writes nothing) then `npm run import`.
 * Fixed IDs (hyphens — dotted IDs are private in public datasets) make re-runs replace, not duplicate.
 */
import { createReadStream, existsSync } from "node:fs";
import path from "node:path";
import { getCliClient } from "sanity/cli";
import { caseStudies, practitionerHighlights, practitioners } from "../../lib/content";
import { cases, peopleListingDetails } from "../../lib/recreation-content";
import { peopleProfiles } from "../../lib/people-profiles";
import { hotspotFromObjectPosition } from "../../lib/cms/assets";

const dryRun = process.argv.includes("--dry-run");
const client = getCliClient({ apiVersion: "2026-10-01" });
const publicDir = path.resolve(process.cwd(), "..", "public");

/** Older /case-studies slugs for each current /work slug. */
const legacyCaseSlugs: Record<string, string> = {
  "insurance-leadership": "insurance-senior-sales-leadership",
  "education-transformation": "education-institution-transformation",
  "consultative-selling": "it-ites-consultative-selling",
  "entrepreneurial-mindset": "financial-services-entrepreneurial-mindset",
  "automotive-alignment": "automotive-leadership-assimilation",
  "medical-technology-leadership": "medical-technology-strategic-thinking",
};

/** LexoRank-compatible ranks ("0|<base36>:") understood by @sanity/orderable-document-list. */
const rank = (index: number) => `0|${(100000 + index * 1000).toString(36)}:`;

const uploads = new Map<string, string>();
async function uploadImage(publicPath: string): Promise<string> {
  const file = path.join(publicDir, publicPath.replace(/^\//, ""));
  if (!existsSync(file)) throw new Error(`Missing image: ${file}`);
  const cached = uploads.get(file);
  if (cached) return cached;
  const id = dryRun
    ? `image-dry-run-${path.basename(file)}`
    : (await client.assets.upload("image", createReadStream(file), { filename: path.basename(file) }))._id;
  uploads.set(file, id);
  return id;
}

function image(assetId: string, objectPosition?: string) {
  return {
    _type: "image",
    asset: { _type: "reference", _ref: assetId },
    ...(objectPosition ? { hotspot: { _type: "sanity.imageHotspot", ...hotspotFromObjectPosition(objectPosition), width: 0.4, height: 0.4 } } : {}),
  };
}

const slug = (current: string) => ({ _type: "slug", current });

async function main() {
  const legacy = new Map(caseStudies.map((study, index) => [study.slug, { study, index }]));
  const usedLegacy = new Set<string>();
  const caseDocs = cases.map((item, index) => {
    const legacySlug = legacyCaseSlugs[item.slug];
    const older = legacySlug ? legacy.get(legacySlug) : undefined;
    if (!older) throw new Error(`No older case study mapped for /work/${item.slug}`);
    usedLegacy.add(older.study.slug);
    return {
      _id: `caseStudy-${item.slug}`, _type: "caseStudy", orderRank: rank(index),
      title: item.title, slug: slug(item.slug), industry: item.industry, summary: item.summary,
      coverText: item.cover, strap: item.strap, theme: item.theme, featured: Boolean(item.featured),
      context: item.context, focus: item.focus,
      work: item.work.map((step, stepIndex) => ({ _key: `work-${stepIndex}`, _type: "workItem", title: step.title, text: step.text })),
      resultsHeading: item.resultTitle, results: item.results, takeaway: item.takeaway,
      legacySlug: slug(older.study.slug), olderTitle: older.study.title, olderIndustry: older.study.industry,
      headline: older.study.headline, olderContext: older.study.context, edge: older.study.edge,
      framework: older.study.framework, outcomes: older.study.outcomes, olderOrder: older.index + 1,
    };
  });
  if (usedLegacy.size !== caseStudies.length) throw new Error("Every older case study must map to exactly one engagement.");

  const practitionerBySlug = new Map(practitioners.map((person) => [person.slug, person]));
  const personDocs = [];
  for (const [index, profile] of peopleProfiles.entries()) {
    const practitioner = practitionerBySlug.get(profile.slug);
    const listing = peopleListingDetails[profile.slug];
    const highlight = practitionerHighlights[profile.slug];
    if (!practitioner || !listing || !highlight) throw new Error(`Incomplete source data for ${profile.slug}`);
    if (path.basename(profile.portrait) !== listing.image) throw new Error(`Listing and profile images differ for ${profile.slug}`);
    const olderPhoto = practitioner.photo && practitioner.photo !== profile.portrait ? image(await uploadImage(practitioner.photo)) : undefined;
    personDocs.push({
      _id: `person-${profile.slug}`, _type: "person", orderRank: rank(index),
      name: profile.name, slug: slug(profile.slug), role: profile.role, group: listing.category,
      portrait: image(await uploadImage(profile.portrait), profile.imagePosition),
      introduction: profile.introduction, biography: profile.biography, experience: profile.experience, focus: listing.focus,
      ...(practitioner.linkedin ? { linkedin: practitioner.linkedin } : {}),
      olderRole: practitioner.role, lede: practitioner.lede, olderBio: practitioner.bio, expertise: practitioner.expertise,
      ...(olderPhoto ? { olderPhoto } : {}),
      highlightLabel: highlight.label, highlightDetail: highlight.detail, highlightBackground: highlight.background,
    });
  }

  const documents = [...caseDocs, ...personDocs];
  if (dryRun) {
    for (const doc of documents) console.log(`would write ${doc._id}`);
    console.log(`Dry run: ${documents.length} documents and ${uploads.size} images; nothing was written.`);
    return;
  }
  const transaction = client.transaction();
  for (const doc of documents) transaction.createOrReplace(doc);
  await transaction.commit();
  console.log(`Imported ${documents.length} documents and ${uploads.size} images.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
```

- [ ] **Step 3: Type-check and dry-run the import**

```bash
cd studio && npx tsc --noEmit && npm run import:dry && cd ..
```

Expected:
- 9 lines of the form `would write …` (6 `caseStudy-…` and 3 `person-…`)
- then `Dry run: 9 documents and 5 images; nothing was written.` The 5 images are 3 portraits plus the 2 older `/practitioners/*.webp` photos.

- [ ] **Step 4: Run the import**

```bash
cd studio && npm run import && cd ..
```

- Expected: `Imported 9 documents and 5 images.`
- Run it again. Expected: the same message, and the Studio still shows 6 case studies and 3 people, so re-running replaces rather than duplicates.
- In `npm run dev` (Studio), open "Case studies". You should see Education first, as on `/work`, and the older fieldset filled in.

- [ ] **Step 5: Commit**

```bash
git add lib/content.ts lib/recreation-content.ts app/practitioners/page.tsx studio/scripts/import-current-content.ts
git commit -m "feat(cms): import current case studies and people into Sanity

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Site connection: client, cached queries, snapshot and fallback

**Files:**
- Create: `lib/sanity/client.ts`, `lib/cms/queries.mjs`, `lib/cms/fallback.ts`, `lib/cms/source.ts`, `scripts/cms-snapshot.mjs`, `tests/cms-fallback.test.cjs`, `tests/cms-snapshot.test.cjs`
- Modify: `package.json`, `next.config.mjs`, `proxy.ts`, `.env.example`

**Interfaces:**
- Consumes: `lib/sanity/project.mjs` (Task 1).
- Produces:
  - `queries` (`{ caseStudies, people, resources }`), from `lib/cms/queries.mjs`
  - `shouldUseSnapshot(error: unknown): boolean`
  - `loadQuery<T>(name: "caseStudies" | "people" | "resources"): Promise<T>`
  - `CMS_CACHE_TAG = "sanity"`
  - `npm run cms:snapshot`, which writes `lib/cms/snapshot.generated.json` as `{ generatedAt: string; results: Record<QueryName, unknown> }`

- [ ] **Step 1: Install the site dependencies**

```bash
npm install @sanity/client@^8.9.0 @sanity/webhook@^4.0.4
```

- [ ] **Step 2: Write `lib/cms/queries.mjs`**

```js
/**
 * GROQ for every CMS read. Shared by lib/cms/source.ts and scripts/cms-snapshot.mjs.
 * Lists are fetched whole (the site has a handful of entries) so pages filter in memory and the
 * snapshot needs no parameters.
 */
const file = `{ "url": asset->url, "originalFilename": asset->originalFilename, "extension": asset->extension, "size": asset->size }`;
const image = `{ "url": asset->url, "originalFilename": asset->originalFilename, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height, hotspot }`;
const attachment = `"document": document{ label, "file": file${file} }`;

export const queries = {
  caseStudies: `*[_type == "caseStudy" && defined(slug.current)] | order(orderRank asc) {
    "slug": slug.current, title, industry, summary, coverText, strap, theme, featured, context, focus,
    work[]{ title, text }, resultsHeading, results, takeaway, ${attachment},
    "legacySlug": legacySlug.current, olderTitle, olderIndustry, headline, olderContext, edge, framework, outcomes, olderOrder
  }`,
  people: `*[_type == "person" && defined(slug.current) && defined(portrait.asset)] | order(orderRank asc) {
    "slug": slug.current, name, role, group, "portrait": portrait${image}, introduction, biography, experience, focus, linkedin,
    ${attachment}, olderRole, lede, olderBio, expertise, "olderPhoto": olderPhoto${image},
    highlightLabel, highlightDetail, highlightBackground
  }`,
  resources: `*[_type == "resource" && defined(file.asset)] | order(date desc, title asc) {
    "id": _id, title, description, category, date, "file": file${file}, "cover": coverImage${image}
  }`,
};
```

- [ ] **Step 3: Write the failing fallback tests**, `tests/cms-fallback.test.cjs`:

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const { loadTs } = require("./helpers/load-ts.cjs");

const { shouldUseSnapshot } = loadTs("lib/cms/fallback.ts");
const failure = (props, message = "request failed") => Object.assign(new Error(message), props);

test("connection failures and temporary Sanity errors fall back to the build snapshot", () => {
  const cases = [
    failure({ code: "ECONNREFUSED" }), failure({ code: "ENOTFOUND" }), failure({ code: "EAI_AGAIN" }),
    failure({ code: "ETIMEDOUT" }), failure({ code: "ECONNRESET" }), failure({ code: "UND_ERR_CONNECT_TIMEOUT" }),
    Object.assign(new Error("timed out"), { name: "TimeoutError" }), Object.assign(new Error("aborted"), { name: "AbortError" }),
    failure({ statusCode: 500 }), failure({ statusCode: 502 }), failure({ statusCode: 503 }), failure({ statusCode: 429 }),
    new TypeError("fetch failed", { cause: failure({ code: "ECONNREFUSED" }) }),
  ];
  for (const error of cases) assert.equal(shouldUseSnapshot(error), true, `${error.name} ${error.code ?? error.statusCode ?? ""}`);
});

test("query mistakes, our own bugs and non-errors surface instead of hiding behind old content", () => {
  const cases = [
    failure({ statusCode: 400 }), failure({ statusCode: 401 }), failure({ statusCode: 403 }), failure({ statusCode: 404 }),
    new TypeError("Cannot read properties of undefined (reading 'url')"), new Error("Person has no portrait"),
    new TypeError("fetch failed", { cause: new Error("certificate has expired") }),
    "ECONNREFUSED", null, undefined, { code: "ECONNREFUSED" }, 503,
  ];
  for (const error of cases) assert.equal(shouldUseSnapshot(error), false, String(error));
});
```

- [ ] **Step 4: Create `lib/cms/fallback.ts` with the signature only, then run the tests to see them fail**

```ts
/**
 * Decides whether a failed Sanity read should be answered from the build snapshot.
 *  - true:  Sanity could not be reached or is temporarily failing — network errors, timeouts, HTTP 429 or 5xx.
 *  - false: anything else — an invalid query (HTTP 4xx), a bug in our mapping code, or a non-Error value.
 * Tests load this module in their own realm: use duck-typing, never `instanceof Error`.
 */
export function shouldUseSnapshot(error: unknown): boolean {
  void error;
  throw new Error("Not implemented yet");
}
```

```bash
node --test tests/cms-fallback.test.cjs
```
Expected: FAIL with `Not implemented yet`.

- [ ] **Step 5: 👤 OWNER CONTRIBUTION: implement `shouldUseSnapshot`, about 5–10 lines.**
  - **Ask the owner to write the body.** The tests above define the contract.
  - **Tradeoff to explain:** too broad, and real bugs ship silently behind stale content. Too narrow, and visitors see the error page during a brief Sanity outage.
  - **Hints:**
    - `@sanity/client` HTTP errors carry a numeric `statusCode`.
    - Node network errors carry a string `code`.
    - `fetch` wraps the real reason in `cause`.
  - If the owner declines, use this reference implementation:

```ts
const NETWORK_CODES = new Set(["ECONNREFUSED", "ECONNRESET", "ENOTFOUND", "EAI_AGAIN", "ETIMEDOUT", "ESOCKETTIMEDOUT", "EHOSTUNREACH", "ENETUNREACH", "UND_ERR_CONNECT_TIMEOUT", "UND_ERR_SOCKET"]);

export function shouldUseSnapshot(error: unknown): boolean {
  if (typeof error !== "object" || error === null || typeof (error as { message?: unknown }).message !== "string") return false;
  const { statusCode, code, name, cause } = error as { statusCode?: unknown; code?: unknown; name?: unknown; cause?: unknown };
  if (typeof statusCode === "number") return statusCode === 429 || statusCode >= 500;
  if (typeof code === "string" && NETWORK_CODES.has(code)) return true;
  if (name === "TimeoutError" || name === "AbortError") return true;
  return cause !== undefined && cause !== error && shouldUseSnapshot(cause);
}
```

```bash
node --test tests/cms-fallback.test.cjs
```
Expected: 2 passing.

- [ ] **Step 6: Write `lib/sanity/client.ts`**

```ts
import "server-only";
import { createClient } from "@sanity/client";
import { SANITY_API_HOST, SANITY_API_VERSION, SANITY_DATASET, SANITY_PROJECT_ID } from "./project.mjs";

/** Published content only. Visitor traffic is absorbed by the Next.js data cache, not Sanity's CDN. */
export const sanityClient = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: SANITY_API_VERSION,
  useCdn: false,
  perspective: "published",
  timeout: 10_000,
  maxRetries: 2,
  ...(SANITY_API_HOST ? { apiHost: SANITY_API_HOST, useProjectHostname: false } : {}),
});
```

- [ ] **Step 7: Write `lib/cms/source.ts`**

```ts
import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import { unstable_cache } from "next/cache";
import { sanityClient } from "@/lib/sanity/client";
import { shouldUseSnapshot } from "./fallback";
import { queries } from "./queries.mjs";

export type QueryName = keyof typeof queries;
export const CMS_CACHE_TAG = "sanity";
export const CMS_REVALIDATE_SECONDS = 300;

type Snapshot = { generatedAt: string; results: Record<QueryName, unknown> };
let snapshot: Snapshot | undefined;

/** Written by scripts/cms-snapshot.mjs before every build; traced into the deployment by next.config.mjs. */
function readSnapshot(): Snapshot {
  snapshot ??= JSON.parse(readFileSync(path.join(process.cwd(), "lib", "cms", "snapshot.generated.json"), "utf8")) as Snapshot;
  return snapshot;
}

/** Cached across requests and deployments; the Sanity webhook expires the "sanity" tag on publish. */
export async function loadQuery<T>(name: QueryName): Promise<T> {
  const cached = unstable_cache(() => sanityClient.fetch<T>(queries[name]), ["cms", name], {
    tags: [CMS_CACHE_TAG],
    revalidate: CMS_REVALIDATE_SECONDS,
  });
  try {
    return await cached();
  } catch (error) {
    if (!shouldUseSnapshot(error)) throw error;
    const backup = readSnapshot();
    console.warn(`[cms] Sanity unreachable; serving "${name}" from the build snapshot of ${backup.generatedAt}.`);
    return backup.results[name] as T;
  }
}
```

- [ ] **Step 8: Write the failing snapshot tests**, `tests/cms-snapshot.test.cjs`:

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
function runSnapshot(extraArgs) {
  const output = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "woy-snapshot-")), "snapshot.json");
  const result = spawnSync(process.execPath, ["scripts/cms-snapshot.mjs", "--output", output, ...extraArgs], {
    cwd: root, encoding: "utf8", timeout: 90_000, env: { ...process.env, CMS_TEST_UNREACHABLE: "1" },
  });
  return { ...result, output };
}

test("a build stops when the snapshot cannot be generated, so the live deployment stays up", () => {
  const result = runSnapshot([]);
  assert.equal(result.status, 1, result.stderr);
  assert.match(result.stderr, /CMS snapshot failed/);
  assert.equal(fs.existsSync(result.output), false);
});

test("local development starts offline without writing a snapshot", () => {
  const result = runSnapshot(["--allow-offline"]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stderr, /CMS snapshot skipped/);
  assert.equal(fs.existsSync(result.output), false);
});
```

```bash
node --test tests/cms-snapshot.test.cjs
```
Expected: FAIL. `scripts/cms-snapshot.mjs` doesn't exist yet.

- [ ] **Step 9: Write `scripts/cms-snapshot.mjs`**

```js
// Saves every published CMS query result into the deployment as a last-resort backup.
// `npm run build` runs this first and FAILS on error, so a deploy never ships without content and
// the current deployment stays live. `--allow-offline` (used by `npm run dev`) only warns.
import { mkdirSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@sanity/client";
import { SANITY_API_HOST, SANITY_API_VERSION, SANITY_DATASET, SANITY_PROJECT_ID } from "../lib/sanity/project.mjs";
import { queries } from "../lib/cms/queries.mjs";

const args = process.argv.slice(2);
const allowOffline = args.includes("--allow-offline");
const outputArg = args.indexOf("--output");
const output = path.resolve(outputArg >= 0 ? args[outputArg + 1] : "lib/cms/snapshot.generated.json");

const client = createClient({
  projectId: SANITY_PROJECT_ID, dataset: SANITY_DATASET, apiVersion: SANITY_API_VERSION,
  useCdn: false, perspective: "published", timeout: 15_000, maxRetries: 2,
  ...(SANITY_API_HOST ? { apiHost: SANITY_API_HOST, useProjectHostname: false } : {}),
});

try {
  const results = {};
  for (const [name, query] of Object.entries(queries)) results[name] = await client.fetch(query);
  mkdirSync(path.dirname(output), { recursive: true });
  const temporary = `${output}.${process.pid}.tmp`;
  writeFileSync(temporary, `${JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2)}\n`);
  renameSync(temporary, output);
  console.log(`CMS snapshot written to ${path.relative(process.cwd(), output)} (${Object.keys(results).join(", ")}).`);
} catch (error) {
  const reason = error && typeof error.message === "string" ? error.message : String(error);
  if (allowOffline) {
    console.warn(`CMS snapshot skipped (Sanity unreachable): ${reason}`);
  } else {
    console.error(`CMS snapshot failed; stopping so the current deployment stays live. ${reason}`);
    process.exitCode = 1;
  }
}
```

- [ ] **Step 10: Wire up the scripts, Next.js config, proxy matcher and env example**

`package.json` `"scripts"`: change `"dev"` and add the CMS scripts:
```json
"predev": "node scripts/cms-snapshot.mjs --allow-offline",
"dev": "next dev -p 5173",
"prebuild": "node scripts/cms-snapshot.mjs",
"cms:snapshot": "node scripts/cms-snapshot.mjs",
```

`next.config.mjs`:

1. Add this import after the existing import:
```js
import { SANITY_DATASET, SANITY_PROJECT_ID } from "./lib/sanity/project.mjs";
```
2. Replace the `images` line with:
```js
  images: {
    formats: ["image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io", pathname: `/images/${SANITY_PROJECT_ID}/${SANITY_DATASET}/**` }],
  },
  // The build-time CMS snapshot is read with fs at runtime; ship it with every server function.
  outputFileTracingIncludes: { "/**": ["./lib/cms/snapshot.generated.json"] },
  // Same-origin, single-segment proxy to THIS project's assets only. Keeps CSP img-src 'self' and
  // lets downloads use the `download` attribute.
  async rewrites() {
    return [
      { source: "/cms-assets/images/:file", destination: `https://cdn.sanity.io/images/${SANITY_PROJECT_ID}/${SANITY_DATASET}/:file` },
      { source: "/cms-assets/files/:file", destination: `https://cdn.sanity.io/files/${SANITY_PROJECT_ID}/${SANITY_DATASET}/:file` },
    ];
  },
```
3. In `headers()`, change the cache rule's source to also cover the proxied assets:
```js
        source: "/:folder(logos|images|cms-assets)/:path*",
```

`proxy.ts` matcher: insert `cms-assets/|` after `assets/|`, so it reads:
```ts
  matcher: ["/((?!api/contact$|_next/static|_next/image|assets/|cms-assets/|images/|logos/|fonts/|credentials/|practitioners/[^/]+\\.webp$|favicon\\.ico$|icon\\.svg$|apple-icon\\.png$|opengraph-image(?:/|$)|twitter-image(?:/|$)|robots\\.txt$|sitemap\\.xml$|llms\\.txt$).*)"],
```

`.env.example`: append:
```bash

# Sanity CMS. The project ID and dataset are public and default to the values in lib/sanity/project.mjs.
# SANITY_PROJECT_ID=
# SANITY_DATASET=production
# Required in production: shared secret for the Sanity publish webhook (POST /api/revalidate), 32+ chars.
# Create it locally with `npm run cms:secret` (written to .env.local, never printed); paste the same value
# into the Sanity webhook and the Vercel project settings.
SANITY_REVALIDATE_SECRET=
```

- [ ] **Step 11: Run the snapshot tests, generate a real snapshot and check the build**

```bash
node --test tests/cms-snapshot.test.cjs tests/cms-fallback.test.cjs
npm run cms:snapshot
npm run build
```

Expected:
- The tests pass, 4 in all.
- The snapshot step prints `CMS snapshot written to lib/cms/snapshot.generated.json (caseStudies, people, resources).`
- The build succeeds. Its log shows the prebuild snapshot.

- [ ] **Step 12: Commit**

```bash
git add package.json package-lock.json next.config.mjs proxy.ts .env.example lib/sanity/client.ts lib/cms/queries.mjs lib/cms/fallback.ts lib/cms/source.ts scripts/cms-snapshot.mjs tests/cms-fallback.test.cjs tests/cms-snapshot.test.cjs
git commit -m "feat(cms): connect the site to Sanity with cached reads and a build snapshot fallback

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Mappers, getters and parity with today's content

**Files:**
- Create: `lib/cms/map-case-studies.ts`, `lib/cms/map-people.ts`, `lib/cms/map-resources.ts`, `lib/cms/content.ts`, `tests/cms-mappers.test.cjs`, `tests/cms-parity.test.cjs`

**Interfaces:**
- Consumes: Task 2 helpers and types, Task 4 `loadQuery`.
- Produces:
  - `toEngagement(raw: RawCaseStudy): Engagement`
  - `toCaseStudyBrief(raw: RawCaseStudy): CaseStudyBrief`
  - `orderBriefs(raws: RawCaseStudy[]): CaseStudyBrief[]`
  - `selectFeatured(items: Engagement[], limit?: number): Engagement[]`
  - `initials(name: string): string`
  - `toProfile(raw: RawPerson): PersonProfile`
  - `toListing(raw: RawPerson): PersonListing`
  - `toPractitioner(raw: RawPerson): Practitioner`
  - `toResource(raw: RawResource): Resource | null`
  - Getters, all returning `Promise<…>`: `getEngagements`, `getEngagement(slug)`, `getCaseStudyBriefs`, `getCaseStudyBrief(slug)`, `getProfiles`, `getProfile(slug)`, `getPeopleListings`, `getPractitioners`, `getResources`.

- [ ] **Step 1: Write the failing mapper tests**, `tests/cms-mappers.test.cjs`:

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const { loadTs } = require("./helpers/load-ts.cjs");

const assets = loadTs("lib/cms/assets.ts");
const cases = loadTs("lib/cms/map-case-studies.ts", { "./assets": assets });
const people = loadTs("lib/cms/map-people.ts", { "./assets": assets });
const resources = loadTs("lib/cms/map-resources.ts", { "./assets": assets });

const cdnImage = (name, hotspot = null) => ({ url: `https://cdn.sanity.io/images/abc123xy/production/${name}-800x1000.jpg`, originalFilename: `${name}.jpg`, width: 800, height: 1000, hotspot });
const pdf = { url: "https://cdn.sanity.io/files/abc123xy/production/f00d.pdf", originalFilename: "Case study.pdf", extension: "pdf", size: 2048 };

// Minimal published case study: Sanity returns null for empty arrays and unset fields.
const minimalCase = {
  slug: "new-case", title: "A new case", industry: "Retail", summary: "Summary.", coverText: "Line one\nLine two",
  strap: "Strategy", theme: "navy", featured: null, context: "Context.", focus: ["Focus"], work: [{ title: "Step", text: "Text" }],
  resultsHeading: "Results", results: ["Result one"], takeaway: "Takeaway.", document: null,
  legacySlug: null, olderTitle: null, olderIndustry: null, headline: null, olderContext: null, edge: null, framework: null, outcomes: null, olderOrder: null,
};

test("a minimal case study renders on both page sets through the fallbacks", () => {
  const engagement = cases.toEngagement(minimalCase);
  assert.equal("featured" in engagement, false);
  assert.equal("download" in engagement, false);
  assert.deepEqual(cases.toCaseStudyBrief(minimalCase), {
    slug: "new-case", industry: "Retail", title: "A new case", headline: "Summary.", context: "Context.",
    edge: ["Focus"], framework: ["Step"], outcomes: ["Result one"],
  });
  const empty = cases.toEngagement({ ...minimalCase, focus: null, work: null, results: null });
  assert.deepEqual([empty.focus, empty.work, empty.results], [[], [], []]);
});

test("older-page fields win when present and attachments reach both page sets", () => {
  const raw = { ...minimalCase, legacySlug: "old-case", olderTitle: "Old title", headline: "Old headline", edge: ["Edge"], document: { label: null, file: pdf } };
  const brief = cases.toCaseStudyBrief(raw);
  assert.equal(brief.slug, "old-case");
  assert.equal(brief.title, "Old title");
  assert.deepEqual(brief.edge, ["Edge"]);
  assert.equal(brief.download.label, "Download the full case study");
  assert.equal(cases.toEngagement(raw).download.href, "/cms-assets/files/f00d.pdf?dl=Case%20study.pdf");
});

test("older-page order uses explicit positions first, then main order", () => {
  const raws = ["a", "b", "c", "d"].map((slug) => ({ ...minimalCase, slug }));
  raws[2].olderOrder = 1;
  raws[0].olderOrder = 2;
  assert.deepEqual(cases.orderBriefs(raws).map((brief) => brief.slug), ["c", "a", "b", "d"]);
});

test("the homepage shows up to four featured case studies, in order, and copes with fewer", () => {
  const items = ["a", "b", "c", "d", "e"].map((slug, index) => ({ slug, featured: index !== 1 }));
  assert.deepEqual(cases.selectFeatured(items).map((item) => item.slug), ["a", "c", "d", "e"]);
  assert.deepEqual(cases.selectFeatured(items.slice(0, 2)).map((item) => item.slug), ["a"]);
  assert.deepEqual(cases.selectFeatured([]), []);
});

const minimalPerson = {
  slug: "new-person", name: "Asha  Rao", role: "Partner", group: null, portrait: cdnImage("asha", { x: 0.5, y: 0.2 }),
  introduction: "Intro.", biography: ["Para one."], experience: null, focus: "Focus line", linkedin: null, document: null,
  olderRole: null, lede: null, olderBio: null, expertise: null, olderPhoto: null, highlightLabel: "Label", highlightDetail: null, highlightBackground: null,
};

test("a new person renders on every page without the optional older-page details", () => {
  assert.equal(people.initials("Asha  Rao"), "AR");
  assert.equal(people.initials("Madonna"), "M");
  assert.equal(people.initials("Mary Anne de Souza"), "MS");
  assert.deepEqual(people.toProfile(minimalPerson), {
    slug: "new-person", name: "Asha  Rao", role: "Partner", portrait: minimalPerson.portrait.url, imagePosition: "50% 20%",
    introduction: "Intro.", biography: ["Para one."], experience: [],
  });
  assert.deepEqual(people.toListing(minimalPerson), {
    slug: "new-person", name: "Asha  Rao", role: "Partner", category: "leadership", focus: "Focus line",
    image: "/cms-assets/images/asha-800x1000.jpg",
  });
  const practitioner = people.toPractitioner(minimalPerson);
  assert.equal("highlight" in practitioner, false, "Partial highlights are hidden, not half-rendered");
  assert.equal(practitioner.lede, "Intro.");
  assert.equal(practitioner.photo, minimalPerson.portrait.url);
  assert.equal(practitioner.linkedin, null);
  assert.equal(people.toListing({ ...minimalPerson, group: "partner" }).category, "partner");
});

test("resources without a file are dropped; descriptions and covers are optional", () => {
  assert.equal(resources.toResource({ id: "r1", title: "T", date: "2026-10-01", file: null }), null);
  const resource = resources.toResource({ id: "r2", title: "Brochure", description: null, category: null, date: "2026-10-01", file: pdf, cover: null });
  assert.equal(resource.description, "");
  assert.equal(resource.category, "Other");
  assert.equal(resource.download.label, "Download");
  assert.equal("cover" in resource, false);
});
```

- [ ] **Step 2: Run them to see them fail**

```bash
node --test tests/cms-mappers.test.cjs
```
Expected: FAIL with `ENOENT … map-case-studies.ts`.

- [ ] **Step 3: Implement the mappers**

`lib/cms/map-case-studies.ts`:
```ts
import { toDownload } from "./assets";
import type { RawCaseStudy } from "./raw";
import type { CaseStudyBrief, Engagement } from "./types";

const DEFAULT_LABEL = "Download the full case study";
const list = (value?: string[] | null) => (value ?? []).filter((item) => typeof item === "string" && item.trim() !== "");
const either = (value: string | null | undefined, fallback: string) => (value?.trim() ? value : fallback);

export function toEngagement(raw: RawCaseStudy): Engagement {
  const download = toDownload(raw.document, DEFAULT_LABEL);
  return {
    slug: raw.slug, industry: raw.industry, title: raw.title, cover: raw.coverText, strap: raw.strap, theme: raw.theme,
    summary: raw.summary, context: raw.context, focus: list(raw.focus),
    work: (raw.work ?? []).filter((item) => item?.title && item?.text).map(({ title, text }) => ({ title, text })),
    resultTitle: raw.resultsHeading, results: list(raw.results), takeaway: raw.takeaway,
    ...(raw.featured ? { featured: true } : {}),
    ...(download ? { download } : {}),
  };
}

export function toCaseStudyBrief(raw: RawCaseStudy): CaseStudyBrief {
  const engagement = toEngagement(raw);
  const edge = list(raw.edge);
  const framework = list(raw.framework);
  const outcomes = list(raw.outcomes);
  return {
    slug: either(raw.legacySlug, raw.slug),
    industry: either(raw.olderIndustry, raw.industry),
    title: either(raw.olderTitle, raw.title),
    headline: either(raw.headline, raw.summary),
    context: either(raw.olderContext, raw.context),
    edge: edge.length ? edge : engagement.focus,
    framework: framework.length ? framework : engagement.work.map((item) => item.title),
    outcomes: outcomes.length ? outcomes : engagement.results,
    ...(engagement.download ? { download: engagement.download } : {}),
  };
}

/** Explicit older-page positions first (ascending), then everything else in main order. */
export function orderBriefs(raws: RawCaseStudy[]): CaseStudyBrief[] {
  return raws
    .map((raw, index) => ({ raw, index }))
    .sort((a, b) => (a.raw.olderOrder ?? Infinity) - (b.raw.olderOrder ?? Infinity) || a.index - b.index)
    .map(({ raw }) => toCaseStudyBrief(raw));
}

export function selectFeatured<T extends { featured?: boolean }>(items: T[], limit = 4): T[] {
  return items.filter((item) => item.featured).slice(0, limit);
}
```

`lib/cms/map-people.ts`:
```ts
import { cmsAssetPath, objectPositionFromHotspot, toDownload } from "./assets";
import type { RawPerson } from "./raw";
import type { PersonListing, PersonProfile, Practitioner } from "./types";

const DEFAULT_LABEL = "Download profile";
const list = (value?: string[] | null) => (value ?? []).filter((item) => typeof item === "string" && item.trim() !== "");
const either = (value: string | null | undefined, fallback: string) => (value?.trim() ? value : fallback);

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return `${first}${last}`.toUpperCase();
}

export function toProfile(raw: RawPerson): PersonProfile {
  const download = toDownload(raw.document, DEFAULT_LABEL);
  return {
    slug: raw.slug, name: raw.name, role: raw.role, portrait: raw.portrait.url,
    imagePosition: objectPositionFromHotspot(raw.portrait.hotspot),
    introduction: raw.introduction, biography: list(raw.biography), experience: list(raw.experience),
    ...(download ? { download } : {}),
  };
}

export function toListing(raw: RawPerson): PersonListing {
  return {
    slug: raw.slug, name: raw.name, role: raw.role, category: raw.group === "partner" ? "partner" : "leadership",
    focus: raw.focus, image: cmsAssetPath(raw.portrait.url),
  };
}

export function toPractitioner(raw: RawPerson): Practitioner {
  const olderBio = list(raw.olderBio);
  const highlight = raw.highlightLabel?.trim() && raw.highlightDetail?.trim() && raw.highlightBackground?.trim()
    ? { label: raw.highlightLabel, detail: raw.highlightDetail, background: raw.highlightBackground }
    : undefined;
  return {
    slug: raw.slug, name: raw.name, initials: initials(raw.name), role: either(raw.olderRole, raw.role),
    lede: either(raw.lede, raw.introduction), bio: olderBio.length ? olderBio : list(raw.biography),
    expertise: list(raw.expertise), linkedin: raw.linkedin?.trim() || null,
    photo: raw.olderPhoto?.url ?? raw.portrait.url,
    ...(highlight ? { highlight } : {}),
  };
}
```

`lib/cms/map-resources.ts`:
```ts
import { toFileDownload } from "./assets";
import type { RawResource } from "./raw";
import type { Resource } from "./types";

export function toResource(raw: RawResource): Resource | null {
  if (!raw.file?.url) return null;
  return {
    id: raw.id, title: raw.title, description: raw.description?.trim() ?? "", category: raw.category?.trim() || "Other",
    date: raw.date, download: toFileDownload(raw.file, "Download"),
    ...(raw.cover?.url ? { cover: { src: raw.cover.url, width: raw.cover.width, height: raw.cover.height } } : {}),
  };
}
```

- [ ] **Step 4: Run the mapper tests to see them pass**

```bash
node --test tests/cms-mappers.test.cjs
```
Expected: 6 passing.

- [ ] **Step 5: Write the getters**, `lib/cms/content.ts`:

```ts
import "server-only";
import { cache } from "react";
import { orderBriefs, toEngagement } from "./map-case-studies";
import { toListing, toPractitioner, toProfile } from "./map-people";
import { toResource } from "./map-resources";
import { loadQuery } from "./source";
import type { RawCaseStudy, RawPerson, RawResource } from "./raw";
import type { Resource } from "./types";

const rawCaseStudies = cache(() => loadQuery<RawCaseStudy[]>("caseStudies"));
const rawPeople = cache(() => loadQuery<RawPerson[]>("people"));

export const getEngagements = cache(async () => (await rawCaseStudies()).map(toEngagement));
export async function getEngagement(slug: string) { return (await getEngagements()).find((item) => item.slug === slug); }

export const getCaseStudyBriefs = cache(async () => orderBriefs(await rawCaseStudies()));
export async function getCaseStudyBrief(slug: string) { return (await getCaseStudyBriefs()).find((item) => item.slug === slug); }

export const getProfiles = cache(async () => (await rawPeople()).map(toProfile));
export async function getProfile(slug: string) { return (await getProfiles()).find((item) => item.slug === slug); }
export const getPeopleListings = cache(async () => (await rawPeople()).map(toListing));
export const getPractitioners = cache(async () => (await rawPeople()).map(toPractitioner));

export const getResources = cache(async () =>
  (await loadQuery<RawResource[]>("resources")).map(toResource).filter((item): item is Resource => item !== null));
```

- [ ] **Step 6: Write the parity test**, `tests/cms-parity.test.cjs`. It is temporary, and Task 10 deletes it with the old data.

```js
// Migration-time check: Sanity content mapped back through lib/cms equals today's TypeScript data.
// Requires `npm run cms:snapshot` first. Deleted with the old data files in Task 10.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { loadTs, root } = require("./helpers/load-ts.cjs");

const snapshotFile = path.join(root, "lib/cms/snapshot.generated.json");
if (!fs.existsSync(snapshotFile)) {
  test("CMS parity", { skip: "run `npm run cms:snapshot` first" }, () => {});
  return;
}
const { results } = JSON.parse(fs.readFileSync(snapshotFile, "utf8"));
const assets = loadTs("lib/cms/assets.ts");
const cases = loadTs("lib/cms/map-case-studies.ts", { "./assets": assets });
const people = loadTs("lib/cms/map-people.ts", { "./assets": assets });
const content = loadTs("lib/content.ts");
const profiles = loadTs("lib/people-profiles.ts");
const recreation = loadTs("lib/recreation-content.ts", { "./people-profiles": profiles });
const base = (file) => path.basename(file);

test("engagements match /work content exactly", () => {
  assert.deepStrictEqual(results.caseStudies.map(cases.toEngagement), recreation.cases);
});

test("older case-study pages keep their text and order", () => {
  assert.deepStrictEqual(cases.orderBriefs(results.caseStudies), content.caseStudies);
});

test("profiles keep their text and framing; portraits are the same files", () => {
  const strip = ({ portrait, ...rest }) => rest;
  assert.deepStrictEqual(results.people.map(people.toProfile).map(strip), profiles.peopleProfiles.map(strip));
  assert.deepStrictEqual(results.people.map((raw) => raw.portrait.originalFilename), profiles.peopleProfiles.map((p) => base(p.portrait)));
});

test("listing cards keep group, focus and image file", () => {
  assert.deepStrictEqual(
    results.people.map(people.toListing).map(({ image, ...rest }) => rest),
    recreation.people.map(({ slug, name, role, category, focus }) => ({ slug, name, role, category, focus })),
  );
  assert.deepStrictEqual(results.people.map((raw) => raw.portrait.originalFilename), recreation.people.map((p) => p.image));
});

test("practitioners keep text, highlights and photo files", () => {
  const mapped = results.people.map(people.toPractitioner);
  assert.deepStrictEqual(mapped.map(({ photo, highlight, ...rest }) => rest), content.practitioners.map(({ photo, ...rest }) => rest));
  assert.deepStrictEqual(mapped.map((p) => p.highlight), content.practitioners.map((p) => content.practitionerHighlights[p.slug]));
  assert.deepStrictEqual(results.people.map((raw) => (raw.olderPhoto ?? raw.portrait).originalFilename), content.practitioners.map((p) => base(p.photo)));
});
```

- [ ] **Step 7: Run parity against the real data**

```bash
npm run cms:snapshot && node --test tests/cms-parity.test.cjs
```

Expected: 5 passing. If one fails, the diff shows exactly which field the import or a mapper got wrong. Fix the importer or mapper, re-import if the importer changed, and repeat. **Do not continue to Task 6 until all 5 pass.**

- [ ] **Step 8: Commit**

```bash
git add lib/cms/map-case-studies.ts lib/cms/map-people.ts lib/cms/map-resources.ts lib/cms/content.ts tests/cms-mappers.test.cjs tests/cms-parity.test.cjs
git commit -m "feat(cms): map Sanity documents to existing page shapes with parity checks

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Case-study pages read from Sanity

**Files:**
- Modify:
  - `app/work/page.tsx`, `app/work/[slug]/page.tsx`
  - `components/recreation/WorkFilter.tsx`, `components/recreation/Site.tsx`, `components/work/EngagementPage.tsx`, `components/SelectedWorkSection.tsx`
  - `app/expertise/page.tsx`, `app/case-studies/page.tsx`, `app/case-studies/[slug]/page.tsx`
  - `lib/structured-data.ts`, `lib/faq.ts`, `app/faq/page.tsx`, `app/sitemap.ts`
  - `tests/structured-data.test.cjs`

**Interfaces:**
- Consumes: the getters and `selectFeatured` from Task 5. Types: `Engagement`, `CaseStudyBrief` and `Practitioner`.
- Produces:
  - `practitionerGraph(practitioners: Practitioner[])`
  - `caseStudyListSchema(caseStudies: CaseStudyBrief[])`
  - `caseStudySchema(study: CaseStudyBrief)`
  - `buildFaqItems({ practitioners, caseStudies }): FAQItem[]`
  - `WorkFilter({ cases })`
  - `EngagementPage({ engagement, related })`

- [ ] **Step 1: Update `tests/structured-data.test.cjs` so the graph functions take data as arguments.** Write the new expectations first. Replace the last two tests with:

```js
const practitionerFixture = [
  { slug: "a-person", name: "A Person", initials: "AP", role: "Partner", lede: "Lede.", bio: ["Bio."], expertise: ["Strategy"], linkedin: null, photo: null },
  { slug: "b-person", name: "B Person", initials: "BP", role: "Coach", lede: "Lede.", bio: ["Bio."], expertise: [], linkedin: "https://www.linkedin.com/in/b", photo: "https://cdn.sanity.io/images/abc123xy/production/b-1x1.jpg" },
];
const caseFixture = [
  { slug: "one", industry: "Insurance", title: "One", headline: "Headline one", context: "Context one", edge: [], framework: [], outcomes: ["Changed."] },
  { slug: "two", industry: "Education", title: "Two", headline: "Headline two", context: "Context two", edge: [], framework: [], outcomes: ["Changed."] },
];

test("practitioners share the site entity without invented details", () => {
  const [organization] = schema.siteEntityGraph();
  const people = schema.practitionerGraph(practitionerFixture);
  assert.equal(people.length, 2);
  assert.equal(people[0].url, "https://www.woy.test/practitioners#a-person");
  assert.equal(people[0].affiliation["@id"], organization["@id"]);
  assert.ok(!("sameAs" in people[0]) && !("image" in people[0]));
  assert.deepEqual(plain(people[1].sameAs), ["https://www.linkedin.com/in/b"]);
  assert.equal(people[1].image, "https://cdn.sanity.io/images/abc123xy/production/b-1x1.jpg");
  for (const person of people) assert.ok(!("hasCredential" in person));
});

test("case-study listing and detail graphs identify the same published works without naming confidential clients", () => {
  const list = schema.caseStudyListSchema(caseFixture);
  assert.equal(list.numberOfItems, 2);
  for (const [index, study] of caseFixture.entries()) {
    const work = schema.caseStudySchema(study);
    const listed = list.itemListElement[index].item;
    assert.equal(listed["@id"], work["@id"]);
    assert.equal(listed.url, work.url);
    assert.equal(work.description, study.context);
    assert.equal(work.about.name, study.industry);
    for (const unsupported of ["customer", "sponsor", "datePublished", "dateModified", "review", "aggregateRating"]) assert.ok(!(unsupported in work));
  }
});
```

In the earlier test, `"visible services and practitioners share the site entity…"`, delete the practitioner part: everything from `const people = schema.practitionerGraph();` to the end of that test's loop. Rename the test `"visible services share the site entity without invented details"`.

```bash
node --test tests/structured-data.test.cjs
```
Expected: FAIL. `practitionerGraph` still reads `content.practitioners`, so the counts and URLs differ.

- [ ] **Step 2: Make `lib/structured-data.ts` take data as arguments**

Replace line 1 with:
```ts
import { expertiseAreas, site } from "@/lib/content";
import type { CaseStudyBrief, Practitioner } from "@/lib/cms/types";
```

Change these signatures, leaving the bodies as they are:
```ts
export function practitionerGraph(practitioners: Practitioner[]): SchemaNode[] {
export function caseStudyListSchema(caseStudies: CaseStudyBrief[]): SchemaNode {
export function caseStudySchema(study: CaseStudyBrief): SchemaNode {
```

```bash
node --test tests/structured-data.test.cjs
```
Expected: all passing.

- [ ] **Step 3: Pass data into the client and shared components**

`components/recreation/WorkFilter.tsx`:
- Replace `import {cases} from '@/lib/recreation-content';` with `import type {Engagement} from '@/lib/cms/types';`.
- Replace `export function WorkFilter(){` with `export function WorkFilter({cases}:{cases:Engagement[]}){`.
- Replace the effect's closing `},[]);` with `},[cases]);`.

`components/recreation/Site.tsx`:
- Replace line 4 with:
```tsx
import { steps } from '@/lib/recreation-content';
import type { Engagement, PersonListing } from '@/lib/cms/types';
```
- In `CaseCard`, change `{item:CaseStudy;index?:number}` to `{item:Engagement;index?:number}`.
- In `PersonCard`, change `{person:typeof people[number]}` to `{person:PersonListing}`, and `src={`/assets/${person.image}`}` to `src={person.image}`.
- Delete `RelatedWork` on line 13. Nothing imports it.

`components/work/EngagementPage.tsx`:
- Replace line 4 with `import type { Engagement } from "@/lib/cms/types";`.
- Replace the signature and the `related` line with:
```tsx
export function EngagementPage({ engagement, related }: { engagement: Engagement; related: Engagement[] }) {
```
- Delete `const related = cases.filter(item => item.slug !== engagement.slug).slice(0, 2);`.

- [ ] **Step 4: Make the `/work` routes async**

`app/work/page.tsx`:
- Add `import { getEngagements } from "@/lib/cms/content";`.
- Replace `export default function Work(){return <div` with `export default async function Work(){const cases=await getEngagements();return <div`.
- Replace `<WorkFilter/>` with `<WorkFilter cases={cases}/>`.

`app/work/[slug]/page.tsx`, replacing the whole file:
```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EngagementPage } from "@/components/work/EngagementPage";
import { getEngagements } from "@/lib/cms/content";
import { pageMetadata } from "@/lib/metadata";

type EngagementRouteProps = { params: Promise<{ slug: string }> };

async function findEngagement(slug: string) {
  const engagements = await getEngagements();
  const engagement = engagements.find(item => item.slug === slug);
  if (!engagement) notFound();
  return { engagement, related: engagements.filter(item => item.slug !== slug).slice(0, 2) };
}

export async function generateStaticParams() {
  return (await getEngagements()).map(item => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: EngagementRouteProps): Promise<Metadata> {
  const { engagement } = await findEngagement((await params).slug);
  return pageMetadata(engagement.title, engagement.summary, `/work/${engagement.slug}`);
}

export default async function EngagementDetailPage({ params }: EngagementRouteProps) {
  const { engagement, related } = await findEngagement((await params).slug);
  return <EngagementPage engagement={engagement} related={related} />;
}
```

`components/SelectedWorkSection.tsx`:
1. Replace line 2 with:
```tsx
import { getEngagements } from "@/lib/cms/content";
import { selectFeatured } from "@/lib/cms/map-case-studies";
```
2. Replace line 5 and the function signature with:
```tsx
const numberWords = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];

export async function SelectedWorkSection() {
  const engagements = await getEngagements();
  const selectedCases = selectFeatured(engagements);
  const industryCount = new Set(engagements.map((item) => item.industry)).size;
```
3. Replace `<p>Explore engagements across six industries.</p>` with:
```tsx
<p>Explore engagements across {numberWords[industryCount] ?? industryCount} {industryCount === 1 ? "industry" : "industries"}.</p>
```

`app/expertise/page.tsx`:
- Replace `import { expertise, cases } from "@/lib/recreation-content";` with:
```tsx
import { expertise } from "@/lib/recreation-content";
import { getEngagements } from "@/lib/cms/content";
```
- Replace `export default function ExpertisePage() {` with:
```tsx
export default async function ExpertisePage() {
  const cases = await getEngagements();
```

- [ ] **Step 5: Make the older `/case-studies` routes async**

`app/case-studies/page.tsx`:
- Replace `import { caseStudies } from "@/lib/content";` with `import { getCaseStudyBriefs } from "@/lib/cms/content";`.
- Replace `export default function CaseStudiesPage() {` with:
```tsx
export default async function CaseStudiesPage() {
  const caseStudies = await getCaseStudyBriefs();
```
- Replace `caseStudyListSchema(),` with `caseStudyListSchema(caseStudies),`.
- Replace `<dd>{study.outcomes[0]}.</dd>` with `<dd>{study.outcomes[0] ?? study.headline}.</dd>`.

`app/case-studies/[slug]/page.tsx`: replace lines 8–27 (the import through the `next` computation) with:
```tsx
import { getCaseStudyBriefs } from "@/lib/cms/content";
import styles from "../case-studies.module.css";

async function findStudy(slug: string) {
  const caseStudies = await getCaseStudyBriefs();
  const index = caseStudies.findIndex((c) => c.slug === slug);
  if (index < 0) notFound();
  return { study: caseStudies[index], next: caseStudies[(index + 1) % caseStudies.length] };
}

export async function generateStaticParams() {
  return (await getCaseStudyBriefs()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { study } = await findStudy((await params).slug);
  return pageMetadata(study.title, `${study.industry} case study: ${study.headline}`, `/case-studies/${study.slug}`);
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { study, next } = await findStudy((await params).slug);
```

Delete the now-unused `import styles from "../case-studies.module.css";` duplicate if one exists. Keep a single styles import.

- [ ] **Step 6: Make the FAQ build from data, and the sitemap async**

`lib/faq.ts`:
1. Replace line 1 with:
```ts
import { approach, site } from "@/lib/content";
import type { CaseStudyBrief, Practitioner } from "@/lib/cms/types";
```
2. Replace `export const faqItems: FAQItem[] = [` with:
```ts
export function buildFaqItems({ practitioners, caseStudies }: { practitioners: Practitioner[]; caseStudies: CaseStudyBrief[] }): FAQItem[] {
  return [
```
3. Replace the array's closing `];` at the end of the file with `  ];\n}`.

The template strings inside already use `practitioners` and `caseStudies`, which now resolve to the parameters.

`app/faq/page.tsx`:
- Replace `import { faqItems } from "@/lib/faq";` with:
```tsx
import { buildFaqItems } from "@/lib/faq";
import { getCaseStudyBriefs, getPractitioners } from "@/lib/cms/content";
```
- Replace `export default function FAQPage() {` with:
```tsx
export default async function FAQPage() {
  const faqItems = buildFaqItems({ practitioners: await getPractitioners(), caseStudies: await getCaseStudyBriefs() });
```

`app/sitemap.ts`, replacing the imports and the function head:
```ts
import type { MetadataRoute } from "next";
import { getCaseStudyBriefs, getEngagements, getProfiles } from "@/lib/cms/content";
import { siteUrl } from "@/lib/site-url";

/** Keep public routes, individual profiles, and published cases discoverable. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cases, caseStudies, peopleProfiles] = await Promise.all([getEngagements(), getCaseStudyBriefs(), getProfiles()]);
```
The rest of the body is unchanged: `cases`, `caseStudies` and `peopleProfiles` now hold the fetched lists.

- [ ] **Step 7: Run the static checks and unit tests**

```bash
npm run lint && npm run typecheck && npm test
```
Expected: all pass. If typecheck reports a remaining import of `cases` or `caseStudies` from the old modules, switch that consumer to the getters the same way.

- [ ] **Step 8: Build and run the browser smoke test**

```bash
npm run build
```

Then start `npm start -- -p 5173` in the background and run:

```bash
npm run test:browser
```

Expected: PASS. The smoke test's built-in copies of `/work` and the profiles must still match the rendered pages.

- [ ] **Step 9: Commit**

```bash
git add -A app components lib tests/structured-data.test.cjs
git commit -m "feat(cms): render case studies from Sanity on /work, /case-studies, home and FAQ

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: People pages read from Sanity

**Files:**
- Modify: `app/people/page.tsx`, `app/people/[slug]/page.tsx`, `components/people/ProfilePage.tsx`, `app/practitioners/page.tsx`, `components/LeadershipSection.tsx`, `tests/browser-smoke.mjs`

**Interfaces:**
- Consumes: `getPeopleListings`, `getProfiles`, `getPractitioners` and `practitionerGraph(practitioners)`.
- Produces: a `/practitioners` highlight block rendered only when `p.highlight` exists.

- [ ] **Step 1: Update the smoke-test assertion that expected local portrait paths.** In `tests/browser-smoke.mjs`, replace:
```js
    assert.match(await portrait.getAttribute("src"), new RegExp(slug));
```
with:
```js
    assert.match(await portrait.getAttribute("src"), /^\/_next\/image\?url=https%3A%2F%2Fcdn\.sanity\.io%2Fimages%2F/, "Profile portrait comes from Sanity via next/image");
    assert.equal(await portrait.getAttribute("alt"), profile.name);
```
Check that `profile` is the loop variable at that point. If the loop variable has a different name, use it.

- [ ] **Step 2: Make the `/people` routes async**

`app/people/page.tsx`:
- Replace line 3 with `import { getPeopleListings } from "@/lib/cms/content";`.
- Replace `export default function People(){` with `export default async function People(){\n  const people=await getPeopleListings();`.

`app/people/[slug]/page.tsx`, replacing lines 5–17:
```tsx
import { getProfiles } from "@/lib/cms/content";

type ProfileRouteProps = { params: Promise<{ slug: string }> };

async function findProfile(slug: string) {
  const profile = (await getProfiles()).find(person => person.slug === slug);
  if (!profile) notFound();
  return profile;
}

export async function generateStaticParams() {
  return (await getProfiles()).map(profile => ({ slug: profile.slug }));
}
```
Then put `await` in front of both `findProfile(...)` calls.

`components/people/ProfilePage.tsx`: replace line 4 with `import type { PersonProfile } from "@/lib/cms/types";`.

- [ ] **Step 3: Make `/practitioners` async and guard the highlight block**

`app/practitioners/page.tsx`:
1. Replace `import { practitioners, practitionerHighlights } from "@/lib/content";` with `import { getPractitioners } from "@/lib/cms/content";`.
2. Replace `export default function PractitionersPage() {` with:
```tsx
export default async function PractitionersPage() {
  const practitioners = await getPractitioners();
```
3. Replace `...practitionerGraph(),` with `...practitionerGraph(practitioners),`.
4. Replace `const proof = practitionerHighlights[p.slug];` with `const proof = p.highlight;`.
5. Replace the experience block with:
```tsx
                {proof && <div className={styles.experience}>
                  <p><strong>{proof.label}</strong><span>{proof.detail}</span></p>
                  <p className={styles.background}>{proof.background}</p>
                </div>}
```
6. Replace `<ul>{p.expertise.map(item => <li key={item}>{item}</li>)}</ul>` and the `<h3>Areas of focus</h3>` above it with:
```tsx
                    {p.expertise.length > 0 && <><h3>Areas of focus</h3><ul>{p.expertise.map(item => <li key={item}>{item}</li>)}</ul></>}
```

- [ ] **Step 4: Keep the homepage leadership feature as code-owned copy.** In `components/LeadershipSection.tsx`:
- Delete `import { practitioners } from "@/lib/content";` and the `const founder = …` line.
- Replace `{`${founder.name}, founder and managing director of WOY Consulting`}` with `"Vipin Tuteja, founder and managing director of WOY Consulting"`.
- Replace `{founder.name}` with `Vipin Tuteja`.

- [ ] **Step 5: Run the checks**

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

Then start `npm start -- -p 5173` in the background and run:

```bash
npm run test:browser
```
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add -A app components tests/browser-smoke.mjs
git commit -m "feat(cms): render people from Sanity on /people, profiles and /practitioners

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Documents: the Resources page and download buttons

**Files:**
- Create: `components/DownloadButton.tsx`, `app/resources/page.tsx`, `app/resources/resources.module.css`, `tests/cms-resources-page.test.cjs`
- Modify: `components/work/EngagementPage.tsx`, `components/people/ProfilePage.tsx`, `app/case-studies/[slug]/page.tsx`, `components/Footer.tsx`, `app/sitemap.ts`, `tests/browser-smoke.mjs`

**Interfaces:**
- Consumes: `getResources()`, `CmsDownload` and `formatFileSize`.
- Produces: `DownloadButton({ download, className? })` and the `/resources` route.

- [ ] **Step 1: Write the failing render test**, `tests/cms-resources-page.test.cjs`:

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const { renderToStaticMarkup } = require("react-dom/server");
const { loadTs } = require("./helpers/load-ts.cjs");

const assets = loadTs("lib/cms/assets.ts");
const { DownloadButton } = loadTs("components/DownloadButton.tsx", { "@/lib/cms/assets": assets });
const { ResourceList } = loadTs("app/resources/ResourceList.tsx", {
  "@/components/DownloadButton": { DownloadButton },
  "./resources.module.css": new Proxy({}, { get: (_, key) => String(key) }),
  "next/image": { __esModule: true, default: (props) => require("react").createElement("img", { src: props.src, alt: props.alt }) },
  "next/link": { __esModule: true, default: ({ href, children }) => require("react").createElement("a", { href }, children) },
});

const download = { href: "/cms-assets/files/f00d.pdf?dl=Brochure.pdf", label: "Download", fileName: "Brochure.pdf", extension: "pdf", size: 1_572_864 };

test("download links are same-origin, named and sized", () => {
  const html = renderToStaticMarkup(DownloadButton({ download }));
  assert.match(html, /href="\/cms-assets\/files\/f00d\.pdf\?dl=Brochure\.pdf"/);
  assert.match(html, /download="Brochure\.pdf"/);
  assert.match(html, /\(PDF, 1\.5 MB\)/);
  assert.doesNotMatch(renderToStaticMarkup(DownloadButton({ download: { ...download, size: 0 } })), /0 B|NaN/);
});

test("an empty library shows a friendly message instead of an empty grid", () => {
  const html = renderToStaticMarkup(ResourceList({ resources: [] }));
  assert.match(html, /New resources are on their way/);
  assert.match(html, /href="\/contact"/);
  assert.doesNotMatch(html, /<ul/);
});

test("resources list newest first as given, with category, readable date and download", () => {
  const html = renderToStaticMarkup(ResourceList({ resources: [
    { id: "a", title: "Annual report", description: "", category: "Report", date: "2026-10-01", download },
  ] }));
  assert.match(html, /Report · <time datetime="2026-10-01">1 October 2026<\/time>/);
  assert.match(html, /Annual report/);
  assert.match(html, /cms-assets\/files/);
});
```

```bash
node --test tests/cms-resources-page.test.cjs
```
Expected: FAIL with `ENOENT … DownloadButton.tsx`.

- [ ] **Step 2: Write `components/DownloadButton.tsx`**

```tsx
import { ArrowDown } from "lucide-react";
import { formatFileSize } from "@/lib/cms/assets";
import type { CmsDownload } from "@/lib/cms/types";

/** Same-origin (via the /cms-assets rewrite), so the browser honours the download file name. */
export function DownloadButton({ download, className = "text-link" }: { download: CmsDownload; className?: string }) {
  const details = [download.extension === "file" ? "" : download.extension.toUpperCase(), formatFileSize(download.size)].filter(Boolean).join(", ");
  return (
    <a className={className} href={download.href} download={download.fileName}>
      <span>{download.label}{details && <span className="muted"> ({details})</span>}</span>
      <ArrowDown size={17} aria-hidden="true" />
    </a>
  );
}
```

- [ ] **Step 3: Write `app/resources/ResourceList.tsx`, `app/resources/page.tsx` and the styles**

`app/resources/ResourceList.tsx`:
```tsx
import Image from "next/image";
import Link from "next/link";
import { DownloadButton } from "@/components/DownloadButton";
import type { Resource } from "@/lib/cms/types";
import styles from "./resources.module.css";

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export function ResourceList({ resources }: { resources: Resource[] }) {
  if (resources.length === 0) {
    return (
      <p className={`muted ${styles.empty}`}>
        New resources are on their way. In the meantime, <Link href="/contact">start a conversation</Link> and we’ll share what is relevant to you.
      </p>
    );
  }
  return (
    <ul className={styles.list} role="list">
      {resources.map((resource) => (
        <li key={resource.id} className={`${styles.item} ${resource.cover ? styles.withCover : ""}`}>
          {resource.cover && (
            <Image src={resource.cover.src} alt="" width={resource.cover.width} height={resource.cover.height}
              sizes="(max-width: 700px) 88vw, 240px" className={styles.cover} />
          )}
          <div className={styles.body}>
            <p className="eyebrow red">
              {resource.category} · <time dateTime={resource.date}>{dateFormat.format(new Date(`${resource.date}T00:00:00Z`))}</time>
            </p>
            <h2 className={styles.title}>{resource.title}</h2>
            {resource.description && <p className="muted">{resource.description}</p>}
            <DownloadButton download={resource.download} />
          </div>
        </li>
      ))}
    </ul>
  );
}
```

`app/resources/page.tsx`:
```tsx
import { PageIntro } from "@/components/recreation/Site";
import { StructuredData } from "@/components/StructuredData";
import { getResources } from "@/lib/cms/content";
import { pageMetadata } from "@/lib/metadata";
import { contentPageGraph } from "@/lib/structured-data";
import { ResourceList } from "./ResourceList";
import styles from "./resources.module.css";

const description = "Brochures, reports and other documents from WOY Consulting, ready to download.";
export const metadata = pageMetadata("Resources", description, "/resources");

export default async function ResourcesPage() {
  const resources = await getResources();
  return (
    <div className="recreation">
      <StructuredData id="resources-structured-data" nodes={contentPageGraph({ path: "/resources", name: "Resources", description, type: "CollectionPage" })} />
      <PageIntro label="Resources" title={<>Perspectives and materials.<br /><em>Ready to share.</em></>}>
        <p>Brochures, reports and other documents from WOY Consulting.</p>
      </PageIntro>
      <section className={`wrap ${styles.library}`} aria-label="Documents">
        <ResourceList resources={resources} />
      </section>
    </div>
  );
}
```

`app/resources/resources.module.css`:
```css
.library { padding-bottom: 90px; }
.list { margin: 0; padding: 0; list-style: none; border-top: 1px solid var(--border); }
.item { display: grid; grid-template-columns: minmax(0, 1fr); gap: 36px; padding-block: 36px; border-bottom: 1px solid var(--border); }
.withCover { grid-template-columns: minmax(0, 240px) minmax(0, 1fr); }
.cover { width: 100%; height: auto; }
.body { display: grid; gap: 14px; justify-items: start; }
.title { font-size: clamp(1.75rem, 2.6vw, 2.25rem); }
.empty { padding-block: 36px; border-top: 1px solid var(--border); }
.empty a { border-bottom: 1px solid currentColor; }
.empty a:hover { color: var(--primary); }
@media (max-width: 700px) { .withCover { grid-template-columns: minmax(0, 1fr); gap: 20px; } }
```

```bash
node --test tests/cms-resources-page.test.cjs
```
Expected: 3 passing.

- [ ] **Step 4: Attach downloads to the detail pages.** These render only when a document is attached.

`components/work/EngagementPage.tsx`:
- Add `import { DownloadButton } from "@/components/DownloadButton";`.
- Directly after the `</Link>` of "Discuss a similar challenge", insert:
```tsx
          {engagement.download && <DownloadButton download={engagement.download} className={styles.contact} />}
```

`components/people/ProfilePage.tsx`:
- Add `import { DownloadButton } from "@/components/DownloadButton";`.
- Directly before the "Start a conversation" `<Link`, insert:
```tsx
            {profile.download && <DownloadButton download={profile.download} className={styles.contact} />}
```

`app/case-studies/[slug]/page.tsx`:
- Add `import { DownloadButton } from "@/components/DownloadButton";`.
- Directly before `<p className={styles.confidentiality}>`, insert:
```tsx
        {study.download && <DownloadButton download={study.download} className={styles.backLink} />}
```

- [ ] **Step 5: Link the page from the footer and sitemap, and update the footer assertion**

`components/Footer.tsx`: add `{ label: "Resources", href: "/resources" },` as the last item of `explore`.

`app/sitemap.ts`: add `{ path: "/resources", priority: 0.6 },` after the `/faq` entry.

`tests/browser-smoke.mjs`: in the footer `deepEqual`, add `["Resources", "/resources"],` after `["Our approach", "/approach"],`.

- [ ] **Step 6: Run the checks, then check the empty state and a real document**

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

Then start `npm start -- -p 5173` in the background and run:

```bash
npm run test:browser
```

- Expected: all pass, and `/resources` shows the empty-state message.
- In the local Studio, create a test Resource with a small PDF and publish it. Run `npm run cms:revalidate`, or restart the server, after Task 9.
- Check that `/resources` lists it, and that "Download (PDF, …)" downloads the file with its original name from `localhost`.
- Then **delete the test resource** in the Studio.

- [ ] **Step 7: Commit**

```bash
git add -A app components tests/cms-resources-page.test.cjs tests/browser-smoke.mjs
git commit -m "feat(cms): add Resources page and optional document downloads

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Publish webhook: instant refresh

**Files:**
- Create: `app/api/revalidate/route.ts`, `scripts/cms-create-secret.mjs`, `scripts/cms-revalidate.mjs`, `tests/cms-revalidate.test.cjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: `CMS_CACHE_TAG` (`"sanity"`) from `lib/cms/source.ts`. It's repeated as a literal in the route, so the test can load the route without a server.
- Produces: `POST /api/revalidate`, plus `npm run cms:secret` and `npm run cms:revalidate`.

- [ ] **Step 1: Write the failing tests**, `tests/cms-revalidate.test.cjs`:

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const webhook = require("@sanity/webhook");
const { loadTs } = require("./helpers/load-ts.cjs");

const calls = [];
const route = loadTs("app/api/revalidate/route.ts", {
  "next/cache": { revalidateTag: (...args) => calls.push(args) },
  "@sanity/webhook": webhook,
});
const secret = "s".repeat(48);
const body = JSON.stringify({ _type: "caseStudy", _id: "caseStudy-insurance-leadership" });
const request = (headers, payload = body) => new Request("http://localhost/api/revalidate", { method: "POST", headers, body: payload });

test.beforeEach(() => { calls.length = 0; process.env.SANITY_REVALIDATE_SECRET = secret; });

test("a correctly signed publish expires the CMS cache immediately", async () => {
  const signature = await webhook.encodeSignatureHeader(body, Date.now(), secret);
  const response = await route.POST(request({ [webhook.SIGNATURE_HEADER_NAME]: signature }));
  assert.equal(response.status, 200);
  assert.deepEqual(calls, [["sanity", { expire: 0 }]]);
});

test("missing or wrong signatures are refused without revalidating or echoing input", async () => {
  const wrong = await webhook.encodeSignatureHeader(body, Date.now(), "x".repeat(48));
  for (const headers of [{}, { [webhook.SIGNATURE_HEADER_NAME]: wrong }, { [webhook.SIGNATURE_HEADER_NAME]: "t=1,v1=garbage" }]) {
    const response = await route.POST(request(headers));
    assert.equal(response.status, 401);
    assert.equal(await response.text(), "");
  }
  assert.deepEqual(calls, []);
});

test("an unconfigured or weak secret disables the endpoint", async () => {
  for (const value of [undefined, "short"]) {
    if (value === undefined) delete process.env.SANITY_REVALIDATE_SECRET; else process.env.SANITY_REVALIDATE_SECRET = value;
    const response = await route.POST(request({ [webhook.SIGNATURE_HEADER_NAME]: "t=1,v1=x" }));
    assert.equal(response.status, 503);
  }
  assert.deepEqual(calls, []);
});

test("oversized bodies are refused before signature checks", async () => {
  const large = JSON.stringify({ padding: "x".repeat(70_000) });
  const signature = await webhook.encodeSignatureHeader(large, Date.now(), secret);
  const response = await route.POST(request({ [webhook.SIGNATURE_HEADER_NAME]: signature }, large));
  assert.equal(response.status, 413);
  assert.deepEqual(calls, []);
});

test("only POST is exported, so other methods get 405 from Next.js", () => {
  assert.deepEqual(Object.keys(route).filter((key) => /^[A-Z]+$/.test(key)), ["POST"]);
});
```

```bash
node --test tests/cms-revalidate.test.cjs
```
Expected: FAIL with `ENOENT … route.ts`.

- [ ] **Step 2: Write `app/api/revalidate/route.ts`**

```ts
import { revalidateTag } from "next/cache";
import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";

export const dynamic = "force-dynamic";

const MAX_BODY_CHARACTERS = 64 * 1024;
const empty = (status: number) => new Response(null, { status });

/** Sanity publish webhook: verifies the HMAC signature, then expires every CMS read ("sanity" tag). */
export async function POST(request: Request) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret || secret.length < 32) return empty(503);
  const signature = request.headers.get(SIGNATURE_HEADER_NAME);
  const body = await request.text();
  if (body.length > MAX_BODY_CHARACTERS) return empty(413);
  if (!signature) return empty(401);
  let valid = false;
  try {
    valid = await isValidSignature(body, signature, secret);
  } catch {
    valid = false;
  }
  if (!valid) return empty(401);
  revalidateTag("sanity", { expire: 0 });
  return Response.json({ revalidated: true });
}
```

```bash
node --test tests/cms-revalidate.test.cjs
```
Expected: 5 passing.

- [ ] **Step 3: Write the two local helper scripts**

`scripts/cms-create-secret.mjs`:
```js
// Adds a random SANITY_REVALIDATE_SECRET to .env.local without ever printing it.
import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

const file = ".env.local";
const current = existsSync(file) ? readFileSync(file, "utf8") : "";
if (/^SANITY_REVALIDATE_SECRET=\S{32,}$/m.test(current)) {
  console.log("SANITY_REVALIDATE_SECRET already set in .env.local; left unchanged.");
} else {
  const separator = current && !current.endsWith("\n") ? "\n" : "";
  appendFileSync(file, `${separator}SANITY_REVALIDATE_SECRET=${randomBytes(32).toString("hex")}\n`);
  console.log("Added SANITY_REVALIDATE_SECRET to .env.local (value not shown). Open the file to copy it when configuring Sanity and Vercel.");
}
```

`scripts/cms-revalidate.mjs`:
```js
// Sends a correctly signed revalidate request to a local server, the way Sanity's webhook would.
import { encodeSignatureHeader, SIGNATURE_HEADER_NAME } from "@sanity/webhook";

const base = process.env.TEST_BASE_URL || "http://localhost:5173";
const secret = process.env.SANITY_REVALIDATE_SECRET;
if (!secret) {
  console.error("SANITY_REVALIDATE_SECRET is not set. Run `npm run cms:secret` first.");
  process.exit(1);
}
const body = JSON.stringify({ _type: "manual", _id: "local-revalidate" });
const signature = await encodeSignatureHeader(body, Date.now(), secret);
const response = await fetch(`${base}/api/revalidate`, {
  method: "POST", headers: { "content-type": "application/json", [SIGNATURE_HEADER_NAME]: signature }, body,
});
console.log(`POST /api/revalidate → ${response.status}`);
if (!response.ok) process.exitCode = 1;
```

`package.json` `"scripts"`, add:
```json
"cms:secret": "node scripts/cms-create-secret.mjs",
"cms:revalidate": "node --env-file-if-exists=.env.local scripts/cms-revalidate.mjs",
```

- [ ] **Step 4: Do a real round trip locally**

```bash
npm run cms:secret
npm run build
```

1. Start `npm start -- -p 5173` in the background. `next start` reads `.env.local`.
2. In the local Studio, change the summary of "Helping senior sales leaders lead as one" by adding ` (test)`, then Publish.
3. Run:

```bash
npm run cms:revalidate
```

4. Expected: `POST /api/revalidate → 200`. Reload `/work/insurance-leadership`; the summary should end in "(test)".
5. **Remove " (test)"**, publish, revalidate again and confirm the original text is back.

- [ ] **Step 5: Commit**

```bash
git add app/api/revalidate/route.ts scripts/cms-create-secret.mjs scripts/cms-revalidate.mjs tests/cms-revalidate.test.cjs package.json
git commit -m "feat(cms): add signed publish webhook for instant cache refresh

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Remove the migrated data

**Files:**
- Delete: `lib/people-profiles.ts`, `tests/cms-parity.test.cjs`
- Modify: `lib/content.ts`, `lib/recreation-content.ts`, `tests/browser-smoke.mjs`, `studio/scripts/import-current-content.ts`

**Interfaces:**
- Produces: no reference to migrated data remains. Case-study routes in the smoke test come from `/sitemap.xml`.

- [ ] **Step 1: Run parity one last time.** It's the final proof before the source data goes.

```bash
npm run cms:snapshot && node --test tests/cms-parity.test.cjs
```
Expected: 5 passing.

- [ ] **Step 2: Delete the migrated data**

- `lib/content.ts`: delete the `CaseStudy` type, `caseStudies`, the `Practitioner` type, `practitioners`, `practitionerHighlights` and `caseStudyBySlug`.
- `lib/recreation-content.ts`: delete the `peopleProfiles` import, the `CaseStudy` type, `cases`, `peopleListingDetails` and `people`. Keep `expertise` and `steps`.
- Delete `lib/people-profiles.ts` and `tests/cms-parity.test.cjs`.
- `studio/scripts/import-current-content.ts` reads the deleted data. Mark it as historical by replacing its body with:

```ts
/**
 * Batch 1 import (case studies and people) has run; its source data now lives only in Sanity.
 * Kept as a record of the mapping. See git history (commit "feat(cms): import current case studies…")
 * for the original script. Batch 2 replaces this file with its own import.
 */
throw new Error("The batch 1 import already ran; content now lives in Sanity.");
```

- [ ] **Step 3: Discover case-study routes from the sitemap in `tests/browser-smoke.mjs`.** Replace lines 162–164 with:

```js
const sitemapXml = await (await fetch(`${base}/sitemap.xml`)).text();
const caseRoutes = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => new URL(match[1]).pathname).filter(route => route.startsWith("/case-studies/"));
assert.equal(caseRoutes.length, 6, "Six older case-study routes are listed in the sitemap");
```

- [ ] **Step 4: Make sure nothing still references the old data**

```bash
grep -rnE "people-profiles|caseStudies|practitionerHighlights|peopleListingDetails|\bcases\b.*recreation-content|practitioners\b.*@/lib/content" app components lib tests scripts --include=*.ts --include=*.tsx --include=*.mjs --include=*.cjs
```

Expected: matches only in `lib/cms/*`, `lib/faq.ts` (parameters), `app/case-studies/*` and `app/sitemap.ts` (getter results), and `tests/structured-data.test.cjs` (fixtures). Any match that imports from `@/lib/content`, `lib/recreation-content` or `lib/people-profiles` must be fixed.

- [ ] **Step 5: Run everything**

```bash
npm run lint && npm run typecheck && npm test && npm run build && npm run security:check
```

Then start `npm start -- -p 5173` in the background and run:

```bash
npm run test:browser && npm run test:theme-navigation && npm run test:selected-work-navigation
```
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add -A lib tests studio/scripts
git commit -m "refactor(cms): remove case-study and people data now served by Sanity

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: Visual parity, the outage path and performance

**Files:**
- No source changes, unless a difference is found. Any fix gets its own commit with a test.

**Interfaces:**
- Consumes: the Task 0 baseline and capture/compare scripts.

- [ ] **Step 1: Capture the live-CMS run.** Build, start `npm start -- -p 5173` in the background, then run:

```bash
npm run test:visual:capture -- --label sanity
npm run test:visual:compare -- baseline sanity --allow resources__ --allow home__footer__
```

Expected: `No visual differences across <n> screenshots.`

- If anything differs, open the images in `reports/visual/diff-baseline-vs-sanity/` and find the cause. Likely suspects are a portrait framing (hotspot) or a missing class on the `<img>`.
- Fix it, add a mapper test that pins the fix, commit, and repeat.

- [ ] **Step 2: Review the expected footer change by eye.** Open `reports/visual/sanity/home__footer__*.png` next to the baseline's. The only difference should be the extra "Resources" link.

- [ ] **Step 3: Prove the outage path renders identically, with Sanity unreachable and nothing cached**

```bash
rm -rf .next/cache
CMS_TEST_UNREACHABLE=1 npm start -- -p 5173
```

- Run the server in the background. Expected in the server log: `[cms] Sanity unreachable; serving "caseStudies" from the build snapshot …`. In another shell:

```bash
npm run test:visual:capture -- --label outage
npm run test:visual:compare -- baseline outage --allow resources__ --allow home__footer__
```

- Expected: `No visual differences …`. Stop the server.
- The build itself must run **without** `CMS_TEST_UNREACHABLE`, because the build fetches the snapshot.

- [ ] **Step 4: Run the remaining checks**

```bash
npm run test:performance
```

Expected: Lighthouse within ±3 points of the baseline run in `reports/`. Re-run once if a single metric is noisy.

```bash
npm run test:security-browser && npm run test:contact-browser && npm run test:contact-security-browser && npm run test:logo
```
Expected: all pass.

- [ ] **Step 5: Record the verification evidence.** Commit only if fixes were needed, using each fix's own message. Otherwise there's nothing to commit.

---

### Task 12: Documentation

**Files:**
- Create: `docs/editing-guide.md`
- Modify: `README.md`, `docs/superpowers/specs/2026-10-11-sanity-cms-design.md`

- [ ] **Step 1: Write `docs/editing-guide.md`** in plain language for WOY staff:

```markdown
# Editing the WOY Consulting website

You edit the website at **https://woy-consulting.sanity.studio**. Sign in with the email or Google account you were invited with.

## The golden rule
**Anything you upload can be downloaded by anyone, even before you press Publish.** Never upload confidential client material, contracts or internal decks.

## Changing a case study or a person
1. Open **Case studies** or **People** in the left sidebar and click the entry.
2. Edit the text. Required fields are marked; you cannot publish until they are filled.
3. Press **Publish** (bottom right). The website updates within a minute.
4. To change the order on the website, drag entries in the sidebar list.

Each case study also has a collapsed section, **Older case-study page (/case-studies)**. It controls the older page design. Leave its fields empty to reuse the main text automatically.

## Adding a document
- **For the Resources page:** open **Resources**, click **+**, fill in the title, category and date, upload the file (PDF, Word, PowerPoint or Excel), then Publish.
- **On a case study or profile:** scroll to **Downloadable document**, upload the file and, if you like, set the button label. Then Publish. A Download button appears on that page.

## Undoing a change
Open the entry, click the clock icon (**History**) at the top right, choose an earlier version and press **Restore**, then Publish.

## Photos
For portraits, click the crop icon and drag the circle onto the face. The website frames the photo around that point.

## Something looks wrong?
Restore the previous version (see above), then contact the website developer with the page address and a screenshot.
```

- [ ] **Step 2: Update `README.md`**
  - Replace "Core marketing copy is maintained in `lib/content.ts`" with: "Case studies, people and documents are edited in Sanity (see `docs/editing-guide.md`); remaining copy lives in `lib/content.ts`."
  - Add a **Content management (Sanity)** section covering:
    - `studio/` (`cd studio && npm install && npm run dev`)
    - `npm run cms:snapshot`
    - `npm run cms:secret`
    - `npm run cms:revalidate`
    - the webhook URL `https://<domain>/api/revalidate` with the trigger "Create, Update, Delete" for `_type in ["caseStudy","person","resource"]` and the secret from `.env.local`
    - the fact that a build fails if Sanity is unreachable while the snapshot is taken
  - Change "Adding a seventh case study means adding one object…" to "Adding a case study: create it in the Studio and publish."

- [ ] **Step 3: Bring the spec in line with this plan's refinements.** Edit `docs/superpowers/specs/2026-10-11-sanity-cms-design.md`:
  - **§4:** caching uses `unstable_cache` with one tag, `sanity`, rather than `fetch` tags per type.
  - **§8:** raw `<img>` elements and downloads use the `/cms-assets/*` same-origin rewrite, limited to this project and dataset, so `CollectiveExperience` may keep `<img>`. `next/image` uses absolute Sanity URLs via `remotePatterns`.
  - **§5 people:** add the `group` field and the three `highlight*` fields.
  - **§9:** document IDs use hyphens, not dots.

- [ ] **Step 4: Commit**

```bash
git add docs/editing-guide.md README.md docs/superpowers/specs/2026-10-11-sanity-cms-design.md
git commit -m "docs: add editor guide and Sanity setup notes

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## After Batch 1 (not part of this plan)

Push the branch and open a pull request **only after the owner reviews it locally** (spec §12). The go-live steps depend on the domain and the Vercel plan:

- `sanity deploy`
- the webhook
- Vercel environment variables
- inviting editors

They're tracked in the spec's go-live checklist.
