import type { RawAttachment, RawFile } from "./raw";
import type { CmsDownload } from "./types";

const CDN_ASSET = /^https:\/\/cdn\.sanity\.io\/(images|files)\/[a-z0-9]+\/[a-z0-9][a-z0-9_-]*\/([A-Za-z0-9_-]+(?:\.[A-Za-z0-9]+)?)$/;

/** Same-origin path served by the /cms-assets rewrite in next.config.mjs (this project and dataset only). */
export function cmsAssetPath(url: string): string {
  const match = CDN_ASSET.exec(url);
  if (!match) throw new Error(`Unexpected Sanity asset URL: ${url}`);
  return `/cms-assets/${match[1]}/${match[2]}`;
}

/** Sanity hotspots store fractions; CSS object-position uses percentages. */
export function hotspotFromObjectPosition(position: string): { x: number; y: number } {
  const match = /^(\d+(?:\.\d+)?)% (\d+(?:\.\d+)?)%$/.exec(position.trim());
  if (!match) throw new Error(`Unsupported object-position: ${position}`);
  return { x: Number(match[1]) / 100, y: Number(match[2]) / 100 };
}

const percent = (fraction: number) => `${Math.round(fraction * 1_000_000) / 10_000}%`;

export function objectPositionFromHotspot(hotspot?: { x: number; y: number } | null): string {
  return hotspot ? `${percent(hotspot.x)} ${percent(hotspot.y)}` : "50% 50%";
}

export function toFileDownload(file: NonNullable<RawFile>, label: string): CmsDownload {
  const extension = (file.extension ?? "").toLowerCase();
  const fileName = file.originalFilename?.trim() || "document";
  return {
    href: `${cmsAssetPath(file.url)}?dl=${encodeURIComponent(fileName)}`,
    label,
    fileName,
    extension: /^[a-z0-9]{1,8}$/.test(extension) ? extension : "file",
    size: Math.max(0, file.size ?? 0),
  };
}

export function toDownload(attachment: RawAttachment | undefined, fallbackLabel: string): CmsDownload | undefined {
  if (!attachment?.file?.url) return undefined;
  return toFileDownload(attachment.file, attachment.label?.trim() || fallbackLabel);
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
