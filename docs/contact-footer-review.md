# Contact and footer update, 25 September 2026

Implemented the supplied contact-page layout, copy, original portrait, four visible fields, consent, native validation and responsive design. The owner approved adapting the existing `/api/contact` server instead of the unavailable Cloudflare D1 implementation mentioned in the brief. Submission acknowledges receipt only after the configured delivery endpoint accepts it; no email, CRM or D1 storage claim is made.

Both conversation CTAs route to `/contact`; visible email addresses remain direct mail links. `/privacy` redirects to the existing policy. The privacy notice records the current fields and consent version, 2026-09-25.

The footer has reduced vertical spacing and fixed brand red #CD1421 for “Let’s begin.” Typography, company details, navigation and D&B disclosure remain intact.

## Verification

- Production build and TypeScript passed.
- ESLint passed.
- All 39 unit tests passed, including 16 contact/security tests.
- `tests/contact-browser.mjs` passed: native required/email/message/consent validation, server field errors, server/network failures, preserved values, unchanged retry UUID, edited/reset UUID, duplicate suppression, busy geometry, confirmed success and reset. Five requests were intercepted locally; no external enquiry was sent.
- Twelve contact/footer layouts checked across 320, 390, 700, 768, 1080 and 1440px in both themes with no horizontal overflow or runtime errors.
- No-JavaScript fallback uses POST (never enquiry details in the URL) and offers direct email.
- Design audit and DESIGN.md lint passed.
- Browser screenshots inspected for desktop/light, mobile/dark and footer.

Axe reports colour-contrast exceptions for the owner-requested fixed reds on navy, including the footer emphasis in light mode and existing/red contact text in dark mode. No non-contrast violations were found in the contact-page checks. This is not a full WCAG contrast pass.

This document records the 25 September layout review. Delivery has since been replaced with direct Resend integration, shared Redis limits and Turnstile verification. Use the current [security and deployment instructions](security-deployment.md) and `.env.example` for the required configuration; no external form-handler endpoint is used. Live provider credentials and inbox delivery still need owner-account verification. No deployment or push was performed during this historical layout review.
