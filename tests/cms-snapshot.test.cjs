const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
function runSnapshot(extraArgs) {
  const output = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "woy-snapshot-")), "snapshot.json");
  const result = spawnSync(process.execPath, ["scripts/cms-snapshot.mjs", "--output", output, ...extraArgs], {
    cwd: root, encoding: "utf8", timeout: 90_000, env: { ...process.env, CMS_TEST_UNREACHABLE: "1" },
  });
  return { ...result, output };
}

test("a build stops when the snapshot cannot be generated, so the live deployment stays up", () => {
  const result = runSnapshot([]);
  assert.equal(result.status, 1, result.stderr);
  assert.match(result.stderr, /CMS snapshot failed/);
  assert.equal(fs.existsSync(result.output), false);
});

test("local development starts offline without writing a snapshot", () => {
  const result = runSnapshot(["--allow-offline"]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stderr, /CMS snapshot skipped/);
  assert.equal(fs.existsSync(result.output), false);
});
