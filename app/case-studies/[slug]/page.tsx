import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { CTASection } from "@/components/CTASection";
import { Reveal } from "@/components/Reveal";
import { MarkGlyph } from "@/components/Mark";
import { caseStudies, caseStudyBySlug } from "@/lib/content";

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = caseStudyBySlug(slug);
  if (!c) return { title: "Case study" };
  return {
    title: `${c.title} | ${c.industry}`,
    description: c.context,
  };
}

const BLOCKS = [
  { key: "edge", label: "WOY's edge" },
  { key: "framework", label: "The framework" },
  { key: "outcomes", label: "What changed" },
] as const;

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = caseStudyBySlug(slug);
  if (!study) notFound();

  const index = caseStudies.findIndex((c) => c.slug === slug);
  const next = caseStudies[(index + 1) % caseStudies.length];

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-sunken">
        <MarkGlyph className="pointer-events-none absolute -right-16 -top-20 h-[420px] w-[420px] text-red opacity-[0.045] md:right-[4%]" />

        <div className="shell relative py-14 md:py-20">
          <Link
            href="/case-studies"
            className="group inline-flex items-center gap-2 text-sm text-ink2 transition-colors hover:text-red"
          >
            <ArrowLeft
              size={15}
              weight="bold"
              className="transition-transform duration-300 group-hover:-translate-x-1"
            />
            All case studies
          </Link>

          <Reveal>
            <p className="mt-9 text-xs font-medium uppercase tracking-[0.1em] text-red">
              {study.industry}
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="t-h2 mt-4 max-w-[20ch]">{study.title}</h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-6 max-w-[52ch] text-lg font-light leading-relaxed text-ink2">
              {study.headline}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------- context */}
      <section className="py-16 md:py-20">
        <div className="shell grid gap-8 lg:grid-cols-[14rem_1fr] lg:gap-16">
          <Reveal>
            <h2 className="text-sm font-medium uppercase tracking-[0.1em] text-ink3">
              The situation
            </h2>
          </Reveal>
          <Reveal delay={0.06}>
            <p className="max-w-[62ch] text-xl font-light leading-relaxed">
              {study.context}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------ blocks */}
      <section className="pb-4">
        <div className="shell">
          {BLOCKS.map((block, bi) => (
            <div
              key={block.key}
              className="grid gap-8 border-t border-line py-12 lg:grid-cols-[14rem_1fr] lg:gap-16 md:py-16"
            >
              <Reveal>
                <h2 className="text-sm font-medium uppercase tracking-[0.1em] text-ink3">
                  {block.label}
                </h2>
              </Reveal>
              <ul role="list" className="grid gap-4">
                {study[block.key].map((item, i) => (
                  <Reveal key={item} delay={i * 0.05} as="li">
                    <div className="relative max-w-[64ch] pl-8 font-light leading-relaxed text-ink2">
                      <span className="absolute left-0 top-[0.72em] h-px w-4 bg-red" />
                      {item}
                    </div>
                  </Reveal>
                ))}
              </ul>
              {bi === BLOCKS.length - 1 && <span className="hidden" />}
            </div>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------------- next */}
      <section className="border-t border-line py-14">
        <div className="shell">
          <Link
            href={`/case-studies/${next.slug}`}
            className="group flex flex-wrap items-end justify-between gap-6"
          >
            <div>
              <p className="text-sm text-ink3">Next case study</p>
              <p className="mt-2 text-xs font-medium uppercase tracking-[0.1em] text-red">
                {next.industry}
              </p>
              <h2 className="t-h3 mt-3 max-w-[20ch] transition-colors duration-300 group-hover:text-red">
                {next.title}
              </h2>
            </div>
            <ArrowRight
              size={30}
              className="mb-2 text-ink3 transition-all duration-300 group-hover:translate-x-2 group-hover:text-red"
            />
          </Link>
        </div>
      </section>

      <CTASection />
    </>
  );
}
