import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { caseStudies } from "@/lib/content";
import styles from "./SelectedCaseStudies.module.css";

const featured = caseStudies.find((study) => study.slug === "education-institution-transformation")!;
const selected = ["insurance-senior-sales-leadership", "automotive-leadership-assimilation"].map((slug) => caseStudies.find((study) => study.slug === slug)!);

export function SelectedCaseStudies() {
  return (
    <section className={`shell ${styles.section}`} aria-labelledby="selected-work-title">
      <div className={styles.heading}>
        <div><p className={styles.eyebrow}>Selected engagements</p><h2 id="selected-work-title">Progress, in practice.</h2></div>
        <Link href="/case-studies" className={styles.allCases}>Explore all case studies <ArrowRight size={17} aria-hidden="true" /></Link>
      </div>
      <div className={styles.work}>
        <Link href={`/case-studies/${featured.slug}`} className={styles.featured}>
          <p className={styles.industry}>{featured.industry}</p>
          <h3>One institution.<br />A shared direction.</h3>
          <p className={styles.featuredSummary}>Strategy, governance and culture connected around one growth agenda.</p>
          <span className={styles.read}>Read the engagement <ArrowRight size={18} aria-hidden="true" /></span>
        </Link>
        <div className={styles.otherCases}>
          {selected.map((study) => (
            <Link href={`/case-studies/${study.slug}`} key={study.slug} className={styles.case}>
              <div><p className={styles.eyebrow}>{study.industry}</p><h3>{study.title}</h3><p className={styles.summary}>{study.headline}</p></div>
              <ArrowRight size={20} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
