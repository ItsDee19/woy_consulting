import { StructuredData } from "@/components/StructuredData";
import { contentPageGraph, schemaId } from "@/lib/structured-data";
import { pageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/PageHero";
import { ContactForm } from "@/components/ContactForm";
import { Reveal } from "@/components/Reveal";
import { approach, site } from "@/lib/content";

export const metadata = pageMetadata(
  "Start a Conversation",
  `Email WOY Consulting at ${site.email} or share your details to discuss your leadership, people or business challenge with a partner.`,
  "/contact"
);

export default function ContactPage() {
  return (
    <>
      <StructuredData id="contact-structured-data" nodes={contentPageGraph({
          path: "/contact", name: "Contact WOY Consulting", description: metadata.description ?? "",
          type: "ContactPage", mainEntity: { "@id": schemaId("/", "organization") },
        })} />
      <PageHero
        kicker="Contact"
        title="Let’s start with your challenge."
        lede="Email us directly or share your details below. A short conversation about what you are working on, and whether we are the right people for it."
      />

      <section className="py-16 md:py-24">
        <div className="shell grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
          <div>
            <div className="mb-12 border-b border-line pb-8">
              <p className="text-xs font-medium uppercase tracking-[0.13em] text-ink3">Write to WOY</p>
              <a href={site.ctaHref} className="mt-3 inline-flex min-h-11 max-w-full items-center break-all text-xl font-medium text-red underline decoration-line2 underline-offset-8 transition-colors hover:decoration-red sm:text-2xl">
                {site.email}
              </a>
              <p className="mt-3 max-w-[44ch] text-sm font-light leading-relaxed text-ink2">
                Share a little about your organisation and the challenge you have in mind.
              </p>
            </div>
            <Reveal>
              <h2 className="t-h3 max-w-[18ch]">What happens next</h2>
            </Reveal>

            <ol role="list" className="mt-8 grid gap-6">
              {[
                {
                  t: "A partner calls you",
                  d: "Not a coordinator, and not a scheduling link. One of the people who would actually do the work.",
                },
                {
                  t: "We listen before proposing",
                  d: "The first conversation is Discover in miniature. Most briefs sharpen considerably in thirty minutes.",
                },
                {
                  t: "You get a straight answer",
                  d: "Including when the honest answer is that you do not need us, or that someone else fits better.",
                },
              ].map((s, i) => (
                <Reveal key={s.t} delay={i * 0.06} as="li">
                  <div className="border-t border-line pt-5">
                    <h3 className="font-medium">{s.t}</h3>
                    <p className="mt-2 max-w-[44ch] text-sm font-light leading-relaxed text-ink2">
                      {s.d}
                    </p>
                  </div>
                </Reveal>
              ))}
            </ol>

            <Reveal delay={0.2}>
              <p className="mt-10 max-w-[44ch] text-sm text-ink3">
                Engagements begin with {approach[0].title}, which means we are
                comfortable being brought a problem that is not yet fully
                defined.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <div className="rounded-[2px] border border-line bg-raised p-7 md:p-9">
              <ContactForm />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
