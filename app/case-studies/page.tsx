import { StructuredData } from "@/components/StructuredData";
import { caseStudyListSchema, contentPageGraph, schemaId } from "@/lib/structured-data";
import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { caseStudies } from "@/lib/content";
import styles from "./case-studies.module.css";

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
      <header className={`shell ${styles.indexHero}`}>
        <div>
          <p className={styles.eyebrow}>Case studies</p>
          <h1>Leadership challenges.<br /><span>Meaningful change.</span></h1>
        </div>
        <p className={styles.heroIntro}>Different sectors. Different starting points. A closer look at how we help leaders turn ambition into changes their organisations can sustain.</p>
      </header>

      <section className={`shell ${styles.featuredSection}`} aria-labelledby="featured-case-title">
        <div className={styles.featured}>
          <div className={styles.featuredCopy}>
            <p className={styles.navyEyebrow}>Featured engagement · {featured.industry}</p>
            <h2 id="featured-case-title">One institution.<br />A shared direction.</h2>
            <p className={styles.featuredIntro}>{featured.headline}</p>
            <p className={styles.featuredDescription}>Connecting strategy, governance and culture so academic and support teams could work to one growth agenda.</p>
            <Link href={`/case-studies/${featured.slug}`} className={styles.navyLink}>
              Explore the engagement <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <div className={styles.roadmap}>
            <p className={styles.roadmapLabel}>From ambition to operating discipline</p>
            <ol className={styles.horizons} aria-label="Connected planning horizons">
              <li><span className={styles.horizonNumber}>5<span>yr</span></span><span>Long-term direction</span></li>
              <li><span className={styles.horizonNumber}>3<span>yr</span></span><span>Strategic priorities</span></li>
              <li><span className={styles.horizonNumber}>1<span>yr</span></span><span>Execution roadmap</span></li>
            </ol>
            <p className={styles.roadmapConnection}>One connected institutional agenda</p>
            <ul className={styles.workstreams} aria-label="Supporting systems">
              <li><strong>Governance</strong><span>Decision rights &amp; service commitments</span></li>
              <li><strong>Culture</strong><span>Values translated into behaviours</span></li>
              <li><strong>People</strong><span>Goals, reviews &amp; accountability</span></li>
            </ul>
          </div>
        </div>
      </section>

      <section className={`shell ${styles.collection}`} aria-labelledby="more-cases-title">
        <div className={styles.collectionHeading}>
          <h2 id="more-cases-title">More work. Different contexts.</h2>
          <span>{otherStudies.length} engagements</span>
        </div>
        <ul className={styles.caseList}>
          {otherStudies.map((study) => (
            <li key={study.slug}>
              <Link href={`/case-studies/${study.slug}`} className={styles.caseRow}>
                <p className={styles.caseIndustry}>{study.industry}</p>
                <div className={styles.caseSubject}>
                  <h3>{study.title}</h3>
                  <p>{study.headline}</p>
                </div>
                <div className={styles.caseOutcome}>
                  <span>What changed</span>
                  <p>{study.outcomes[0]}</p>
                  <span className={styles.readCase}>Read the case <ArrowRight size={17} aria-hidden="true" /></span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <p className={styles.confidentiality}>Client names are withheld under confidentiality agreements. The contexts, work and observed outcomes are drawn from WOY engagements.</p>
      </section>
    </>
  );
}
