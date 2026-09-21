# Footer and email CTA review

Implemented on 21 September 2026 from the owner-supplied footer reference and `hello@woyconsulting.com` contact address.

## Result

The shared footer now combines the closing conversation invitation with company details and site navigation. A large two-line heading, fine orbital geometry around the exact WOY compass glyph, navy background and red action establish the visual direction. Brief hover/focus movement adds feedback without autoplay or an additional JavaScript dependency.

The reference supplies the company display name and Gurgaon location. Its D-U-N-S block was not reproduced because no verified profile destination or usable badge asset was supplied. Existing legal links, cookie preferences and the AvlysAI credit remain visible. A Back to top link targets the main content.

All prominent conversation links now open `mailto:hello@woyconsulting.com`. The address is also visible in the footer, Contact page and FAQ, and is included in the Organization structured data. The Contact page and its existing form remain available through footer navigation. Setting an email link does not configure the form's separate server delivery service.

Separate page-bottom CTA sections were removed so the closing invitation appears once. The homepage hero and Navbar retain their prominent CTA, using the same canonical email destination.

## Design consistency

| Area | Treatment |
|---|---|
| Identity | Existing navy, on-navy, action and fixed red artwork tokens; Geist typography |
| Reference | Large conversation prompt, red action, company information and quiet dividing rules |
| Signature | Exact WOY compass within fine orbital lines; brief response to CTA hover/focus |
| Navigation | Explore and WOY Consulting groups; Expertise stays out of the Navbar |
| Accessibility | Native links, visible keyboard focus, decorative SVG hidden from assistive technology, reduced motion and forced colors |
| Small screens | Stacked invitation and company details, two-column navigation and at least 44px mobile navigation targets |

## Verification

- `npm run lint`, `npm run typecheck`, `npm test` and `npm run build`: passed; 31 tests and 23 generated routes/assets.
- `npm run test:browser`: 15 pages, both themes and eight widths from 320 to 1920px. Zero detected JavaScript errors, automated WCAG A/AA violations, horizontal overflow or broken internal links/assets; 67 links and 55 image URLs collected.
- Every page checks the email CTA destination, visible email address, retained Contact route and AvlysAI destination. Footer Contact and Back to top navigation are exercised, alongside the existing legal, cookie, form, method and portrait checks.
- Additional footer checks passed at 320, 390, 768, 801, 1024, 1440 and 1920px. Keyboard email activation was intercepted locally to avoid launching a mail app. Keyboard focus, reduced motion, forced colors, touch navigation and mobile CTA menu closure passed.
- Desktop, tablet and mobile screenshots were reviewed. Strict premium audit has zero findings; official `designmd lint DESIGN.md` reports zero errors or warnings. An independent source review found no actionable issues.

Browser screenshots and detailed reports are retained in the ignored `reports/` directory. No external message was sent, and the email domain was not assumed to be the final public website origin.
