import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import { unstable_cache } from "next/cache";
import { sanityClient } from "@/lib/sanity/client";
import { shouldUseSnapshot } from "./fallback";
import { queries } from "./queries.mjs";

export type QueryName = keyof typeof queries;
export const CMS_CACHE_TAG = "sanity";
export const CMS_REVALIDATE_SECONDS = 300;

type Snapshot = { generatedAt: string; results: Record<QueryName, unknown> };
let snapshot: Snapshot | undefined;

/** Written by scripts/cms-snapshot.mjs before every build; traced into the deployment by next.config.mjs. */
function readSnapshot(): Snapshot {
  snapshot ??= JSON.parse(readFileSync(path.join(process.cwd(), "lib", "cms", "snapshot.generated.json"), "utf8")) as Snapshot;
  return snapshot;
}

/** Cached across requests and deployments; the Sanity webhook expires the "sanity" tag on publish. */
export async function loadQuery<T>(name: QueryName): Promise<T> {
  const cached = unstable_cache(() => sanityClient.fetch<T>(queries[name]), ["cms", name], {
    tags: [CMS_CACHE_TAG],
    revalidate: CMS_REVALIDATE_SECONDS,
  });
  try {
    return await cached();
  } catch (error) {
    if (!shouldUseSnapshot(error)) throw error;
    const backup = readSnapshot();
    console.warn(`[cms] Sanity unreachable; serving "${name}" from the build snapshot of ${backup.generatedAt}.`);
    return backup.results[name] as T;
  }
}
