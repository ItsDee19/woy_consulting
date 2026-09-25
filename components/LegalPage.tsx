import type { ReactNode } from "react";
import { PageHero } from "@/components/PageHero";

export type LegalSection = {
  id: string;
  title: string;
  content: ReactNode;
};

export function LegalPage({ title, lede, sections, updatedDate = "2026-09-21", updatedLabel = "21 September 2026" }: {
  title: string;
  lede: string;
  sections: LegalSection[];
  updatedDate?: string;
  updatedLabel?: string;
}) {
  return (
    <>
      <PageHero kicker="Website information" title={title} lede={lede} />
      <div className="shell grid gap-12 py-12 md:py-20 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-20">
        <aside>
          <p className="text-sm text-ink2">Last updated <time dateTime={updatedDate}>{updatedLabel}</time></p>
          <nav aria-label="On this page" className="mt-7 border-t border-line pt-6">
            <p className="text-sm font-medium">On this page</p>
            <ul className="mt-3 grid gap-1">
              {sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className="inline-block py-2 text-sm text-ink2 underline decoration-transparent underline-offset-4 transition-colors hover:text-ink hover:decoration-ink">
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <div className="grid max-w-[72ch] gap-10">
          {sections.map((section) => (
            <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="scroll-mt-28 border-t border-line pt-6">
              <h2 id={`${section.id}-title`} className="text-2xl font-medium">{section.title}</h2>
              <div className="mt-4 space-y-4 text-base leading-relaxed text-ink2 [&_a]:text-ink [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-red [&_li]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">
                {section.content}
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
