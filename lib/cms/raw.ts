/** Shapes returned by the GROQ queries in lib/cms/queries.mjs. Sanity returns null for missing values. */
export type RawFile = { url: string; originalFilename: string | null; extension: string | null; size: number | null } | null;
export type RawImage = {
  url: string;
  originalFilename: string | null;
  width: number;
  height: number;
  hotspot?: { x: number; y: number } | null;
} | null;
export type RawAttachment = { label?: string | null; file?: RawFile } | null;

export type RawCaseStudy = {
  slug: string; title: string; industry: string; summary: string; coverText: string; strap: string; theme: string;
  featured?: boolean | null; context: string; focus?: string[] | null; work?: { title: string; text: string }[] | null;
  resultsHeading: string; results?: string[] | null; takeaway: string; document?: RawAttachment;
  legacySlug?: string | null; olderTitle?: string | null; olderIndustry?: string | null; headline?: string | null;
  olderContext?: string | null; edge?: string[] | null; framework?: string[] | null; outcomes?: string[] | null;
  olderOrder?: number | null;
};

export type RawPerson = {
  slug: string; name: string; role: string; group?: string | null; portrait: NonNullable<RawImage>;
  introduction: string; biography?: string[] | null; experience?: string[] | null; focus: string;
  linkedin?: string | null; document?: RawAttachment;
  olderRole?: string | null; lede?: string | null; olderBio?: string[] | null; expertise?: string[] | null;
  olderPhoto?: RawImage; highlightLabel?: string | null; highlightDetail?: string | null; highlightBackground?: string | null;
};

export type RawResource = {
  id: string; title: string; description?: string | null; category?: string | null; date: string;
  file: RawFile; cover?: RawImage;
};
