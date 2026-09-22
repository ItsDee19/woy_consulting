import { CaretDown, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { expertiseAreas } from "@/lib/content";
import { ExpertiseAnchors } from "./ExpertiseAnchors";
import styles from "./ExpertiseSection.module.css";

export function ExpertiseSection() {
  return (
    <section id="expertise" className={styles.section} aria-labelledby="expertise-title">
      <ExpertiseAnchors />
      <div className={`shell ${styles.layout}`}>
        <div className={styles.introduction}>
          <p className={styles.eyebrow}>Where we make a difference</p>
          <h2 id="expertise-title">Business ambition.<em>Human possibility.</em></h2>
          <p className={styles.intro}>
            Strategy, leadership, culture and people systems work best together.
            We connect them around the priorities that matter to your business.
          </p>
          <Link href="/case-studies" className={styles.link}>
            See our expertise in practice <ArrowUpRight size={19} aria-hidden />
          </Link>
        </div>
        <div className={styles.areas}>
          {expertiseAreas.map((area, index) => (
            <details key={area.slug} id={area.slug} name="woy-expertise" open={index === 0} className={styles.area}>
              <summary>
                <h3>{area.title}</h3>
                <span className={styles.indicator}><CaretDown size={18} aria-hidden /></span>
              </summary>
              {area.legacySlugs.map(slug => <span key={slug} id={slug} className={styles.legacyAnchor} aria-hidden="true" />)}
              <div className={styles.detail}>
                <p className={styles.description}>{area.summary}</p>
                <div className={styles.delivery}>
                  <p className={styles.deliveryLabel}>What we deliver</p>
                  <ul>{area.deliverables.map(item => <li key={item}>{item}</li>)}</ul>
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
