import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { MarkGlyph } from "@/components/Mark";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "This page could not be found. Return to WOY Consulting to explore our expertise, practitioners and case studies.",
  robots: { index: false, follow: true },
  openGraph: {
    title: "Page Not Found | WOY Consulting",
    description: "Return to WOY Consulting to explore our expertise, practitioners and case studies.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Page Not Found | WOY Consulting",
    description: "Return to WOY Consulting to explore our expertise, practitioners and case studies.",
  },
};

export default function NotFound() {
  return (
    <section className="relative overflow-hidden bg-sunken">
      <MarkGlyph className="pointer-events-none absolute -right-16 top-10 h-[400px] w-[400px] text-red opacity-[0.045] md:right-[8%]" />
      <div className="shell relative flex min-h-[60dvh] flex-col justify-center py-20 md:py-28">
        <p className="text-sm font-medium text-red">404 / Page not found</p>
        <h1 className="t-h2 mt-4 max-w-[18ch]">Let’s get you back on course.</h1>
        <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-ink2">
          This page may have moved, or the address may be incomplete.
          Return to the homepage to find what you need.
        </p>
        <div>
          <Link href="/" className="group mt-8 inline-flex items-center gap-2.5 rounded-[2px] bg-action px-7 py-4 font-medium text-white transition-colors hover:bg-action-hover">
            Back to home
            <ArrowRight aria-hidden="true" size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
