import { ArrowUpRight, CaretDown } from "@phosphor-icons/react/dist/ssr";
import { site } from "@/lib/content";
import styles from "./DunsRegistration.module.css";

export function DunsRegistration() {
  return (
    <section id="duns-registration" className={styles.registration} aria-labelledby="duns-title">
      <div className={styles.sealFrame} aria-hidden="true">
        {/* Preserve the supplied seal pixels; CSS frames the original reference. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={site.duns.referenceImage} width="536" height="527" loading="lazy" decoding="async" alt="" className={styles.sealImage} />
      </div>
      <div className={styles.identity}>
        <h3 id="duns-title">D-U-N-S® Registered™</h3>
        <a href={site.duns.profileUrl} target="_blank" rel="noopener noreferrer" className={styles.profileLink}>
          View our D&amp;B profile <ArrowUpRight size={16} aria-hidden="true" />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
      <details className={styles.qr}>
        <summary>
          <span className={styles.whenClosed}>Show QR code</span>
          <span className={styles.whenOpen}>Hide QR code</span>
          <CaretDown size={16} aria-hidden="true" />
        </summary>
        <figure className={styles.qrContent}>
          <div className={styles.qrFrame}>
            {/* Lossless source and its full quiet zone keep the supplied QR scannable. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={site.duns.referenceImage} width="536" height="527" loading="lazy" decoding="async" alt="QR code for WOY Consulting’s D&B registration profile" className={styles.qrImage} />
          </div>
          <figcaption>Scan to view our D&amp;B profile.</figcaption>
        </figure>
      </details>
    </section>
  );
}
