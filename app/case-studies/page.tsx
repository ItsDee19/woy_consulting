import { StructuredData } from "@/components/StructuredData";
import { caseStudyListSchema, contentPageGraph, schemaId } from "@/lib/structured-data";
import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { caseStudies } from "@/lib/content";
import { CollectiveExperience } from "@/components/CollectiveExperience";
import styles from "./case-study-index.module.css";

export const metadata = pageMetadata(
  "Leadership & Transformation Case Studies",
  "Explore WOY case studies in insurance, education, IT, financial services, automotive and medical technology, with client confidentiality protected.",
  "/case-studies"
);

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
          <div className={styles.heroLinks}>
            <a href="#engagements" className={styles.browseLink}>Explore the case studies <ArrowDown size={17} aria-hidden="true" /></a>
            <a href="#collective-experience" className={styles.experienceLink}>Our collective experience <ArrowDown size={16} aria-hidden="true" /></a>
          </div>
        </div>
      </header>

      <section id="engagements" className={`shell ${styles.engagements}`} aria-labelledby="engagements-title">
        <div className={styles.collectionHeader}>
          <h2 id="engagements-title">Selected engagements</h2>
          <p>{caseStudies.length} case studies across leadership, strategy and change</p>
        </div>
        <ul className={styles.collection} aria-label="Case studies">
          {caseStudies.map((study) => (
            <li key={study.slug}>
              <article className={styles.case} data-case-card>
                <Link href={`/case-studies/${study.slug}`} className={styles.caseLink} aria-labelledby={`case-${study.slug}`}>
                  <p className={styles.industry}>{study.industry}</p>
                  <h3 id={`case-${study.slug}`}>{study.title}</h3>
                  <dl className={styles.brief}>
                    <div>
                      <dt>The challenge</dt>
                      <dd>{study.context}</dd>
                    </div>
                    <div className={styles.result}>
                      <dt>What changed</dt>
                      <dd>{study.outcomes[0]}.</dd>
                    </div>
                  </dl>
                  <span className={styles.readCase}>Read the case study <span className={styles.caseArrow}><ArrowUpRight size={20} aria-hidden="true" /></span></span>
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

      <CollectiveExperience />
    </>
  );
}
