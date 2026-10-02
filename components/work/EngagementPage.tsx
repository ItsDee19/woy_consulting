import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { CaseCard, TextLink } from "@/components/recreation/Site";
import { cases, type CaseStudy } from "@/lib/recreation-content";
import styles from "./EngagementPage.module.css";

/** The listing and detail pages share the same engagement records and cards. */
export function EngagementPage({ engagement }: { engagement: CaseStudy }) {
  const related = cases.filter(item => item.slug !== engagement.slug).slice(0, 2);

  return (
    <div className={`recreation ${styles.page}`} data-engagement-detail={engagement.slug}>
      <section className={`${styles.container} ${styles.intro}`} aria-labelledby="engagement-title">
        <div className={styles.returnLink}><TextLink href="/work">All selected work</TextLink></div>
        <p className={styles.eyebrow}>{engagement.industry} / Engagement story</p>
        <h1 id="engagement-title" className={styles.title}>{engagement.title}</h1>
        <p className={styles.summary}>{engagement.summary}</p>
      </section>

      <div className={styles.container}>
        <div className={`${styles.cover} ${styles[engagement.theme]}`} data-engagement-cover>
          <p className={styles.eyebrow}>{engagement.industry}</p>
          <p className={styles.coverTitle}>{engagement.cover.split("\n").map((line, index) => (
            <span key={line}>{index > 0 && <br />}{line}</span>
          ))}</p>
          <p className={styles.strap}>{engagement.strap}</p>
        </div>
      </div>

      <div className={`${styles.container} ${styles.body}`}>
        <aside className={styles.focus} aria-labelledby="engagement-focus">
          <p className={styles.eyebrow} id="engagement-focus">Engagement focus</p>
          <ul className={styles.focusList} role="list">
            {engagement.focus.map(item => <li key={item}>{item}</li>)}
          </ul>
          <p className={styles.confidential}>Client identity kept confidential.</p>
        </aside>

        <div className={styles.chapters}>
          <section className={styles.chapter} aria-labelledby="engagement-context">
            <p className={styles.eyebrow}>01 / The context</p>
            <h2 id="engagement-context">A business priority.<br />A starting point.</h2>
            <p className={styles.context}>{engagement.context}</p>
          </section>

          <section className={styles.chapter} aria-labelledby="engagement-work">
            <p className={styles.eyebrow}>02 / The work</p>
            <h2 id="engagement-work">A response shaped<br />around the context.</h2>
            <ol className={styles.workstreams} role="list">
              {engagement.work.map((item, index) => (
                <li className={styles.workstream} key={item.title}>
                  <span className={styles.number} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className={`${styles.chapter} ${styles.results}`} aria-labelledby="engagement-contribution">
            <p className={styles.eyebrow}>03 / The contribution</p>
            <h2 id="engagement-contribution">{engagement.resultTitle}</h2>
            <ul>{engagement.results.map(item => <li key={item}>{item}</li>)}</ul>
          </section>
        </div>
      </div>

      <section className={styles.takeaway} aria-labelledby="engagement-perspective">
        <div className={styles.container}>
          <p className={styles.eyebrow}>The perspective</p>
          <h2 id="engagement-perspective">{engagement.takeaway}</h2>
          <Link className={styles.contact} href="/contact">
            Discuss a similar challenge<ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className={`${styles.container} ${styles.related}`} aria-labelledby="related-engagements">
        <div className={styles.relatedHeader}>
          <h2 id="related-engagements">More perspectives.<br />More possibilities.</h2>
          <TextLink href="/work">All selected work</TextLink>
        </div>
        <div className="case-grid">
          {related.map((item, index) => <CaseCard key={item.slug} item={item} index={index} />)}
        </div>
      </section>
    </div>
  );
}
