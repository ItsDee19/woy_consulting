import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { brandPhilosophy, philosophyIntroduction, philosophyLogoIntroduction } from "@/lib/recreation-philosophy";
import styles from "./PhilosophySection.module.css";

export function PhilosophySection() {
  return (
    <section id="our-philosophy" className={styles.section} aria-labelledby="philosophy-heading">
      <div className={styles.layout}>
        <div className={styles.headingRow}>
          <div>
            <p className={styles.eyebrow}>The philosophy behind our work</p>
            <h2 id="philosophy-heading">Win Over Yourself.</h2>
          </div>
          <div className={styles.intro}>
            <p>{philosophyIntroduction}</p>
            <p>{philosophyLogoIntroduction}</p>
          </div>
        </div>
        <div className={styles.principles}>
          {brandPhilosophy.map(symbol => (
            <article key={symbol.id} className={styles.principle}>
              <div className={styles.symbolRow}>
                <span className={styles.symbolWindow} aria-hidden="true">
                  <span className={`${styles.symbol} ${styles[symbol.id]}`} />
                </span>
                <p className={styles.symbolName}>{symbol.symbol}</p>
              </div>
              <h3>{symbol.meaning}</h3>
              <p className={styles.body}>{symbol.business}</p>
            </article>
          ))}
        </div>
        <div className={styles.next}>
          <Link href="/approach#our-philosophy" className={styles.link}>Explore our philosophy and approach <ArrowUpRight size={17} aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  );
}
