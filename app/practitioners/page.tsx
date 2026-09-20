import type { Metadata } from "next";
import Image from "next/image";
import { LinkedinLogo } from "@phosphor-icons/react/dist/ssr";
import { PageHero } from "@/components/PageHero";
import { CTASection } from "@/components/CTASection";
import { Reveal } from "@/components/Reveal";
import { practitioners } from "@/lib/content";

export const metadata: Metadata = {
  title: "Practitioners",
  description:
    "A consortium of over ten consultants and more than twenty-five coaches, all former business leaders. The partners you meet stay accountable through delivery.",
};

export default function PractitionersPage() {
  return (
    <>
      <PageHero
        kicker="The practitioners"
        title="The leaders you meet are the ones who stay through delivery."
        lede="A consortium of over ten consultants and more than twenty-five coaches, all former business leaders across a range of industries and disciplines."
      />

      <section className="py-16 md:py-24">
        <div className="shell grid gap-4 lg:grid-cols-3">
          {practitioners.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.07}>
              <article className="reveal-photo group flex h-full flex-col overflow-hidden rounded-[2px] border border-line bg-raised transition-all duration-400 hover:-translate-y-1 hover:border-red/40 hover:shadow-[0_1px_2px_rgba(20,23,29,.04),0_16px_38px_-16px_rgba(20,23,29,.16)]">
                {/* TODO: set `photo` in lib/content.ts and a real headshot
                    replaces the initials tile. The greyscale to colour reveal
                    already applies to whichever one renders. */}
                {p.photo ? (
                  <div className="aspect-[4/3.1] overflow-hidden">
                    <Image
                      src={p.photo}
                      alt={p.name}
                      width={800}
                      height={620}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className="tile grid aspect-[4/3.1] place-items-center"
                    style={{
                      background:
                        "radial-gradient(70% 90% at 50% 15%, color-mix(in srgb, var(--c-red) 17%, transparent), transparent 70%), var(--c-sunken)",
                    }}
                    aria-hidden
                  >
                    <span className="text-[clamp(2.6rem,5vw,3.6rem)] font-light tracking-[-0.04em] text-red">
                      {p.initials}
                    </span>
                  </div>
                )}

                <div className="flex flex-1 flex-col gap-2.5 p-7 md:p-8">
                  <h2 className="text-xl font-medium tracking-[-0.022em]">
                    {p.name}
                  </h2>
                  <p className="text-sm font-medium text-red">{p.role}</p>
                  <p className="text-sm font-light italic leading-relaxed text-ink3">
                    {p.lede}
                  </p>

                  <div className="mt-2 grid gap-3">
                    {p.bio.map((para) => (
                      <p
                        key={para.slice(0, 32)}
                        className="text-sm font-light leading-relaxed text-ink2"
                      >
                        {para}
                      </p>
                    ))}
                  </div>

                  <ul role="list" className="mt-4 flex flex-wrap gap-1.5">
                    {p.expertise.map((e) => (
                      <li
                        key={e}
                        className="rounded-[2px] border border-line px-2.5 py-1 text-xs text-ink2"
                      >
                        {e}
                      </li>
                    ))}
                  </ul>

                  {/* TODO: add the real LinkedIn URL in lib/content.ts */}
                  {p.linkedin ? (
                    <a
                      href={p.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-medium text-ink2 transition-colors hover:text-red"
                      aria-label={`${p.name} on LinkedIn`}
                    >
                      <LinkedinLogo size={19} />
                      LinkedIn
                    </a>
                  ) : (
                    <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm text-ink3">
                      <LinkedinLogo size={19} aria-hidden />
                      LinkedIn profile to be added
                    </span>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-sunken py-16 md:py-20">
        <div className="shell grid gap-8 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
          <Reveal>
            <h2 className="t-h2 max-w-[16ch]">Beyond the named partners</h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="max-w-[62ch] font-light leading-relaxed text-ink2">
              The consortium extends well past the profiles above. Engagements
              draw on more than twenty-five credentialled coaches and a wider
              bench of former CXOs, selected for the specific context rather than
              assigned by availability. Where an engagement needs a specialist we
              do not have, we say so.
            </p>
          </Reveal>
        </div>
      </section>

      <CTASection
        title="Talk to a partner, not a pitch team."
        body="The person who scopes the work is the person who delivers it."
      />
    </>
  );
}
