import Link from "next/link";
import { Mark } from "./Mark";
import { CookiePreferencesButton } from "./CookieConsent";
import { nav, site } from "@/lib/content";

export function Footer() {
  return (
    <footer className="bg-block text-onblock">
      <div className="shell grid gap-10 pb-12 pt-16 md:grid-cols-2 md:pt-20">
        <div>
          <Mark className="h-14 w-[118px] text-onblock" />
          <p className="mt-6 max-w-[34ch] text-sm text-onblock2">{site.tagline}</p>
          <p className="mt-6 text-sm text-onblock2">
            Practitioner-led advisory. Established {site.established}.
          </p>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-3 self-start">
          {[...nav, { label: "FAQs", href: "/faq" }, { label: site.cta, href: "/contact" }].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="py-1 text-sm text-onblock2 transition-colors hover:text-onblock"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="shell border-t border-blockline py-5 text-sm text-onblock2">
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
          <p>&copy; {new Date().getFullYear()} {site.name}.</p>
          <p className="font-medium tracking-wide text-redb">{site.principle}</p>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
          <nav aria-label="Legal and privacy" className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/privacy-policy" className="py-2 transition-colors hover:text-onblock">Privacy policy</Link>
            <Link href="/terms-and-conditions" className="py-2 transition-colors hover:text-onblock">Terms and conditions</Link>
            <CookiePreferencesButton className="py-2 transition-colors hover:text-onblock" />
          </nav>
          <a href="https://avlysai.com/" target="_blank" rel="noopener noreferrer" className="py-2 text-onblock underline decoration-onblock2/50 underline-offset-4 transition-colors hover:decoration-onblock">
            Made by AvlysAI<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
