import type { MetadataRoute } from "next";
import { caseStudies } from "@/lib/content";
import { siteUrl } from "@/lib/site-url";

/** Generated from the route list and lib/content.ts, so new cases appear here. */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    { path: "", priority: 1 },
    { path: "/about", priority: 0.8 },
    { path: "/expertise", priority: 0.8 },
    { path: "/work", priority: 0.8 },
    { path: "/people", priority: 0.8 },
    { path: "/approach", priority: 0.7 },
    { path: "/case-studies", priority: 0.7 },
    { path: "/practitioners", priority: 0.7 },
    { path: "/contact", priority: 0.6 },
    { path: "/faq", priority: 0.6 },
    { path: "/privacy-policy", priority: 0.3 },
    { path: "/terms-and-conditions", priority: 0.3 },
  ];

  return [
    ...pages.map((p) => ({
      url: `${siteUrl}${p.path}`,
      changeFrequency: "monthly" as const,
      priority: p.priority,
    })),
    ...caseStudies.map((c) => ({
      url: `${siteUrl}/case-studies/${c.slug}`,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];
}
