# Security

## Reporting a vulnerability

Please send private security reports to [hello@woyconsulting.com](mailto:hello@woyconsulting.com), with “Website security report” in the subject. Include the affected URL or file, the impact, and the smallest safe set of reproduction steps. Redact credentials and personal information. Do not include real client enquiries or other people's data.

Please do not disclose a suspected vulnerability in a public issue or pull request before it has been assessed. Avoid denial-of-service testing, bulk form submissions, accessing other people's records, or changing production data. Testing a local checkout with synthetic data is preferred. This policy does not promise a response time or establish a paid bug-bounty programme.

The maintained version is the latest `main` branch. Historical commits and the `_legacy` reference implementation are not separately supported deployments.

## Checks in this repository

The **Security and quality** workflow is configured for pull requests, pushes to `main`, manual runs and a weekly schedule. It installs the committed dependency lockfile, checks runtime dependency advisories at high severity and above, runs lint and unit tests, builds the application, checks TypeScript after generated route types exist, and scans source plus browser output. It also runs the production CSP and contact-security browser suites with mocked external services. Its separate jobs scan fetched Git history using Gitleaks and analyse JavaScript/TypeScript using CodeQL.

Actions are pinned to verified upstream commit SHAs. The Gitleaks release archive is pinned to a version and SHA-256 checksum. Secret scanning runs inside the GitHub runner; no secret values or source excerpts are uploaded as secret-scan artifacts or printed in its report. CodeQL sends its code-scanning results to this repository's GitHub security interface. No deployment credentials are needed. Workflow permissions are read-only except the CodeQL job's permission to publish security findings; workflows do not use `pull_request_target`.

Dependabot is configured to propose npm and GitHub Actions updates weekly. Patch and minor version updates are grouped for review; there is no automatic merge. Review and update the pinned Gitleaks version/checksum periodically because its CLI download is not managed by Dependabot.

These files only become scheduled checks after they reach the GitHub default branch and Actions is available. They do not themselves enable branch protection, required status checks, GitHub secret-scanning push protection, private vulnerability reporting, Dependabot security alerts, or production monitoring. A repository administrator should confirm those settings and the first successful workflow run. If CodeQL default setup is already enabled, choose either that setup or this advanced workflow to avoid duplicate analysis.

## Local checks and their limits

Run `node scripts/security-check.mjs --source-only` before committing. After `npm run build`, run `node scripts/security-check.mjs` to also inspect emitted browser files. The scanner reports only file paths, categories and line numbers, never the matched credential value. A missing browser build is an error rather than a successful empty scan.

The local source scan checks tracked files and new non-ignored files. It rejects committed environment/private-key files and recognises common credential formats, suspicious credential assignments, and server-only contact configuration in browser output. It skips binary files, symbolic links, generated folders, Markdown documentation, and test/fixture examples to avoid reporting deliberate examples as real credentials. Ignored local `.env` files are intentionally not read. Gitleaks provides the broader full-history scan in CI, including documentation and tests.

These checks cannot detect every credential format, transformed or encrypted secrets, deleted remote branches, host settings, or every application vulnerability. They are not a replacement for review or a deployed-host assessment. A dependency scan's result depends on advisories known at the time it runs. Do not publish source, environment files, or internal briefing material to resolve a scanner warning.

## If a credential is exposed

Revoke or rotate it at its provider first, remove it from the application and configuration, and assess relevant access logs and downstream systems. Removing the value in a new commit alone does not remove it from Git history, caches or forks. Coordinate any necessary history cleanup separately after rotation, then re-run checks. Keep incident records and reports private, and avoid copying the value into an issue, build log, or chat.

## Upstream tooling

- [GitHub checkout action](https://github.com/actions/checkout/releases/tag/v7.0.1)
- [GitHub setup-node action](https://github.com/actions/setup-node/releases/tag/v7.0.0)
- [GitHub CodeQL action](https://github.com/github/codeql-action/releases/tag/v4.38.2)
- [Gitleaks CLI](https://github.com/gitleaks/gitleaks/releases/tag/v8.30.1)
