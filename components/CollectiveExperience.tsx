import { getImageProps } from "next/image";
import { clientLogos, logoDisclaimer } from "@/lib/content";
import styles from "./CollectiveExperience.module.css";

// Keep the shared roster intact; this static wall is alphabetised for scanning.
const organisations = [...clientLogos].sort((a, b) => a.name.localeCompare(b.name, "en"));

export function CollectiveExperience() {
  return (
    <section
      id="collective-experience"
      className={`logo-band ${styles.section}`}
      aria-labelledby="collective-experience-title"
      aria-describedby="collective-experience-note"
    >
      <div className="shell">
        <div className={styles.introduction}>
          <h2 id="collective-experience-title">Our collective<br />{" "}experience.</h2>
          <p>
            Organisations that WOY and its practitioners have supported through
            direct assignments and engagements delivered with partner and
            affiliate platforms.
          </p>
        </div>

        <ul className={styles.logos} role="list" aria-label="Organisations supported by WOY and its practitioners">
          {organisations.map((logo) => {
            const { props } = getImageProps({
              src: logo.file,
              alt: `${logo.name} logo`,
              width: logo.w,
              height: logo.h,
              sizes: "(max-width: 599px) 132px, (max-width: 899px) 140px, (max-width: 1199px) 156px, 144px",
              loading: "lazy",
              decoding: "async",
            });
            return (
              <li key={logo.name}>
                {/* Server-generated responsive sources preserve the supplied brand artwork. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img {...props} alt={props.alt} />
              </li>
            );
          })}
        </ul>

        <p id="collective-experience-note" className={styles.note}>
          {logoDisclaimer} Logos reflect our collective experience and do not
          identify the organisations in the anonymised case studies above.
        </p>
      </div>
    </section>
  );
}
