import Image from "next/image";
import Link from "next/link";
import { DownloadButton } from "@/components/DownloadButton";
import type { Resource } from "@/lib/cms/types";
import styles from "./resources.module.css";

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export function ResourceList({ resources }: { resources: Resource[] }) {
  if (resources.length === 0) {
    return (
      <div className={styles.empty}>
        <p className="muted">
          New resources are on their way. In the meantime, <Link href="/contact">start a conversation</Link> and we’ll share what is relevant to you.
        </p>
      </div>
    );
  }
  return (
    <ul className={styles.list} role="list">
      {resources.map((resource) => (
        <li key={resource.id} className={`${styles.item} ${resource.cover ? styles.withCover : ""}`}>
          {resource.cover && (
            <Image src={resource.cover.src} alt="" width={resource.cover.width} height={resource.cover.height}
              sizes="(max-width: 700px) 88vw, 240px" className={styles.cover} />
          )}
          <div className={styles.body}>
            <p className="eyebrow red">
              {resource.category} · <time dateTime={resource.date}>{dateFormat.format(new Date(`${resource.date}T00:00:00Z`))}</time>
            </p>
            <h2 className={styles.title}>{resource.title}</h2>
            {resource.description && <p className="muted">{resource.description}</p>}
            <DownloadButton download={resource.download} />
          </div>
        </li>
      ))}
    </ul>
  );
}
