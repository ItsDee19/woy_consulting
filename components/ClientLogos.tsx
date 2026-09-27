import { getImageProps } from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import styles from "./ClientLogos.module.css";
import { clientLogos, type ClientLogo } from "@/lib/content";
import { experienceLogos } from "@/lib/recreation-experience-logos";

/* Full colour, no plate, no border. The band behind these is a white surface
   (see .logo-band in globals.css), which is what lets the artwork sit directly
   on the page with nothing drawn around it. */
function Plate({ logo, size = "md" }: { logo: ClientLogo; size?: "md" | "sm" }) {
  const box = size === "md" ? "h-16" : "h-12";
  // Static logo plates keep Next's responsive image optimisation without
  // hydrating an Image component for every copy in the two marquee rows.
  const { props } = getImageProps({
    src: logo.file,
    alt: `${logo.name} logo`,
    sizes: "168px",
    width: logo.w,
    height: logo.h,
    loading: "lazy",
    decoding: "async",
    className: "max-h-full w-auto object-contain",
    style: { maxWidth: "100%" },
  });
  return (
    <figure className="logo-plate group flex w-[176px] shrink-0 flex-col items-center gap-3 sm:w-[200px]">
      <div className={`flex w-full ${box} items-center justify-center px-4`}>
        {/* Optimised src/srcSet are generated on the server by getImageProps. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img {...props} alt={props.alt} />
      </div>
      <figcaption className="text-center text-xs leading-tight text-ink3 transition-colors duration-300 group-hover:text-ink2">
        {logo.name}
      </figcaption>
    </figure>
  );
}

const featuredRows = [
  ["Samsung", "Pramerica Life Insurance", "Reliance Industries", "CGI", "The Shri Ram Academy", "Boston Scientific"],
  ["Maruti Suzuki", "Siemens Financial Services", "Aditya Birla UltraTech", "American India Foundation", "Tata Management Training Centre", "Valeo"],
];

// The reference's twelve marks lead the two rows; every existing organisation
// remains in the continuous sequence after those opening positions.
const featuredNames = new Set(featuredRows.flat());
const remainingLogos = clientLogos.filter((logo) => !featuredNames.has(logo.name));
const marqueeRows = featuredRows.map((names, row) => [
  ...names.map((name) => clientLogos.find((logo) => logo.name === name)!),
  ...remainingLogos.filter((_, index) => index % 2 === row),
]);

function MarqueeLogo({ logo }: { logo: ClientLogo }) {
  const referenceName = logo.name === "Aditya Birla UltraTech" ? "UltraTech Cement" : logo.name;
  const reference = experienceLogos.find((item) => item.name === referenceName);
  const displayWidth = reference ? reference.displayWidth * 1.25 : 200;
  const { props } = getImageProps({
    src: logo.file,
    alt: logo.name,
    sizes: "(max-width: 600px) 132px, 200px",
    width: logo.w,
    height: logo.h,
    loading: "lazy",
    decoding: "async",
    className: styles.artwork,
    style: { maxWidth: `min(100%, ${displayWidth}px)` },
  });
  return (
    <li className={styles.logo}>
      {/* Optimised source sets retain the original, full-colour artwork. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img {...props} alt={props.alt} />
    </li>
  );
}

function Row({ items, direction }: { items: ClientLogo[]; direction: "l" | "r" }) {
  return (
    <div className={styles.viewport} tabIndex={0} role="group" aria-label={direction === "l" ? "First row of organisations" : "Second row of organisations"}>
      <div className={`${styles.track} ${direction === "l" ? styles.left : styles.right}`}>
        {[0, 1].map((copy) => (
          <ul key={copy} className={styles.group} aria-hidden={copy === 1}>
            {items.map((logo) => <MarqueeLogo key={logo.name} logo={logo} />)}
          </ul>
        ))}
      </div>
    </div>
  );
}

/** Two rows drifting in opposite directions. Hover or focus to hold them. */
export function ClientMarquee() {
  return (
    <section className={styles.section} data-client-marquee aria-labelledby="client-marquee-heading" aria-describedby="client-marquee-description">
      <div className={`${styles.inner} ${styles.header}`}>
        <h2 id="client-marquee-heading">Our collective<br />experience</h2>
        <p id="client-marquee-description">
          Organisations that WOY and its practitioners have supported through direct assignments and engagements delivered with partner and affiliate platforms.
        </p>
      </div>
      <div className={styles.rows}>
        <Row items={marqueeRows[0]} direction="l" />
        <Row items={marqueeRows[1]} direction="r" />
      </div>
      <div className={`${styles.inner} ${styles.footer}`}>
        <Link href="/work#collective-experience" className={styles.link}>
          View all organisations <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
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
