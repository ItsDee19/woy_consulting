/** Shapes the components consume. They mirror the pre-CMS TypeScript data exactly, plus optional downloads. */
export type CmsDownload = { href: string; label: string; fileName: string; extension: string; size: number };

export type Engagement = {
  slug: string; industry: string; title: string; cover: string; strap: string; theme: string; summary: string;
  context: string; focus: string[]; work: { title: string; text: string }[]; resultTitle: string; results: string[];
  takeaway: string; featured?: boolean; download?: CmsDownload;
};

export type CaseStudyBrief = {
  slug: string; industry: string; title: string; headline: string; context: string;
  edge: string[]; framework: string[]; outcomes: string[]; download?: CmsDownload;
};

export type PersonProfile = {
  slug: string; name: string; role: string; portrait: string; imagePosition: string;
  introduction: string; biography: string[]; experience: string[]; download?: CmsDownload;
};

export type PersonListing = { slug: string; name: string; role: string; category: "leadership" | "partner"; focus: string; image: string };

export type PractitionerHighlight = { label: string; detail: string; background: string };

export type Practitioner = {
  slug: string; name: string; initials: string; role: string; lede: string; bio: string[]; expertise: string[];
  linkedin: string | null; photo: string | null; highlight?: PractitionerHighlight;
};

export type Resource = {
  id: string; title: string; description: string; category: string; date: string; download: CmsDownload;
  cover?: { src: string; width: number; height: number };
};
