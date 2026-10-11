# WOY Consulting: Sanity CMS design

- **Date:** 2026-10-11
- **Status:** Draft for review
- **Repository:** `ItsDee19/woy_consulting`

## 1. Goal

WOY staff, who are not developers, can update the website's content and upload documents without touching code or GitHub. Expected volume is 5–10 changes a month. The CMS runs on Sanity's free plan, so it costs ₹0.

### Success criteria

1. A WOY editor logs in to the Studio, edits a case study or uploads a PDF, clicks **Publish**, and sees the change on the live site within a minute. The target is a few seconds.
2. Every existing page renders pixel-identical to today in light and dark mode, on desktop and mobile. The only allowed differences are listed in §10.
3. All existing checks still pass: lint, typecheck, unit tests, build, browser smoke, theme navigation, security check and Lighthouse.
4. No secrets are committed to Git, and the Content-Security-Policy in `lib/security-policy.mjs` is unchanged.

## 2. Decisions taken

| Topic | Decision |
|---|---|
| CMS | Sanity, free plan |
| Approach | **A**: Studio hosted by Sanity at `woy-consulting.sanity.studio`. The site reads published content through the Next.js cache, and a publish notification refreshes it within seconds. |
| Documents | **Both**: a new `/resources` page, plus an optional PDF attachment on case studies and people |
| Duplicate page sets | **Keep both**, fed from one CMS entry per case study or person |
| Editable scope | Case studies, people and resources, plus FAQs, expertise areas, client logos, site details and the legal pages |
| Sanity unreachable and nothing cached | **B**: serve an automatic backup copy saved at every build |
| Delivery | Two batches, each on its own branch and pull request |
| Workflow | Built and verified locally first. Pushed only after the owner reviews it. |

## 3. Current state (relevant findings)

- **Stack.** Next.js 16 (App Router), React 19, TypeScript, Tailwind 4, hosted on Vercel.
  - `app/layout.tsx` is `force-dynamic`.
  - `proxy.ts` sends a nonce-based CSP with every response.
  - HTML is `no-store`.
- **Content is spread across code files:**
  - `lib/content.ts`
  - `lib/recreation-content.ts`
  - `lib/people-profiles.ts`
  - `lib/faq.ts`
  - `lib/recreation-experience-logos.ts` and `lib/recreation-logo-assets.ts`
  - JSX in `app/privacy-policy/page.tsx` and `app/terms-and-conditions/page.tsx`
- **Two parallel page sets exist.**
  - The navbar set: `/work` and `/work/[slug]`, plus `/people` and `/people/[slug]`.
  - An older set that is still live, in the sitemap, and linked from `/about`: `/case-studies` and `/case-studies/[slug]`, plus `/practitioners`.
  - Each case study and person is written twice, with different fields, slugs, roles, photos and order.
- **Expertise copy exists in two places.** It's in `content.ts` `expertiseAreas` (homepage) and in `recreation-content.ts` `expertise` (`/expertise`).
  - The six `capabilities` in `content.ts` are not rendered anywhere. They will be deleted, not migrated.
- **Client logos have three presentations, each with its own crops and ordering:**
  - the homepage marquee (`clientLogos`, `featuredRows`, `marqueeCrops`)
  - the `/work` grid (`experienceLogos` + `recreationLogoAssets`, with `displayWidth`)
  - the `/case-studies` grid (`clientLogos`, sorted alphabetically)
- **One privacy version constant is shared.** `PRIVACY_NOTICE_VERSION` is used by the privacy page, `ContactForm` (a client component) and the version check in `/api/contact`.
- **The homepage hero, Stats, the leadership feature, the 4D approach, the logo philosophy and the navbar are design copy.** They stay in code.
- **Content inconsistency for WOY to confirm.** This work does not change it. The homepage says Vipin has "45+ years of leadership", but his profile says "more than 35 years".

## 4. Architecture

```
Editors ──► Studio (woy-consulting.sanity.studio; source in studio/)
                │ publish
                ▼
        Sanity Content Lake (project "WOY Consulting", dataset "production", public)
                │ webhook (signed)                    ▲ GROQ (published only)
                ▼                                     │
   POST /api/revalidate ──► revalidateTag ──► Next.js data cache ◄── lib/cms getters ◄── pages
                                                                         │ connection failure
                                                                         ▼
                                                     lib/cms/snapshot.generated.json (built at deploy)
```

