import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { ApproachAccordion } from "@/components/Accordion";
import { CTASection } from "@/components/CTASection";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Approach",
  description:
    "The 4D approach: Discover, Define, Design, Deliver. A structured path from diagnosis to sustained adoption, with ownership transferred to the internal team.",
};

export default function ApproachPage() {
  return (
    <>
      <PageHero
        kicker="How we work"
        title="A structured path from diagnosis to sustained adoption."
        lede="Four stages, each with a job to do. The last one is the one most engagements skip, and it is the reason change does not survive the consultant leaving."
      />

      <section className="bg-block py-16 text-onblock md:py-24">
        <div className="shell">
          <ApproachAccordion tone="dark" />

          <Reveal delay={0.1}>
            <p className="mt-12 max-w-[48ch] text-lg font-light text-redb md:text-xl">
              From insight, to alignment, to capability, to sustained execution.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------ what stays behind */}
      <section className="py-20 md:py-28">
        <div className="shell grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
          <Reveal>
            <h2 className="t-h2 max-w-[16ch]">What stays behind when we leave</h2>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="grid max-w-[62ch] gap-5 font-light leading-relaxed text-ink2">
              <p>
                An engagement that depends on us to keep working has failed,
                whatever the feedback scores say. Delivery is built so that the
                internal team can run, sustain and scale the change on their own.
              </p>
              <p>
                That means success metrics people actually review, operating
                cadences that survive a busy quarter, and accountability loops
                with names attached. It also means capability transfer is a
                deliverable rather than a hope: leaders, HR and line teams are
                equipped to carry it before we step back.
              </p>
              <p>
                We measure the work by observable behaviour shifts and system
                reinforcement, not by the size of the deck.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <CTASection
        title="Bring us the problem before it is fully defined."
        body="Discover exists precisely because the brief is rarely the real issue. A first conversation costs nothing and usually sharpens it."
      />
    </>
  );
}
