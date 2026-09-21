import { pageMetadata } from "@/lib/metadata";
import { StructuredData } from "@/components/StructuredData";
import { webPageSchema, serviceGraph } from "@/lib/structured-data";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { LogoFormation } from "@/components/LogoFormation";
import { ClientMarquee } from "@/components/ClientLogos";
import { CTASection } from "@/components/CTASection";
import { Reveal } from "@/components/Reveal";
import { Stats } from "@/components/Stats";
import FourDApproach from "@/components/FourDApproach";
import { ExpertiseSection } from "@/components/ExpertiseSection";
import { SelectedCaseStudies } from "@/components/SelectedCaseStudies";
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
      <section className="shell flex min-h-[calc(100dvh-72px)] items-center pb-14 pt-8 md:pb-20">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[1.12fr_1fr] lg:gap-14">
          <div className="order-2 lg:order-1">
            <p className="mb-5 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.13em] text-red"><span className="h-px w-8 bg-current" aria-hidden />Leadership &amp; business advisory</p>
            <h1 className="t-display">
              Real-world acumen.
              <br />
              Lasting transformation.
            </h1>
            <p className="mt-6 max-w-[34ch] text-lg font-light leading-relaxed text-ink2 md:text-xl">
              Practitioner-led advisory since {site.established}. Former CEOs and
              CXOs who have led through scale, complexity and change.
            </p>
            <div className="mt-9">
              <Link
                href="/contact"
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
            <p className="max-w-[32ch] text-center text-sm text-ink3">
              Win Over Yourself. The philosophy behind WOY.
            </p>
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

      <SelectedCaseStudies />

      <CTASection />
    </>
  );
}
