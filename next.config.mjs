import { configuredSiteOrigins, isLocalHost } from "./lib/site-origin.mjs";

const isProduction = process.env.NODE_ENV === "production";
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  agentRules: false,
  poweredByHeader: false,
  images: { formats: ["image/webp"], remotePatterns: [] },
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
        source: "/:folder(logos|images)/:path*",
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
