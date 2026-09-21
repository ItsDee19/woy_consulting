import { Plus, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { capabilitiesByPillar, pillars, type Pillar } from "@/lib/content";
import { ExpertiseAnchors } from "./ExpertiseAnchors";
import styles from "./ExpertiseSection.module.css";

const delivery: { key: Pillar; outcome: string }[] = [
  { key: "empowering", outcome: "Leaders with the clarity, judgement and influence to move the business forward." },
  { key: "transforming", outcome: "People, culture and HR systems aligned with the organisation’s ambitions." },
  { key: "accelerating", outcome: "A focused strategy, stronger sales capability and the structure to execute." },
];

export function ExpertiseSection() {
  return (
    <section id="expertise" className={styles.section} aria-labelledby="expertise-title">
      <ExpertiseAnchors />
      <div className="shell">
        <div className={styles.headingRow}>
          <div>
            <p className={styles.eyebrow}>Our expertise</p>
            <h2 id="expertise-title">What we deliver.</h2>
          </div>
          <p className={styles.intro}>Six capabilities. Three business priorities.<br />Shaped around the change you need to make.</p>
        </div>
        <div className={styles.pillars}>
          {delivery.map(({ key, outcome }) => (
            <article key={key} className={styles.pillar}>
              <h3>{pillars[key].title}</h3>
              <p className={styles.outcome}>{outcome}</p>
              <div className={styles.capabilities}>
                {capabilitiesByPillar(key).map(capability => (
                  <details key={capability.slug} id={capability.slug} name="woy-capability" className={styles.capability}>
                    <summary><h4>{capability.title}</h4><Plus size={18} aria-hidden /></summary>
                    <div className={styles.detail}>
                      <p>{capability.summary}</p>
                      <ul>{capability.detail.map(area => <li key={area.heading}>{area.heading}</li>)}</ul>
                    </div>
                  </details>
                ))}
              </div>
            </article>
          ))}
        </div>
        <div className={styles.footnote}>
          <p>Senior practitioners. Bespoke design. Support through implementation.</p>
          <Link href="/case-studies">See the work in practice <ArrowUpRight size={18} aria-hidden /></Link>
        </div>
      </div>
    </section>
  );
}
