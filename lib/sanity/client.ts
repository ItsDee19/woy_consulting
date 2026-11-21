import "server-only";
import { createClient } from "@sanity/client";
import { SANITY_API_HOST, SANITY_API_VERSION, SANITY_DATASET, SANITY_PROJECT_ID } from "./project.mjs";

/** Published content only. Visitor traffic is absorbed by the Next.js data cache, not Sanity's CDN. */
export const sanityClient = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: SANITY_API_VERSION,
  useCdn: false,
  perspective: "published",
  timeout: 10_000,
  maxRetries: 2,
  ...(SANITY_API_HOST ? { apiHost: SANITY_API_HOST, useProjectHostname: false } : {}),
});
