import { toFileDownload } from "./assets";
import type { RawResource } from "./raw";
import type { Resource } from "./types";

export function toResource(raw: RawResource): Resource | null {
  if (!raw.file?.url) return null;
  return {
    id: raw.id, title: raw.title, description: raw.description?.trim() ?? "", category: raw.category?.trim() || "Other",
    date: raw.date, download: toFileDownload(raw.file, "Download"),
    ...(raw.cover?.url ? { cover: { src: raw.cover.url, width: raw.cover.width, height: raw.cover.height } } : {}),
  };
}
