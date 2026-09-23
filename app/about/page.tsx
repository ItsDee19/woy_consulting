import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { StructuredData } from "@/components/StructuredData";
import { contentPageGraph, schemaId } from "@/lib/structured-data";
import { pageMetadata } from "@/lib/metadata";
import { Reveal } from "@/components/Reveal";
import { MARK, SOURCE_SYMBOLS } from "@/components/mark-geometry";
import { site, symbols } from "@/lib/content";
import styles from "./about.module.css";

export const metadata = pageMetadata(
  "About Our Practitioner-led Firm",
  "Meet WOY Consulting, a boutique advisory founded in 2015. Former CEOs and CXOs help organisations strengthen leadership, people, culture and execution.",
  "/about"
);

type SymbolKey = (typeof symbols)[number]["key"];

// Expanded from the logo philosophy in the September 2026 introduction, page 4.
const principleDetails: Record<SymbolKey, string> = {
  ring: "Growth begins with self-awareness in leaders. The circle brings that personal perspective together with the wider organisation: connecting diverse viewpoints into a unified strategy, so leadership, teams and business priorities support sustainable growth and continuous innovation.",
  star: "The five-point star represents the pursuit of excellence across leadership and business. It is a commitment to setting benchmarks, building the capability to deliver exceptional value and sustaining a competitive advantage through the quality of everyday decisions and execution.",
  needle: "The compass represents direction in changing conditions. It calls on leaders and organisations to navigate uncertainty with clarity and resilience, respond proactively to market shifts and keep evolving so the business remains relevant, adaptable and competitive.",
};

const differences = [
  {
    title: "Experience in the room",
    body: "Former CEOs, CXOs and business leaders bring first-hand understanding of targets, talent, trade-offs and execution.",
  },
  {
    title: "Built around your reality",
    body: "We adapt proven frameworks to your context, ambition and constraints. The work is designed to be used.",
  },
  {
    title: "Senior partners, throughout",
    body: "The leaders you meet stay involved through delivery, combining enterprise rigour with boutique agility.",
  },
  {
    title: "Change your teams can sustain",
    body: "We leave behind stronger capability, clear ownership and practical rhythms that support lasting progress.",
  },
];

function PhilosophySymbol({ part }: { part?: SymbolKey }) {
  return (
    <svg viewBox="120 34 120 120" fill="none" aria-hidden="true" focusable="false">
      {(!part || part === "ring") && (
        <circle cx={MARK.cx} cy={MARK.cy} r={MARK.r} stroke="currentColor" strokeWidth={MARK.ringStroke} />
      )}
      {!part && (
        <>
          <g stroke="currentColor" strokeWidth={MARK.spokeStroke}>
            {MARK.spokes.map((path) => <path key={path} d={path} />)}
          </g>
          <path d={MARK.needle} fill="currentColor" />
        </>
      )}
      {part === "star" && <path d={SOURCE_SYMBOLS.starOutline} stroke="currentColor" strokeWidth="3.1" strokeLinejoin="round" />}
      {part === "needle" && (
        <g stroke="currentColor">
          <circle cx={MARK.cx} cy={MARK.cy} r="40" strokeWidth="1" />
          <circle cx={MARK.cx} cy={MARK.cy} r="34" strokeWidth="1.25" />
          <path d={SOURCE_SYMBOLS.compassPoints} strokeWidth="1.5" />
          <path d="M180 50v88M136 94h88" strokeWidth="1" />
          <path d="M180 63v31l5-12Z M211 94h-31l12 5Z M180 125V94l-5 12Z M149 94h31l-12-5Z" fill="currentColor" stroke="none" />
        </g>
      )}
    </svg>
  );
}

export default function AboutPage() {
  return (
    <>
      <StructuredData id="about-structured-data" nodes={contentPageGraph({
        path: "/about", name: "About WOY Consulting", description: metadata.description ?? "",
        type: "AboutPage", mainEntity: { "@id": schemaId("/", "organization") },
      })} />

      <section className={styles.intro} aria-labelledby="about-title">
        <div className="shell">
          <p className={styles.eyebrow}>About WOY Consulting</p>
          <div className={styles.introGrid}>
            <h1 id="about-title" className={styles.title}>
              Experience,<br /><span>on your side.</span>
            </h1>
            <div className={styles.introCopy}>
              <p className={styles.lede}>
                We have led businesses, built teams and navigated change.
                Today, we bring that experience to your next chapter.
              </p>
              <p className={styles.description}>
                A boutique, practitioner-led firm helping organisations strengthen
                leadership, people, culture and execution since {site.established}.
              </p>
              <Link href="/practitioners" className={styles.textLink}>
                Meet our practitioners <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>
          <dl className={styles.facts}>
            <div><dt>Established</dt><dd>{site.established}</dd></div>
            <div><dt>Former CEOs, CXOs<br />&amp; business leaders</dt><dd>10<span>+</span></dd></div>
            <div><dt>Coaches in our<br />wider consortium</dt><dd>25<span>+</span></dd></div>
            <div><dt>From the first conversation<br />through delivery</dt><dd className={styles.wordFact}>Partner-led</dd></div>
          </dl>
        </div>
      </section>

      <section id="philosophy" className={styles.philosophy} aria-labelledby="philosophy-title">
        <div className={`shell ${styles.philosophyGrid}`}>
          <Reveal className={styles.philosophyIdentity}>
            <p className={styles.eyebrow}>Our philosophy, in our name and mark</p>
            <h2 id="philosophy-title">Win Over<br /><span>Yourself.</span></h2>
            <p className={styles.philosophyIntro}>
              WOY stands for Win Over Yourself. Our guiding principle connects
              personal growth with organisational progress: greater self-awareness,
              a commitment to excellence and the ability to adapt.
            </p>
            <div className={styles.philosophySignature}>
              <div className={styles.brandSymbol}><PhilosophySymbol /></div>
              <p>Three symbols become one mark. Together, they express how leaders
                and organisations can grow, excel and navigate change.</p>
            </div>
            <Link href="/approach" className={`${styles.textLink} ${styles.philosophyLink}`}>
              How this shapes our 4D approach <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </Reveal>
          <Reveal delay={0.08}>
            <ul className={styles.principles}>
              {symbols.map((symbol) => (
                <li key={symbol.key}>
                  <div className={styles.partSymbol}><PhilosophySymbol part={symbol.key} /></div>
                  <div>
                    <p className={styles.symbolLabel}>{symbol.name}</p>
                    <h3>{symbol.lede}</h3>
                    <p className={styles.principleBody}>{principleDetails[symbol.key]}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className={styles.partnership} aria-labelledby="partnership-title">
        <div className={`shell ${styles.partnershipGrid}`}>
          <Reveal>
            <p className={styles.eyebrow}>The WOY difference</p>
            <h2 id="partnership-title" className={styles.sectionTitle}>A partner<br />in the work.</h2>
            <p className={styles.partnershipLede}>
              Clear choices. Stronger leadership.<br />Progress that carries forward.
            </p>
          </Reveal>
          <div className={styles.differences}>
            {differences.map((difference, i) => (
              <Reveal key={difference.title} delay={i * 0.04}>
                <div className={styles.difference}>
                  <h3>{difference.title}</h3>
                  <p>{difference.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

    </>
  );
}
