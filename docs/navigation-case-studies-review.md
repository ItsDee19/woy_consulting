# Navigation, expertise and case-study refinement

> Current updates: homepage expertise now uses four editorial accordions; see [the expertise review](expertise-review.md). The case-study index now presents all six engagements as readable cards and adds the full “Our collective experience” logo wall. The former About logo section is removed. See DESIGN.md for the current design contract. The notes below record earlier iterations; case-detail content and URLs remain unchanged.

The owner requested explicit Home navigation, a stronger case-study presentation, a compact combination of expertise and delivery on the homepage, removal of the standalone Expertise page, and monochrome-to-colour practitioner interactions. The established WOY palette, source facts and logo remain the basis of the work.

## Latest reference refinement, 23 September 2026

The navbar, full footer and homepage hero label now use an Arial/Helvetica sans-serif stack based on the supplied screenshot. Main content retains its editorial serif. The hero label is uppercase and tracked, with its leading rule removed. Desktop and mobile navbar actions read “Let’s talk” and keep the supplied email destination. The static navbar/footer logos now follow the reference’s broader W/Y proportions; see [the logo review](logo-formation-review.md).

This release also includes the six readable case-study cards, the 47-logo collective-experience section, the removal of About’s former industry roster, and the source-verified transparency repairs for five logos.

Verification: production build and TypeScript, ESLint, all 32 unit tests, strict design audit and design-document lint passed. The production browser suite checked 15 pages in both themes and eight widths with no JavaScript errors, automated accessibility violations, horizontal overflow or broken internal links/assets. Focused logo checks passed at five widths, and footer checks verified the grouped D&B profile/QR control, keyboard and no-JavaScript disclosure, contrast and responsive layout. Local screenshots and detailed reports remain in ignored `reports/`.

## Changes

- Home appears in desktop/mobile navigation and the footer. Expertise links to `/#expertise`; the existing active-page state only marks Home on the homepage.
- The homepage shows all six capabilities grouped by the three outcomes. Native disclosures expose the source summaries and delivery areas, one at a time. Original capability slugs remain valid homepage anchors; direct fragment visits open the matching detail.
- `/expertise` permanently redirects to `/#expertise`. Sitemap, FAQ, service metadata and internal links reflect the new location. HTTPS upgrade rules remain first. No standalone expertise route remains in the production page set.
- Case studies now have a featured education engagement, a factual 5/3/1-year planning diagram and concise sector/outcome rows. Detail pages separate the situation, work and outcomes with section links. All six original slugs and anonymised content remain.
- Practitioner portraits start monochrome on devices with hover, then regain colour and gently enlarge inside a fixed frame. Keyboard focus offers the same effect. Touch devices show colour; reduced motion disables zoom and transition. No controls, layout movement or continuous animation were added.

## Design alignment

Runtime tokens remain in `app/globals.css` and are documented by `DESIGN.md`. This refinement introduces no new palette or typeface.

| Area | Design decision | Implementation |
|---|---|---|
| Navigation | Direct route home, expertise as homepage content | Shared nav data, consistent Home active state, permanent legacy redirect |
| Expertise | Six capabilities without another long page | Three compact columns, native disclosures and saved capability anchors |
| Case studies | Explain actual consulting work rather than decorate it | Real planning horizons, observed outcomes, clear engagement briefs |
| Portrait motion | Personal, restrained and accessible | Grayscale-to-colour plus 4.5% zoom; fixed geometry; touch/reduced-motion alternatives |

## Verification

- Production build/TypeScript, ESLint, 31 unit tests, DESIGN.md lint and strict design audit passed.
- The full browser audit checked 15 public pages, light/dark themes and 320–1920px viewports: zero JS errors, automated WCAG A/AA violations, horizontal overflow or broken internal links/assets. It checked 65 unique links and 50 image assets.
- New interaction checks cover Home navigation, mobile menu closure, the 308 legacy redirect, matching homepage service entities, capability deep links and exclusive native disclosures, plus portrait hover, keyboard focus, touch and reduced-motion alternatives.
- After removing redundant labels and tightening spacing, targeted checks expanded each of the six capabilities at 320, 390, 768, 1024 and 1440px. All fit without overflow. Case-study chapter navigation clears the sticky header.
- At 1440px, the collapsed expertise section is 673px tall versus the previous 1,012px section: approximately one-third shorter while adding the six capability summaries/focus areas on demand. At 390px it is 1,226px tall, preserving readable single-column content.
- Final local Lighthouse: performance 96 mobile / 100 desktop; accessibility and best practices 100 in both modes; CLS 0. Mobile FCP/LCP/TBT: 1.1s/2.6s/90ms; desktop: 0.3s/0.7s/0ms. Local SEO remains 69 because the preview intentionally blocks indexing. These are local lab measurements, not hosted field results.

Screenshots and machine-readable reports stay in ignored `reports/`. Existing contact tests remain mocked and do not send enquiries. The final domain and server-only delivery configuration still await the owner’s production inputs.
