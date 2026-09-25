"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Moon, Sun } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { hasPreferenceConsent } from "@/lib/cookie-consent";
import { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetDescription, SheetClose } from "@/components/recreation/ui/sheet";
import { Button } from "@/components/recreation/ui/button";
import controls from "./NavControls.module.css";
import { Logo } from "@/components/recreation/Site";

const links = [
  ["/", "Home"],
  ["/expertise", "Expertise"],
  ["/work", "Selected work"],
  ["/people", "Leadership & Partners"],
  ["/approach", "Our approach"],
];

function subscribeTheme(callback: () => void) {
  window.addEventListener("woy-theme-changed", callback);
  return () => window.removeEventListener("woy-theme-changed", callback);
}

export function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const dark = useSyncExternalStore(
    subscribeTheme,
    () => document.documentElement.getAttribute("data-theme") === "dark",
    () => false,
  );
  const isActive = (href: string) => href === "/" ? path === "/" : path.startsWith(href);

  function toggleTheme() {
    const next = dark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    window.dispatchEvent(new Event("woy-theme-changed"));
    try {
      if (hasPreferenceConsent()) localStorage.setItem("woy-theme", next);
    } catch {
      // The toggle works even when browser storage is unavailable.
    }
  }
  return (
    <div className={`recreation ${controls.shell}`}>
      <header className="header-shell">
        <div className="wrap">
          <div className={`site-header ${controls.header}`}>
            <Link href="/" aria-label="WOY Consulting home"><Logo /></Link>
            <nav className={`desktop-nav ${controls.navigation}`} aria-label="Main navigation">
              {links.map(([href, label]) => (
                <Link href={href} key={href} aria-current={isActive(href) ? "page" : undefined}>{label}</Link>
              ))}
              <Link className={`nav-cta ${controls.cta}`} href="/contact" aria-current={path === "/contact" ? "page" : undefined}>
                Let’s talk <span aria-hidden="true">↗</span>
              </Link>
            </nav>
            <div className={controls.controls}>
              <button type="button" className={controls.toggle} onClick={toggleTheme}
                aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
                title={dark ? "Switch to light theme" : "Switch to dark theme"}>
                {dark ? <Sun size={19} aria-hidden="true" /> : <Moon size={19} aria-hidden="true" />}
              </button>
              <div className="mobile-nav">
                <Sheet open={open} onOpenChange={setOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" className="menu-button" aria-label="Open navigation menu">
                      <Menu size={24} /><span>Menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent className={`mobile-sheet ${controls.mobileSheet}`} aria-describedby="navigation-description">
                    <SheetTitle className="sr-only">WOY navigation</SheetTitle>
                    <SheetDescription id="navigation-description" className="sr-only">Explore WOY Consulting.</SheetDescription>
                    <Logo />
                    <nav aria-label="Mobile navigation">
                      {links.map(([href, label]) => (
                        <SheetClose asChild key={href}>
                          <Link href={href} aria-current={isActive(href) ? "page" : undefined}>{label}</Link>
                        </SheetClose>
                      ))}
                      <SheetClose asChild><Link className={`red ${controls.mobileCta}`} href="/contact">Let’s talk ↗</Link></SheetClose>
                    </nav>
                    <p className="eyebrow muted">Win Over Yourself.</p>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
