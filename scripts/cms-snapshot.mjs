// Saves every published CMS query result into the deployment as a last-resort backup.
// `npm run build` runs this first and FAILS on error, so a deploy never ships without content and
// the current deployment stays live. `--allow-offline` (used by `npm run dev`) only warns.
import { mkdirSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@sanity/client";
import { SANITY_API_HOST, SANITY_API_VERSION, SANITY_DATASET, SANITY_PROJECT_ID } from "../lib/sanity/project.mjs";
import { queries } from "../lib/cms/queries.mjs";

const args = process.argv.slice(2);
const allowOffline = args.includes("--allow-offline");
const outputArg = args.indexOf("--output");
const output = path.resolve(outputArg >= 0 ? args[outputArg + 1] : "lib/cms/snapshot.generated.json");

const client = createClient({
  projectId: SANITY_PROJECT_ID, dataset: SANITY_DATASET, apiVersion: SANITY_API_VERSION,
  useCdn: false, perspective: "published", timeout: 15_000, maxRetries: 2,
  ...(SANITY_API_HOST ? { apiHost: SANITY_API_HOST, useProjectHostname: false } : {}),
});

try {
  const results = {};
  for (const [name, query] of Object.entries(queries)) results[name] = await client.fetch(query);
  mkdirSync(path.dirname(output), { recursive: true });
  const temporary = `${output}.${process.pid}.tmp`;
  writeFileSync(temporary, `${JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2)}\n`);
  renameSync(temporary, output);
  console.log(`CMS snapshot written to ${path.relative(process.cwd(), output)} (${Object.keys(results).join(", ")}).`);
} catch (error) {
  const reason = error && typeof error.message === "string" ? error.message : String(error);
  if (allowOffline) {
    console.warn(`CMS snapshot skipped (Sanity unreachable): ${reason}`);
  } else {
    console.error(`CMS snapshot failed; stopping so the current deployment stays live. ${reason}`);
    process.exitCode = 1;
  }
}
