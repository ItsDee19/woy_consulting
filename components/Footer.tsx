import Link from "next/link";
import { Mark } from "./Mark";
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
          {[...nav, { label: site.cta, href: "/contact" }].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-onblock2 transition-colors hover:text-redb"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="shell flex flex-wrap items-center justify-between gap-3 border-t border-blockline py-5 text-sm text-ink3">
        <p>
          &copy; {new Date().getFullYear()} {site.name}.
        </p>
        <p className="font-medium tracking-wide text-redb">{site.principle}</p>
      </div>
    </footer>
  );
}
