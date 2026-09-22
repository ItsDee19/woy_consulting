import Link from "next/link";
import { ArrowUpRight, ArrowUp } from "@phosphor-icons/react/dist/ssr";
import { Mark } from "./Mark";
import { DunsRegistration } from "./DunsRegistration";
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
    <footer id="footer" className={styles.footer} aria-label="WOY Consulting footer">
      <div className="shell">
        <div className={styles.invitation}>
          <div className={styles.headline}>
            <p className={styles.eyebrow}>What comes next?</p>
            <h2>A clearer direction.<br /><em>Let’s begin.</em></h2>
          </div>
          <div className={styles.contactAction}>
            <a href={site.ctaHref} className={styles.cta}>
              <span>{site.cta}</span><ArrowUpRight size={23} weight="regular" aria-hidden="true" />
            </a>
            <a href={site.ctaHref} className={styles.email}>{site.email}</a>
          </div>
        </div>

        <div className={styles.directory}>
          <div className={styles.identity}>
            <Link href="/" aria-label="WOY Consulting home" className={styles.brandLink}><Mark className={styles.brand} /></Link>
            <p className={styles.principle}>{site.principle}<span aria-hidden="true">.</span></p>
            <address className={styles.address}>
              <p className={styles.legalName}>{site.legalName}</p>
              <p>{site.location}</p>
            </address>
          </div>
          <nav aria-label="Footer" className={styles.navigation}>
            <div><p className={styles.directoryLabel}>Explore</p><ul>{explore.map(item => <li key={item.href}><Link href={item.href}>{item.label}</Link></li>)}</ul></div>
            <div><p className={styles.directoryLabel}>WOY Consulting</p><ul>{company.map(item => <li key={item.href}><Link href={item.href}>{item.label}</Link></li>)}</ul></div>
          </nav>
          <DunsRegistration />
        </div>

        <div className={styles.bottom}>
          <nav aria-label="Legal and privacy" className={styles.legal}>
            <Link href="/privacy-policy">Privacy policy</Link>
            <Link href="/terms-and-conditions">Terms and conditions</Link>
            <CookiePreferencesButton />
          </nav>
          <a href="#main" className={styles.backToTop}>Back to top <ArrowUp size={15} aria-hidden="true" /></a>
          <p className={styles.copyright}>&copy; {new Date().getFullYear()} {site.name}.</p>
          <a href="https://avlysai.com/" target="_blank" rel="noopener noreferrer" className={styles.credit}>Made by AvlysAI<ArrowUpRight size={14} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>
        </div>
      </div>
    </footer>
  );
}
