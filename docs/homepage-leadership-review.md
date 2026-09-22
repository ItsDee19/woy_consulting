# Homepage leadership section

The homepage’s Selected Engagements teaser is replaced by Experience in the room, directly above the shared footer. The redesigned section uses an asymmetric portrait and editorial heading, italic red emphasis, concise partnership copy, a navy nameplate and a compact leadership-experience strip. Its link opens the Practitioners page.

Vipin’s supplied image is encoded as a 41,552-byte WebP without retouching. CSS frames the photograph and excludes the original image caption; his name and role are rendered as accessible HTML. The image loads lazily with responsive sources. Provenance and framing coordinates are recorded in `image-sources.json`. The original 35+ years proof point was replaced on 22 September 2026 with Business leadership, supported by Strategy, execution and P&L ownership. The named organisations continue to refer to Vipin’s prior leadership roles.

The old homepage teaser component and styles were removed. On phones the headline precedes the photograph, copy and credentials. Existing theme tokens, focus styles and reduced-motion preferences govern the new section.

Verification: production build, TypeScript, ESLint and all 31 unit tests passed. The full browser suite passed across 15 public pages, both themes and eight widths from 320 to 1920 pixels, with no detected JavaScript errors, automated accessibility violations, overflow or broken links. Focused checks confirmed the supplied image, final-section placement, responsive containment and keyboard navigation to Practitioners. Desktop, tablet and phone screenshots were reviewed in both themes. Strict design audit and official design document lint reported no errors or warnings. Independent source review found no actionable issues.

The implementation was verified in the local preview and subsequently approved by the owner for publication to the repository.
