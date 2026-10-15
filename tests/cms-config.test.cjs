const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("site and Studio point at the same public Sanity project and dataset", () => {
  const site = read("lib/sanity/project.mjs");
  const studio = read("studio/project.ts");
  const siteId = /SANITY_PROJECT_ID \|\| "([a-z0-9]+)"/.exec(site)?.[1];
  const studioId = /projectId = "([a-z0-9]+)"/.exec(studio)?.[1];
  assert.ok(siteId && siteId !== "PROJECT_ID_FROM_STEP_3", "Replace the project ID placeholder");
  assert.equal(studioId, siteId);
  assert.match(studio, /dataset = "production"/);
  assert.match(site, /SANITY_DATASET \|\| "production"/);
});

test("the outage simulation can only target a closed loopback port", () => {
  assert.match(read("lib/sanity/project.mjs"), /CMS_TEST_UNREACHABLE === "1" \? "http:\/\/127\.0\.0\.1:9" : undefined/);
});