### Units

| Unit | Responsibility | Depends on |
|---|---|---|
| `studio/` | A standalone Sanity Studio with its own `package.json`. Holds the schemas, desk structure and import script, and is deployed with `sanity deploy`. It is outside the Next.js build, lint and typecheck. | Sanity |
| `lib/sanity/client.ts` | Server-only client config: project ID, dataset, pinned `apiVersion`, `useCdn: false` and the `published` perspective. | env |
| `lib/sanity/fetch.ts` | `sanityFetch(query, params, tags)`. It calls the client with `next: { revalidate: 300, tags }`. | client |
| `lib/cms/queries.ts` | All GROQ queries. Used by the getters and by the snapshot script. | — |
| `lib/cms/*.ts` | One getter per content type, for example `getCaseStudies()` and `getSiteSettings()`. Each is wrapped in React `cache()` and maps Sanity documents to the shapes the components consume today. | fetch, snapshot |
| `lib/cms/fallback.ts` | Decides whether an error should fall back to the snapshot (`shouldUseSnapshot`) and serves the matching snapshot section. | snapshot |
| `scripts/cms-snapshot.mjs` | Runs on `prebuild` and `predev`. It fetches every query and writes `lib/cms/snapshot.generated.json`, which is git-ignored. **It exits non-zero on any failure**, so the build fails and the current production deployment stays live. | queries |
| `app/api/revalidate/route.ts` | The webhook receiver. It verifies the Sanity signature, then revalidates tags. | secret |

**Caching.** Published content is fetched from Sanity's live API (`useCdn: false`), so a fetch that happens straight after a publish is never served stale by Sanity's CDN. Results are held in the Next.js data cache under these tags:

- `sanity`, for everything
- `sanity:<type>`, for each content type

Visitors are served from that cache. The webhook revalidates the tag for the published document's `_type`, and a 300-second time-based refresh acts as a backstop. Sanity API usage therefore scales with the number of edits, not with traffic.

> To verify while planning: the exact `revalidateTag` signature and fetch-cache behaviour inside `force-dynamic` routes in the installed Next.js 16. Read `node_modules/next/dist/docs` before writing code.

### Environment variables

| Name | Secret? | Where it lives |
|---|---|---|
| `SANITY_PROJECT_ID` | No | `.env.example`, `.env.local`, Vercel |
| `SANITY_DATASET` (`production`) | No | same |
| `SANITY_REVALIDATE_SECRET` | **Yes** | `.env.local` and Vercel only |

- There is no read token, because the dataset is public.
- There is no write token anywhere. The import runs with the developer's own Sanity CLI login (`sanity exec --with-user-token`).

## 5. Content model

Rules for every type:

- Required fields block Publish.
- Lengths are capped where the design needs it, for example the cover text is two short lines.
- Lists are reordered by drag and drop (`@sanity/orderable-document-list`).
- Fields that only matter to a developer are hidden or read-only, and are set by the import.

### Batch 1

**`caseStudy`**

The main fields drive `/work`, `/work/[slug]`, the homepage "Selected work" section, and the "In practice" links on `/expertise`:

- `title`
- `slug`, generated from the title. Its help text warns that changing it changes the URL.
- `industry`, `summary`, `coverText` (two lines), `strap`
- `theme`: Mist, Navy, Charcoal or Silver
- `featured`
- `context`, `focus[]`, `work[] {title, text}`
- `resultsHeading`, `results[]`, `takeaway`
- `document`: an optional file with a button label. The default label is "Download the full case study".
- order

The **"Older case-study page"** group is collapsed and drives `/case-studies` and `/case-studies/[slug]`. Each field falls back to a main field when empty:

| Older field | Falls back to |
|---|---|
| `legacySlug` | `slug` |
| `olderTitle` | `title` |
| `olderIndustry` | `industry` |
| `headline` | `summary` |
| `olderContext` | `context` |
| `edge[]` | `focus[]` |
| `framework[]` | the `work[]` titles |
| `outcomes[]` | `results[]` |
| `olderOrder` | entries without it follow, in main order |

**`person`**

The main fields drive `/people` and `/people/[slug]`:

