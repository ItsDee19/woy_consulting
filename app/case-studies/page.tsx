import { StructuredData } from "@/components/StructuredData";
import { caseStudyListSchema, contentPageGraph, schemaId } from "@/lib/structured-data";
import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { PageHero } from "@/components/PageHero";
import { CTASection } from "@/components/CTASection";
import { Reveal } from "@/components/Reveal";
import { caseStudies } from "@/lib/content";

export const metadata = pageMetadata(
  "Leadership & Transformation Case Studies",
  "Explore WOY case studies in insurance, education, IT, financial services, automotive and medical technology, with client confidentiality protected.",
  "/case-studies"
);

export default function CaseStudiesPage() {
  return (
    <>
      <StructuredData id="case-studies-structured-data" nodes={[
          ...contentPageGraph({
            path: "/case-studies", name: "Case Studies", description: metadata.description ?? "",
            type: "CollectionPage", mainEntity: { "@id": schemaId("/case-studies", "case-studies") },
          }),
          caseStudyListSchema(),
        ]} />
      <PageHero
        kicker="Case studies"
        title="Proven impact across industries, contexts and leadership challenges."
        lede="Client names are withheld under confidentiality agreements. Industry and scope of work are shown, along with what actually changed."
      />

      <section className="py-16 md:py-24">
        <div className="shell">
          <ul role="list" className="grid gap-4 md:grid-cols-2">
            {caseStudies.map((c, i) => (
              <Reveal key={c.slug} delay={(i % 2) * 0.06} as="li">
                <Link
                  href={`/case-studies/${c.slug}`}
                  className="group flex h-full flex-col rounded-[2px] border border-line bg-raised p-8 transition-all duration-300 hover:-translate-y-1 hover:border-red/40 hover:shadow-[0_1px_2px_rgba(20,23,29,.04),0_16px_38px_-16px_rgba(20,23,29,.16)] md:p-10"
                >
                  <p className="text-xs font-medium uppercase tracking-[0.1em] text-red">
                    {c.industry}
                  </p>
                  <h2 className="mt-4 text-2xl font-medium leading-snug tracking-[-0.026em]">
                    {c.title}
                  </h2>
                  <p className="mt-4 max-w-[48ch] font-light leading-relaxed text-ink2">
                    {c.headline}
                  </p>

                  <ul role="list" className="mt-7 grid gap-2">
                    {c.outcomes.slice(0, 2).map((o) => (
                      <li
                        key={o}
                        className="relative pl-5 text-sm font-light leading-relaxed text-ink3"
                      >
                        <span className="absolute left-0 top-[0.72em] h-px w-2.5 bg-red" />
                        {o}
                      </li>
                    ))}
                  </ul>

                  <span className="mt-auto inline-flex items-center gap-1.5 pt-8 text-sm font-medium text-ink2 transition-colors group-hover:text-red">
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
        </div>
      </section>

      <CTASection
        title="Your situation will not match any of these exactly."
        body="It never does. That is why every engagement starts with Discover rather than with a template."
      />
    </>
  );
}
