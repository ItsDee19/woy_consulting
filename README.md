# WOY Consulting - website

A multi-page Next.js site (App Router, TypeScript, Tailwind v4). Core marketing copy is maintained in `lib/content.ts`; policy text lives in the two legal page files.

```
app/
  layout.tsx            shell: nav, footer, theme boot, scroll progress
  template.tsx          per-route enter animation
  page.tsx              home
  about/ approach/ practitioners/ contact/
  case-studies/
    page.tsx            index
    [slug]/page.tsx     six generated detail pages
components/             Nav, Footer, LogoFormation, Mark, ClientLogos, ...
lib/content.ts          all site copy and data
lib/site-url.ts         canonical origin for metadata, sitemap and robots
public/logos/           47 client logos extracted from the WOY deck
_legacy/                the earlier single-page static build, kept for reference
```

## Run it

Use Node.js 22.19 or newer (Node 24 recommended for the development tools).

```bash
npm install
```

```bash
npm run dev
```

Opens on `http://localhost:5173`. `npm run build` produces public pages, legal pages, social/icon assets, sitemap and robots. The contact API runs on the server.

See [the launch checklist](docs/launch-checklist.md) for the 20-point audit and deployment requirements, and [SEO/GEO readiness](docs/seo-geo.md) for search improvements and public-domain setup.

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm start -- -p 5173
```

With that production server running, use `npm run test:browser` for the route, accessibility and interaction checks, and `npm run test:performance` for mobile/desktop Lighthouse reports. These use Chrome on Windows or Playwright Chromium elsewhere; set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to use another installed Chromium browser. Results are written to ignored `reports/`.

## Deploy to Vercel

Vercel auto-detects Next.js, so there is nothing to configure in the build
settings. Import `ItsDee19/woy_consulting`, accept the defaults, and deploy.

Set server-only variables from `.env.example`: `SITE_URL`, `CONTACT_ENDPOINT`, `CONTACT_FORM_SECRET` and optional `CONTACT_ENDPOINT_TOKEN`. Rebuild after changing the public origin. Without delivery configuration the form reports unavailable and retains entered details.

HTTPS redirects, HSTS, CSP and other headers are in `next.config.mjs`. Hosting must supply TLS and trustworthy proxy headers. Preview/local builds block indexing. See [the checklist](docs/launch-checklist.md) for shared spam-limit requirements.

**Note on the repository:** `.gitignore` excludes `*.pdf` and `*.mp4`. The
introduction deck names clients that the site itself anonymises under
confidentiality agreements, and this repository is public. Share those files
through a private channel rather than committing them.

## Routes

| Route | What it holds |
|---|---|
| `/` | Plain light/dark hero, balanced animated brand mark and Growth / Excellence / Agility caption, positioning, compact expertise and delivery section, clients, interactive 4D approach and a founder-led leadership section |
| `/about` | Concise firm introduction, logo philosophy, partnership principles and expandable client roster |
| `/expertise` | Permanent redirect to the homepage’s `#expertise` section |
| `/approach` | Interactive 4D journey, connected architectural planes and the ownership built into delivery |
| `/case-studies` | Featured engagement and outcome-led portfolio of six cases |
| `/case-studies/[slug]` | Six detail pages, generated from `lib/content.ts` |
| `/practitioners` | Authentic portraits with monochrome/colour hover, experience highlights and expandable biographies |
| `/contact` | Direct email to hello@woyconsulting.com, plus the name, mobile and email form |
| `/faq` | Answers about WOY, its services, approach and enquiries |
| `/privacy-policy` | Information handling and cookie choices |
| `/terms-and-conditions` | Website terms and enquiries |

Adding a seventh case study means adding one object to `caseStudies` in
`lib/content.ts`. The portfolio entry, the detail page, the route and its metadata
all follow automatically.

---

## Brand foundations

Taken from the WOY introduction deck and the brand artwork, not invented.

| Token | Value | Source |
|---|---|---|
| Logo red | `#CD1421` | sampled from the logo artwork |
| Accent red | `#E83928` | sampled from the deck's cover band |
| Ink / charcoal | `#14171D` | aligned to the deck's `#041D41` navy |
| Warm white | `#FBF9F7` | page background |
| Typeface | Georgia-based serif stack | reference-inspired editorial typography throughout the website |

**Guiding principle: "Win Over Yourself."** The deck says *Win*, not *Wind*. The
site uses *Win* throughout.

### The mark

Geometry was measured off WOY's own artwork at 900 DPI rather than approximated,
and lives in `components/mark-geometry.ts`:

- **Circle**, holistic growth and unified vision
- **Five-point star**, excellence and competitive advantage. Five spokes at
  `0deg, 90deg, 180deg, 230deg, 310deg`. The horizontal pair is levelled rather
  than sitting at a true 72 degree spacing, which is how the original is drawn.
- **Compass**, strategic agility and adaptability. The north marker above the ring.

Spokes reach `0.745` of the ring's centreline radius.

