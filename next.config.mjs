import { configuredSiteOrigins, isLocalHost } from "./lib/site-origin.mjs";

const isProduction = process.env.NODE_ENV === "production";
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProduction ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self'${isProduction ? "" : " ws: wss:"}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

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
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          ...(isProduction ? [{ key: "Strict-Transport-Security", value: "max-age=31536000" }] : []),
        ],
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
    const expertiseRedirect = { source: "/expertise", destination: "/#expertise", permanent: true };
    if (!isProduction) return [expertiseRedirect];
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
    // Upgrade public HTTP traffic before moving the retired service page.
    return [...httpsRedirects, expertiseRedirect];
  },
};

export default nextConfig;