- `name`, `slug`, `role`
- `portrait`, an image whose focal point is required
- `introduction`, `biography[]` (paragraphs), `experience[]` (company names)
- `focus`, the one-line summary used in listings
- `linkedin`, optional
- `document`, an optional file with a button label
- order

The **"Older practitioners page"** group is collapsed and drives `/practitioners`. Each field falls back to a main field when empty:

| Older field | Falls back to |
|---|---|
| `olderRole` | `role` |
| `lede` | `introduction` |
| `olderBio[]` | `biography[]` |
| `expertise[]` | empty, so the list is hidden |
| `olderPhoto` | `portrait` |

The initials are derived from the name. The homepage leadership feature stays in code.

**`resource`** (documents)

- `title`, `description` (at most 240 characters)
- `category`: Brochure, Whitepaper, Report or Other
- `file`: required. Accepts `.pdf`, `.doc(x)`, `.ppt(x)` and `.xls(x)`.
- `date`: required, defaults to today
- `coverImage`: optional

The `/resources` page lists resources newest first. Each item shows the category, date, description, file type and size, and a **Download** link that uses `?dl=<file name>`.

### Batch 2

**`faq`**

- `question`
- `answer`: plain paragraphs
- `links[] {label, href}`. Links must be internal paths, `https:` or `mailto:`.
- order

The answers that are generated from other content today are imported as fixed text. These entries feed both `/faq` and the FAQPage structured data.

**`expertiseArea`**

- `title`, `question`, `description`, `services[]`
- `featuredCaseStudy`: a reference to a `caseStudy`
- order. The 01–04 numbering is derived from it.

Read-only fields set by the import, so existing links keep working:

- `anchorId`, for example `strategy`
- `homepageSlug`
- `legacyAnchors[]`

The import checks that the homepage `summary` and the `/expertise` `description` are identical. If they differ, a separate `homepageSummary` field is added.

**`clientLogo`**

- `name`
- `logo`, an image with an editor crop
- `displayWidth`, for the `/work` grid
- `featuredOnHomepage` and `homepagePosition` (1–12)
- order

A hidden "advanced" group holds the per-presentation crops and orderings set by the import, which reproduce today's three presentations exactly. Logos added later use the editor's crop and the main order everywhere.

**`siteSettings`** (single document)

- `name`, `legalName`, `location`, `email`, `principle`, `tagline`, `established`
- `ctaLabel` (the "Start a conversation" button label)
- `description` (used for SEO)
- `duns {number, profileUrl, referenceImage}`
- `logoDisclaimer`

The CTA link (`ctaHref`) stays in code.

**`legalPage`** (two single documents: `privacyPolicy` and `termsAndConditions`)

- `title`, `lede`, `lastUpdated` (a date)
- `sections[] {heading, body}`. `body` is Portable Text: paragraphs, bullet lists and links. Each section's anchor ID is generated from its heading.
- The privacy body can also contain a **cookie preferences button** block. Editors can move it, but its behaviour stays in code.

**Privacy notice version.** The privacy `lastUpdated` date (`YYYY-MM-DD`) becomes the privacy notice version:

- The privacy page, `ContactForm` (which receives it as a prop) and `/api/contact` all read it from the same getter.
- Suppose the policy is republished while a visitor has the form open. That submission is rejected through the existing version check, and the visitor sees a message asking them to refresh and resend. The plan will confirm the wording of that message.

## 6. Page and route changes

- **Pages and server components** `await` the `lib/cms` getters. **Client components** receive data as props and never call Sanity: `WorkFilter`, `ExpertiseAccordion` and `ContactForm`.
- **Dynamic routes.** `generateStaticParams` reads slugs from the getters, and `dynamicParams` stays enabled. New entries are therefore reachable without a redeploy, and unknown slugs return `notFound()`.
- **Shared consumers use the getters**, so they always match the pages: `app/sitemap.ts`, `lib/structured-data.ts` and the metadata helpers.

**Batch 1 changes**

| Area | Change |
|---|---|
| Existing routes | `/work`, `/work/[slug]`, the homepage Selected work section, the "In practice" links on `/expertise`, `/people`, `/people/[slug]`, `/case-studies`, `/case-studies/[legacySlug]` and `/practitioners` all read from the getters. |
| FAQ (interim) | `lib/faq.ts` becomes async and builds its generated answers from the getters until batch 2. |
| New `/resources` page | Linked from the footer navigation. Gets a sitemap entry and CollectionPage structured data. |
| Download button | A new `DownloadButton` component on `/work/[slug]`, `/case-studies/[slug]` and `/people/[slug]`, rendered only when a document is attached. |

