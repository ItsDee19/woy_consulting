const test = require("node:test");
const assert = require("node:assert/strict");
const webhook = require("@sanity/webhook");
const { loadTs } = require("./helpers/load-ts.cjs");

const calls = [];
const route = loadTs("app/api/revalidate/route.ts", {
  "next/cache": { revalidateTag: (...args) => calls.push(args) },
  "@sanity/webhook": webhook,
});
const secret = "s".repeat(48);
const body = JSON.stringify({ _type: "caseStudy", _id: "caseStudy-insurance-leadership" });
const request = (headers, payload = body) => new Request("http://localhost/api/revalidate", { method: "POST", headers, body: payload });

test.beforeEach(() => { calls.length = 0; process.env.SANITY_REVALIDATE_SECRET = secret; });

test("a correctly signed publish expires the CMS cache immediately", async () => {
  const signature = await webhook.encodeSignatureHeader(body, Date.now(), secret);
  const response = await route.POST(request({ [webhook.SIGNATURE_HEADER_NAME]: signature }));
  assert.equal(response.status, 200);
  assert.deepEqual(calls, [["sanity", { expire: 0 }]]);
});

test("missing or wrong signatures are refused without revalidating or echoing input", async () => {
  const wrong = await webhook.encodeSignatureHeader(body, Date.now(), "x".repeat(48));
  for (const headers of [{}, { [webhook.SIGNATURE_HEADER_NAME]: wrong }, { [webhook.SIGNATURE_HEADER_NAME]: "t=1,v1=garbage" }]) {
    const response = await route.POST(request(headers));
    assert.equal(response.status, 401);
    assert.equal(await response.text(), "");
  }
  assert.deepEqual(calls, []);
});

test("an unconfigured or weak secret disables the endpoint", async () => {
  for (const value of [undefined, "short"]) {
    if (value === undefined) delete process.env.SANITY_REVALIDATE_SECRET; else process.env.SANITY_REVALIDATE_SECRET = value;
    const response = await route.POST(request({ [webhook.SIGNATURE_HEADER_NAME]: "t=1,v1=x" }));
    assert.equal(response.status, 503);
  }
  assert.deepEqual(calls, []);
});

test("oversized bodies are refused before signature checks", async () => {
  const large = JSON.stringify({ padding: "x".repeat(70_000) });
  const signature = await webhook.encodeSignatureHeader(large, Date.now(), secret);
  const response = await route.POST(request({ [webhook.SIGNATURE_HEADER_NAME]: signature }, large));
  assert.equal(response.status, 413);
  assert.deepEqual(calls, []);
});

test("only POST is exported, so other methods get 405 from Next.js", () => {
  assert.deepEqual(Object.keys(route).filter((key) => /^[A-Z]+$/.test(key)), ["POST"]);
});
