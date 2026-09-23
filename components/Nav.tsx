"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { List, X, Sun, Moon, ArrowUpRight } from "@phosphor-icons/react";
import { Mark } from "./Mark";
import styles from "./Nav.module.css";
import { nav, site } from "@/lib/content";
import { hasPreferenceConsent } from "@/lib/cookie-consent";

function subscribeTheme(callback: () => void) {
  window.addEventListener("woy-theme-changed", callback);
  return () => window.removeEventListener("woy-theme-changed", callback);
}


export function Nav() {
  const pathname = usePathname();
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const open = menuPath === pathname;
  const menuButton = useRef<HTMLButtonElement>(null);
  const [stuck, setStuck] = useState(false);
  const dark = useSyncExternalStore(subscribeTheme, () => document.documentElement.getAttribute("data-theme") === "dark", () => false);
  const sentinel = useRef<HTMLDivElement>(null);

  /* Add a full-width separator after the page moves, without a scroll listener. */
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);


  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setMenuPath(null);
        menuButton.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function toggleTheme() {
    const next = dark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    window.dispatchEvent(new Event("woy-theme-changed"));
    try {
      if (hasPreferenceConsent()) localStorage.setItem("woy-theme", next);
    } catch {
      /* private mode */
    }
  }

  return (
    <>
      <div ref={sentinel} aria-hidden className="absolute left-0 top-0 h-px w-px" />

      <header className={styles.header} data-stuck={stuck || undefined}>
        <div className={`shell ${styles.bar}`}>
          <Link href="/" aria-label={`${site.name}, home`} className={styles.brandLink}>
            <Mark className={styles.brand} />
          </Link>

          <nav aria-label="Primary" className={styles.primary}>
            {nav.map((item) => {
              const active =
                !item.href.includes("#") &&
                (pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href + "/")));
              return (
                <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={styles.navLink}>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className={styles.actions}>
            <a href={site.ctaHref} className={styles.conversation}>
              <span>Let&#8217;s talk</span><ArrowUpRight size={18} aria-hidden="true" />
            </a>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
              title={dark ? "Switch to light theme" : "Switch to dark theme"}
              className={styles.themeButton}
            >
              {dark ? <Sun size={19} aria-hidden="true" /> : <Moon size={19} aria-hidden="true" />}
            </button>
            <button
              type="button"
              ref={menuButton}
              onClick={() => setMenuPath(open ? null : pathname)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              className={styles.menuButton}
            >
              {open ? <X size={23} aria-hidden="true" /> : <List size={23} aria-hidden="true" />}
            </button>
          </div>
        </div>

        {open && (
          <nav id="mobile-nav" aria-label="Mobile" className={styles.mobile}>
            <div className={`shell ${styles.mobileInner}`}>
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuPath(null)}
                  aria-current={pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href + "/")) ? "page" : undefined}
                  className={styles.mobileLink}
                >
                  {item.label}<ArrowUpRight size={18} aria-hidden="true" />
                </Link>
              ))}
              <a href={site.ctaHref} onClick={() => setMenuPath(null)} className={styles.mobileConversation}>
                Let&#8217;s talk<ArrowUpRight size={19} aria-hidden="true" />
              </a>
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
