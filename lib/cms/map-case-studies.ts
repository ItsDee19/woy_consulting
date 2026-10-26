import { toDownload } from "./assets";
import type { RawCaseStudy } from "./raw";
import type { CaseStudyBrief, Engagement } from "./types";

const DEFAULT_LABEL = "Download the full case study";
const list = (value?: string[] | null) => (value ?? []).filter((item) => typeof item === "string" && item.trim() !== "");
const either = (value: string | null | undefined, fallback: string) => (value?.trim() ? value : fallback);

export function toEngagement(raw: RawCaseStudy): Engagement {
  const download = toDownload(raw.document, DEFAULT_LABEL);
  return {
    slug: raw.slug, industry: raw.industry, title: raw.title, cover: raw.coverText, strap: raw.strap, theme: raw.theme,
    summary: raw.summary, context: raw.context, focus: list(raw.focus),
    work: (raw.work ?? []).filter((item) => item?.title && item?.text).map(({ title, text }) => ({ title, text })),
    resultTitle: raw.resultsHeading, results: list(raw.results), takeaway: raw.takeaway,
    ...(raw.featured ? { featured: true } : {}),
    ...(download ? { download } : {}),
  };
}

export function toCaseStudyBrief(raw: RawCaseStudy): CaseStudyBrief {
  const engagement = toEngagement(raw);
  const edge = list(raw.edge);
  const framework = list(raw.framework);
  const outcomes = list(raw.outcomes);
  return {
    slug: either(raw.legacySlug, raw.slug),
    industry: either(raw.olderIndustry, raw.industry),
    title: either(raw.olderTitle, raw.title),
    headline: either(raw.headline, raw.summary),
    context: either(raw.olderContext, raw.context),
    edge: edge.length ? edge : engagement.focus,
    framework: framework.length ? framework : engagement.work.map((item) => item.title),
    outcomes: outcomes.length ? outcomes : engagement.results,
    ...(engagement.download ? { download: engagement.download } : {}),
  };
}

/** Explicit older-page positions first (ascending), then everything else in main order. */
export function orderBriefs(raws: RawCaseStudy[]): CaseStudyBrief[] {
  return raws
    .map((raw, index) => ({ raw, index }))
    .sort((a, b) => (a.raw.olderOrder ?? Infinity) - (b.raw.olderOrder ?? Infinity) || a.index - b.index)
    .map(({ raw }) => toCaseStudyBrief(raw));
}

export function selectFeatured<T extends { featured?: boolean }>(items: T[], limit = 4): T[] {
  return items.filter((item) => item.featured).slice(0, limit);
}
