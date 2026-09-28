const assert = require("node:assert/strict");
const { execFileSync, spawnSync } = require("node:child_process");
const { mkdtempSync, mkdirSync, rmSync, writeFileSync } = require("node:fs");
const { tmpdir } = require("node:os");
const { join, resolve } = require("node:path");
const { pathToFileURL } = require("node:url");
const test = require("node:test");

const script = resolve(__dirname, "../scripts/security-check.mjs");
const scanner = import(pathToFileURL(script).href);
// Synthetic values are assembled so a full-history scanner does not mistake a fixture for a leaked credential.
const fakeGithubToken = () => ["ghp", "aB9".repeat(13)].join("_");

function repository(t) {
  const root = mkdtempSync(join(tmpdir(), "woy-security-check-"));
  execFileSync("git", ["init", "--quiet"], { cwd: root });
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}

function write(root, file, text) {
  mkdirSync(resolve(root, file, ".."), { recursive: true });
  writeFileSync(join(root, file), text);
}

test("known credentials are reported without returning their value", async () => {
  const { scanText, formatFinding } = await scanner;
  const secret = fakeGithubToken();
  const result = scanText(`const value = '${secret}';`);
  assert.equal(result[0].category, "github-token");
  assert.equal(result[0].line, 1);
  assert.ok(!JSON.stringify(result).includes(secret));
  assert.ok(!formatFinding({ path: "app/example.ts", ...result[0] }).includes(secret));
});

test("browser server-only configuration is blocked but legitimate server references are allowed", async () => {
  const { scanText } = await scanner;
  for (const name of ["CONTACT_ENDPOINT_TOKEN", "CONTACT_FORM_SECRET", "UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN", "TURNSTILE_SECRET_KEY"]) {
    const code = `const value = process.env.${name};`;
    assert.deepEqual(scanText(code), []);
    assert.equal(scanText(code, { browser: true })[0].category, "server-config-in-browser");
  }
  assert.deepEqual(scanText("const origin = process.env.NEXT_PUBLIC_SITE_URL;", { browser: true }), []);
  assert.deepEqual(scanText("const siteKey = process.env.TURNSTILE_SITE_KEY;", { browser: true }), []);
});

test("scans tracked and new source, leaves ignored local files and examples alone", async t => {
  const { scanRepository } = await scanner;
  const root = repository(t);
  write(root, ".gitignore", ".env.local\n.next/\n");
  write(root, "app/tracked.js", "export const publicValue = 'hello';");
  execFileSync("git", ["add", ".gitignore", "app/tracked.js"], { cwd: root });
  write(root, "app/new.js", `const leaked = '${fakeGithubToken()}';`);
  write(root, ".env.local", `TOKEN=${fakeGithubToken()}`);
  write(root, "tests/fixture.js", fakeGithubToken());
  const result = scanRepository(root, { sourceOnly: true });
  assert.deepEqual(result.findings.map(f => f.path), ["app/new.js"]);
});

test("tracked environment files fail even when gitignored", async t => {
  const { scanRepository } = await scanner;
  const root = repository(t);
  write(root, ".gitignore", ".env*\n");
  write(root, ".env.local", "NO_SECRET_NEEDED=1\n");
  execFileSync("git", ["add", "--force", ".env.local"], { cwd: root });
  assert.equal(scanRepository(root, { sourceOnly: true }).findings[0].category, "environment-file-in-repository");
});

test("full check fails if a browser build is missing and scans emitted bundles", async t => {
  const { scanRepository } = await scanner;
  const root = repository(t);
  write(root, ".gitignore", ".next/\n");
  assert.throws(() => scanRepository(root), /No browser build found/);
  write(root, ".next/static/chunks/app.js", "console.log('CONTACT_FORM_SECRET');");
  const result = scanRepository(root);
  assert.equal(result.bundles, 1);
  assert.equal(result.findings[0].path, ".next/static/chunks/app.js");
  assert.equal(result.findings[0].category, "server-config-in-browser");
});

test("CLI exits unsuccessfully on leaks and never prints the matched value", async t => {
  const root = repository(t);
  const secret = fakeGithubToken();
  write(root, "new.js", `const value = '${secret}';`);
  const result = spawnSync(process.execPath, [script, "--source-only"], { cwd: root, encoding: "utf8" });
  assert.equal(result.status, 1);
  assert.ok(result.stderr.includes("github-token"));
  assert.ok(!`${result.stdout}${result.stderr}`.includes(secret));
});
