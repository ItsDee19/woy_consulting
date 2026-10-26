import { configuredSiteOrigins, isLocalHost } from "./lib/site-origin.mjs";
import { SANITY_DATASET, SANITY_PROJECT_ID } from "./lib/sanity/project.mjs";

const isProduction = process.env.NODE_ENV === "production";
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  agentRules: false,
  poweredByHeader: false,
  images: {
    formats: ["image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io", pathname: `/images/${SANITY_PROJECT_ID}/${SANITY_DATASET}/**` }],
  },
  // The build-time CMS snapshot is read with fs at runtime; ship it with every server function.
  outputFileTracingIncludes: { "/**": ["./lib/cms/snapshot.generated.json"] },
  // Same-origin, single-segment proxy to THIS project's assets only. Keeps CSP img-src 'self' and
  // lets downloads use the `download` attribute. Only known-safe extensions are proxied, so an
  // uploaded .html or .svg can never be served from the site's own origin (stored-XSS guard).
  // Verified: a header set here for /cms-assets is overridden by Sanity's own response headers
  // (script-src 'none', nosniff), so the extension allowlist is the control, not a headers() rule.
  async rewrites() {
    return [
      { source: "/cms-assets/images/:file([A-Za-z0-9_-]+\\.(?:png|jpe?g|webp|avif|gif))", destination: `https://cdn.sanity.io/images/${SANITY_PROJECT_ID}/${SANITY_DATASET}/:file` },
      { source: "/cms-assets/files/:file([A-Za-z0-9_-]+\\.(?:pdf|docx?|pptx?|xlsx?))", destination: `https://cdn.sanity.io/files/${SANITY_PROJECT_ID}/${SANITY_DATASET}/:file` },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
          ...(isProduction ? [{ key: "Strict-Transport-Security", value: "max-age=31536000" }] : []),
        ],
      },
      {
        source: "/api/:path*",
        headers: [{ key: "Content-Security-Policy", value: "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'" }],
      },
      {
        source: "/:folder(logos|images|cms-assets)/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
    ];
  },
  async redirects() {
    // The hosting proxy must overwrite X-Forwarded-Proto on every request.
    // Fixed configured origins avoid interpolating untrusted Host headers.
    const preservedDestinations = [{ source: "/privacy", destination: "/privacy-policy", permanent: true }];
    if (!isProduction) return preservedDestinations;
    const httpsRedirects = configuredSiteOrigins(process.env)
      .filter((origin) => !isLocalHost(new URL(origin).hostname))
      .map((origin) => {
        const hostname = new URL(origin).hostname;
        const escapedHost = hostname.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return {
          source: "/:path*",
          has: [
            { type: "header", key: "x-forwarded-proto", value: "http" },
            hostname.startsWith("[")
              ? { type: "header", key: "host", value: escapedHost + "(?::[0-9]+)?" }
              : { type: "host", value: escapedHost },
          ],
          destination: `${origin}/:path*`,
          permanent: true,
        };
      });
    // Upgrade public HTTP traffic before resolving the supplied source links.
    return [...httpsRedirects, ...preservedDestinations];
  },
};

export default nextConfig;
