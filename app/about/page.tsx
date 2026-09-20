import { StructuredData } from "@/components/StructuredData";
import { contentPageGraph, schemaId } from "@/lib/structured-data";
import { pageMetadata } from "@/lib/metadata";
import Image from "next/image";
import { PageHero } from "@/components/PageHero";
import { PhilosophyMark } from "@/components/PhilosophyMark";
import { CTASection } from "@/components/CTASection";
import { Reveal } from "@/components/Reveal";
import { Stats } from "@/components/Stats";
import { ClientGrid } from "@/components/ClientLogos";
import { differentiators, logoDisclaimer, site } from "@/lib/content";

export const metadata = pageMetadata(
  "About Our Practitioner-led Firm",
  "Meet WOY Consulting, a boutique advisory founded in 2015. Former CEOs and CXOs help organisations strengthen leadership, people, culture and execution.",
  "/about"
);

export default function AboutPage() {
  return (
    <>
      <StructuredData id="about-structured-data" nodes={contentPageGraph({
          path: "/about", name: "About WOY Consulting", description: metadata.description ?? "",
          type: "AboutPage", mainEntity: { "@id": schemaId("/", "organization") },
        })} />
      <PageHero
        kicker={`Practitioner-led since ${site.established}`}
        title="We have sat in the chair before advising the person in it."
        lede="WOY is a boutique consulting firm that partners with organisations to strengthen leadership, elevate people and culture systems, and improve execution where it matters most."
      />

      {/* ------------------------------------------------------- who we are */}
      <section className="py-16 md:py-24">
        <div className="shell">
          <Reveal>
            <figure className="reveal-photo m-0 h-[220px] overflow-hidden md:h-[400px]">
              <Image
                src="/images/leadership-room.webp"
                alt=""
                width={1800}
                height={760}
                className="h-full w-full object-cover"
                sizes="(max-width: 1320px) 90vw, 1176px"
                loading="eager"
              />
            </figure>
          </Reveal>

          <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
            <Reveal>
              <h2 className="t-h2 max-w-[14ch]">Who we are</h2>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="grid max-w-[62ch] gap-5 font-light leading-relaxed text-ink2">
                <p>
                  Established in {site.established}, we work across
                  multinationals, Indian conglomerates, public sector
                  institutions, SMEs, startups and founder-led businesses, across
                  industries.
                </p>
                <p>
                  WOY is a consortium of more than ten former CEOs, CXOs and
                  senior business leaders who have led large teams, run P&amp;Ls,
                  handled governance and driven change in real operating
                  environments. That is the difference between advice that
                  survives contact with a Monday morning and advice that does not.
                </p>
                <p>
                  The work is partner-led end to end. The leaders you meet stay
                  involved through delivery, which keeps judgement senior and
                  adoption practical. We adapt proven frameworks to your reality
                  rather than force-fitting templates.
                </p>
              </div>
            </Reveal>

            <div className="lg:col-span-2">
              <Stats />
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ logo philosophy */}
      <section className="border-y border-line bg-sunken py-20 md:py-28">
        <div className="shell">
          <Reveal>
            <h2 className="t-h2 max-w-[20ch]">
              The philosophy behind the mark
            </h2>
          </Reveal>
          <Reveal delay={0.06}>
            <p className="mb-14 mt-5 max-w-[58ch] font-light text-ink2">
              Our guiding principle inspires individuals and organisations toward
              exceptional leadership, sustained growth and meaningful
              transformation. It is embodied in a logo built from three symbols.
            </p>
          </Reveal>

          <PhilosophyMark />
        </div>
      </section>

      {/* -------------------------------------------------- differentiators */}
      <section className="py-20 md:py-28">
        <div className="shell">
          <Reveal>
            <h2 className="t-h2 max-w-[16ch]">Why partner with WOY</h2>
          </Reveal>

          <div className="mt-14 grid gap-px bg-line md:grid-cols-2">
            {differentiators.map((d, i) => (
              <Reveal key={d.title} delay={i * 0.05}>
                <div className="h-full bg-bg p-8 transition-colors duration-300 hover:bg-sunken md:p-10">
                  <h3 className="text-xl font-medium tracking-[-0.022em]">
                    {d.title}
                  </h3>
                  <ul role="list" className="mt-5 grid gap-3">
                    {d.points.map((p) => (
                      <li
                        key={p}
                        className="relative pl-6 font-light leading-relaxed text-ink2"
                      >
                        <span className="absolute left-0 top-[0.7em] h-px w-3 bg-red" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- client wall */}
      <section className="logo-band border-t border-line py-20 md:py-28">
        <div className="shell">
          <Reveal>
            <h2 className="t-h2 max-w-[18ch]">Brands supported by WOY</h2>
          </Reveal>
          <Reveal delay={0.06}>
            <p className="mb-14 mt-5 max-w-[56ch] font-light text-ink2">
              Across financial services, technology, manufacturing, healthcare,
              energy, education, public sector and consumer businesses.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <ClientGrid />
          </Reveal>
          <Reveal delay={0.14}>
            <p className="mt-12 max-w-[62ch] text-sm text-ink3">
              {logoDisclaimer}
            </p>
          </Reveal>
        </div>
      </section>

      <CTASection />
    </>
  );
}
