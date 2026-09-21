import { StructuredData } from "@/components/StructuredData";
import { caseStudySchema, contentPageGraph, schemaId } from "@/lib/structured-data";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { CTASection } from "@/components/CTASection";
import { caseStudies, caseStudyBySlug } from "@/lib/content";
import styles from "../case-studies.module.css";

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const study = caseStudyBySlug(slug);
  if (!study) notFound();
  return pageMetadata(study.title, `${study.industry} case study: ${study.headline}`, `/case-studies/${study.slug}`);
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = caseStudyBySlug(slug);
  if (!study) notFound();
  const index = caseStudies.findIndex((c) => c.slug === slug);
  const next = caseStudies[(index + 1) % caseStudies.length];

  return (
    <>
      <StructuredData id="case-study-structured-data" nodes={[
        ...contentPageGraph({
          path: `/case-studies/${study.slug}`, name: study.title, description: `${study.industry} case study: ${study.headline}`,
          mainEntity: { "@id": schemaId(`/case-studies/${study.slug}`, "case-study") },
        }, [{ name: "Case Studies", path: "/case-studies" }]),
        caseStudySchema(study),
      ]} />
      <header className={styles.detailHero}>
        <div className="shell">
          <Link href="/case-studies" className={styles.backLink}><ArrowLeft size={16} aria-hidden="true" /> All case studies</Link>
          <div className={styles.detailIntroduction}>
            <div>
              <p className={styles.eyebrow}>{study.industry} · Engagement brief</p>
              <h1>{study.title}</h1>
            </div>
            <p className={styles.detailHeadline}>{study.headline}</p>
          </div>
          <nav className={styles.chapterNav} aria-label="In this case study">
            <a href="#situation">The situation</a>
            <a href="#work">The work</a>
            <a href="#outcomes">What changed</a>
          </nav>
        </div>
      </header>

      <div className={`shell ${styles.narrative}`}>
        <section id="situation" className={styles.situation} aria-labelledby="situation-title">
          <h2 id="situation-title" className={styles.sectionLabel}>The situation</h2>
          <p>{study.context}</p>
        </section>
        <section id="work" className={styles.workSection} aria-labelledby="work-title">
          <div className={styles.workHeading}>
            <h2 id="work-title">The work</h2>
            <p>A tailored intervention, shaped around the organisation and its leaders.</p>
          </div>
          <div className={styles.workColumns}>
            <div className={styles.roleColumn}>
              <h3>WOY’s role</h3>
              <div className={styles.roleCopy}>{study.edge.map((item) => <p key={item}>{item}.</p>)}</div>
            </div>
            <div className={styles.frameworkColumn}>
              <h3>Engagement design</h3>
              <ul>{study.framework.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          </div>
        </section>
      </div>

      <section id="outcomes" className={styles.outcomesSection} aria-labelledby="outcomes-title">
        <div className={`shell ${styles.outcomesLayout}`}>
          <div>
            <p className={styles.navyEyebrow}>Observed outcomes</p>
            <h2 id="outcomes-title">What changed.</h2>
            <p className={styles.outcomesNote}>The shifts in thinking, capability and ways of working that emerged from the engagement.</p>
          </div>
          <ul className={styles.outcomeGrid}>{study.outcomes.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </section>

      <section className={`shell ${styles.nextSection}`} aria-labelledby="next-case-title">
        <Link href={`/case-studies/${next.slug}`} className={styles.nextCase}>
          <div><p className={styles.eyebrow}>Next engagement · {next.industry}</p><h2 id="next-case-title">{next.title}</h2></div>
          <ArrowRight size={30} aria-hidden="true" />
        </Link>
        <p className={styles.confidentiality}>Client identity is withheld under confidentiality agreements.</p>
      </section>
      <CTASection title="Let’s discuss your context." body="Bring the challenge you are working through. Our partners will help you explore a practical way forward." />
    </>
  );
}