---

## The hero animation

One 12-second CSS timeline in `globals.css`, shared by every part through
`--mk-duration`. The reference circle, outlined five-point star and detailed
compass rose are introduced separately before converging into the WOY mark. The animation uses W/Y paths whose painted height matches the ring; shared static logo geometry is unchanged.
Auto-loops; respects system reduced-motion preferences.

| Time | What happens |
|---|---|
| 0.0–1.7s | The three reference symbols reveal; the compass rose aligns north |
| 1.7–3.1s | Circle, star and compass hold separately |
| 3.1–5.5s | Symbols converge; the star resolves into the original spokes and the compass leaves its north marker |
| 5.5–7.0s | W, Y and CONSULTING complete the lockup; a fine alignment ring fades away |
| 7.0–10.1s | The original logo holds, clear of construction details |
| 10.1–12.0s | A gentle fade hides the reset before the sequence repeats |

**If you edit it, two things matter:**

1. The `woy-sheen` gradient must stay `gradientUnits="userSpaceOnUse"`. With the
   default `objectBoundingBox`, any stroke whose bounding box has zero width or
   height is not rendered at all per the SVG spec, which silently deletes the
   vertical spoke, both horizontal spokes and the Y stem.
2. `prefers-reduced-motion: reduce` collapses the sequence to the finished static
   lockup. Keep that block in sync with the timeline.

The full loop pauses outside the viewport and when the document is hidden. All tracks share a start time and use no animation delays. `npm run test:logo` samples the separate, merging and completed states and verifies reduced motion and off-screen pausing.

## Why there is no animation library

Reveals, the page transition and the scroll progress bar are IntersectionObserver
and CSS rather than Motion. The failure mode of a broken animation library on a
marketing site is invisible content, so `Reveal` carries three safeguards:

- the hidden state is scoped to `[data-js]`, so content renders visible if
  scripting never runs
- anything already in the viewport at mount is shown immediately rather than
  waiting on an observer callback
- a timer backstops the observer

The scroll progress bar uses a CSS scroll-driven animation, so it runs on the
compositor with no JavaScript and degrades to nothing where unsupported.

---

## Client logos

The 47 logos in `public/logos/` were extracted directly from page 15 of the WOY
deck, trimmed, and are rendered in full colour with their brand names beneath
them. No plate, no border, nothing drawn around the artwork.

The band behind them (`.logo-band` in `globals.css`) is a white surface in both
themes. That is deliberate and load-bearing: the extracted artwork carries a
white background, and several brands (EY, Airtel, Horiba, Union Bank) have a
dark or coloured lockup of their own. A white band is what lets the marks sit
directly on the page with no box around them and stay legible without
recolouring anyone's brand. Inside the band the ink tokens are re-pointed to
their light values so the captions stay readable in dark mode.

The home page runs two rows drifting in opposite directions; `/about` shows the
full grid. The disclaimer under both is carried over verbatim from the deck.

Four frames were dropped deliberately: an Aviva marketing banner rather than a
logo, a watermarked Go First file, a stray fragment, and WOY's own mark. The SAIL
file was cropped to remove a baked-in award badge.

---

## Before this goes live

The following details require WOY’s production information.

1. **Contact delivery.** Configure the server-only handler and signing secret from `.env.example`. Add the privacy email when provided.

2. **LinkedIn URLs.** `linkedin` is `null` for all three practitioners in
   `lib/content.ts`, and the card shows a placeholder line. These were not
   guessed, because a wrong guess points at the wrong person.

3. **Headshots.** Set `photo` in `lib/content.ts` to an image path and the
   initials tile is replaced automatically. Stock faces were not substituted
   under real people's names.

4. **Section photography.** Existing decorative stock photos are optimized locally in `public/images/`. Replace them with WOY-owned photography when available and update meaningful alternatives.

5. **Domain.** Set `SITE_URL` to the verified public origin for metadata, sitemap and HTTPS redirects.

## Content decisions

- **Case studies carry no client names.** Industry and scope of work only, per
  the NDA constraint. Names in the source deck were stripped.
- **No awards or press section.** WOY positions through work and engagement.
- **The Approach page is an interactive 4D journey**, with keyboard-accessible stage tabs, connected planes, stable detail panels and a readable no-JavaScript fallback.
- **Conversation CTAs open an email to hello@woyconsulting.com.** The footer combines the closing invitation, company information, navigation and legal links. The Contact page remains available; its separate form asks for name, mobile and email only and still requires server delivery configuration.

## Accessibility and performance

- Single-line nav at every desktop width, 72px tall, with the active route marked
  via `aria-current`.
- Skip link, visible focus rings, labelled form fields with `role="alert"` errors
  and an `aria-live` status.
- Every animation honours `prefers-reduced-motion`.
- Dark mode follows the system and can be overridden from the nav; the choice
  is applied before first paint and persists only with optional theme-memory consent.
- No scroll listeners anywhere.
