import { StructuredData } from "@/components/StructuredData";
import { caseStudyListSchema, contentPageGraph, schemaId } from "@/lib/structured-data";
import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { caseStudies } from "@/lib/content";
import styles from "./case-study-index.module.css";

export const metadata = pageMetadata(
  "Leadership & Transformation Case Studies",
  "Explore WOY case studies in insurance, education, IT, financial services, automotive and medical technology, with client confidentiality protected.",
  "/case-studies"
);

const featured = caseStudies.find((study) => study.slug === "education-institution-transformation")!;
const otherStudies = caseStudies.filter((study) => study.slug !== featured.slug);

export default function CaseStudiesPage() {
  return (
    <>
      <StructuredData id="case-studies-structured-data" nodes={[
        ...contentPageGraph({
          path: "/case-studies", name: "Case Studies", description: metadata.description ?? "",
          type: "CollectionPage", mainEntity: { "@id": schemaId("/case-studies", "case-studies") },
        }),
        caseStudyListSchema(),
      ]} />

      <header className={`shell ${styles.hero}`}>
        <div>
          <p className={styles.eyebrow}>Case studies</p>
          <h1>The work behind<br /><em>meaningful change.</em></h1>
        </div>
        <div className={styles.introduction}>
          <p>From leadership capability to organisation-wide change, every engagement starts with a different reality. These are some of the ways we have helped leaders move forward.</p>
          <a href="#engagements" className={styles.browseLink}>Explore the engagements <ArrowDown size={17} aria-hidden="true" /></a>
        </div>
      </header>

      <section id="engagements" className={`shell ${styles.engagements}`} aria-label="Selected engagements">
        <article className={styles.featured} aria-labelledby="featured-case-title">
          <div className={styles.featuredBrief}>
            <p className={styles.featuredLabel}><span>Featured engagement</span><span>{featured.industry}</span></p>
            <h2 id="featured-case-title">A shared direction<br />for a complex institution.</h2>
            <p className={styles.featuredContext}>{featured.context}</p>
            <Link href={`/case-studies/${featured.slug}`} className={styles.featuredLink}>
              Read the education case study <ArrowUpRight size={19} aria-hidden="true" />
            </Link>
          </div>
          <div className={styles.featuredOutcome}>
            <p className={styles.outcomeLabel}>What changed</p>
            <p className={styles.outcomeStatement}>{featured.outcomes[0]}.</p>
            <p className={styles.outcomeDetail}>{featured.outcomes[1]}.</p>
          </div>
        </article>

        <div className={styles.collectionHeader}>
          <h2>Different contexts.<br /><em>The same depth of commitment.</em></h2>
          <p>Explore leadership, capability and organisational change across sectors.</p>
        </div>

        <ul className={styles.collection} aria-label="More case studies">
          {otherStudies.map((study) => (
            <li key={study.slug}>
              <article className={styles.case}>
                <Link href={`/case-studies/${study.slug}`} className={styles.caseLink}>
                  <div className={styles.caseTopline}>
                    <p className={styles.industry}>{study.industry}</p>
                    <span className={styles.caseArrow}><ArrowUpRight size={21} aria-hidden="true" /></span>
                  </div>
                  <h3>{study.title}</h3>
                  <p className={styles.caseHeadline}>{study.headline}</p>
                  <div className={styles.caseResult}>
                    <span>Observed change</span>
                    <p>{study.outcomes[0]}.</p>
                  </div>
                  <span className={styles.readCase}>Read the case study <ArrowUpRight size={16} aria-hidden="true" /></span>
                </Link>
              </article>
            </li>
          ))}
        </ul>
        <aside className={styles.confidentiality} aria-label="Client confidentiality">
          <p>Real work. Respected confidences.</p>
          <p>Client names are withheld under confidentiality agreements. The contexts, work and observed outcomes are drawn from WOY engagements.</p>
        </aside>
      </section>
    </>
  );
}
