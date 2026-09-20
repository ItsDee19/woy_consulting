import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { MarkGlyph } from "./Mark";
import { site } from "@/lib/content";

export function CTASection({
  title = "Start with a conversation.",
  body = "Leave your details and a partner will reach out. No pitch deck, no intake questionnaire.",
}: {
  title?: string;
  body?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-block text-onblock">
      <MarkGlyph className="pointer-events-none absolute -bottom-24 -right-10 h-[380px] w-[380px] text-redb opacity-[0.07] md:right-[6%]" />

      <div className="shell relative py-20 md:py-28">
        <h2 className="t-h2 max-w-[16ch] text-onblock">{title}</h2>
        <p className="mt-5 max-w-[46ch] font-light leading-relaxed text-onblock2">
          {body}
        </p>
        <Link
          href="/contact"
          className="group mt-9 inline-flex items-center gap-2.5 rounded-[2px] bg-red px-7 py-4 font-medium text-white transition-all duration-300 hover:bg-redb active:translate-y-px"
        >
          {site.cta}
          <ArrowRight
            size={18}
            weight="bold"
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </Link>
      </div>
    </section>
  );
}
