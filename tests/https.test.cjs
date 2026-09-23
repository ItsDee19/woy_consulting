const assert = require("node:assert/strict");
const test = require("node:test");
const { pathToFileURL } = require("node:url");
const { resolve } = require("node:path");
const { matchHas, prepareDestination } = require("next/dist/shared/lib/router/utils/prepare-destination");
const { getPathMatch } = require("next/dist/shared/lib/router/utils/path-match");

const environmentKeys = ["NODE_ENV", "SITE_URL", "NEXT_PUBLIC_SITE_URL", "VERCEL_PROJECT_PRODUCTION_URL", "VERCEL_URL"];
let importNumber = 0;

async function redirectRules(environment = {}) {
  const previous = Object.fromEntries(environmentKeys.map((key) => [key, process.env[key]]));
  try {
    for (const key of environmentKeys) {
      if (environment[key] === undefined) delete process.env[key];
      else process.env[key] = environment[key];
    }
    process.env.NODE_ENV ||= "production";
    const configUrl = pathToFileURL(resolve(__dirname, "../next.config.mjs"));
    const config = (await import(`${configUrl.href}?test=${++importNumber}`)).default;
    return await config.redirects();
  } finally {
    for (const key of environmentKeys) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  }
}

function redirect(rules, { host, protocol = "http", pathname = "/", query = {} }) {
  const headers = { host };
  if (protocol !== null) headers["x-forwarded-proto"] = protocol;
  for (const rule of rules) {
    const pathParams = getPathMatch(rule.source)(pathname);
    const conditionParams = matchHas({ headers }, query, rule.has);
    if (!pathParams || !conditionParams) continue;
    return {
      ...prepareDestination({
        destination: rule.destination,
        params: { ...pathParams, ...conditionParams },
        query,
        appendParamsToQuery: false,
      }),
      permanent: rule.permanent,
    };
  }
  return null;
}

test("HTTPS redirects compile with Next and preserve the path and query", async () => {
  const rules = await redirectRules({ SITE_URL: "http://www.example.com" });
  const result = redirect(rules, { host: "www.example.com", pathname: "/case-studies/sample", query: { source: "email", tag: ["a", "b"] } });
  assert.ok(result);
  assert.equal(result.parsedDestination.protocol, "https:");
  assert.equal(result.parsedDestination.hostname, "www.example.com");
  assert.equal(result.parsedDestination.pathname, "/case-studies/sample");
  assert.deepEqual(result.parsedDestination.query, { source: "email", tag: ["a", "b"] });
  assert.equal(result.permanent, true);
  const root = redirect(rules, { host: "www.example.com", pathname: "/" }).parsedDestination;
  assert.equal(new URL(`${root.protocol}//${root.hostname}${root.pathname}`).pathname, "/");
});

test("HTTPS requests do not loop and proxy protocol must be explicit", async () => {
  const rules = await redirectRules({ SITE_URL: "https://example.com" });
  for (const protocol of ["https", null, "http,https", "https,http"]) {
    assert.equal(redirect(rules, { host: "example.com", protocol }), null);
  }
});

test("destinations accept only exact configured hosts, not arbitrary or lookalike hosts", async () => {
  const rules = await redirectRules({ SITE_URL: "https://example.com" });
  for (const host of ["evil.example", "example.com.evil.example", "exampleXcom", "evil.example@example.com", "example.com/evil", "example.com\\evil"]) {
    assert.equal(redirect(rules, { host }), null, host);
  }
  assert.ok(redirect(rules, { host: "EXAMPLE.COM:80" }));
});

test("loopback addresses remain on HTTP even when explicitly configured", async () => {
  for (const host of ["localhost", "local.localhost", "localhost.", "0.0.0.0", "127.0.0.1", "127.2.3.4", "[::1]", "[::ffff:127.0.0.1]"]) {
    const rules = await redirectRules({ SITE_URL: `http://${host}:5173` });
    assert.equal(redirect(rules, { host, pathname: "/about" }), null, host);
    assert.equal(redirect(rules, { host, pathname: "/expertise" }), null);
  }
});

test("local hosts never match a configured public site", async () => {
  const rules = await redirectRules({ SITE_URL: "https://example.com" });
  for (const host of ["localhost:5173", "foo.localhost:5173", "localhost.:5173", "127.0.0.1:5173", "127.2.3.4:5173", "0.0.0.0:5173", "[::1]:5173"]) {
    assert.equal(redirect(rules, { host }), null, host);
  }
});

test("Vercel production and preview hosts are included as fixed destinations", async () => {
  const rules = await redirectRules({ SITE_URL: "https://example.com", VERCEL_PROJECT_PRODUCTION_URL: "project.vercel.app", VERCEL_URL: "preview-project.vercel.app" });
  for (const host of ["example.com", "project.vercel.app", "preview-project.vercel.app"]) {
    assert.equal(redirect(rules, { host }).parsedDestination.hostname, host);
  }
  assert.equal(redirect(rules, { host: "other-project.vercel.app" }), null);
});

