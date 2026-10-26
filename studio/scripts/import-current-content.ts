/**
 * One-off import of the batch 1 content that lives in lib/*.ts today.
 * Run from studio/: `npm run import:dry` (prints, writes nothing) then `npm run import`.
 * Fixed IDs (hyphens — dotted IDs are private in public datasets) make re-runs replace, not duplicate.
 */
import { createReadStream, existsSync } from "node:fs";
import path from "node:path";
import { getCliClient } from "sanity/cli";
import { caseStudies, practitionerHighlights, practitioners } from "../../lib/content";
import { cases, peopleListingDetails } from "../../lib/recreation-content";
import { peopleProfiles } from "../../lib/people-profiles";
import { hotspotFromObjectPosition } from "../../lib/cms/assets";

const dryRun = process.argv.includes("--dry-run");
const client = getCliClient({ apiVersion: "2026-10-01" });
const publicDir = path.resolve(process.cwd(), "..", "public");

/** Older /case-studies slugs for each current /work slug. */
const legacyCaseSlugs: Record<string, string> = {
  "insurance-leadership": "insurance-senior-sales-leadership",
  "education-transformation": "education-institution-transformation",
  "consultative-selling": "it-ites-consultative-selling",
  "entrepreneurial-mindset": "financial-services-entrepreneurial-mindset",
  "automotive-alignment": "automotive-leadership-assimilation",
  "medical-technology-leadership": "medical-technology-strategic-thinking",
};

/** LexoRank-compatible ranks ("0|<base36>:") understood by @sanity/orderable-document-list. */
const rank = (index: number) => `0|${(100000 + index * 1000).toString(36)}:`;

const uploads = new Map<string, string>();
async function uploadImage(publicPath: string): Promise<string> {
  const file = path.join(publicDir, publicPath.replace(/^\//, ""));
  if (!existsSync(file)) throw new Error(`Missing image: ${file}`);
  const cached = uploads.get(file);
  if (cached) return cached;
  const id = dryRun
    ? `image-dry-run-${path.basename(file)}`
    : (await client.assets.upload("image", createReadStream(file), { filename: path.basename(file) }))._id;
  uploads.set(file, id);
  return id;
}

function image(assetId: string, objectPosition?: string) {
  return {
    _type: "image",
    asset: { _type: "reference", _ref: assetId },
    ...(objectPosition ? { hotspot: { _type: "sanity.imageHotspot", ...hotspotFromObjectPosition(objectPosition), width: 0.4, height: 0.4 } } : {}),
  };
}

const slug = (current: string) => ({ _type: "slug", current });

async function main() {
  const legacy = new Map(caseStudies.map((study, index) => [study.slug, { study, index }]));
  const usedLegacy = new Set<string>();
  const caseDocs = cases.map((item, index) => {
    const legacySlug = legacyCaseSlugs[item.slug];
    const older = legacySlug ? legacy.get(legacySlug) : undefined;
    if (!older) throw new Error(`No older case study mapped for /work/${item.slug}`);
    usedLegacy.add(older.study.slug);
    return {
      _id: `caseStudy-${item.slug}`, _type: "caseStudy", orderRank: rank(index),
      title: item.title, slug: slug(item.slug), industry: item.industry, summary: item.summary,
      coverText: item.cover, strap: item.strap, theme: item.theme, featured: Boolean(item.featured),
      context: item.context, focus: item.focus,
      work: item.work.map((step, stepIndex) => ({ _key: `work-${stepIndex}`, _type: "workItem", title: step.title, text: step.text })),
      resultsHeading: item.resultTitle, results: item.results, takeaway: item.takeaway,
      legacySlug: slug(older.study.slug), olderTitle: older.study.title, olderIndustry: older.study.industry,
      headline: older.study.headline, olderContext: older.study.context, edge: older.study.edge,
      framework: older.study.framework, outcomes: older.study.outcomes, olderOrder: older.index + 1,
    };
  });
  if (usedLegacy.size !== caseStudies.length) throw new Error("Every older case study must map to exactly one engagement.");

  const practitionerBySlug = new Map(practitioners.map((person) => [person.slug, person]));
  const personDocs = [];
  for (const [index, profile] of peopleProfiles.entries()) {
    const practitioner = practitionerBySlug.get(profile.slug);
    const listing = peopleListingDetails[profile.slug];
    const highlight = practitionerHighlights[profile.slug];
    if (!practitioner || !listing || !highlight) throw new Error(`Incomplete source data for ${profile.slug}`);
    if (path.basename(profile.portrait) !== listing.image) throw new Error(`Listing and profile images differ for ${profile.slug}`);
    const olderPhoto = practitioner.photo && practitioner.photo !== profile.portrait ? image(await uploadImage(practitioner.photo)) : undefined;
    personDocs.push({
      _id: `person-${profile.slug}`, _type: "person", orderRank: rank(index),
      name: profile.name, slug: slug(profile.slug), role: profile.role, group: listing.category,
      portrait: image(await uploadImage(profile.portrait), profile.imagePosition),
      introduction: profile.introduction, biography: profile.biography, experience: profile.experience, focus: listing.focus,
      ...(practitioner.linkedin ? { linkedin: practitioner.linkedin } : {}),
      olderRole: practitioner.role, lede: practitioner.lede, olderBio: practitioner.bio, expertise: practitioner.expertise,
      ...(olderPhoto ? { olderPhoto } : {}),
      highlightLabel: highlight.label, highlightDetail: highlight.detail, highlightBackground: highlight.background,
    });
  }

  const documents: Array<{ _id: string; _type: string } & Record<string, unknown>> = [...caseDocs, ...personDocs];
  if (dryRun) {
    for (const doc of documents) console.log(`would write ${doc._id}`);
    console.log(`Dry run: ${documents.length} documents and ${uploads.size} images; nothing was written.`);
    return;
  }
  const transaction = client.transaction();
  for (const doc of documents) transaction.createOrReplace(doc);
  await transaction.commit();
  console.log(`Imported ${documents.length} documents and ${uploads.size} images.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
