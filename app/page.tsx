import { pageMetadata } from "@/lib/metadata";
import { StructuredData } from "@/components/StructuredData";
import { webPageSchema, serviceGraph } from "@/lib/structured-data";
import Link from "next/link";
import styles from "./home.module.css";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { LogoFormation } from "@/components/LogoFormation";
import { Stats } from "@/components/Stats";
import { ClientMarquee } from "@/components/ClientLogos";
import FourDApproach from "@/components/FourDApproach";
import { ExpertiseSection } from "@/components/ExpertiseSection";
import { PhilosophySection } from "@/components/PhilosophySection";
import { SelectedWorkSection } from "@/components/SelectedWorkSection";
import { LeadershipSection } from "@/components/LeadershipSection";
import { site } from "@/lib/content";

export const metadata = pageMetadata(
  "Leadership & Business Advisory",
  site.description,
  "/"
);

export default function Home() {
  return (
    <>
      <StructuredData id="home-structured-data" nodes={[webPageSchema({ path: "/", name: "WOY Consulting | Leadership & Business Advisory", description: site.description }), ...serviceGraph()]} />
      {/* ------------------------------------------------------------ hero */}
      <section className={styles.hero} data-home-hero aria-labelledby="home-title">
        <div className={`shell ${styles.content}`}>
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>Partner-led consulting · Since&nbsp;2015</p>
              <h1 id="home-title" className={styles.title}>
                <span>Turning strategic</span>{" "}<span>intent into</span>{" "}
                <em><span>sustained</span>{" "}<span>performance.</span></em>
              </h1>
              <p className={styles.intro}>
                We partner with CEOs, founders and leadership teams to align strategy,
                strengthen leadership and build organisations that perform.
              </p>
              <div className={styles.actions}>
                <Link href={site.ctaHref} className={styles.primaryAction}>
                  {site.cta}
                  <ArrowUpRight size={18} aria-hidden="true" />
                </Link>
                <Link href="/work" className={styles.secondaryAction}>
                  Explore our work
                  <ArrowUpRight size={18} aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className={styles.heroIdentity}>
              <LogoFormation className="w-full max-w-[520px]" />
              <div className={styles.logoCaption} data-logo-caption>
                <p className={styles.captionTitle}>Win Over Yourself<span>.</span></p>
                <p className={styles.captionValues}>
                  <span>Growth.</span>{" "}<span>Excellence.</span>{" "}<span>Agility.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Stats />

      {/* -------------------------------------------------------- clients */}
      <ClientMarquee />

      <ExpertiseSection />

      <PhilosophySection />

      <SelectedWorkSection />

      <LeadershipSection />

      <FourDApproach />
    </>
  );
}
