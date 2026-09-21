# Approach page and navigation review

Implemented on 21 September 2026 in response to the request to remove Expertise from the Navbar and give the Approach page an interactive, futuristic presentation.

## Design and behavior

- Desktop and mobile navigation now contain Home, About, Approach, Case Studies and Practitioners. Expertise remains accessible in the homepage section and footer; the legacy route redirect is preserved.
- The Approach page uses a navy editorial introduction and four connected architectural planes. Selecting Discover, Define, Design or Deliver illuminates the corresponding plane and displays the canonical stage description, outputs and outcome.
- Arrow keys, Home/End and previous/next controls support keyboard navigation. Inactive panels are inert and excluded from the accessibility tree; their grid placement reserves consistent space. Touch targets are at least 44 pixels. Short transitions follow system reduced-motion preferences.
- All stages remain available without JavaScript. The closing section summarizes ownership, capability and operating routines, then links to case studies and the shared conversation CTA.
- The palette, typography and red logo remain governed by existing tokens. Limited shading belongs to the diagram, with no autoplay or new animation dependency. The old accordion and its unused CSS were removed.

## Design drift review

| Area | Shared intent | Approach-page treatment |
|---|---|---|
| Identity | WOY navy, fixed red artwork and warm reading surfaces | Existing tokens throughout; readable coral for small text on navy |
| Method | Canonical 4D descriptions and outputs | All four stages retain their source content |
| Interaction | Clear controls and restrained motion | Explicit tabs and next/previous controls; no hover dependency |
| Depth | Flat reading surfaces and separators | SVG plane shading explains the connected stages |
| Layout | Natural document scrolling and shared shell | Stable detail area with a stacked mobile layout |

## Verification

- `npm run lint`, `npm run typecheck`, `npm test` and `npm run build`: passed; 31 unit tests and 23 generated routes/assets.
- `npm run test:browser`: 15 public pages, both themes and eight widths from 320 to 1920 pixels; zero JavaScript errors, automated accessibility violations, horizontal overflow or broken internal links/assets. The crawl collected 66 links and 50 image URLs.
- Explorer checks cover tab selection, keyboard focus, active-panel relationships, next/previous wrapping, stable section height, reduced motion and the no-JavaScript fallback. Navbar absence is checked separately for desktop and mobile; footer Expertise navigation is exercised.
- Additional checks exercised all four stages at 320, 390, 768 and 1440 pixels; all four selected states passed automated accessibility checks in both themes after transitions settled. Touch selection, touch next-stage navigation and forced-colour keyboard operation passed.
- Desktop, tablet and mobile screenshots were inspected. Diagram labels were placed along their corresponding plane edges, and the SVG is clipped to its viewport to prevent decorative overflow.
- Strict premium audit: zero findings. Official `designmd lint DESIGN.md`: zero errors or warnings. Independent read-only review found no actionable issues.

## Local page-speed measurement

`TEST_BASE_URL=http://localhost:5173/approach npm run test:performance`, production build, Chrome 153 and Lighthouse 13.5. Browser interaction checks completed before benchmarking.

| Metric | Mobile | Desktop |
|---|---:|---:|
| Performance | 98 | 100 |
| Accessibility | 100 | 100 |
| Best practices | 100 | 100 |
| First contentful paint | 0.9 s | 0.3 s |
| Largest contentful paint | 2.4 s | 0.5 s |
| Total blocking time | 50 ms | 0 ms |
| Cumulative layout shift | 0 | 0 |

These are local lab measurements, not live-host or real-user results. The final public domain is still pending and the preview intentionally blocks search indexing. Generated browser, screenshot and Lighthouse reports are retained in the ignored `reports/` directory.
