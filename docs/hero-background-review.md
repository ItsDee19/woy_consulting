# Homepage hero background

Implemented on 21 September 2026. The owner subsequently approved publishing the background, revised hero copy and final red emphasis together.

## Design and delivery

A generated architectural terrace and open horizon give the leadership and business advisory hero a sense of direction and lasting progress. The image is conceptual brand artwork, not a representation of a WOY office or engagement. The exact built-in image generation prompt and provenance are recorded in [hero-image-prompt.md](hero-image-prompt.md).

The single 1918 x 820 WebP asset is 83,736 bytes. Next Image provides responsive sources and preloads the hero image. Warm translucent overlays support light mode; navy overlays support dark mode. Phone layouts use a different crop and a vertical overlay to protect copy. The red logo animation, email CTA and existing layout order are preserved. The owner-supplied hero copy introduces partner-led consulting since 2015, with the headline “Turning strategic intent into sustained performance.” The final phrase is italic and uses the existing red text accent in both themes. There is no additional JavaScript or animation dependency.

The image is decorative and excluded from the accessibility tree. Solid theme backgrounds remain when it cannot load; forced-colors mode hides the image. Caption text uses the primary ink color, and the dark-theme eyebrow uses light text with a red rule.

## Verification

- Production build, TypeScript, ESLint and 31 unit tests passed.
- Browser checks passed on 15 public pages, both themes and eight viewport widths from 320 to 1920 pixels. No detected JavaScript errors, automated accessibility violations, horizontal overflow or broken internal links/assets.
- Hero assertions confirm successful decoding, decorative semantics, one image shared across themes and complete coverage of the hero at every tested width.
- Pixel sampling behind the hero text at eight widths in both themes produced 80 passing contrast samples, including the separate italic emphasis. The large red headline phrase measured at least 4.10:1, above its 3:1 requirement; the small logo caption measured at least 4.75:1, above its 4.5:1 requirement. The light overlay was strengthened slightly to protect that caption at tablet widths. This is a targeted check of the actual rendered image and overlays, not a complete accessibility certification.
- Image-request failure and Windows forced-colors fallbacks passed. Desktop and phone screenshots in both themes were visually inspected.
- Logo formation, convergence, completed artwork, responsive geometry, reduced motion and off-screen pause checks passed.
- Rendered copy and metadata on 15 public pages plus the custom 404 contain no em dashes. Source and text-asset scans also passed; the two remaining em dashes in a CSS comment and a review heading were replaced with standard punctuation.
- Strict premium audit: zero findings. Official design document lint: zero errors or warnings. Independent source review found no actionable issues.

## Local performance

Measured against the production preview after the background integration, before the final copy and accent refinement, using Chrome 153 and Lighthouse 13.5 with no competing browser audit.

| Metric | Mobile | Desktop |
|---|---:|---:|
| Performance | 92 | 100 |
| Accessibility | 100 | 100 |
| Best practices | 100 | 100 |
| First contentful paint | 1.1 s | 0.3 s |
| Largest contentful paint | 3.0 s | 0.7 s |
| Total blocking time | 180 ms | 20 ms |
| Cumulative layout shift | 0 | 0 |

These are local lab observations, not field measurements. SEO scores 69 because local previews intentionally block indexing. The public domain remains unconfigured, so hosted performance and production indexing need validation once that domain is supplied.

Screenshots, contrast samples, browser results and Lighthouse reports are retained in ignored `reports/`. The local production preview remains available at http://localhost:5173/.
