# Vercel security setup

The code is hardened locally. Provider credentials, firewall rules, alert destinations and repository protection still need configuration in the owner’s accounts. No production service has been provisioned or verified by this change.

## Required environment

Configure Production values in Vercel Project Settings → Environment Variables, then redeploy. Keep Preview credentials separate. Use `.env.example` as a template; never commit real values.

| Variable | Purpose |
| --- | --- |
| `SITE_URL` | Final verified HTTPS origin; keep indexing disabled until launch. |
| `RESEND_API_KEY` | Private Resend API key with Sending access, restricted to the verified sending domain. |
| `CONTACT_FROM_EMAIL` | One bare sender mailbox on that verified domain, such as `enquiries@example.com`; the app adds the display name WOY Consulting. |
| `CONTACT_TO_EMAIL` | One real, monitored mailbox that should receive the enquiries. |
| `CONTACT_FORM_SECRET` | Independent cryptographically random secret, at least 32 characters. |
| `UPSTASH_REDIS_REST_URL` | Root HTTPS `*.upstash.io` REST endpoint for a dedicated Redis database. |
| `UPSTASH_REDIS_REST_TOKEN` | Server-only read/write token with access to EVAL and its underlying commands. |
| `TURNSTILE_SITE_KEY` | Public Cloudflare Turnstile managed-widget ID; restrict allowed hostnames to the production website. |
| `TURNSTILE_SECRET_KEY` | Corresponding private server verification key. |

Vercel supplies `VERCEL=1` and `VERCEL_ENV`. Do not simulate these on a public non-Vercel server. The app accepts only the platform-overwritten `x-vercel-forwarded-for` visitor address; it ignores arbitrary forwarded-IP headers. If another proxy sits in front of Vercel, verify the identity contract before launch. The production API returns an unavailable response if shared storage, bot verification, trusted IP or delivery configuration is missing. The contact page offers direct email when its widget is not configured.

Use separate production and preview Redis databases, widget keys, Resend API keys and recipient mailboxes. Redis keys also separate preview from production. Do not add every random preview domain to the production widget. Scope preview test keys to a protected preview environment; never put Cloudflare test keys in production.

## Connect Resend

