const test = require("node:test");
const assert = require("node:assert/strict");
const { loadTs } = require("./helpers/load-ts.cjs");

const assets = loadTs("lib/cms/assets.ts");
const cases = loadTs("lib/cms/map-case-studies.ts", { "./assets": assets });
const people = loadTs("lib/cms/map-people.ts", { "./assets": assets });
const resources = loadTs("lib/cms/map-resources.ts", { "./assets": assets });

const cdnImage = (name, hotspot = null) => ({ url: `https://cdn.sanity.io/images/abc123xy/production/${name}-800x1000.jpg`, originalFilename: `${name}.jpg`, width: 800, height: 1000, hotspot });
const pdf = { url: "https://cdn.sanity.io/files/abc123xy/production/f00d.pdf", originalFilename: "Case study.pdf", extension: "pdf", size: 2048 };

// Minimal published case study: Sanity returns null for empty arrays and unset fields.
const minimalCase = {
  slug: "new-case", title: "A new case", industry: "Retail", summary: "Summary.", coverText: "Line one\nLine two",
  strap: "Strategy", theme: "navy", featured: null, context: "Context.", focus: ["Focus"], work: [{ title: "Step", text: "Text" }],
  resultsHeading: "Results", results: ["Result one"], takeaway: "Takeaway.", document: null,
  legacySlug: null, olderTitle: null, olderIndustry: null, headline: null, olderContext: null, edge: null, framework: null, outcomes: null, olderOrder: null,
};

test("a minimal case study renders on both page sets through the fallbacks", () => {
  const engagement = cases.toEngagement(minimalCase);
  assert.equal("featured" in engagement, false);
  assert.equal("download" in engagement, false);
  assert.deepEqual(cases.toCaseStudyBrief(minimalCase), {
    slug: "new-case", industry: "Retail", title: "A new case", headline: "Summary.", context: "Context.",
    edge: ["Focus"], framework: ["Step"], outcomes: ["Result one"],
  });
  const empty = cases.toEngagement({ ...minimalCase, focus: null, work: null, results: null });
  assert.deepEqual([empty.focus, empty.work, empty.results], [[], [], []]);
});

test("older-page fields win when present and attachments reach both page sets", () => {
  const raw = { ...minimalCase, legacySlug: "old-case", olderTitle: "Old title", headline: "Old headline", edge: ["Edge"], document: { label: null, file: pdf } };
  const brief = cases.toCaseStudyBrief(raw);
  assert.equal(brief.slug, "old-case");
  assert.equal(brief.title, "Old title");
  assert.deepEqual(brief.edge, ["Edge"]);
  assert.equal(brief.download.label, "Download the full case study");
  assert.equal(cases.toEngagement(raw).download.href, "/cms-assets/files/f00d.pdf?dl=Case%20study.pdf");
});

test("older-page order uses explicit positions first, then main order", () => {
  const raws = ["a", "b", "c", "d"].map((slug) => ({ ...minimalCase, slug }));
  raws[2].olderOrder = 1;
  raws[0].olderOrder = 2;
  assert.deepEqual(cases.orderBriefs(raws).map((brief) => brief.slug), ["c", "a", "b", "d"]);
});

test("the homepage shows up to four featured case studies, in order, and copes with fewer", () => {
  const items = ["a", "b", "c", "d", "e"].map((slug, index) => ({ slug, featured: index !== 1 }));
  assert.deepEqual(cases.selectFeatured(items).map((item) => item.slug), ["a", "c", "d", "e"]);
  assert.deepEqual(cases.selectFeatured(items.slice(0, 2)).map((item) => item.slug), ["a"]);
  assert.deepEqual(cases.selectFeatured([]), []);
});

const minimalPerson = {
  slug: "new-person", name: "Asha  Rao", role: "Partner", group: null, portrait: cdnImage("asha", { x: 0.5, y: 0.2 }),
  introduction: "Intro.", biography: ["Para one."], experience: null, focus: "Focus line", linkedin: null, document: null,
  olderRole: null, lede: null, olderBio: null, expertise: null, olderPhoto: null, highlightLabel: "Label", highlightDetail: null, highlightBackground: null,
};

test("a new person renders on every page without the optional older-page details", () => {
  assert.equal(people.initials("Asha  Rao"), "AR");
  assert.equal(people.initials("Madonna"), "M");
  assert.equal(people.initials("Mary Anne de Souza"), "MS");
  assert.deepEqual(people.toProfile(minimalPerson), {
    slug: "new-person", name: "Asha  Rao", role: "Partner", portrait: minimalPerson.portrait.url, imagePosition: "50% 20%",
    introduction: "Intro.", biography: ["Para one."], experience: [],
  });
  assert.deepEqual(people.toListing(minimalPerson), {
    slug: "new-person", name: "Asha  Rao", role: "Partner", category: "leadership", focus: "Focus line",
    image: "/cms-assets/images/asha-800x1000.jpg",
  });
  const practitioner = people.toPractitioner(minimalPerson);
  assert.equal("highlight" in practitioner, false, "Partial highlights are hidden, not half-rendered");
  assert.equal(practitioner.lede, "Intro.");
  assert.equal(practitioner.photo, minimalPerson.portrait.url);
  assert.equal(practitioner.linkedin, null);
  assert.equal(people.toListing({ ...minimalPerson, group: "partner" }).category, "partner");
});

test("resources without a file are dropped; descriptions and covers are optional", () => {
  assert.equal(resources.toResource({ id: "r1", title: "T", date: "2026-10-01", file: null }), null);
  const resource = resources.toResource({ id: "r2", title: "Brochure", description: null, category: null, date: "2026-10-01", file: pdf, cover: null });
  assert.equal(resource.description, "");
  assert.equal(resource.category, "Other");
  assert.equal(resource.download.label, "Download");
  assert.equal("cover" in resource, false);
});
