import { cmsAssetPath, objectPositionFromHotspot, toDownload } from "./assets";
import type { RawPerson } from "./raw";
import type { PersonListing, PersonProfile, Practitioner } from "./types";

const DEFAULT_LABEL = "Download profile";
const list = (value?: string[] | null) => (value ?? []).filter((item) => typeof item === "string" && item.trim() !== "");
const either = (value: string | null | undefined, fallback: string) => (value?.trim() ? value : fallback);

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return `${first}${last}`.toUpperCase();
}

export function toProfile(raw: RawPerson): PersonProfile {
  const download = toDownload(raw.document, DEFAULT_LABEL);
  return {
    slug: raw.slug, name: raw.name, role: raw.role, portrait: raw.portrait.url,
    imagePosition: objectPositionFromHotspot(raw.portrait.hotspot),
    introduction: raw.introduction, biography: list(raw.biography), experience: list(raw.experience),
    ...(download ? { download } : {}),
  };
}

export function toListing(raw: RawPerson): PersonListing {
  return {
    slug: raw.slug, name: raw.name, role: raw.role, category: raw.group === "partner" ? "partner" : "leadership",
    focus: raw.focus, image: cmsAssetPath(raw.portrait.url),
  };
}

export function toPractitioner(raw: RawPerson): Practitioner {
  const olderBio = list(raw.olderBio);
  const highlight = raw.highlightLabel?.trim() && raw.highlightDetail?.trim() && raw.highlightBackground?.trim()
    ? { label: raw.highlightLabel, detail: raw.highlightDetail, background: raw.highlightBackground }
    : undefined;
  return {
    slug: raw.slug, name: raw.name, initials: initials(raw.name), role: either(raw.olderRole, raw.role),
    lede: either(raw.lede, raw.introduction), bio: olderBio.length ? olderBio : list(raw.biography),
    expertise: list(raw.expertise), linkedin: raw.linkedin?.trim() || null,
    photo: raw.olderPhoto?.url ?? raw.portrait.url,
    ...(highlight ? { highlight } : {}),
  };
}