1. In Resend, add a domain or subdomain that WOY owns and complete its DNS verification. Add the exact sending records shown in Resend at the authoritative DNS provider, then wait for the domain to show **Verified**. For example, a sender at `enquiries@mail.example.com` needs `mail.example.com` verified. See [Resend verified domains](https://resend.com/docs/dashboard/domains/introduction).
2. Create a key with **Sending access** and restrict it to that domain. Put it in Vercel as `RESEND_API_KEY`; do not use a `NEXT_PUBLIC_` prefix. If the Vercel Marketplace integration created a differently named variable, map its key to the exact name `RESEND_API_KEY` in this project's environment settings. A URL or integration identifier is not an API key. See [Resend API keys](https://resend.com/docs/dashboard/api-keys/introduction).
3. Set `CONTACT_FROM_EMAIL` and `CONTACT_TO_EMAIL` separately. Both accept one plain address only, without a display name, angle brackets, `mailto:`, or a comma-separated list. The sender must match the Resend domain; the recipient must be a mailbox the team can read. The visitor's address is used only for Reply-To so a reply goes to that visitor.
4. Configure all the other required values in the table, including the signed-form secret, Redis and Turnstile. Resend supplies email delivery; it does not replace these protections. Deploy again after adding or changing Vercel environment variables. Upload the updated project folder if deploying through the Vercel CLI without GitHub integration.

The server posts a plain-text enquiry to the fixed Resend `/emails` endpoint. It includes the four form fields, enquiry ID and consent/version record; the sender and recipient are fixed server configuration. It follows no redirects and uses a 15-second deadline. A successful response must contain a valid provider message ID before the form acknowledges receipt. This confirms that Resend accepted the request, not that an email reached the inbox. Check the Resend email activity and the recipient mailbox during the approved launch test. The email format follows [Resend's sending API](https://resend.com/docs/api-reference/emails/send-email).

The old external contact-delivery handler is no longer used. No Resend SDK installation or separate form-handler URL is required.

## Protection implemented in the application

- Next.js and eslint-config-next patched to 16.3.6 for the published ImageResponse advisory.
- Atomic shared counters: 20 challenge requests and 5 submission attempts per visitor identity per 15 minutes; IPv6 addresses share a /64 budget. A 100-delivery global backstop applies after bot verification. These modest limits suit an enquiry form; adjust only from real traffic and false-positive evidence.
- Signed, expiring HttpOnly/SameSite=Strict cookies, exact origin checks, strict schema and explicit consent remain in place. Production cookies use Secure.
- Server verification checks Turnstile success, website hostname, action `contact`, token age and single-use acceptance. Turnstile tokens are never included in the email sent through Resend.
- Shared delivery records bind an enquiry ID to an HMAC payload digest for 24 hours. A 45-second owner-bound lease prevents simultaneous sends while allowing interrupted attempts to recover. Redis contains digests and status, not enquiry text. Every retry passes the same `contact/<enquiry UUID>` idempotency key and payload to Resend. Its [24-hour idempotency window](https://resend.com/docs/dashboard/emails/idempotency-keys) also covers a send accepted just before an ambiguous network timeout; repeated requests after that window are not guaranteed to deduplicate.
- Input is capped at 32 KiB with a 5-second read deadline and request-abort cancellation. Provider calls have independent short deadlines and cannot follow redirects.
- Every HTML response gets a fresh cryptographic script nonce. Inline event handlers and scripts without trusted provenance are blocked. Theme boot, framework scripts and JSON-LD carry the nonce. Styles retain inline support for the existing UI.
- Nonce-bearing HTML is rendered per request and marked private/no-store; images, fonts and versioned framework assets retain their normal caching. This trades static HTML/CDN caching for stronger script isolation. Measure latency in the production region and keep the function near its data services.
- Contact events record only a random request ID, event name, status and elapsed milliseconds. No form values, visitor IPs, provider responses, tokens or credentials are logged by this code.

## Vercel firewall and operations

These are account settings, not settings that `vercel.json` has enabled automatically:

1. Use Vercel-managed TLS and redirect the public HTTP origin to HTTPS. Confirm the primary domain and aliases resolve to this project. HSTS is set without preloading or claiming every subdomain.
2. Add a firewall rate-limit rule scoped to **path `/api/contact`**, covering GET and POST. Begin with an observation/log rule to measure shared-network visitors; a reasonable initial outer guard is 30 requests per IP per minute. Then enable a deny/429 action once reviewed. Keep application limits in place too. Availability and configuration vary by Vercel plan; do not purchase or enable a paid feature without the owner’s approval.
3. Enable the applicable managed security rules and review their logs before enforcing challenge rules. Do not challenge all marketing routes or search crawlers indiscriminately. Avoid an HTML firewall challenge on API requests, which expect JSON.
4. In Runtime Logs, filter JSON `event` values beginning with `contact.`. Alert immediately on repeated `configuration_unavailable`, `identity_unavailable` or `storage_unavailable`; alert on sustained `delivery_failed`, `delivery_unconfirmed` or `bot_unavailable`. Review spikes in `rate_limited`/`bot_rejected` alongside firewall traffic. Suggested starting signal: 5 service failures in 5 minutes or a sustained failure ratio over 10%; tune to actual volume. Connect alerts or a log drain in the owner’s monitoring account and restrict retention/access; no recipient or external drain is configured by this repository.
5. Configure usage/budget notifications for Vercel, Redis and Resend. Enable MFA, limit administrative access and rotate service credentials through provider dashboards when personnel or integrations change.
6. Protect `main` with pull-request review and required security/quality jobs once the workflow has run successfully. Enable GitHub secret scanning/push protection where available, Dependabot alerts and private vulnerability reporting. The repository now includes pinned GitHub Actions for lint/build/tests/dependency audit, CodeQL and a full-history Gitleaks scan, plus weekly dependency-update checks. They become active when the files are pushed; local execution does not establish a passing remote check.

## Verification before launch

Run `npm ci`, `npm run lint`, `npm test`, `npm run build`, `npm run typecheck` and `npm run security:check`. Start the production build and run `npm run test:security-browser` and `npm run test:theme-navigation`. Contact browser tests use a dummy **public** widget key and intercept all Cloudflare/contact traffic; see `tests/contact-security-browser.mjs`. Unit tests mock Redis, Siteverify and the Resend API; no live email is sent by these tests. They do not prove live provider credentials work.

On a protected Vercel preview, verify real Redis credentials and the host-bound widget, inspect CSP headers for fresh nonces on two requests, and confirm theme/navigation and images. With the owner’s approval, send one clearly labelled enquiry to the staging recipient, retry it with the same ID and unchanged fields, then check that Resend accepted only one email and that it reached the mailbox. Test provider outages and rate limits against staging, never by flooding the public site. Confirm there are no credentials in browser bundles, and check actual HTTPS redirects, CSP, cookies, response headers and firewall behaviour on the final domain. Re-run performance checks against the deployed region.

Reference documentation: [Vercel visitor headers](https://vercel.com/docs/headers/request-headers#x-vercel-forwarded-for), [Vercel Firewall](https://vercel.com/docs/vercel-firewall), [Upstash REST API](https://upstash.com/docs/redis/features/restapi), [Turnstile server verification](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/), [Turnstile CSP](https://developers.cloudflare.com/turnstile/reference/content-security-policy/), [Next.js nonce CSP and rendering trade-offs](https://nextjs.org/docs/app/guides/content-security-policy), [Next.js 16.3.6](https://github.com/vercel/next.js/releases/tag/v16.3.6).

## Local verification completed on 28 September 2026

- Production build, ESLint, generated TypeScript and strict design-contract checks passed.
- 57 unit/security tests passed, including malformed requests, cookie rotation, shared budgets, body cancellation, bot-token validation and ambiguous-delivery retries. Redis behaviour and external verification/delivery were mocked.
- Production-browser CSP checks passed on nine normal and missing routes. Every rendered script had the response nonce; injected inline scripts and event handlers were blocked.
- Theme bootstrap/persistence passed seven initial-state scenarios and 34 client navigations. Contact checks passed 26 viewport/theme layouts across the two suites, including retries and widget cleanup, without JavaScript/CSP errors. Existing brand-red dark-mode contrast exceptions were retained rather than changing the requested colours.
- Source/browser credential checks, the checksum-verified full-history Gitleaks scan and runtime dependency audit passed. Workflow YAML/actionlint passed; the GitHub workflow has not yet run remotely.
- Homepage local Lighthouse performance: 91 mobile / 100 desktop; accessibility and best practices 100 in the tested light theme; zero layout shift. Local noindex remains intentional. These are local lab observations, not hosted performance guarantees.
- The final local preview was restored without a dummy widget key. Missing configuration produces an email fallback and HTTP503, never a false success.

Real Redis Lua execution, provider credentials, delivery acceptance, Vercel edge identity and firewall/alerts still require the protected deployment verification above.

## Resend integration verification on 29 September 2026

The production build, ESLint, 62 unit/security tests, source/browser credential scan and both contact browser suites passed. Delivery, Redis and Turnstile were mocked; no live email was sent. The broad browser suite exercised 21 routes with no JavaScript errors, broken links or horizontal overflow. Its accessibility assertion still fails on the documented fixed-red text contrast in dark mode; this is not an all-checks or WCAG pass, and the owner-requested palette was preserved. The local preview was restored without the temporary public test widget key. Live sending still requires the environment setup and protected deployment verification above.