**Batch 2 changes**

| Area | Change |
|---|---|
| FAQ | `/faq` |
| Expertise | The homepage expertise section and `/expertise` |
| Logos | All three logo presentations |
| Site settings | Read everywhere `site` is used: the layout, footer, contact page, `TurnstileCheck`, `DunsRegistration`, metadata and structured data |
| Legal | The legal pages and the contact privacy version |

**Cleanup at the end of each batch**

- Delete the data that moved to Sanity.
- Code-owned content (navbar, 4D approach, pillars, philosophy symbols) moves to `lib/static-content.ts`.
- `capabilities` is deleted.

## 7. Failure handling (option B)

| Situation | Behaviour |
|---|---|
| Sanity is reachable | Live, cached content |
| Sanity is unreachable and a cached copy exists | Next.js keeps serving the cached copy, and the failure is logged |
| A connection failure with nothing cached | Serve the matching section of the build snapshot, and `console.warn` with the snapshot's timestamp |
| A query or mapping error (a bug) | Throw. Never fall back. |
| The snapshot can't be generated at build | The build fails, and the previous deployment stays live |

The connection-versus-bug decision lives in one function, `shouldUseSnapshot(error)`. It covers network errors, timeouts, HTTP 5xx and 429. The repository owner writes it during implementation, with its tradeoffs explained first.

The snapshot file is generated, never edited by hand and git-ignored. Every script that needs it (`dev`, `build`, `typecheck`) generates it first.

## 8. Security

- **The CSP is unchanged.**
  - Every Sanity image is rendered through `next/image` or `getImageProps`, so browsers load it from `/_next/image` on the site's own origin. `next.config.mjs` `images.remotePatterns` allows only `https://cdn.sanity.io/images/<projectId>/production/**`.
  - Raw `cdn.sanity.io` URLs are never placed in `<img>`. Today `components/recreation/CollectiveExperience.tsx` uses a plain `<img>`, so it moves to `getImageProps`.
  - Document downloads are ordinary links (navigations) to `cdn.sanity.io/files/...`.
- **The webhook accepts POST only.**
  - It verifies the HMAC signature with `SANITY_REVALIDATE_SECRET`. A missing or invalid signature returns 401, and nothing from the request body is echoed back.
  - The existing strict CSP header on `/api/*` stays.
- **Public dataset.**
  - Published content and every uploaded asset can be fetched by anyone with the project ID. Drafts cannot.
  - An asset URL exists from the moment a file is uploaded, even if the entry is never published. The editor guide says plainly: **upload only material that is meant to be public.**
- **CORS origins** allow only the hosted Studio domain and `http://localhost:3333`.
- **Rich text** (legal pages and FAQ links) is rendered through `@portabletext/react` with explicit components. No raw HTML is rendered, and link protocols are allow-listed.
- **Roles.** The free plan has two roles, Administrator and Viewer, so every editor is an Administrator. Invite only named WOY staff, and remove them when they leave.
- **Bundle scan.** `npm run security:check` must still pass, including its scan of client bundles for secrets.

## 9. Content import

- **Script.** `studio/scripts/import-current-content.ts`, run with `npx sanity exec scripts/import-current-content.ts --with-user-token`. A `--dry-run` flag prints what would change.
- **Sources.** It reads the current TypeScript content modules and the files under `/public`, and uploads every image and file it needs.
- **Focal points.** A portrait's `imagePosition: "50% 26%"` becomes the hotspot `{x: 0.5, y: 0.26}`.
- **Crops.** A pixel crop `[x, y, w, h]` on a `W×H` image becomes `{left: x/W, top: y/H, right: 1-(x+w)/W, bottom: 1-(y+h)/H}`.
- **Fixed IDs** such as `caseStudy.education-transformation`, `person.vipin-tuteja` and `clientLogo.airtel` are written with `createOrReplace`. The import is idempotent and safe to re-run.
- **Order of work.** Batch 1 imports case studies and people. Batch 2 imports everything else.
- **Parity tests.** Before any page is switched over, a test maps every imported document back through the `lib/cms` mappers and deep-compares the result with the current TypeScript data. The old files are deleted only after that test passes.

