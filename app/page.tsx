import { pageMetadata } from "@/lib/metadata";
import { StructuredData } from "@/components/StructuredData";
import { webPageSchema } from "@/lib/structured-data";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { LogoFormation } from "@/components/LogoFormation";
import { ClientMarquee } from "@/components/ClientLogos";
import { CTASection } from "@/components/CTASection";
import { Reveal } from "@/components/Reveal";
import { Stats } from "@/components/Stats";
import FourDApproach from "@/components/FourDApproach";
import {
  caseStudies,
  capabilitiesByPillar,
  pillars,
  site,
  type Pillar,
} from "@/lib/content";

export const metadata = pageMetadata(
  "Leadership & Business Advisory",
  site.description,
  "/"
);

const PILLAR_ORDER: Pillar[] = ["empowering", "transforming", "accelerating"];

export default function Home() {
  return (
    <>
      <StructuredData id="home-structured-data" nodes={[webPageSchema({ path: "/", name: "WOY Consulting | Leadership & Business Advisory", description: site.description })]} />
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

      {/* ------------------------------------------------------ what we do */}
      <section className="py-20 md:py-28">
        <div className="shell">
          <Reveal>
            <h2 className="t-h2 max-w-[16ch]">What we deliver</h2>
          </Reveal>
          <Reveal delay={0.06}>
            <p className="mt-5 max-w-[56ch] font-light text-ink2">
              Six capabilities, built around three outcomes. Every engagement is
              shaped to your context, maturity and constraints.
            </p>
          </Reveal>

          <div className="mt-14 border-t border-line">
            {PILLAR_ORDER.map((key, i) => {
              const p = pillars[key];
              const caps = capabilitiesByPillar(key);
              return (
                <Reveal key={key} delay={i * 0.05}>
                  <div className="group grid gap-6 border-b border-line py-9 md:grid-cols-[0.9fr_1.1fr] md:gap-14 md:py-12">
                    <div>
                      <h3 className="t-h3 transition-colors duration-300 group-hover:text-red">
                        {p.title}
                      </h3>
                      <p className="mt-2 text-sm text-ink3">{p.sub}</p>
                    </div>
                    <div>
                      <p className="max-w-[54ch] font-light leading-relaxed text-ink2">
                        {p.blurb}
                      </p>
                      <ul role="list" className="mt-6 flex flex-wrap gap-2">
                        {caps.map((c) => (
                          <li key={c.slug}>
                            <Link
                              href={`/expertise#${c.slug}`}
                              className="inline-block rounded-[2px] border border-line px-3 py-1.5 text-xs text-ink2 transition-colors hover:border-red hover:text-red"
                            >
                              {c.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- clients */}
      <ClientMarquee />

      <FourDApproach />

      {/* ----------------------------------------------- selected case work */}
      <section className="py-20 md:py-28">
        <div className="shell">
          <Reveal>
            <h2 className="t-h2 max-w-[16ch]">Selected work</h2>
          </Reveal>
          <Reveal delay={0.06}>
            <p className="mt-5 max-w-[56ch] font-light text-ink2">
              Client names are withheld under confidentiality agreements.
              Industry and scope of work are shown.
            </p>
          </Reveal>

          <ul role="list" className="mt-12 grid gap-4 md:grid-cols-3">
            {caseStudies.slice(0, 3).map((c, i) => (
              <Reveal key={c.slug} delay={i * 0.06} as="li">
                <Link
                  href={`/case-studies/${c.slug}`}
                  className="group flex h-full flex-col rounded-[2px] border border-line bg-raised p-7 transition-all duration-400 hover:-translate-y-1 hover:border-red/40 hover:shadow-[0_1px_2px_rgba(20,23,29,.04),0_14px_34px_-14px_rgba(20,23,29,.14)]"
                >
                  <p className="text-xs font-medium uppercase tracking-[0.1em] text-red">
                    {c.industry}
                  </p>
                  <h3 className="mt-4 text-xl font-medium leading-snug tracking-[-0.022em]">
                    {c.title}
                  </h3>
                  <p className="mt-3 font-light leading-relaxed text-ink2">
                    {c.headline}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-7 text-sm font-medium text-ink2 transition-colors group-hover:text-red">
                    Read the case
                    <ArrowRight
                      size={15}
                      weight="bold"
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={0.1}>
            <Link
              href="/case-studies"
              className="group mt-10 inline-flex items-center gap-2 font-medium text-red"
            >
              All case studies
              <ArrowRight
                size={17}
                weight="bold"
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </Reveal>
        </div>
      </section>

      <CTASection />
    </>
  );
}
