# Homepage expertise and typography review

The owner-supplied reference replaces the previous three-column homepage expertise section. “Business ambition. Human possibility.” leads into four native accordion areas: strategy, leadership, organisation and people systems. Red italic emphasis, hairline rules and a restrained chevron preserve the reference's editorial character. Each panel contains a concise description and three deliverables; the first is open initially and only one opens at a time. The case-study link provides a concrete next destination.

The reference's serif appearance is implemented with Georgia and Times fallbacks across the website. This is a visual interpretation of the screenshot, not an identification of its original font file. The CSS font token owns the stack; controls and SVG labels inherit it, and there is no font download or delayed font swap.

Four Service entities now describe the four visible areas. All six previous capability anchors open their corresponding disclosure and clear the sticky navigation. The retired Expertise page and navigation item remain retired. Native disclosure controls work without JavaScript; reduced motion disables their entrance animation.

Validation: production build, TypeScript, ESLint, 32 unit tests, strict design audit and DESIGN.md lint pass. Browser checks cover all 15 routes, four current and six legacy expertise anchors, keyboard controls, no-JavaScript disclosures, typography inheritance, responsive widths from 320 to 1920px, and themes. No JavaScript errors, automated accessibility violations, horizontal overflow or broken links were found. Logo animation checks also pass. Screenshots in ignored `reports/` cover the expertise section plus independent typography review of the other pages.