## 10. Testing and acceptance

1. **Baseline screenshots before any code change.** Every route, including all `/work/*`, `/case-studies/*` and `/people/*` pages, captured at 1440×900 and 390×844, in light and dark mode, with reduced motion. They are captured with Playwright, which is already a dev dependency.
2. **Comparison after each batch.** Zero pixel differences, except:
   - the footer gains a Resources link
   - the new `/resources` page
   - Download buttons, which appear only where a document is attached. None are attached during the comparison run.
3. **A second comparison with Sanity blocked**, to prove the snapshot path renders identically.
4. **Parity tests** (see §9).
5. **New unit tests:**
   - the mappers and their fallback rules
   - initials
   - crop and hotspot conversion
   - `shouldUseSnapshot`
   - the webhook (valid, invalid and missing signature)
   - the privacy-version flow in `/api/contact`
   - the snapshot script failing on a fetch error
6. **Existing checks:**
   - `npm run lint`
   - `npm run typecheck`
   - `npm test`
   - `npm run build`
   - `npm run test:browser`
   - `npm run test:theme-navigation`
   - `npm run test:selected-work-navigation`
   - `npm run security:check`
   - `npm run test:performance`, with no regression beyond run-to-run noise of ±3 Lighthouse points
7. **Manual round trip.** Edit an entry in the local Studio, run the local revalidate helper (`npm run cms:revalidate`) or wait 5 minutes, and see the change on the local site.

## 11. Setup steps and who does them

| Step | Who |
|---|---|
| Create a Sanity account, or sign in to one | **Owner only** |
| Log in to the Sanity CLI on this machine (`npx sanity login`, browser sign-in) | **Owner** completes the sign-in |
| Create the Sanity project and dataset, set the CORS origins | Claude, with the owner's go-ahead. The owner accepts any terms. |
| Run the import | Claude, using the owner's CLI login |
| Generate `SANITY_REVALIDATE_SECRET` into `.env.local` | Claude |
| Paste the secret into the Sanity webhook and the Vercel environment | **Owner** |
| Set `SANITY_PROJECT_ID` and `SANITY_DATASET` in Vercel, and `sanity deploy` the Studio | Claude, with the owner's go-ahead, or the owner |
| Invite WOY's editors | Claude, after the owner approves each invite, or the owner |

## 12. Rollout

- This spec is committed on `feat/sanity-batch-1`. Batch 1 is built and verified locally. It is pushed and a pull request opened against `main` only after the owner reviews it. Batch 2 follows on `feat/sanity-batch-2`.
- **Go-live checklist:**
  - Vercel environment variables
  - Studio deployed
  - CORS origins set
  - webhook pointed at `https://<production domain>/api/revalidate`
  - editors invited
  - the editor guide sent to WOY
  - **the Vercel plan confirmed.** Hobby does not allow commercial use, and Pro is about $20 a month.
- **Rollback.** Revert the pull request. Content in Sanity is unaffected and can stay where it is.

## 13. Editor guide

`docs/editing-guide.md`, written in plain language with screenshots. It covers:

- logging in
- editing a case study or person
- adding a resource
- attaching a document
- publishing
- undoing a change (document history)
- what never to upload
- why the privacy policy's "last updated" date matters
- who to contact when something looks wrong

## 14. Out of scope

- Draft preview and visual editing. These would need `frame-ancestors` relaxed.
- Private or client-only documents.
- A page builder, or new page layouts.
- Editing the homepage hero, Stats, the leadership feature, the 4D approach, the logo philosophy or the navbar.
- Multiple languages.
- Scheduled publishing and finer-grained roles, which need a paid Sanity plan.

## 15. Risks and open items

| Item | Mitigation |
|---|---|
| Sanity's free plan doesn't explicitly confirm commercial use | Check the terms or ask Sanity before go-live |
| Vercel Hobby is non-commercial | The owner confirms the plan before go-live |
| Next.js 16 API details (`revalidateTag`, fetch cache under `force-dynamic`) | Verify against the installed Next.js docs while planning |
| Logo pixel parity across three presentations | Hidden per-presentation crop and order fields, plus screenshot comparison |
| Studio's React version vs the site's React 19 | Studio is a separate package with its own dependencies |
| "45+" vs "35" years of leadership | Raise with WOY. Not changed by this work. |
