/**
 * The canonical origin for this deployment.
 *
 * Resolution order:
 *   1. NEXT_PUBLIC_SITE_URL          the real domain, once it is pointed here
 *   2. VERCEL_PROJECT_PRODUCTION_URL the stable production domain on Vercel
 *   3. VERCEL_URL                    the per-deployment preview domain
 *   4. localhost                     local development
 *
 * Used for metadataBase, the sitemap and robots.txt, so Open Graph and canonical
 * URLs resolve correctly on previews as well as in production.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (production) return `https://${production}`;

  const preview = process.env.VERCEL_URL;
  if (preview) return `https://${preview}`;

  return "http://localhost:5173";
}

export const siteUrl = resolveSiteUrl();
