import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { brandPhilosophy, philosophyIntroduction, philosophyLogoIntroduction } from "@/lib/recreation-philosophy";
import styles from "./PhilosophySection.module.css";

const symbolOffsets = { circle: 344, star: 514, compass: 687 } as const;

/** Display the original source symbols without the slide's white paper. */
function PhilosophySymbol({ part }: { part: keyof typeof symbolOffsets }) {
  const maskId = `home-philosophy-${part}`;
  return (
    <svg viewBox="0 0 112 116" aria-hidden="true" focusable="false" className={styles.symbol}>
      <defs>
        <filter id={`${maskId}-ink`} colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 -3 0 0 3" />
        </filter>
        <mask id={maskId} x="0" y="0" width="112" height="116" maskUnits="userSpaceOnUse">
          <image href="/assets/woy-philosophy.png" x="-56" y={-symbolOffsets[part]} width="1758" height="853" filter={`url(#${maskId}-ink)`} />
        </mask>
      </defs>
      <rect width="112" height="116" fill="currentColor" mask={`url(#${maskId})`} />
    </svg>
  );
}

export function PhilosophySection() {
  return (
    <section id="philosophy" className={styles.section} aria-labelledby="home-philosophy-title">
      <div className={styles.layout}>
        <div className={styles.headingRow}>
          <div>
            <p className={styles.eyebrow}>The philosophy behind our work</p>
            <h2 id="home-philosophy-title">Win Over Yourself.</h2>
          </div>
          <div className={styles.intro}>
            <p>{philosophyIntroduction}</p>
            <p>{philosophyLogoIntroduction}</p>
          </div>
        </div>
        <ul className={styles.principles}>
          {brandPhilosophy.map(symbol => (
            <li key={symbol.id} className={styles.principle}>
              <div className={styles.symbolRow}>
                <PhilosophySymbol part={symbol.id} />
                <p className={styles.symbolName}>{symbol.symbol}</p>
              </div>
              <h3>{symbol.meaning}</h3>
              <p className={styles.body}>{symbol.business}</p>
            </li>
          ))}
        </ul>
        <div className={styles.next}>
          <Link href="/approach#our-philosophy" className={styles.link}>Explore our philosophy and approach <ArrowUpRight size={19} aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  );
}
