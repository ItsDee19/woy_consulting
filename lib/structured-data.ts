import { capabilities, caseStudies, pillars, practitioners, site, type CaseStudy } from "@/lib/content";
import { siteUrl } from "@/lib/site-url";

export type SchemaNode = Record<string, unknown>;
export type SchemaReference = { "@id": string };
export type Breadcrumb = { name: string; path: string };
export type WebPageOptions = {
  path: string;
  name: string;
  description: string;
  type?: "WebPage" | "AboutPage" | "CollectionPage" | "ContactPage";
  mainEntity?: SchemaReference | SchemaReference[];
  breadcrumb?: SchemaReference;
};

/** Graph URLs always use the same canonical origin as metadata and the sitemap. */
export function schemaUrl(path: string): string {
  const url = new URL(path, siteUrl);
  if (!path.startsWith("/") || path.startsWith("//") || url.origin !== new URL(siteUrl).origin) {
    throw new Error("Structured-data paths must remain on the canonical site origin.");
  }
  return url.href;
}

export function schemaId(path: string, fragment: string): string {
  const url = new URL(schemaUrl(path));
  url.hash = fragment;
  return url.href;
}

const organization = (): SchemaReference => ({ "@id": schemaId("/", "organization") });
const website = (): SchemaReference => ({ "@id": schemaId("/", "website") });

/** Known business facts only. No inferred address, reviews, credentials or contacts. */
export function siteEntityGraph(): SchemaNode[] {
  return [
    {
      "@type": "Organization",
      ...organization(),
      name: site.name,
      url: schemaUrl("/"),
      logo: schemaUrl("/apple-icon.png"),
      description: site.description,
      slogan: site.principle,
      foundingDate: String(site.established),
    },
    {
      "@type": "WebSite",
      ...website(),
      name: site.name,
      url: schemaUrl("/"),
      description: site.description,
      inLanguage: "en",
      publisher: organization(),
    },
  ];
}

export function webPageSchema(options: WebPageOptions): SchemaNode {
  return {
    "@type": options.type ?? "WebPage",
    "@id": schemaId(options.path, "webpage"),
    url: schemaUrl(options.path),
    name: options.name,
    description: options.description,
    inLanguage: "en",
    isPartOf: website(),
    about: organization(),
    ...(options.mainEntity ? { mainEntity: options.mainEntity } : {}),
    ...(options.breadcrumb ? { breadcrumb: options.breadcrumb } : {}),
  };
}

export function breadcrumbSchema(path: string, items: Breadcrumb[]): SchemaNode {
  return {
    "@type": "BreadcrumbList",
    "@id": schemaId(path, "breadcrumb"),
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: schemaUrl(item.path),
    })),
  };
}

/** For content routes; the homepage can use webPageSchema directly. */
export function contentPageGraph(options: WebPageOptions, ancestors: Breadcrumb[] = []): SchemaNode[] {
  return [
    webPageSchema({ ...options, breadcrumb: { "@id": schemaId(options.path, "breadcrumb") } }),
    breadcrumbSchema(options.path, [
      { name: "Home", path: "/" },
      ...ancestors,
      { name: options.name, path: options.path },
    ]),
  ];
}

export function serviceGraph(): SchemaNode[] {
  return capabilities.map((capability) => ({
    "@type": "Service",
    "@id": schemaId("/", capability.slug),
    url: schemaUrl(`/#${capability.slug}`),
    name: capability.title,
    description: capability.summary,
    serviceType: capability.title,
    category: pillars[capability.pillar].title,
    provider: organization(),
    mainEntityOfPage: { "@id": schemaId("/", "webpage") },
  }));
}

export function practitionerGraph(): SchemaNode[] {
  return practitioners.map((practitioner) => ({
    "@type": "Person",
    "@id": schemaId("/practitioners", practitioner.slug),
    url: schemaUrl(`/practitioners#${practitioner.slug}`),
    name: practitioner.name,
    jobTitle: practitioner.role,
    description: practitioner.lede,
    knowsAbout: practitioner.expertise,
    affiliation: organization(),
    ...(practitioner.linkedin ? { sameAs: [practitioner.linkedin] } : {}),
    ...(practitioner.photo ? { image: new URL(practitioner.photo, siteUrl).href } : {}),
  }));
}

export function caseStudyListSchema(): SchemaNode {
  return {
    "@type": "ItemList",
    "@id": schemaId("/case-studies", "case-studies"),
    name: "WOY Consulting case studies",
    numberOfItems: caseStudies.length,
    itemListElement: caseStudies.map((study, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@id": schemaId(`/case-studies/${study.slug}`, "case-study"),
        name: study.title,
        url: schemaUrl(`/case-studies/${study.slug}`),
      },
    })),
  };
}

export function caseStudySchema(study: CaseStudy): SchemaNode {
  const path = `/case-studies/${study.slug}`;
  return {
    "@type": "CreativeWork",
    "@id": schemaId(path, "case-study"),
    url: schemaUrl(path),
    name: study.title,
    headline: study.headline,
    description: study.context,
    genre: "Case study",
    inLanguage: "en",
    about: { "@type": "Thing", name: study.industry },
    publisher: organization(),
    isPartOf: { "@id": schemaId("/case-studies", "webpage") },
    mainEntityOfPage: { "@id": schemaId(path, "webpage") },
  };
}

/** JSON-LD lives inside HTML raw text, so JSON.stringify alone is not sufficient. */
export function serializeStructuredData(nodes: SchemaNode[]): string {
  return JSON.stringify({ "@context": "https://schema.org", "@graph": nodes })
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
