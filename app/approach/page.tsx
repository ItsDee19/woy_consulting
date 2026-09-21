import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { StructuredData } from "@/components/StructuredData";
import { contentPageGraph } from "@/lib/structured-data";
import { pageMetadata } from "@/lib/metadata";
import { ApproachExplorer } from "@/components/ApproachExplorer";
import { CTASection } from "@/components/CTASection";
import styles from "./approach.module.css";

export const metadata = pageMetadata(
  "The 4D Consulting Approach",
  "Discover, Define, Design, Deliver: a structured path from diagnosis to lasting adoption, with ownership transferred to your internal team.",
  "/approach"
);

const foundations = [
  { title: "Clear ownership", body: "Agreed priorities, defined outcomes and people accountable for carrying the work forward." },
  { title: "Capability within your team", body: "Leaders, HR and line teams equipped to apply the tools and sustain the change." },
  { title: "A rhythm for progress", body: "Success measures, operating cadences and review routines that make execution part of everyday work." },
];

export default function ApproachPage() {
  return (
    <>
      <StructuredData id="approach-structured-data" nodes={contentPageGraph({
        path: "/approach", name: "The 4D Consulting Approach", description: metadata.description ?? "",
      })} />
      <header className={styles.hero}>
        <div className={`shell ${styles.heroGrid}`}>
          <div>
            <p className={styles.eyebrow}>The WOY 4D approach</p>
            <h1>A clear direction.<br /><span>Change that lasts.</span></h1>
          </div>
          <div className={styles.introduction}>
            <p>Insight becomes a shared ambition. A tailored solution becomes a way of working your people can sustain.</p>
            <a href="#explore-4d" className={styles.exploreLink}>Explore the journey <span aria-hidden>↓</span></a>
          </div>
        </div>
      </header>

      <div id="explore-4d" className={styles.explorerAnchor}>
        <ApproachExplorer />
      </div>

      <section className={styles.ownership} aria-labelledby="ownership-title">
        <div className="shell">
          <div className={styles.ownershipHeading}>
            <div>
              <p className={styles.eyebrow}>Built to carry forward</p>
              <h2 id="ownership-title">The lasting part<br />belongs to you.</h2>
            </div>
            <p>Partner-led through delivery.<br />Designed for your team to own.</p>
          </div>
          <dl className={styles.foundations}>
            {foundations.map(item => <div key={item.title}><dt>{item.title}</dt><dd>{item.body}</dd></div>)}
          </dl>
          <Link href="/case-studies" className={styles.proofLink}>See the approach in practice <ArrowUpRight size={18} aria-hidden /></Link>
        </div>
      </section>
      <CTASection title="Start with the challenge you’re facing." body="A conversation with a WOY practitioner can help clarify the next step." />
    </>
  );
}
