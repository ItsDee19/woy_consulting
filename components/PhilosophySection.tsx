import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { symbols } from "@/lib/content";
import { MARK, SOURCE_SYMBOLS } from "./mark-geometry";
import styles from "./PhilosophySection.module.css";

type SymbolKey = (typeof symbols)[number]["key"];

/** The three source symbols, distinct from the combined logo they inspire. */
function PhilosophySymbol({ part }: { part: SymbolKey }) {
  return (
    <svg viewBox="120 34 120 120" fill="none" aria-hidden="true" focusable="false" className={styles.symbol}>
      {part === "ring" && <circle cx={MARK.cx} cy={MARK.cy} r={MARK.r} stroke="currentColor" strokeWidth={MARK.ringStroke} />}
      {part === "star" && <path d={SOURCE_SYMBOLS.starOutline} stroke="currentColor" strokeWidth="3.1" strokeLinejoin="round" />}
      {part === "needle" && (
        <g stroke="currentColor">
          <circle cx={MARK.cx} cy={MARK.cy} r="34" strokeWidth="1.25" />
          <circle cx={MARK.cx} cy={MARK.cy} r="40" strokeWidth=".7" />
          {Array.from({ length: 32 }, (_, index) => (
            <path key={index} d={`M180 ${index % 4 === 0 ? 53 : 55}v${index % 4 === 0 ? 5 : 2.5}`} transform={`rotate(${index * 11.25} 180 94)`} strokeWidth={index % 4 === 0 ? 1 : .7} />
          ))}
          <path d={SOURCE_SYMBOLS.compassPoints} strokeWidth="1" />
          <path d="M180 63v62M149 94h62M160.2 74.2l39.6 39.6m-39.6 0 39.6-39.6" strokeWidth=".7" />
          <path d="M180 63v31l5-12Z M211 94h-31l12 5Z M180 125V94l-5 12Z M149 94h31l-12-5Z" fill="currentColor" stroke="none" />
          <circle cx={MARK.cx} cy={MARK.cy} r="2.5" fill="var(--c-raised)" strokeWidth=".8" />
          <g fill="currentColor" stroke="none" textAnchor="middle" fontSize="8">
            <text x="180" y="45">N</text><text x="230" y="97">E</text><text x="180" y="149">S</text><text x="130" y="97">W</text>
          </g>
        </g>
      )}
    </svg>
  );
}

export function PhilosophySection() {
  return (
    <section id="philosophy" className={styles.section} aria-labelledby="home-philosophy-title">
      <div className="shell">
        <div className={styles.headingRow}>
          <div>
            <p className={styles.eyebrow}>The philosophy behind our work</p>
            <h2 id="home-philosophy-title">Win Over <em>Yourself.</em></h2>
          </div>
          <p className={styles.intro}>
            Lasting business performance begins with how leaders think, act and grow.
            Our guiding principle, “Win Over Yourself”, comes to life in three symbols:
            a shared vision for growth, the pursuit of excellence and the agility to adapt.
          </p>
        </div>
        <ul className={styles.principles}>
          {symbols.map(symbol => (
            <li key={symbol.key} className={styles.principle}>
              <div className={styles.symbolRow}>
                <PhilosophySymbol part={symbol.key} />
                <p className={styles.symbolName}>{symbol.name}</p>
              </div>
              <h3>{symbol.lede}</h3>
              <p className={styles.body}>{symbol.body}</p>
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
