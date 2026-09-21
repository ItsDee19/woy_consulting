import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Plus, LinkedinLogo } from "@phosphor-icons/react/dist/ssr";
import { StructuredData } from "@/components/StructuredData";
import { contentPageGraph, practitionerGraph, schemaId } from "@/lib/structured-data";
import { pageMetadata } from "@/lib/metadata";
import { CTASection } from "@/components/CTASection";
import { practitioners } from "@/lib/content";
import styles from "./practitioners.module.css";

export const metadata = pageMetadata(
  "Leadership Advisors & Practitioners",
  "Meet Vipin Tuteja, Sandeep Bidani and Kannan Swaminathan, WOY practitioners in leadership, culture, strategy and executive coaching.",
  "/practitioners"
);

const experience: Record<string, { label: string; detail: string; background: string }> = {
  "vipin-tuteja": {
    label: "35+ years",
    detail: "of business leadership",
    background: "Xerox · American Express · Ricoh · Samsung",
  },
  "sandeep-bidani": {
    label: "38,000+ people",
    detail: "within his past HR leadership remit",
    background: "KPMG · American Express · IBM",
  },
  "kannan-swaminathan": {
    label: "2,000+ hours",
    detail: "of coaching in India and globally",
    background: "ICF Professional Certified Coach · EMCC Senior Practitioner",
  },
};

export default function PractitionersPage() {
  return (
    <>
      <StructuredData id="practitioners-structured-data" nodes={[
        ...contentPageGraph({
          path: "/practitioners", name: "Leadership Advisors & Practitioners", description: metadata.description ?? "",
          type: "CollectionPage",
          mainEntity: practitioners.map((practitioner) => ({ "@id": schemaId("/practitioners", practitioner.slug) })),
        }),
        ...practitionerGraph(),
      ]} />

      <section className={styles.hero}>
        <div className="shell">
          <p className={styles.eyebrow}>Our practitioners</p>
          <div className={styles.heroGrid}>
            <h1>The experience<br />behind the advice.</h1>
            <div className={styles.heroAside}>
              <p>Business leaders. Trusted thinking partners. The people you meet stay involved through delivery.</p>
              <a href="#meet-the-practitioners" className={styles.textLink}>Meet the practitioners <ArrowUpRight size={19} aria-hidden /></a>
            </div>
          </div>
          <div className={styles.heroFoot}>
            <span>Senior judgement. Personal commitment.</span>
            <span>Practitioner-led since 2015</span>
          </div>
        </div>
      </section>

      <section id="meet-the-practitioners" className={styles.profiles} aria-label="Practitioner profiles">
        <div className={`shell ${styles.profileGrid}`}>
          {practitioners.map((p, i) => {
            const proof = experience[p.slug];
            return (
              <article id={p.slug} key={p.slug} className={styles.profile}>
                <div className={styles.portraitField}>
                  <span className={styles.portraitLine} aria-hidden />
                  {p.photo && <Image
                    src={p.photo}
                    alt={`${p.name}, ${p.role.toLowerCase()} at WOY Consulting`}
                    width={284}
                    height={284}
                    sizes="(max-width: 359px) 84vw, 284px"
                    loading={i === 0 ? "eager" : "lazy"}
                    className={`${styles.portrait} ${i === 0 ? styles.founderPortrait : ""}`}
                  />}
                </div>
                <div className={styles.identity}>
                  <p className={styles.role}>{p.role}</p>
                  <h2>{p.name}</h2>
                  <p className={styles.lede}>{p.lede}</p>
                </div>
                <div className={styles.experience}>
                  <p><strong>{proof.label}</strong><span>{proof.detail}</span></p>
                  <p className={styles.background}>{proof.background}</p>
                </div>
                <details className={styles.biography}>
                  <summary>Explore {p.name.split(" ")[0]}’s experience <Plus size={19} aria-hidden /></summary>
                  <div className={styles.bioBody}>
                    {p.bio.map(para => <p key={para.slice(0, 32)}>{para}</p>)}
                    <h3>Areas of focus</h3>
                    <ul>{p.expertise.map(item => <li key={item}>{item}</li>)}</ul>
                    {p.linkedin && <a href={p.linkedin} target="_blank" rel="noopener noreferrer" className={styles.textLink} aria-label={`${p.name} on LinkedIn`}><LinkedinLogo size={19} aria-hidden /> LinkedIn</a>}
                  </div>
                </details>
              </article>
            );
          })}
        </div>
      </section>

      <section className={styles.consortium}>
        <div className={`shell ${styles.consortiumGrid}`}>
          <div>
            <p className={styles.eyebrow}>A wider circle of expertise</p>
            <h2>The right experience<br />for your context.</h2>
          </div>
          <div>
            <dl className={styles.networkFacts}>
              <div><dt>10+</dt><dd>consultants and former business leaders</dd></div>
              <div><dt>25+</dt><dd>coaches across industries and disciplines</dd></div>
            </dl>
            <p className={styles.networkCopy}>Our consortium brings together senior practitioners around your specific leadership, culture and business challenges.</p>
            <Link href="/expertise" className={styles.textLink}>Explore our expertise <ArrowUpRight size={19} aria-hidden /></Link>
          </div>
        </div>
      </section>
      <CTASection title="A real conversation. With a practitioner." body="Tell us what your organisation is working through. A partner will help you explore the way forward." />
    </>
  );
}
