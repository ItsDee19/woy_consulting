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
    const sourceDestinations = [
      ["education-transformation", "education-institution-transformation"],
      ["insurance-leadership", "insurance-senior-sales-leadership"],
      ["consultative-selling", "it-ites-consultative-selling"],
      ["automotive-alignment", "automotive-leadership-assimilation"],
      ["entrepreneurial-mindset", "financial-services-entrepreneurial-mindset"],
      ["medical-technology-leadership", "medical-technology-strategic-thinking"],
    ].map(([source, destination]) => ({ source: `/work/${source}`, destination: `/case-studies/${destination}`, permanent: true }));
    const profileDestinations = ["vipin-tuteja", "sandeep-bidani", "kannan-swaminathan"].map(slug => ({
      source: `/people/${slug}`, destination: `/practitioners#${slug}`, permanent: true,
    }));
    const preservedDestinations = [...sourceDestinations, ...profileDestinations];
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
