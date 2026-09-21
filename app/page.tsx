import { pageMetadata } from "@/lib/metadata";
import { StructuredData } from "@/components/StructuredData";
import { webPageSchema, serviceGraph } from "@/lib/structured-data";
import Link from "next/link";
import Image from "next/image";
import styles from "./home.module.css";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { LogoFormation } from "@/components/LogoFormation";
import { ClientMarquee } from "@/components/ClientLogos";
import { Reveal } from "@/components/Reveal";
import { Stats } from "@/components/Stats";
import FourDApproach from "@/components/FourDApproach";
import { ExpertiseSection } from "@/components/ExpertiseSection";
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
        <Image src="/images/woy-direction-hero.webp" alt="" aria-hidden="true" fill sizes="100vw" preload className={styles.backdrop} data-hero-background />
        <div className={styles.veil} aria-hidden="true" />
        <div className={`shell ${styles.content}`}>
          <div className="grid w-full items-center gap-8 lg:grid-cols-[1.12fr_1fr] lg:gap-14">
            <div className="order-2 lg:order-1">
              <p className={`mb-5 flex items-center gap-3 text-xs font-semibold tracking-[0.06em] ${styles.eyebrow}`}><span className="h-px w-8 bg-current" aria-hidden />Partner-led consulting · Since 2015</p>
              <h1 id="home-title" className="t-display">
                Turning strategic intent into <em className="text-red">sustained performance.</em>
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

            <div className="order-1 flex flex-col items-center gap-5 lg:order-2">
              <LogoFormation className="w-full max-w-[520px]" />
              <p className={`max-w-[32ch] text-center text-sm ${styles.logoCaption}`}>
                Win Over Yourself. The philosophy behind WOY.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------- positioning band */}
      <section className="border-t border-line bg-sunken py-16 md:py-24">
        <div className="shell grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
          <Reveal>
            <h2 className="t-h2 max-w-[14ch]">
              Strategic partners, not just advisors.
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="grid max-w-[62ch] gap-5 font-light leading-relaxed text-ink2">
              <p>
                We have led businesses, built teams and navigated change. Today,
                we bring that experience to your organisation’s most important
                leadership, culture and execution challenges.
              </p>
              <p>
                Our partners stay involved from the first conversation through
                implementation, shaping solutions your teams can own and sustain.
              </p>
              <Link
                href="/about"
                className="group mt-2 inline-flex w-fit items-center gap-2 font-medium text-red"
              >
                More about WOY
                <ArrowUpRight
                  size={17}
                  weight="bold"
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </div>
          </Reveal>

          <div className="lg:col-span-2">
            <Stats />
          </div>
        </div>
      </section>

      <ExpertiseSection />

      {/* -------------------------------------------------------- clients */}
      <ClientMarquee />

      <FourDApproach />

      <LeadershipSection />
    </>
  );
}
