const assert = require("node:assert/strict");
const test = require("node:test");
const settings = async (environment) => (await import("../lib/site-origin.mjs")).siteSettings(environment);

test("an unknown or local origin never becomes indexable, even in a production build", async () => {
  for (const SITE_URL of [undefined, "http://localhost:5173", "http://127.0.0.1:5173", "http://[::1]:5173"]) {
    assert.equal((await settings({ NODE_ENV: "production", SITE_URL })).isIndexable, false);
  }
});

test("public production gets one HTTPS canonical origin and can be indexed", async () => {
  assert.deepEqual(await settings({ NODE_ENV: "production", SITE_URL: "http://www.example.com/", VERCEL_URL: "build.vercel.app" }), {
    siteUrl: "https://www.example.com", isIndexable: true,
  });
});

test("preview and development stay noindex even when a public canonical is configured", async () => {
  for (const environment of [{ NODE_ENV: "development" }, { NODE_ENV: "production", VERCEL_ENV: "preview" }, { NODE_ENV: "production", VERCEL_ENV: "development" }]) {
    const result = await settings({ SITE_URL: "https://www.example.com", ...environment });
    assert.equal(result.siteUrl, "https://www.example.com");
    assert.equal(result.isIndexable, false);
  }
});

test("staging owners can disable indexing without changing canonical URLs", async () => {
  const result = await settings({ NODE_ENV: "production", SITE_URL: "https://staging.example.com", SITE_INDEXING: " Disabled " });
  assert.equal(result.isIndexable, false);
  assert.equal(result.siteUrl, "https://staging.example.com");
});

test("Vercel production canonical wins over a generated preview URL", async () => {
  const environment = { NODE_ENV: "production", VERCEL_PROJECT_PRODUCTION_URL: "woy-test.vercel.app", VERCEL_URL: "build-123.vercel.app" };
  assert.equal((await settings(environment)).siteUrl, "https://woy-test.vercel.app");
  assert.equal((await settings({ ...environment, VERCEL_ENV: "preview" })).isIndexable, false);
});
