import type { Metadata } from "next";
import { site } from "@/lib/content";

export const socialImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "WOY Consulting. Win Over Yourself. Practitioner-led leadership advisory.",
};

/** Keep every page's search result and social preview in sync. */
export function pageMetadata(title: string, description: string, path: string): Metadata {
  const socialTitle = `${title} | ${site.name}`;
  return {
    title: { absolute: socialTitle },
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName: site.name,
      title: socialTitle,
      description,
      url: path,
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [socialImage],
    },
  };
}
