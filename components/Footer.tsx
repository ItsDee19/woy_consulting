import Link from "next/link";
import { ArrowUpRight, ArrowUp } from "@phosphor-icons/react/dist/ssr";
import { Mark, MarkGlyph } from "./Mark";
import { CookiePreferencesButton } from "./CookieConsent";
import { site } from "@/lib/content";
import styles from "./Footer.module.css";

const explore = [
  { label: "Home", href: "/" },
  { label: "Expertise", href: "/#expertise" },
  { label: "Approach", href: "/approach" },
  { label: "Case Studies", href: "/case-studies" },
];
const company = [
  { label: "About", href: "/about" },
  { label: "Practitioners", href: "/practitioners" },
  { label: "FAQs", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export function Footer() {
  return (
    <footer className={styles.footer} aria-label="WOY Consulting footer">
      <div className="shell">
        <div className={styles.invitation}>
          <div className={styles.artwork} aria-hidden="true">
            <svg className={styles.orbits} viewBox="0 0 440 440" fill="none">
              <circle cx="220" cy="220" r="184" />
              <circle cx="220" cy="220" r="155" />
              <path d="M220 16v24m0 360v24M16 220h24m360 0h24M80 80l17 17m246 246 17 17M80 360l17-17M343 97l17-17" />
              <path className={styles.arc} d="M220 36a184 184 0 0 1 184 184" />
              <path className={styles.axis} d="M220 61v318M61 220h318" />
            </svg>
            <MarkGlyph className={styles.compass} />
          </div>
          <div className={styles.headline}>
            <p className={styles.eyebrow}>What comes next?</p>
            <h2>A clearer direction.<br /><span>A conversation<br className={styles.mobileBreak} /> to begin.</span></h2>
          </div>
          <div className={styles.contactAction}>
            <a href={site.ctaHref} className={styles.cta}>
              <span>{site.cta}</span><ArrowUpRight size={23} weight="regular" aria-hidden="true" />
            </a>
            <a href={site.ctaHref} className={styles.email}>{site.email}</a>
            <p>A direct line to WOY.</p>
          </div>
        </div>

        <div className={styles.directory}>
          <div className={styles.identity}>
            <Link href="/" aria-label="WOY Consulting home" className={styles.brandLink}><Mark className={styles.brand} /></Link>
            <p className={styles.principle}>{site.principle}<span aria-hidden="true">.</span></p>
            <p className={styles.descriptor}>Practitioner-led advisory.<br />Established {site.established}.</p>
          </div>
          <address className={styles.address}>
            <p className={styles.directoryLabel}>Find us</p>
            <p className={styles.legalName}>{site.legalName}</p>
            <p>{site.location}</p>
            <Link href="/contact" className={styles.contactLink}>More ways to connect <ArrowUpRight size={15} aria-hidden="true" /></Link>
          </address>
          <nav aria-label="Footer" className={styles.navigation}>
            <div><p className={styles.directoryLabel}>Explore</p><ul>{explore.map(item => <li key={item.href}><Link href={item.href}>{item.label}</Link></li>)}</ul></div>
            <div><p className={styles.directoryLabel}>WOY Consulting</p><ul>{company.map(item => <li key={item.href}><Link href={item.href}>{item.label}</Link></li>)}</ul></div>
          </nav>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>&copy; {new Date().getFullYear()} {site.name}.</p>
          <nav aria-label="Legal and privacy" className={styles.legal}>
            <Link href="/privacy-policy">Privacy policy</Link>
            <Link href="/terms-and-conditions">Terms and conditions</Link>
            <CookiePreferencesButton />
          </nav>
          <a href="https://avlysai.com/" target="_blank" rel="noopener noreferrer" className={styles.credit}>Made by AvlysAI<ArrowUpRight size={14} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>
          <a href="#main" className={styles.backToTop}>Back to top <ArrowUp size={15} aria-hidden="true" /></a>
        </div>
      </div>
    </footer>
  );
}
