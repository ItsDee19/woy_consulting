const test = require("node:test");
const assert = require("node:assert/strict");
const { loadTs } = require("./helpers/load-ts.cjs");

const { shouldUseSnapshot } = loadTs("lib/cms/fallback.ts");
const failure = (props, message = "request failed") => Object.assign(new Error(message), props);

test("connection failures and temporary Sanity errors fall back to the build snapshot", () => {
  const cases = [
    failure({ code: "ECONNREFUSED" }), failure({ code: "ENOTFOUND" }), failure({ code: "EAI_AGAIN" }),
    failure({ code: "ETIMEDOUT" }), failure({ code: "ECONNRESET" }), failure({ code: "UND_ERR_CONNECT_TIMEOUT" }),
    Object.assign(new Error("timed out"), { name: "TimeoutError" }), Object.assign(new Error("aborted"), { name: "AbortError" }),
    failure({ statusCode: 500 }), failure({ statusCode: 502 }), failure({ statusCode: 503 }), failure({ statusCode: 429 }),
    failure({ statusCode: 402 }, "Assets quota limit reached"), // Sanity free plan: monthly limit used up
    new TypeError("fetch failed", { cause: failure({ code: "ECONNREFUSED" }) }),
  ];
  for (const error of cases) assert.equal(shouldUseSnapshot(error), true, `${error.name} ${error.code ?? error.statusCode ?? ""}`);
});

test("query mistakes, our own bugs and non-errors surface instead of hiding behind old content", () => {
  const cases = [
    failure({ statusCode: 400 }), failure({ statusCode: 401 }), failure({ statusCode: 403 }), failure({ statusCode: 404 }),
    new TypeError("Cannot read properties of undefined (reading 'url')"), new Error("Person has no portrait"),
    new TypeError("fetch failed", { cause: new Error("certificate has expired") }),
    "ECONNREFUSED", null, undefined, { code: "ECONNREFUSED" }, 503,
  ];
  // A circular cause chain must end in "no" instead of overflowing the stack.
  const loop = new Error("loop");
  loop.cause = new Error("again", { cause: loop });
  cases.push(loop);
  for (const error of cases) assert.equal(shouldUseSnapshot(error), false, String(error));
});
