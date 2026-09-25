import { CaseCard, TextLink } from "@/components/recreation/Site";
import { cases } from "@/lib/recreation-content";
import styles from "./SelectedWorkSection.module.css";

const selectedCases = cases.filter((item) => item.featured).slice(0, 2);

export function SelectedWorkSection() {
  return (
    <section
      id="selected-work"
      className={`recreation ${styles.section}`}
      aria-labelledby="home-selected-work-heading"
    >
      <div className={`wrap section ${styles.container}`}>
        <div className={styles.headingRow}>
          <div>
            <p className={`eyebrow red ${styles.eyebrow}`}>Selected work</p>
            <h2 id="home-selected-work-heading">
              Different contexts.<br />Shared commitment.
            </h2>
          </div>
          <p className={styles.intro}>
            Practical work at the intersection of business strategy, leadership and organisational effectiveness.
          </p>
        </div>
        <div className="case-grid">
          {selectedCases.map((item, index) => (
            <article key={item.slug}>
              <CaseCard item={item} index={index} />
            </article>
          ))}
        </div>
        <div className={styles.footer}>
          <p>Explore engagements across six industries.</p>
          <TextLink href="/work">View all selected work</TextLink>
        </div>
      </div>
    </section>
  );
}
