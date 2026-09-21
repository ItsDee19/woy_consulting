# Website launch checklist

Reviewed and implemented on 21 September 2026. The requested application features are implemented. Live hosting and contact delivery require the configuration below; speed has been measured on the local production build, with a hosted performance check needed after deployment.

| # | Requirement | Implementation |
|---|---|---|
| 1 | Privacy policy | `/privacy-policy`; actual enquiry/security/storage behavior, choices and contact route. WOY will add the email later. |
| 2 | Footer credit | Made by AvlysAI links to https://avlysai.com/. |
| 3 | Terms & conditions | `/terms-and-conditions`; website use, enquiries, content and separate consulting engagements. |
| 4 | Load speed | Measured and improved: compressed local WebP photos, responsive images, self-hosted fonts, immediate consent content, fewer logo hydrations and batched layout reads. Latest local scores: 96 mobile / 100 desktop; confirm on the hosted site. |
| 5 | Frontend secrets | Server-only endpoint/token/signing key, import boundary, no CONTACT_* configuration in browser bundles. |
| 6 | Contrast | Accessible light/dark text, separate action/error colors, visible input borders and focus. |
| 7 | HTTPS | Production 308 redirects for configured origins, HSTS/security headers; loopback exempt. Host supplies TLS. |
| 8 | Responsive screens | Phone through wide desktop, landscape navigation, bounded cookie panel; fixed logo overflow. |
| 9 | Cookie consent | Essential-only default, optional theme memory, footer reopening and revocation; no tracking added. |
| 10 | Custom 404 | Branded recovery page and noindex, including unknown case studies. |
| 11 | Meta titles/descriptions | Unique page titles/descriptions, canonical and page-specific OG/Twitter metadata. |
| 12 | Broken links | Same-origin link/fragment crawl; real AvlysAI URL; unknown LinkedIn destinations remain non-links. |
| 13 | Social image | `/opengraph-image`, branded 1200x630 PNG for OG/Twitter. |
| 14 | Form validation | Shared client/server rules, bounded inputs, first-error focus, retained values and stable busy/error states. |
| 15 | Logo favicon | Exact WOY mark: SVG, ICO and Apple touch PNG. |
| 16 | Spam protection | Signed HttpOnly cookie, time guard, honeypot, origin/schema/body limits, rate and duplicate-delivery checks. |
| 17 | Sitemap/robots | All public/legal pages; production indexing and preview/local noindex. |
| 18 | Image alt text | Meaningful logo/headshot alternatives; empty alternatives for decorative stock images. |
| 19 | Clear CTA | Request a conversation consistently leads to `/contact`; other actions are secondary. |
| 20 | Transitions | Short transform/opacity motion, no hydration content flash, system reduced-motion support. Visible animation controls removed at the site owner’s request; the logo retains its red artwork colors. |

## Verification

Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, and `npm run test:browser` against the production server. Browser reports/screenshots and Lighthouse results are saved in ignored `reports/`. Contact delivery tests are mocked; they do not send real enquiries. Lab speed measurements are not real-user field measurements.

### Completed checks

- Production build and TypeScript: passed; 24 generated routes/assets and the server contact API.
- ESLint and design audits: passed. Security, indexing and structured-data unit tests: 29 passed.
- Browser audit: 16 public pages, light/dark themes, and widths of 320, 375, 390, 414, 768, 1024, 1440 and 1920 pixels.
- No JavaScript errors, automated WCAG A/AA violations, horizontal overflow or broken internal links/assets in that run.
- Consent, theme memory/revocation, saved-choice reloads, mobile navigation, validation, unavailable delivery and mocked successful delivery checked. Cookie actions remain reachable at 320 × 568 pixels.
- Server-rendered consent and visible logo loading checked. All favicon, social image, robots and sitemap endpoints return 200; missing pages return 404.

### Local Lighthouse measurements

Production build at `http://localhost:5173/`, Chrome 153, Lighthouse 13.5. Run `npm run test:performance` with the production preview already running to write JSON and HTML reports into `reports/`.

| Metric | Mobile | Desktop |
|---|---:|---:|
| Performance | 96 | 100 |
| Accessibility | 100 | 100 |
| Best practices | 100 | 100 |
| First contentful paint | 1.1 s | 0.3 s |
| Largest contentful paint | 2.6 s | 0.6 s |
| Total blocking time (simulated) | 90 ms | 0 ms |
| Cumulative layout shift | 0 | 0 |

SEO scores 69 locally because local/preview builds intentionally block indexing. This is not a production SEO result.

The latest run followed the deck-led About, Practitioners and 4D redesign, using the same standard mobile and desktop presets with no competing browser audit. Historical runs on this machine scored 29/60 and 39/62 under much slower CPU conditions; those differences cannot be attributed solely to code changes. Four photos shrank from 223,896 to 120,386 bytes (46% smaller).

These are local lab observations, not real-user field measurements or a Core Web Vitals guarantee. Retest on the actual public host after the domain is provided. The assembling logo remains animated in red, respects reduced motion, and pauses off screen; visible animation controls have been removed as requested.

SEO/GEO additions and final-domain steps are documented in [seo-geo.md](seo-geo.md). Browser checks confirm unique branded titles, canonical/social URL agreement, consistent entity origins, matching visible FAQ/schema answers, red artwork in both themes, no animation-control buttons, and JavaScript-free access to FAQ content. The deck-led redesign also verifies 4D keyboard/click navigation, practitioner images and biography disclosures, the expanded client roster, and the final mobile typography/portrait refinements. See [redesign-review.md](redesign-review.md).

## Production setup

1. Use Node.js 22.19+; Node 24 used for verification.
2. Set `SITE_URL` to the verified public HTTPS origin and rebuild. Vercel domains are fallback origins. Local/preview indexing is deliberately blocked.
3. Set server-only `CONTACT_ENDPOINT`, a random `CONTACT_FORM_SECRET` (32+ characters), and optional `CONTACT_ENDPOINT_TOKEN`. See `.env.example`. Never prefix secrets with `NEXT_PUBLIC_`. Missing delivery configuration produces an honest unavailable message.
4. Configure valid TLS at the host. With another reverse proxy, overwrite `X-Forwarded-Proto` and block public access to the plain HTTP origin. The application does not provision certificates.
5. Contact limits/duplicate counters use bounded process memory. Multi-instance/serverless deployments require shared edge/WAF limits for `/api/contact` or a shared store. Only configure `CONTACT_RATE_LIMIT_IP_HEADER` if the host guarantees it cannot be spoofed.
6. Add WOY's privacy email when provided. Confirm policy wording against the chosen delivery provider and business retention arrangements before publishing.

No live deployment or contact-delivery destination is configured by this change. Remaining stock images on other pages are decorative placeholders; `docs/image-sources.json` records source URLs and optimized sizes.
