"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { List, X, Sun, Moon, ArrowRight } from "@phosphor-icons/react";
import { Mark } from "./Mark";
import { nav, site } from "@/lib/content";

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const [dark, setDark] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  /* border appears only once the page has moved. no scroll listener. */
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    setDark(document.documentElement.getAttribute("data-theme") === "dark");
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function toggleTheme() {
    const next = dark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    setDark(!dark);
    try {
      localStorage.setItem("woy-theme", next);
    } catch {
      /* private mode */
    }
  }

  return (
    <>
      <div ref={sentinel} aria-hidden className="absolute left-0 top-0 h-px w-px" />

      <header
        className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
          stuck ? "border-line" : "border-transparent"
        }`}
        style={{
          background: "color-mix(in srgb, var(--c-bg) 88%, transparent)",
          backdropFilter: "blur(14px) saturate(140%)",
          WebkitBackdropFilter: "blur(14px) saturate(140%)",
        }}
      >
        <div className="shell flex h-[72px] items-center gap-4 lg:gap-8">
          <Link href="/" aria-label={`${site.name}, home`} className="shrink-0 text-red">
            <Mark className="h-[42px] w-[92px]" />
          </Link>

          <nav aria-label="Primary" className="ml-auto hidden items-center gap-5 lg:flex xl:gap-7">
            {nav.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`group relative py-1.5 text-sm transition-colors ${
                    active ? "text-ink" : "text-ink2 hover:text-ink"
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute bottom-0 left-0 h-px w-full origin-left bg-red transition-transform duration-300 ${
                      active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
              className="grid h-9 w-9 place-items-center rounded-[2px] border border-line text-ink2 transition-colors hover:border-line2 hover:text-ink"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <Link
              href="/contact"
              className="hidden whitespace-nowrap rounded-[2px] bg-red px-5 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:bg-reddeep hover:shadow-[0_8px_22px_-10px_rgba(205,20,33,.65)] active:translate-y-px lg:inline-flex"
            >
              {site.cta}
            </Link>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              className="grid h-10 w-10 place-items-center text-ink lg:hidden"
            >
              {open ? <X size={24} /> : <List size={24} />}
            </button>
          </div>
        </div>

        {open && (
          <div id="mobile-nav" className="border-t border-line lg:hidden">
            <div className="shell flex flex-col pb-7 pt-2">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="border-b border-line py-3.5 text-lg text-ink"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/contact"
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-[2px] bg-red px-5 py-3.5 font-medium text-white"
              >
                {site.cta}
                <ArrowRight size={17} weight="bold" />
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
