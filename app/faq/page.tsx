import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { CTASection } from "@/components/CTASection";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { StructuredData } from "@/components/StructuredData";
import { faqItems } from "@/lib/faq";
import { pageMetadata } from "@/lib/metadata";
import { contentPageGraph, schemaId, schemaUrl } from "@/lib/structured-data";

const description = "Answers about WOY Consulting's leadership advisory, practitioners, tailored engagements, 4D approach, case studies and how to start a conversation.";

export const metadata = pageMetadata(
  "Frequently Asked Questions",
  description,
  "/faq",
);

export default function FAQPage() {
  const structuredData = {
    "@type": "FAQPage",
    "@id": schemaId("/faq", "questions"),
    url: schemaUrl("/faq"),
    name: "Frequently asked questions about WOY Consulting",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      "@id": schemaId("/faq", item.id),
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <>
      <StructuredData nodes={[
        ...contentPageGraph({
          path: "/faq",
          name: "Frequently asked questions",
          description,
          mainEntity: { "@id": schemaId("/faq", "questions") },
        }),
        structuredData,
      ]} />
      <PageHero
        kicker="Frequently asked questions"
        title="Questions about working with WOY."
        lede="Straight answers about our advisory work, our practitioners and how an engagement begins."
      />

      <section id="questions" aria-label="Questions and answers" className="py-16 md:py-24">
        <div className="shell grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <aside className="self-start lg:sticky lg:top-28">
            <Reveal>
              <h2 className="t-h3 max-w-[17ch]">A useful place to start.</h2>
              <p className="mt-5 max-w-[36ch] font-light leading-relaxed text-ink2">
                Get a sense of the work, then explore the approach and the people behind it.
              </p>
              <nav aria-label="Explore WOY" className="mt-7 flex flex-col items-start gap-2">
                {[
                  { label: "Our expertise", href: "/#expertise" },
                  { label: "Our approach", href: "/approach" },
                  { label: "Our practitioners", href: "/practitioners" },
                ].map((link) => (
                  <Link key={link.href} href={link.href} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-ink underline decoration-line2 underline-offset-4 transition-colors hover:text-red hover:decoration-red">
                    {link.label}<ArrowRight size={15} aria-hidden="true" />
                  </Link>
                ))}
              </nav>
            </Reveal>
          </aside>

          <div className="min-w-0">
            {faqItems.map((item) => (
              <section key={item.id} id={item.id} aria-labelledby={`${item.id}-title`} className="scroll-mt-28 border-t border-line py-8 first:pt-7 last:pb-0 md:py-10">
                <Reveal>
                  <h2 id={`${item.id}-title`} className="max-w-[34ch] text-2xl font-medium leading-snug">{item.question}</h2>
                  <p className="mt-4 max-w-[62ch] font-light leading-relaxed text-ink2">{item.answer}</p>
                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                    {item.links.map((link) => (
                      <Link key={link.href} href={link.href} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-ink underline decoration-line2 underline-offset-4 transition-colors hover:text-red hover:decoration-red">
                        {link.label}<ArrowRight size={15} aria-hidden="true" />
                      </Link>
                    ))}
                  </div>
                </Reveal>
              </section>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Bring the question you are working through."
        body="A conversation with a WOY partner starts with understanding your context and whether we can help."
      />
    </>
  );
}
