import Image from "next/image";
import { clientLogos, logoDisclaimer, type ClientLogo } from "@/lib/content";

/* Full colour, no plate, no border. The band behind these is a white surface
   (see .logo-band in globals.css), which is what lets the artwork sit directly
   on the page with nothing drawn around it. */
function Plate({ logo, size = "md" }: { logo: ClientLogo; size?: "md" | "sm" }) {
  const box = size === "md" ? "h-16" : "h-12";
  return (
    <figure className="logo-plate group flex w-[176px] shrink-0 flex-col items-center gap-3 sm:w-[200px]">
      <div className={`flex w-full ${box} items-center justify-center px-4`}>
        <Image
          src={logo.file}
          alt={`${logo.name} logo`}
          width={logo.w}
          height={logo.h}
          className="max-h-full w-auto object-contain"
          style={{ maxWidth: "100%" }}
        />
      </div>
      <figcaption className="text-center text-xs leading-tight text-ink3 transition-colors duration-300 group-hover:text-ink2">
        {logo.name}
      </figcaption>
    </figure>
  );
}

function Row({
  items,
  direction,
}: {
  items: ClientLogo[];
  direction: "l" | "r";
}) {
  return (
    <div className="marquee-mask overflow-hidden">
      <div className={`flex w-max gap-6 ${direction === "l" ? "marquee-l" : "marquee-r"}`}>
        {[0, 1].map((dup) => (
          <div key={dup} className="flex gap-6" aria-hidden={dup === 1}>
            {items.map((l) => (
              <Plate key={l.name + dup} logo={l} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Two rows drifting in opposite directions. Hover anywhere to hold them. */
export function ClientMarquee() {
  const half = Math.ceil(clientLogos.length / 2);
  return (
    <section className="logo-band border-y border-line py-14 md:py-20">
      <div className="shell">
        <p className="mb-9 text-sm text-ink3">Brands supported by WOY</p>
      </div>

      <div className="marquee-wrap flex flex-col gap-8">
        <Row items={clientLogos.slice(0, half)} direction="l" />
        <Row items={clientLogos.slice(half)} direction="r" />
      </div>

      <div className="shell">
        <p className="mt-10 max-w-[62ch] text-sm text-ink3">{logoDisclaimer}</p>
      </div>
    </section>
  );
}

/** The full wall, every brand visible at once. */
export function ClientGrid() {
  return (
    <ul
      role="list"
      className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5"
    >
      {clientLogos.map((l) => (
        <li key={l.name} className="flex justify-center">
          <Plate logo={l} size="sm" />
        </li>
      ))}
    </ul>
  );
}
