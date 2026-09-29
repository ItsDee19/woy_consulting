import { execFileSync } from "node:child_process";
import { lstatSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

// A fast, offline guard, supplemented by full-history Gitleaks in CI.
// Never include matched text or credential values in findings or console output.
const rules = [
  ["private-key", /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g],
  ["aws-access-key", /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g],
  ["github-token", /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{60,})\b/g],
  ["slack-token", /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/g],
  ["stripe-secret", /\bsk_(?:live|test)_[A-Za-z0-9]{20,}\b/g],
  ["google-api-key", /\bAIza[A-Za-z0-9_-]{35}\b/g],
  ["resend-api-key", /\bre_[A-Za-z0-9_-]{20,}\b/g],
  ["openai-project-key", /\bsk-(?:proj|svcacct)-[A-Za-z0-9_-]{40,}\b/g],
];
const credentialAssignment = /\b(?:api[_-]?key|secret|password|token)\b\s*[:=]\s*["']([^"'\s]{24,})["']/gi;
const browserServerConfig = /\b(?:RESEND_API_KEY|CONTACT_(?:FROM_EMAIL|TO_EMAIL|ENDPOINT(?:_TOKEN)?|FORM_SECRET|RATE_LIMIT_IP_HEADER)|UPSTASH_REDIS_REST_(?:URL|TOKEN)|TURNSTILE_SECRET_KEY)\b/g;
const examples = /^(?:docs|tests|fixtures|__fixtures__)\/|\/(?:fixtures|__fixtures__)\/|\.(?:md|mdx)$/i;
const generated = /^(?:node_modules|\.git|\.next|reports|out|build)\//;

function location(text, index) {
  return text.slice(0, index).split("\n").length;
}

function entropy(value) {
  const counts = new Map();
  for (const character of value) counts.set(character, (counts.get(character) ?? 0) + 1);
  return [...counts.values()].reduce((sum, count) => {
    const probability = count / value.length;
    return sum - probability * Math.log2(probability);
  }, 0);
}

export function scanText(text, { browser = false } = {}) {
  const findings = [];
  for (const [category, expression] of rules) {
    for (const match of text.matchAll(expression)) findings.push({ category, line: location(text, match.index) });
  }
  for (const match of text.matchAll(credentialAssignment)) {
    const candidate = match[1];
    const placeholder = /^(?:replace[-_]?me|your[-_]|example[-_]|placeholder|change[-_]?me|<|\$\{)/i.test(candidate);
    if (!placeholder && entropy(candidate) >= 3.5) findings.push({ category: "hardcoded-credential", line: location(text, match.index) });
  }
  if (browser) {
    for (const match of text.matchAll(browserServerConfig)) findings.push({ category: "server-config-in-browser", line: location(text, match.index) });
  }
  return findings;
}

export function formatFinding({ path, category, line }) {
  return `${JSON.stringify(path)}${line ? `:${line}` : ""} [${category}]`;
}

function readText(path) {
  const stat = lstatSync(path);
  if (stat.isSymbolicLink()) return null;
  if (!stat.isFile()) return null;
  const content = readFileSync(path);
  if (content.subarray(0, 8192).includes(0)) return null;
  return content.toString("utf8");
}

function browserFiles(directory) {
  const result = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) result.push(...browserFiles(join(directory, entry.name)));
    else if (entry.isFile() && /\.(?:js|json|map|html)$/i.test(entry.name)) result.push(join(directory, entry.name));
  }
  return result;
}

export function scanRepository(root = process.cwd(), { sourceOnly = false } = {}) {
  root = resolve(root);
  const paths = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], {
    cwd: root, encoding: "utf8", maxBuffer: 16 * 1024 * 1024,
  }).split("\0").filter(Boolean);
  const findings = [];
  let sourceFiles = 0;
  for (const path of new Set(paths)) {
    if (generated.test(path)) continue;
    if (/(?:^|\/)\.env(?:\.|$)/i.test(path) && !/(?:^|\/)\.env\.example$/i.test(path)) {
      findings.push({ path, category: "environment-file-in-repository" });
      continue;
    }
    if (/(?:^|\/)(?:id_rsa|id_ed25519)$|\.(?:pem|key|p12|pfx)$/i.test(path)) {
      findings.push({ path, category: "private-key-file-in-repository" });
      continue;
    }
    if (examples.test(path)) continue;
    const fullPath = resolve(root, path);
    if (!fullPath.startsWith(root + sep)) throw new Error("Git returned a path outside the repository.");
    let text;
    try { text = readText(fullPath); } catch (error) {
      // Tracked deletions are absent from disk but still listed until staged.
      if (error.code === "ENOENT") continue;
      throw error;
    }
    if (text === null) continue;
    sourceFiles++;
    findings.push(...scanText(text).map(finding => ({ path, ...finding })));
  }
  let bundles = 0;
  if (!sourceOnly) {
    const directory = join(root, ".next", "static");
    let files;
    try { files = browserFiles(directory); } catch (error) {
      if (error.code === "ENOENT") throw new Error("No browser build found. Run npm run build first, or use --source-only for a source-only check.");
      throw error;
    }
    if (files.length === 0) throw new Error("The browser build has no scripts to scan. Run npm run build first.");
    for (const path of files) {
      const text = readText(path);
      if (text === null) continue;
      bundles++;
      findings.push(...scanText(text, { browser: true }).map(finding => ({ path: relative(root, path).split(sep).join("/"), ...finding })));
    }
  }
  return { sourceFiles, bundles, findings };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const arguments_ = process.argv.slice(2);
    if (arguments_.some(argument => argument !== "--source-only")) throw new Error("Usage: node scripts/security-check.mjs [--source-only]");
    const result = scanRepository(process.cwd(), { sourceOnly: arguments_.includes("--source-only") });
    console.log(`Security scan: ${result.sourceFiles} source files and ${result.bundles} browser files checked.`);
    if (result.findings.length) {
      for (const finding of result.findings) console.error(formatFinding(finding));
      process.exitCode = 1;
    } else {
      console.log("No known credential patterns or server configuration markers found in the checked files.");
    }
  } catch (error) {
    console.error(`Security scan could not complete: ${error.message}`);
    process.exitCode = 1;
  }
}
