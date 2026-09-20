import { MarkGlyph } from "./Mark";
import { Reveal } from "./Reveal";

/** Shared masthead for every route below the homepage. */
export function PageHero({
  kicker,
  title,
  lede,
}: {
  kicker: string;
  title: string;
  lede?: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-sunken">
      <MarkGlyph className="pointer-events-none absolute -right-16 -top-20 h-[420px] w-[420px] text-red opacity-[0.045] md:right-[4%]" />

      <div className="shell relative py-16 md:py-24">
        <Reveal>
          <p className="text-sm font-medium text-red">{kicker}</p>
        </Reveal>
        <Reveal delay={0.06}>
          <h1 className="t-h2 mt-4 max-w-[18ch]">{title}</h1>
        </Reveal>
        {lede && (
          <Reveal delay={0.12}>
            <p className="mt-6 max-w-[56ch] text-lg font-light leading-relaxed text-ink2">
              {lede}
            </p>
          </Reveal>
        )}
      </div>
    </section>
  );
}
