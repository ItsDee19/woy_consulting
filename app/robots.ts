import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  /* Keep preview deployments out of the index. Only the production domain,
     set through NEXT_PUBLIC_SITE_URL or VERCEL_PROJECT_PRODUCTION_URL, is
     allowed to be crawled. */
  const isPreview = process.env.VERCEL_ENV === "preview";

  return {
    rules: isPreview
      ? { userAgent: "*", disallow: "/" }
      : { userAgent: "*", allow: "/" },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
