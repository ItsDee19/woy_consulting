/**
 * Public Sanity identifiers — not secrets. The dataset is public, so reads need no token.
 * Shared by next.config.mjs, the snapshot script and the server client.
 */
export const SANITY_PROJECT_ID = process.env.SANITY_PROJECT_ID || "tas6l1r9";
export const SANITY_DATASET = process.env.SANITY_DATASET || "production";
export const SANITY_API_VERSION = "2026-10-01";

if (!/^[a-z0-9]{4,32}$/.test(SANITY_PROJECT_ID)) throw new Error("SANITY_PROJECT_ID must be a Sanity project ID.");
if (!/^[a-z0-9][a-z0-9_-]{0,63}$/.test(SANITY_DATASET)) throw new Error("SANITY_DATASET is not a valid dataset name.");

/**
 * Test-only: CMS_TEST_UNREACHABLE=1 points the API at a closed loopback port to simulate an outage.
 * It can only break reads; it cannot redirect them anywhere else.
 */
export const SANITY_API_HOST = process.env.CMS_TEST_UNREACHABLE === "1" ? "http://127.0.0.1:9" : undefined;
