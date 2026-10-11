// Compares two capture folders pixel by pixel; writes diff images for anything that differs.
import fs from "node:fs";
import path from "node:path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

const [baselineLabel, candidateLabel] = process.argv.slice(2).filter((arg, index, all) => !arg.startsWith("--") && all[index - 1] !== "--allow");
if (!baselineLabel || !candidateLabel) throw new Error("Usage: node tests/visual-compare.mjs <baseline> <candidate> [--allow <file-prefix>]...");
const allowed = process.argv.flatMap((arg, index, all) => all[index - 1] === "--allow" ? [arg] : []);
const root = path.resolve("reports", "visual");
const baselineDir = path.join(root, baselineLabel);
const candidateDir = path.join(root, candidateLabel);
const diffDir = path.join(root, `diff-${baselineLabel}-vs-${candidateLabel}`);
fs.rmSync(diffDir, { recursive: true, force: true });
fs.mkdirSync(diffDir, { recursive: true });

const isAllowed = (file) => allowed.some((prefix) => file.startsWith(prefix));
const baselineFiles = fs.readdirSync(baselineDir).filter((file) => file.endsWith(".png"));
const candidateFiles = new Set(fs.readdirSync(candidateDir).filter((file) => file.endsWith(".png")));
const failures = [];

for (const file of baselineFiles) {
  if (isAllowed(file)) continue;
  if (!candidateFiles.has(file)) { failures.push(`${file}: missing from ${candidateLabel}`); continue; }
  const before = PNG.sync.read(fs.readFileSync(path.join(baselineDir, file)));
  const after = PNG.sync.read(fs.readFileSync(path.join(candidateDir, file)));
  if (before.width !== after.width || before.height !== after.height) {
    failures.push(`${file}: size ${before.width}×${before.height} → ${after.width}×${after.height}`);
    continue;
  }
  const diff = new PNG({ width: before.width, height: before.height });
  const changed = pixelmatch(before.data, after.data, diff.data, before.width, before.height, { threshold: 0.1 });
  if (changed > 0) {
    fs.writeFileSync(path.join(diffDir, file), PNG.sync.write(diff));
    failures.push(`${file}: ${changed} pixels differ`);
  }
}
for (const file of candidateFiles) {
  if (!baselineFiles.includes(file) && !isAllowed(file)) failures.push(`${file}: new in ${candidateLabel}`);
}

if (failures.length) {
  console.error(`Visual differences (${failures.length}). Diff images: ${path.relative(process.cwd(), diffDir)}`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`No visual differences across ${baselineFiles.length} screenshots.`);
}