test("legacy site URL works, origins deduplicate, and development has no HTTPS redirects", async () => {
  const legacy = await redirectRules({ NEXT_PUBLIC_SITE_URL: "http://project.vercel.app", VERCEL_URL: "project.vercel.app" });
  assert.equal(legacy.filter((rule) => rule.has).length, 1);
  assert.ok(redirect(legacy, { host: "project.vercel.app" }));
  const development = await redirectRules({ NODE_ENV: "development", SITE_URL: "https://example.com" });
  assert.equal(redirect(development, { host: "example.com", pathname: "/about" }), null);
  assert.equal(redirect(await redirectRules(), { host: "localhost:5173", pathname: "/about" }), null);
});

test("invalid public origins fail configuration instead of entering the allowlist", async () => {
  for (const SITE_URL of ["javascript:alert(1)", "https://user:pass@example.com", "https://example.com/path", "https://example.com?next=evil", "https://example.com#fragment", "not a URL"]) {
    await assert.rejects(redirectRules({ SITE_URL }), /must be an HTTP\(S\) origin/);
  }
});


test("recreated top-level pages are served directly in every environment", async () => {
  for (const environment of [
    { NODE_ENV: "development" },
    { NODE_ENV: "production" },
    { NODE_ENV: "production", SITE_URL: "https://example.com" },
  ]) {
    const rules = await redirectRules(environment);
    const host = environment.SITE_URL ? "example.com" : "localhost:5173";
    for (const pathname of ["/", "/expertise", "/work", "/people", "/approach", "/expertise-unrelated"]) {
      assert.equal(redirect(rules, { host, protocol: "https", pathname, query: { source: "old-link" } }), null);
    }
  }
});

test("recreated pages still upgrade configured public HTTP requests", async () => {
  const rules = await redirectRules({ SITE_URL: "https://example.com" });
  for (const pathname of ["/expertise", "/work", "/people", "/approach"]) {
    const first = redirect(rules, { host: "example.com", pathname });
    assert.equal(first.parsedDestination.protocol, "https:");
    assert.equal(first.parsedDestination.hostname, "example.com");
    assert.equal(first.parsedDestination.pathname, pathname);
    assert.equal(redirect(rules, { host: "example.com", protocol: "https", pathname }), null);
  }
});

test("source case links retain published case destinations and query parameters", async () => {
  const destinations = [
    ["education-transformation", "education-institution-transformation"],
    ["insurance-leadership", "insurance-senior-sales-leadership"],
    ["consultative-selling", "it-ites-consultative-selling"],
    ["automotive-alignment", "automotive-leadership-assimilation"],
    ["entrepreneurial-mindset", "financial-services-entrepreneurial-mindset"],
    ["medical-technology-leadership", "medical-technology-strategic-thinking"],
  ];
  for (const NODE_ENV of ["development", "production"]) {
    const rules = await redirectRules({ NODE_ENV });
    for (const [source, destination] of destinations) {
      const result = redirect(rules, { host: "localhost:5173", pathname: `/work/${source}`, query: { source: "expertise" } });
      assert.ok(result);
      assert.equal(result.permanent, true);
      assert.equal(result.parsedDestination.pathname, `/case-studies/${destination}`);
      assert.deepEqual(result.parsedDestination.query, { source: "expertise" });
    }
    assert.equal(redirect(rules, { host: "localhost:5173", pathname: "/work/unknown-case" }), null, "Unknown source paths are not sent to an unrelated case");
  }
});

test("source profile links land on the matching established practitioner", async () => {
  for (const NODE_ENV of ["development", "production"]) {
    const rules = await redirectRules({ NODE_ENV });
    for (const slug of ["vipin-tuteja", "sandeep-bidani", "kannan-swaminathan"]) {
      const result = redirect(rules, { host: "localhost:5173", pathname: `/people/${slug}`, query: { source: "people" } });
      assert.ok(result);
      assert.equal(result.permanent, true);
      assert.equal(result.parsedDestination.pathname, "/practitioners");
      assert.equal(result.parsedDestination.hash, `#${slug}`);
      assert.deepEqual(result.parsedDestination.query, { source: "people" });
    }
    assert.equal(redirect(rules, { host: "localhost:5173", pathname: "/people/unknown-person" }), null);
  }
});

test("HTTPS upgrade precedes a source compatibility redirect", async () => {
  const rules = await redirectRules({ SITE_URL: "https://example.com" });
  const first = redirect(rules, { host: "example.com", pathname: "/work/education-transformation" });
  assert.equal(first.parsedDestination.protocol, "https:");
  assert.equal(first.parsedDestination.pathname, "/work/education-transformation");
  const second = redirect(rules, { host: "example.com", protocol: "https", pathname: first.parsedDestination.pathname });
  assert.equal(second.parsedDestination.pathname, "/case-studies/education-institution-transformation");
});
