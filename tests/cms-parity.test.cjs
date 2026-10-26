// Migration-time check: Sanity content mapped back through lib/cms equals today's TypeScript data.
// Requires `npm run cms:snapshot` first. Deleted with the old data files in Task 10.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { loadTs, root } = require("./helpers/load-ts.cjs");

const snapshotFile = path.join(root, "lib/cms/snapshot.generated.json");
if (!fs.existsSync(snapshotFile)) {
  test("CMS parity", { skip: "run `npm run cms:snapshot` first" }, () => {});
  return;
}
const { results } = JSON.parse(fs.readFileSync(snapshotFile, "utf8"));
const assets = loadTs("lib/cms/assets.ts");
const cases = loadTs("lib/cms/map-case-studies.ts", { "./assets": assets });
const people = loadTs("lib/cms/map-people.ts", { "./assets": assets });
const content = loadTs("lib/content.ts");
const profiles = loadTs("lib/people-profiles.ts");
const recreation = loadTs("lib/recreation-content.ts", { "./people-profiles": profiles });
const base = (file) => path.basename(file);

test("engagements match /work content exactly", () => {
  assert.deepStrictEqual(results.caseStudies.map(cases.toEngagement), recreation.cases);
});

test("older case-study pages keep their text and order", () => {
  assert.deepStrictEqual(cases.orderBriefs(results.caseStudies), content.caseStudies);
});

test("profiles keep their text and framing; portraits are the same files", () => {
  const strip = ({ portrait, ...rest }) => rest;
  assert.deepStrictEqual(results.people.map(people.toProfile).map(strip), profiles.peopleProfiles.map(strip));
  assert.deepStrictEqual(results.people.map((raw) => raw.portrait.originalFilename), profiles.peopleProfiles.map((p) => base(p.portrait)));
});

test("listing cards keep group, focus and image file", () => {
  assert.deepStrictEqual(
    results.people.map(people.toListing).map(({ image, ...rest }) => rest),
    recreation.people.map(({ slug, name, role, category, focus }) => ({ slug, name, role, category, focus })),
  );
  assert.deepStrictEqual(results.people.map((raw) => raw.portrait.originalFilename), recreation.people.map((p) => p.image));
});

test("practitioners keep text, highlights and photo files", () => {
  const mapped = results.people.map(people.toPractitioner);
  assert.deepStrictEqual(mapped.map(({ photo, highlight, ...rest }) => rest), content.practitioners.map(({ photo, ...rest }) => rest));
  assert.deepStrictEqual(mapped.map((p) => p.highlight), content.practitioners.map((p) => content.practitionerHighlights[p.slug]));
  assert.deepStrictEqual(results.people.map((raw) => (raw.olderPhoto ?? raw.portrait).originalFilename), content.practitioners.map((p) => base(p.photo)));
});
