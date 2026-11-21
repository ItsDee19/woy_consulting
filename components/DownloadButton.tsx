import { ArrowDown } from "lucide-react";
import { formatFileSize } from "@/lib/cms/assets";
import type { CmsDownload } from "@/lib/cms/types";

/** Same-origin (via the /cms-assets rewrite), so the browser honours the download file name. */
export function DownloadButton({ download, className = "text-link" }: { download: CmsDownload; className?: string }) {
  const details = [download.extension === "file" ? "" : download.extension.toUpperCase(), formatFileSize(download.size)].filter(Boolean).join(", ");
  return (
    <a className={className} href={download.href} download={download.fileName}>
      <span>{download.label}{details && <span className="download-details"> ({details})</span>}</span>
      <ArrowDown size={17} aria-hidden="true" />
    </a>
  );
}
