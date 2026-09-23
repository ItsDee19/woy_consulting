# Source recreation review, 23 September 2026

The supplied source appendix was integrated into the existing Next.js project for the shared navbar and `/expertise`, `/work`, `/people`, `/approach` routes. Its text, route names, original card order, static sections and responsive CSS cascade are preserved. The homepage, footer, About page, legal/contact pages, existing case studies and practitioner biographies retain their prior content and design.

## Integration decisions

- Source styling is isolated under `.recreation` in `app/recreation.css`; its original rule order, including later responsive overrides, is retained. Existing site tokens remain outside that scope.
- The navbar uses the authentic raster logo and source desktop/mobile navigation. The supplied Radix Sheet and Select primitives provide keyboard behavior, focus trapping/restoration and accessible names. A vertical scrollbar was added to the mobile Sheet because the original content exceeded short viewports.
- The owner’s follow-up restores Home to both desktop and mobile navigation and an always-visible light/dark toggle. It retains consent-aware preference storage and adapts the four recreated pages and portaled controls to the existing dark palette. The full-colour organisation gallery remains white.
- Three new routes were added and the Approach page replaced with the supplied static source layout. The former `/expertise` homepage redirect was removed. Source case and profile links resolve through explicit redirects to the existing detailed cases and practitioner biography anchors.
- Source metadata titles/descriptions use the project's canonical/social metadata helper. The sitemap includes all new top-level routes. Root layout continues to own the single main landmark.
- The owner confirmed reuse of existing artwork. The 49 source organisation records retain their order, names and display widths. A separate asset map adapts crop coordinates to the actual previously exported image dimensions, avoiding double-cropping. Original brand artwork, three portraits, Aviva, Go First and a corrected transparent Punjab National Bank logo were recovered from the supplied introduction PDF. No substitute/generated images were used.
- Original source records are kept in `lib/recreation-content.ts`, `lib/recreation-philosophy.ts` and `lib/recreation-experience-logos.ts`. Original source punctuation overrides earlier copy-editing preferences for this bounded recreation.
- Ignored report/reference fixtures are excluded from TypeScript compilation. The source-specified Lucide/Radix and styling helpers are declared dependencies.

## Verification

- Production build and TypeScript pass; ESLint passes; all 35 unit tests pass.
- Full production browser suite: 18 pages, light/dark environments and 320–1920px checks, zero detected JavaScript errors, automated WCAG A/AA violations, horizontal overflow or broken internal links/assets.
- Focused source-page checks at 1440, 1024, 850, 700, 390 and 375px cover open/closed navigation, active links, modal keyboard/focus/Escape/overlay behavior, all industry filters, stable cover numbers, original colors, all 49 logos, three portraits and hover/keyboard states.
- Restored theme controls were checked with OS dark preference, keyboard Space/Enter, consent-aware persistence and both desktop/mobile Home links. Dark Sheet and Select portal accessibility checks pass. Desktop navigation remains on one row down to the 850px mobile breakpoint.
- Mobile Sheet scroll containment was verified at 375×568 and 850×390. Existing hero animation, reduced motion and off-screen pause tests pass. No-JavaScript checks confirm full static expertise and philosophy content.
- Strict design audit and DESIGN.md lint pass. Images were inspected and all recovered/resolved assets decode successfully.

Browser renders were checked against the supplied source properties and copy. The original running reference site was not supplied, so this is not a claim of a pixel-for-pixel comparison with its rendered preview. Detailed screenshots, source extraction and verification reports remain in ignored `reports/`.

## Follow-up: fixed brand reds and philosophy destination

The owner confirmed that the homepage philosophy link should open `/approach#our-philosophy`. It was verified at 390px and 1440px with all three logo explanations visible at the destination. Brand text now retains #CD1421 (original pages) and #BC1830 (recreated sections) in both themes. Error feedback and focus indicators retain separate contrast-oriented colours.

Production build, lint, exact colour-parity checks and link navigation pass. This later colour decision changes the earlier accessibility baseline: exact light-mode reds on dark backgrounds produce known small-text contrast failures (the homepage philosophy eyebrow measures 3.14:1 against a required 4.5:1). Accessibility assertions remain enabled; no blanket waiver was added. See the ignored `reports/brand-red-link-review.json` for measured results.

## Follow-up: centred formation and dark surfaces, 24 September 2026

The star's introductory eight-unit horizontal translation caused the pale guide ring to appear off-centre. Its scaling now shares the fixed guide/orbit centre for the entire twelve-second sequence. The circle/compass travel, final logo, original colours and motion preferences are unchanged. The regression samples 21 points in the sequence at five viewport widths, including convergence/reset, and checks the guide, rotating orbit, star and nested outline in screen coordinates. Every centre difference is below 0.02 CSS pixels.

Dark-mode backgrounds now use an ink canvas #08090B, raised #0D0F12 and recessed #040506 surfaces, neutral separators and a quieter navy #0B1522 for the footer and branded panels. Source case covers, hover fills, menus and portrait placeholders follow the same restrained surface hierarchy. All text colours are preserved, including exact brand reds, error feedback and action text. A before/after browser comparison confirms 944 visible text elements across nine principal pages have unchanged computed colours. Light-mode surfaces, artwork and white logo/QR fields remain intact.

Production build, TypeScript, lint, all 35 unit tests, logo regression, strict design audit and design-document lint pass. The full browser run covers 18 pages and the existing responsive, keyboard, form, navigation and reduced-motion flows: zero JavaScript errors, overflows or broken internal links/assets. The accessibility suite correctly remains failing for small text in the two exact brand reds in dark mode (18 route/theme entries, all colour-contrast). Other automated accessibility rules and light-mode scans pass. No rules or assertions are disabled. Large red display text on the new reading surfaces meets 3:1; small brand-red text measures about 3.03–3.53:1 depending on its surface and cannot meet 4.5:1 on a dark field without changing the requested colours or presentation.

Desktop/mobile hero, philosophy, footer and case-card renders were visually reviewed. Supporting outputs remain in ignored `reports/`, including `dark-colour-preservation.json`, `logo-formation.json` and `browser-check.json`. A bounded release review confirmed the new routes, six case aliases, three practitioner aliases and 49-logo asset map; no private source PDFs, local reports or environment files are included in the release.

Lighthouse measured 95 mobile / 100 desktop performance, with no layout shift (mobile LCP 3.0 s, desktop 0.6 s). The local preview is intentionally noindex until the owner supplies the final public domain, so its SEO score is not a production indexing verdict. Lighthouse also surfaced a pre-existing mobile menu label mismatch: its accessible name now includes the visible word “Menu” (“Open navigation menu”). The browser selectors are updated to verify this name.
