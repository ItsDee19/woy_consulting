import Link from "next/link";
import { PageTopLink } from "./PageTopLink";
import { ArrowUpRight, ArrowUp } from "@phosphor-icons/react/dist/ssr";
import { Mark } from "./Mark";
import { DunsRegistration } from "./DunsRegistration";
import { CookiePreferencesButton } from "./CookieConsent";
import { site } from "@/lib/content";
import styles from "./Footer.module.css";

const explore = [
  { label: "Expertise", href: "/expertise" },
  { label: "Selected work", href: "/work" },
  { label: "Leadership & Partners", href: "/people" },
  { label: "Our approach", href: "/approach" },
];

export function Footer() {
  return (
    <footer id="footer" className={styles.footer} aria-label="WOY Consulting footer">
      <div className="shell">
        <div className={styles.invitation}>
          <div className={styles.headline}>
            <p className={styles.eyebrow}>What comes next?</p>
            <h2>A clearer direction.<br />A conversation to begin.</h2>
          </div>
          <div className={styles.contactAction}>
            <PageTopLink href={`${site.ctaHref}#top`} className={styles.cta}>
              <span>{site.cta}</span><ArrowUpRight size={23} weight="regular" aria-hidden="true" />
            </PageTopLink>
            <a href={`mailto:${site.email}`} className={styles.email}>{site.email}</a>
          </div>
        </div>

        <div className={styles.directory}>
          <div className={styles.identity}>
            <PageTopLink href="/#top" aria-label="WOY Consulting home" className={styles.brandLink}><Mark className={styles.brand} /></PageTopLink>
            <p className={styles.principle}>{site.principle}<span aria-hidden="true">.</span></p>
            <address className={styles.address}>
              <p className={styles.legalName}>{site.legalName}</p>
              <p>{site.location}</p>
            </address>
          </div>
          <nav aria-label="Footer" className={styles.navigation}>
            <div><p className={styles.directoryLabel}>Explore</p><ul>{explore.map(item => (
              <li key={item.href}><Link href={item.href}>{item.label}</Link></li>
            ))}</ul></div>
          </nav>
          <DunsRegistration />
        </div>

        <div className={styles.bottom}>
          <nav aria-label="Legal and privacy" className={styles.legal}>
            <Link href="/privacy-policy">Privacy Policy</Link>
            <CookiePreferencesButton />
          </nav>
          <a href="#main" className={styles.backToTop}>Back to top <ArrowUp size={15} aria-hidden="true" /></a>
          <p className={styles.copyright}>&copy; {new Date().getFullYear()} {site.name}.</p>
          <p className={styles.credit}>Made by AvlysAI</p>
        </div>
      </div>
    </footer>
  );
}
