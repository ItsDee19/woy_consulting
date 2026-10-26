import { CaseCard, TextLink } from "@/components/recreation/Site";
import { getEngagements } from "@/lib/cms/content";
import { selectFeatured } from "@/lib/cms/map-case-studies";
import styles from "./SelectedWorkSection.module.css";

const numberWords = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];

export async function SelectedWorkSection() {
  const engagements = await getEngagements();
  const selectedCases = selectFeatured(engagements);
  const industryCount = new Set(engagements.map((item) => item.industry)).size;
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
          <p>{`Explore engagements across ${numberWords[industryCount] ?? industryCount} ${industryCount === 1 ? "industry" : "industries"}.`}</p>
          <TextLink href="/work">View all selected work</TextLink>
        </div>
      </div>
    </section>
  );
}
