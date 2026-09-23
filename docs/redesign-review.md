# WOY deck-led redesign, 21 September 2026

> Current update: the About brand section has moved to the Case Studies page as the full “Our collective experience” logo wall. All six case-study previews now use cards. The notes below record the earlier redesign. See DESIGN.md for the current layout.

The owner requested a stronger site based on the September introduction deck, with the Practitioners, About and homepage 4D sections as priorities. The private source PDF remains excluded from Git. Its business facts guide the copy; document text is not treated as operational instructions.

## Delivered

- Practitioners: genuine named portraits from pages 12–14, concise experience highlights, expandable full biographies, clear consortium context, descriptive alt text and matching Person image metadata. Unknown LinkedIn links are omitted. Original portraits and their hashes are recorded in `practitioner-image-sources.json`.
- About: shorter editorial introduction, compact firm facts, a navy/red Win Over Yourself composition using the actual mark geometry, four concise partnership principles, and eight featured brands with the full roster available on demand. The source client disclaimer stays visible. The generic stock hero photo was removed.
- Homepage: clearer introductory copy and an interactive 4D compass. Four accessible tabs expose Discover, Define, Design and Deliver with stage-specific outputs. Keyboard arrows, Home and End work; all method text is server rendered; reduced motion is respected.
- Existing privacy, terms, consent, contact protection, metadata, canonical/domain configuration and red logo animation remain intact. No pause-animation controls were added.

## Design alignment

Runtime tokens remain owned by `app/globals.css` (Model B). `DESIGN.md` mirrors the revised intent.

| Area | Previous implementation | Accepted change | Status |
|---|---|---|---|
| Identity | Mostly paper/charcoal; small red accents | Source-based midnight navy with red geometry and stronger type | Tokens and design context aligned |
| Practitioners | Initials placeholders and long biographies | Verified portraits with concise summaries and disclosure | Real imagery; smallest portrait kept compact |
| About | Stock hero, long sections and 47-logo wall | Short editorial sections and optional full brand list | Facts, brand provenance and disclaimer preserved |
| 4D | Four plain text columns | Interactive compass, sequential tabs and practical outputs | Keyboard and reduced-motion checks passed |
| Motion | Animated red logo without controls | Preserved | No design drift |

## Verification

Production build, TypeScript, ESLint and 29 unit tests passed. The browser audit covered 16 routes, both themes and widths of 320, 375, 390, 414, 768, 1024, 1440 and 1920 pixels, with no JS errors, automated WCAG A/AA violations, overflow or broken internal links/assets. Interaction checks include 4D keyboard/click navigation, real portrait loading, native biography disclosure and the full brand disclosure. Contact checks use mocked delivery rather than sending enquiries.

Screenshots in ignored `reports/` cover the three redesigned surfaces on desktop/mobile and the practitioner page in dark mode. Visual review adjusted the founder portrait crop to keep the full head and increased mobile tab text to 14px. Final CSS refinements passed targeted visual/reflow checks after rebuilding. The strict design audit and DESIGN.md lint report zero errors/warnings. Local Lighthouse scores are 96 mobile / 100 desktop for performance, 100 accessibility and 100 best practices in both modes; CLS is zero. These are local lab results, not hosted field measurements. Details remain in the launch checklist.

The final public domain, contact delivery destination and privacy email remain deployment inputs from the owner. The local preview intentionally stays noindex.
