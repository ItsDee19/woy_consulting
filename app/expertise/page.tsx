import { StructuredData } from "@/components/StructuredData";
import { contentPageGraph, schemaId, serviceGraph } from "@/lib/structured-data";
import { pageMetadata } from "@/lib/metadata";
import Image from "next/image";
import { PageHero } from "@/components/PageHero";
import { CTASection } from "@/components/CTASection";
import { Reveal } from "@/components/Reveal";
import { capabilities, pillars, type Pillar } from "@/lib/content";

export const metadata = pageMetadata(
  "Leadership & Business Consulting Services",
  "Explore WOY expertise in leadership coaching, culture, people consulting, HR transformation, strategy, sales and organisation diagnostics.",
  "/expertise"
);

const PILLAR_ORDER: Pillar[] = ["empowering", "transforming", "accelerating"];

/* one supporting image per pillar, placed so the page is not a wall of text */
const PILLAR_IMAGE: Record<Pillar, string> = {
  empowering: "/images/coaching-session.webp",
  transforming: "/images/hr-workshop.webp",
  accelerating: "/images/strategy-review.webp",
};

export default function ExpertisePage() {
  return (
    <>
      <StructuredData id="expertise-structured-data" nodes={[
          ...contentPageGraph({
            path: "/expertise", name: "Leadership and Business Consulting Services", description: metadata.description ?? "",
            type: "CollectionPage",
            mainEntity: capabilities.map((capability) => ({ "@id": schemaId("/expertise", capability.slug) })),
          }),
          ...serviceGraph(),
        ]} />
      <PageHero
        kicker="Expertise"
        title="Six capabilities. Three outcomes. One operating reality: yours."
        lede="We adapt proven frameworks to your context, maturity and constraints. The output is designed for adoption, not for the shelf."
      />

      {PILLAR_ORDER.map((key, pi) => {
        const pillar = pillars[key];
        const caps = capabilities.filter((c) => c.pillar === key);
        const tinted = pi % 2 === 1;

        return (
          <section
            key={key}
            className={`border-b border-line py-16 md:py-24 ${tinted ? "bg-sunken" : ""}`}
          >
            <div className="shell">
              {/* pillar header, image on alternating sides to break the rhythm */}
              <div
                className={`grid items-center gap-8 md:gap-14 lg:grid-cols-2 ${
                  pi === 1 ? "lg:[&>figure]:order-first" : ""
                }`}
              >
                <Reveal>
                  <div>
                    <p className="text-sm font-medium text-red">{pillar.sub}</p>
                    <h2 className="t-h2 mt-3 max-w-[14ch]">{pillar.title}</h2>
                    <p className="mt-5 max-w-[50ch] font-light leading-relaxed text-ink2">
                      {pillar.blurb}
                    </p>
                  </div>
                </Reveal>

                <Reveal delay={0.08}>
                  <figure className="reveal-photo m-0 h-[220px] overflow-hidden md:h-[300px]">
                    <Image
                      src={PILLAR_IMAGE[key]}
                      alt=""
                      width={1100}
                      height={620}
                      className="h-full w-full object-cover"
                      sizes="(max-width: 1023px) 90vw, 570px"
                      loading={pi === 0 ? "eager" : "lazy"}
                    />
                  </figure>
                </Reveal>
              </div>

              {/* capabilities under this pillar */}
              <div className="mt-14 grid gap-4 lg:grid-cols-2">
                {caps.map((c, i) => (
                  <Reveal key={c.slug} delay={i * 0.06}>
                    <article
                      id={c.slug}
                      className="flex h-full scroll-mt-28 flex-col rounded-[2px] border border-line bg-raised p-7 transition-colors duration-300 hover:border-line2 md:p-9"
                    >
                      <h3 className="text-2xl font-medium tracking-[-0.026em]">
                        {c.title}
                      </h3>
                      <p className="mt-4 max-w-[56ch] font-light leading-relaxed text-ink2">
                        {c.summary}
                      </p>

                      <div className="mt-8 grid gap-7 border-t border-line pt-7">
                        {c.detail.map((d) => (
                          <div key={d.heading}>
                            <h4 className="text-[0.95rem] font-medium">
                              {d.heading}
                            </h4>
                            <ul role="list" className="mt-3 grid gap-2">
                              {d.points.map((p) => (
                                <li
                                  key={p}
                                  className="relative pl-5 text-sm font-light leading-relaxed text-ink2"
                                >
                                  <span className="absolute left-0 top-[0.72em] h-px w-2.5 bg-red" />
                                  {p}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      <CTASection
        title="Not sure which of these you need?"
        body="That is usually the right place to start. A short conversation will get to it faster than a proposal will."
      />
    </>
  );
}
