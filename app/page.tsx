import { pageMetadata } from "@/lib/metadata";
import { StructuredData } from "@/components/StructuredData";
import { webPageSchema, serviceGraph } from "@/lib/structured-data";
import Link from "next/link";
import styles from "./home.module.css";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { LogoFormation } from "@/components/LogoFormation";
import { Stats } from "@/components/Stats";
import { ClientMarquee } from "@/components/ClientLogos";
import FourDApproach from "@/components/FourDApproach";
import { ExpertiseSection } from "@/components/ExpertiseSection";
import { PhilosophySection } from "@/components/PhilosophySection";
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
              <p className={`mb-5 ${styles.eyebrow}`}>Partner-led consulting · Since&nbsp;2015</p>
              <h1 id="home-title" className={styles.title}>
                <span>Turning strategic intent into</span>{" "}<em>sustained performance.</em>
              </h1>
              <p className="mt-6 max-w-[34ch] text-lg font-light leading-relaxed text-ink2 md:text-xl">
                We partner with CEOs, founders and leadership teams to align strategy,
                strengthen leadership and build organisations that perform.
              </p>
              <div className="mt-9">
                <Link
                  href={site.ctaHref}
                  className="group inline-flex items-center gap-2.5 rounded-[2px] bg-action px-7 py-4 font-medium text-white transition-all duration-300 hover:bg-action-hover hover:shadow-[0_10px_26px_-12px_rgba(205,20,33,.7)] active:translate-y-px"
                >
                  {site.cta}
                  <ArrowRight
                    size={18}
                    weight="bold"
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
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

      <ExpertiseSection />

      {/* -------------------------------------------------------- clients */}
      <ClientMarquee />

      <PhilosophySection />

      <FourDApproach />

      <LeadershipSection />
    </>
  );
}
