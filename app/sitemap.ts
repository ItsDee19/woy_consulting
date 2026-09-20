import type { MetadataRoute } from "next";
import { caseStudies } from "@/lib/content";
import { siteUrl } from "@/lib/site-url";

/** Generated from the route list and lib/content.ts, so new cases appear here. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const pages = [
    { path: "", priority: 1 },
    { path: "/about", priority: 0.8 },
    { path: "/expertise", priority: 0.8 },
    { path: "/approach", priority: 0.7 },
    { path: "/case-studies", priority: 0.7 },
    { path: "/practitioners", priority: 0.7 },
    { path: "/contact", priority: 0.6 },
  ];

  return [
    ...pages.map((p) => ({
      url: `${siteUrl}${p.path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: p.priority,
    })),
    ...caseStudies.map((c) => ({
      url: `${siteUrl}/case-studies/${c.slug}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];
}
