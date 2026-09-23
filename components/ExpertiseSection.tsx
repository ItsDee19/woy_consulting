import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { expertiseAreas } from "@/lib/content";
import { ExpertiseAccordion } from "./ExpertiseAccordion";
import styles from "./ExpertiseSection.module.css";

export function ExpertiseSection() {
  return (
    <section id="expertise" className={`recreation ${styles.section}`} aria-labelledby="expertise-title">
      <div className={styles.layout}>
        <div className={styles.introduction}>
          <p className={styles.eyebrow}>Where we make a difference</p>
          <h2 id="expertise-title"><span>Business ambition.</span><em>Human possibility.</em></h2>
          <p className={styles.intro}>
            Strategy, leadership, culture and people systems work best together.
            We connect them around the priorities that matter to your business.
          </p>
          <Link href="/expertise" className={styles.link}>
            Our expertise <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
        <ExpertiseAccordion areas={expertiseAreas} />
      </div>
    </section>
  );
}
