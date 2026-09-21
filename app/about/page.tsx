import Link from "next/link";
import { getImageProps } from "next/image";
import { ArrowRight, Plus } from "@phosphor-icons/react/dist/ssr";
import { StructuredData } from "@/components/StructuredData";
import { contentPageGraph, schemaId } from "@/lib/structured-data";
import { pageMetadata } from "@/lib/metadata";
import { CTASection } from "@/components/CTASection";
import { Reveal } from "@/components/Reveal";
import { ClientGrid } from "@/components/ClientLogos";
import { MARK } from "@/components/mark-geometry";
import { clientLogos, logoDisclaimer, site } from "@/lib/content";
import styles from "./about.module.css";

export const metadata = pageMetadata(
  "About Our Practitioner-led Firm",
  "Meet WOY Consulting, a boutique advisory founded in 2015. Former CEOs and CXOs help organisations strengthen leadership, people, culture and execution.",
  "/about"
);

const principles = [
  {
    key: "circle",
    name: "The circle",
    title: "Grow with a shared vision.",
    body: "Connect self-aware leadership with a unified direction for the organisation.",
  },
  {
    key: "star",
    name: "The five-point star",
    title: "Make excellence a habit.",
    body: "Build the capability to set benchmarks, deliver value and sustain your advantage.",
  },
  {
    key: "compass",
    name: "The compass",
    title: "Stay clear. Stay adaptable.",
    body: "Navigate uncertainty with the judgement, agility and resilience to keep moving.",
  },
] as const;

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

const featuredBrands = [
  "Reliance Industries", "Samsung", "Siemens Financial Services", "EY",
  "Maruti Suzuki", "Capgemini", "Dr. Reddy's", "GE HealthCare",
];

function PhilosophySymbol({ part }: { part?: "circle" | "star" | "compass" }) {
  return (
    <svg viewBox="136 39 88 100" fill="none" aria-hidden="true">
      {(!part || part === "circle" || part === "compass") && (
        <circle cx={MARK.cx} cy={MARK.cy} r={MARK.r} stroke="currentColor" strokeWidth={MARK.ringStroke} />
      )}
      {(!part || part === "star") && (
        <g stroke="currentColor" strokeWidth={MARK.spokeStroke}>
          {MARK.spokes.map((path) => <path key={path} d={path} />)}
        </g>
      )}
      {(!part || part === "compass") && <path d={MARK.needle} fill="currentColor" />}
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

      <section className={styles.philosophy} aria-labelledby="philosophy-title">
        <div className={`shell ${styles.philosophyGrid}`}>
          <Reveal className={styles.philosophyIdentity}>
            <p className={styles.eyebrow}>The idea behind our name</p>
            <h2 id="philosophy-title">Win Over<br /><span>Yourself.</span></h2>
            <div className={styles.philosophySignature}>
              <div className={styles.brandSymbol}><PhilosophySymbol /></div>
              <p>Meaningful transformation starts with the capacity to grow, excel and adapt.</p>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <ul className={styles.principles}>
              {principles.map((principle) => (
                <li key={principle.key}>
                  <div className={styles.partSymbol}><PhilosophySymbol part={principle.key} /></div>
                  <div>
                    <p className={styles.symbolLabel}>{principle.name}</p>
                    <h3>{principle.title}</h3>
                    <p className={styles.principleBody}>{principle.body}</p>
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

      <section className={`logo-band ${styles.clients}`} aria-labelledby="brands-title">
        <div className="shell">
          <div className={styles.clientsHeading}>
            <h2 id="brands-title">Experience across industries.</h2>
            <p>Selected brands supported by WOY</p>
          </div>
          <ul className={styles.featuredBrands}>
            {featuredBrands.map((name) => {
              const logo = clientLogos.find((item) => item.name === name)!;
              const { props } = getImageProps({
                src: logo.file, alt: `${logo.name} logo`, width: logo.w, height: logo.h,
                sizes: "(max-width: 639px) 120px, 170px", loading: "lazy",
              });
              return (
                <li key={logo.name}>
                  {/* Responsive optimisation without a client component for each logo. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img {...props} alt={props.alt} />
                </li>
              );
            })}
          </ul>
          <p className={styles.disclaimer}>{logoDisclaimer}</p>
          <details className={styles.allClients}>
            <summary>
              <span className={styles.whenClosed}>View full brand list</span>
              <span className={styles.whenOpen}>Close full brand list</span>
              <Plus size={18} aria-hidden="true" />
            </summary>
            <div className={styles.clientGrid}><ClientGrid /></div>
          </details>
        </div>
      </section>

      <CTASection
        title="Let's work on what comes next."
        body="Share the leadership or business challenge on your mind. Start a conversation with WOY."
      />
    </>
  );
}
