import { siteSettings } from "@/lib/site-origin.mjs";

/** Canonical origin and crawl policy shared by page metadata, schema and sitemap. */
export const { siteUrl, isIndexable } = siteSettings(process.env);
