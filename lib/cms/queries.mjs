/**
 * GROQ for every CMS read. Shared by lib/cms/source.ts and scripts/cms-snapshot.mjs.
 * Lists are fetched whole (the site has a handful of entries) so pages filter in memory and the
 * snapshot needs no parameters.
 */
const file = `{ "url": asset->url, "originalFilename": asset->originalFilename, "extension": asset->extension, "size": asset->size }`;
const image = `{ "url": asset->url, "originalFilename": asset->originalFilename, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height, hotspot }`;
const attachment = `"document": document{ label, "file": file${file} }`;

export const queries = {
  caseStudies: `*[_type == "caseStudy" && defined(slug.current)] | order(orderRank asc) {
    "slug": slug.current, title, industry, summary, coverText, strap, theme, featured, context, focus,
    work[]{ title, text }, resultsHeading, results, takeaway, ${attachment},
    "legacySlug": legacySlug.current, olderTitle, olderIndustry, headline, olderContext, edge, framework, outcomes, olderOrder
  }`,
  people: `*[_type == "person" && defined(slug.current) && defined(portrait.asset)] | order(orderRank asc) {
    "slug": slug.current, name, role, group, "portrait": portrait${image}, introduction, biography, experience, focus, linkedin,
    ${attachment}, olderRole, lede, olderBio, expertise, "olderPhoto": olderPhoto${image},
    highlightLabel, highlightDetail, highlightBackground
  }`,
  resources: `*[_type == "resource" && defined(file.asset)] | order(date desc, title asc) {
    "id": _id, title, description, category, date, "file": file${file}, "cover": coverImage${image}
  }`,
};
