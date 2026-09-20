# WOY Consulting - website

A multi-page Next.js site (App Router, TypeScript, Tailwind v4). Every page
renders from a single content file, so copy changes never require touching a
component.

```
app/
  layout.tsx            shell: nav, footer, theme boot, scroll progress
  template.tsx          per-route enter animation
  page.tsx              home
  about/ expertise/ approach/ practitioners/ contact/
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

```bash
npm install
```

```bash
npm run dev
```

Opens on `http://localhost:5173`. `npm run build` produces 17 prerendered routes,
including `sitemap.xml` and `robots.txt`.

## Deploy to Vercel

Vercel auto-detects Next.js, so there is nothing to configure in the build
settings. Import `ItsDee19/woy_consulting`, accept the defaults, and deploy.

Then set these under **Settings > Environment Variables**:

| Variable | Value | Scope |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://woyconsulting.com` | Production |
| `NEXT_PUBLIC_CONTACT_ENDPOINT` | your form handler URL | Production, Preview |

Neither is required for a first deploy. Without `NEXT_PUBLIC_SITE_URL` the app
falls back to the Vercel production domain, then the preview domain, then
localhost. Without `NEXT_PUBLIC_CONTACT_ENDPOINT` the contact form validates and
reports success without sending anything.

`vercel.json` sets security headers on every route and a one year immutable
cache on `/logos/*`. Preview deployments return `Disallow: /` in `robots.txt`,
so only the production domain is indexed.

**Note on the repository:** `.gitignore` excludes `*.pdf` and `*.mp4`. The
introduction deck names clients that the site itself anonymises under
confidentiality agreements, and this repository is public. Share those files
through a private channel rather than committing them.

## Routes

| Route | What it holds |
|---|---|
| `/` | Hero with the logo animation, positioning, three pillars, client wall, 4D teaser, selected work |
| `/about` | Who we are, the logo philosophy, why partner with WOY, the full client wall |
| `/expertise` | Three pillars, each with its capabilities broken out in full |
| `/approach` | The 4D approach as drop-downs, plus what stays behind after delivery |
| `/case-studies` | Index of six cases |
| `/case-studies/[slug]` | Six detail pages, generated from `lib/content.ts` |
| `/practitioners` | Profiles with hover reveals and LinkedIn slots |
| `/contact` | Name, mobile and email form |

Adding a seventh case study means adding one object to `caseStudies` in
`lib/content.ts`. The index card, the detail page, the route and its metadata
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
| Typeface | Geist | closest match to the deck's humanist sans |

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

One 11 second CSS timeline in `globals.css`, shared by every part of the mark so
it cannot drift. Auto-loops, no replay control.

| Time | What happens |
|---|---|
| 0.0 - 2.2s | Three symbols draw themselves in, staggered |
| 2.2 - 4.2s | The three converge and merge into the single mark |
| 4.2 - 5.7s | W and Y draw in, then CONSULTING settles from wide letterspacing |
| 5.7 - 8.4s | The complete lockup holds |
| 8.4 - 11s | The wordmark releases and the mark separates again |

**If you edit it, two things matter:**

1. The `woy-sheen` gradient must stay `gradientUnits="userSpaceOnUse"`. With the
   default `objectBoundingBox`, any stroke whose bounding box has zero width or
   height is not rendered at all per the SVG spec, which silently deletes the
   vertical spoke, both horizontal spokes and the Y stem.
2. `prefers-reduced-motion: reduce` collapses the sequence to the finished static
   lockup. Keep that block in sync with the timeline.

The loop pauses once it scrolls out of view.

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

Each is marked `TODO` in the source.

1. **Contact form endpoint.** The form validates and shows loading, error and
   success states, but posts nowhere. Create `.env.local`:

   ```
   NEXT_PUBLIC_CONTACT_ENDPOINT=https://formspree.io/f/YOUR_ID
   ```

   Any handler that accepts a `POST` of `FormData` and returns 2xx will work.
   Without it the form runs in demo mode and logs a console warning.

2. **LinkedIn URLs.** `linkedin` is `null` for all three practitioners in
   `lib/content.ts`, and the card shows a placeholder line. These were not
   guessed, because a wrong guess points at the wrong person.

3. **Headshots.** Set `photo` in `lib/content.ts` to an image path and the
   initials tile is replaced automatically. Stock faces were not substituted
   under real people's names.

4. **Section photography.** `/about` and `/expertise` use `picsum.photos`
   placeholders. Replace with WOY's own photography at roughly 1800x760 and
   1100x620.

5. **Domain.** `metadataBase` in `app/layout.tsx` is set to
   `https://woyconsulting.com`. Point it at the real domain so Open Graph URLs
   resolve.

## Content decisions

- **Case studies carry no client names.** Industry and scope of work only, per
  the NDA constraint. Names in the source deck were stripped.
- **No awards or press section.** WOY positions through work and engagement.
- **The 4D approach is drop-downs**, one open at a time.
- **The contact form asks for name, mobile and email only.** No query field.

## Accessibility and performance

- Single-line nav at every desktop width, 72px tall, with the active route marked
  via `aria-current`.
- Skip link, visible focus rings, labelled form fields with `role="alert"` errors
  and an `aria-live` status.
- Every animation honours `prefers-reduced-motion`.
- Dark mode follows the system and can be overridden from the nav; the choice
  persists in `localStorage` and is applied before first paint.
- No scroll listeners anywhere.
