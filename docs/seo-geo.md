# Search and AI-search readiness

## Implemented

- Every public page has a distinct descriptive title with WOY Consulting included once, a description, canonical URL and matching social URL/image.
- The homepage states what WOY is, what it does and when it was established in visible, server-rendered text.
- The `/faq` page answers eight real questions about the firm, its services, practitioners, 4D approach, case studies and enquiries. Answers remain visible without opening controls, with links to supporting pages.
- Organization and WebSite entities establish one shared site identity. Content pages add relevant page/breadcrumb, service, person and case-study entities based on the published copy. FAQ data mirrors visible answers. No ratings, addresses, credentials, client identities or unsupported outcomes are fabricated.
- All public content routes, including FAQs, appear in the sitemap. Footer links make the FAQ discoverable throughout the site.
- Expertise is consolidated into the homepage’s `#expertise` section. The retired `/expertise` route permanently redirects there, is excluded from the sitemap, and service entities point to the corresponding visible homepage capability anchors.
- Production robots rules allow crawling of public content while excluding the API. Local and Vercel preview builds remain noindex. Optional `SITE_INDEXING=disabled` protects other staging deployments.
- Production Googlebot preview controls permit descriptive snippets and large image previews. JavaScript is not required to read the core page copy or structured data.
- Structured data is safely serialized. Automated tests check entity relationships, canonical consistency, staging protection and matching FAQ copy.

## When the public domain is provided

1. Set server-side `SITE_URL` to the final HTTPS origin and rebuild. The site deliberately does not guess a public domain; Vercel’s production-domain environment value remains a fallback where available.
2. Leave `SITE_INDEXING` empty for a launched production site. Keep `SITE_INDEXING=disabled` on non-public staging sites.
3. Check the actual host allows search crawlers, returns 200 for public pages, 404 for missing pages, serves valid HTTPS, and exposes matching canonical, sitemap and structured-data origins.
4. Verify the domain in Google Search Console and Bing Webmaster Tools, submit `/sitemap.xml`, and request inspection of the homepage, services, practitioners, case studies and FAQ pages.
5. Validate rendered structured data with Schema.org’s validator and applicable Google Rich Results tests. FAQ markup does not imply Google FAQ rich-result eligibility for a consulting firm.
6. Retest mobile performance on the public host. The latest local Lighthouse run scored 92 mobile / 100 desktop; full metrics and the limits of local lab measurements are recorded in `launch-checklist.md`.
7. Add verified business contact details, public practitioner profile links and original case evidence when supplied. Keep anonymous cases anonymous and update factual content when the business changes.

SEO and GEO are discoverability work, not a promise of rankings or AI citations. There is no special Google AI schema or required AI text file: clear visible content, crawlability, internal links and accurate structured data are the foundation. No hidden keyword content or crawler-specific alternate answers are served.

## Primary references

- [Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Google: site names and WebSite data](https://developers.google.com/search/docs/appearance/site-names)
- [Google: title links](https://developers.google.com/search/docs/appearance/title-link)
- [Google: structured data](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)

Run `npm run lint`, `npm test`, `npm run build` and `npm run test:browser` before publishing. Browser tests use local/mock contact delivery and do not send real enquiries.

## Verification for this revision

Production build, TypeScript, ESLint and 29 unit tests passed. The browser audit covered 16 public pages, both themes and eight widths without detected JavaScript errors, automated accessibility violations, overflow or broken internal links. FAQ copy and JSON-LD were also checked with JavaScript disabled.
