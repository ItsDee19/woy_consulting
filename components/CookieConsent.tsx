"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  COOKIE_PREFERENCES_EVENT,
  COOKIE_PREFERENCES_KEY,
  readCookiePreferences,
  type CookiePreferences,
} from "@/lib/cookie-consent";

const OPEN_EVENT = "woy-open-cookie-preferences";
const OPEN_ATTRIBUTE = "data-woy-cookie-preferences-open";
const TRIGGER_ATTRIBUTE = "data-woy-cookie-preferences-trigger";

export function CookiePreferencesButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      className={`cursor-pointer text-left ${className}`}
      onClick={(event) => {
        // Footer and banner can hydrate independently. Keep the request in the
        // document until the banner consumes it, even if its listener is not ready.
        document.querySelector(`[${TRIGGER_ATTRIBUTE}]`)?.removeAttribute(TRIGGER_ATTRIBUTE);
        event.currentTarget.setAttribute(TRIGGER_ATTRIBUTE, "");
        document.documentElement.setAttribute(OPEN_ATTRIBUTE, "");
        window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: event.currentTarget }));
      }}
    >
      Cookie preferences
    </button>
  );
}

/** No analytics or marketing code is loaded. The only optional storage is theme memory. */
export function CookieConsent() {
  // Render the first-visit choice with the page instead of waiting for hydration.
  // The boot script hides it before paint when a valid choice already exists.
  const [visible, setVisible] = useState(true);
  const [preferences, setPreferences] = useState(false);
  const [reopened, setReopened] = useState(false);
  const [bannerHeight, setBannerHeight] = useState(0);
  const [notice, setNotice] = useState("");
  const banner = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let readFrame = 0;
    const open = (event?: Event) => {
      // An explicit open wins over the scheduled initial storage read.
      window.cancelAnimationFrame(readFrame);
      const pendingTrigger = document.querySelector<HTMLElement>(`[${TRIGGER_ATTRIBUTE}]`);
      returnFocus.current = (event as CustomEvent<HTMLElement> | undefined)?.detail ?? pendingTrigger;
      document.documentElement.removeAttribute(OPEN_ATTRIBUTE);
      pendingTrigger?.removeAttribute(TRIGGER_ATTRIBUTE);
      document.documentElement.removeAttribute("data-cookie-choice");
      setPreferences(readCookiePreferences()?.preferences ?? false);
      setReopened(true);
      setVisible(true);
    };
    // Read the external browser store after hydration, with cleanup for Strict Mode.
    readFrame = window.requestAnimationFrame(() => {
      if (document.documentElement.hasAttribute(OPEN_ATTRIBUTE)) {
        open();
        return;
      }
      const saved = readCookiePreferences();
      setPreferences(saved?.preferences ?? false);
      setVisible(saved === null);
    });
    const sync = (event: StorageEvent) => {
      if (event.key !== COOKIE_PREFERENCES_KEY && event.key !== null) return;
      const current = readCookiePreferences();
      if (!current) document.documentElement.removeAttribute("data-cookie-choice");
      setPreferences(current?.preferences ?? false);
      setVisible(current === null);
    };
    window.addEventListener(OPEN_EVENT, open);
    window.addEventListener("storage", sync);
    return () => {
      window.cancelAnimationFrame(readFrame);
      window.removeEventListener(OPEN_EVENT, open);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    if (!visible || !banner.current) return;
    const element = banner.current;
    const documentStyle = document.documentElement.style;
    const previousPadding = documentStyle.scrollPaddingBottom;
    const measure = () => {
      const height = Math.ceil(element.getBoundingClientRect().height);
      setBannerHeight(height);
      documentStyle.scrollPaddingBottom = `${height + 16}px`;
    };
    const measureFrame = window.requestAnimationFrame(measure);
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    const keepFocusVisible = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement) || element.contains(target)) return;
      if (target.getBoundingClientRect().bottom > element.getBoundingClientRect().top) {
        window.scrollBy({ top: target.getBoundingClientRect().bottom - element.getBoundingClientRect().top + 16, behavior: "instant" });
      }
    };
    document.addEventListener("focusin", keepFocusVisible);
    if (reopened) heading.current?.focus({ preventScroll: true });
    return () => {
      window.cancelAnimationFrame(measureFrame);
      observer.disconnect();
      document.removeEventListener("focusin", keepFocusVisible);
      documentStyle.scrollPaddingBottom = previousPadding;
    };
  }, [visible, reopened]);

  function close() {
    setVisible(false);
    returnFocus.current?.focus({ preventScroll: true });
    returnFocus.current = null;
  }

  function save(allowPreferences: boolean) {
    const choice: CookiePreferences = {
      version: 1,
      preferences: allowPreferences,
      updatedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(choice));
      if (allowPreferences) {
        const theme = document.documentElement.getAttribute("data-theme");
        if (theme === "light" || theme === "dark") localStorage.setItem("woy-theme", theme);
      } else {
        localStorage.removeItem("woy-theme");
      }
      setNotice(allowPreferences ? "Preferences saved. Theme memory is on." : "Preferences saved. Only essential storage is enabled.");
    } catch {
      // A partial write must not leave a new consent record behind. Storage may
      // itself be unavailable, so attempt each removal independently.
      for (const key of [COOKIE_PREFERENCES_KEY, "woy-theme"]) {
        try { localStorage.removeItem(key); } catch { /* Browser storage remains unavailable. */ }
      }
      setNotice("Your browser could not fully save your choice; you may see this notice again.");
    }
    window.dispatchEvent(new CustomEvent(COOKIE_PREFERENCES_EVENT, { detail: readCookiePreferences() }));
    close();
  }

  return (
    <>
      <p role="status" className="sr-only">{notice}</p>
      {visible && (
        <>
          {/* Space at the end of the document keeps the footer reachable above this non-modal banner. */}
          <div aria-hidden="true" style={{ height: bannerHeight }} />
          <aside
            id="cookie-preferences"
            ref={banner}
            aria-labelledby="cookie-preferences-title"
            className="fixed inset-x-0 bottom-0 z-[60] max-h-[60dvh] overflow-y-auto border-t border-line2 bg-raised pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_40px_-20px_rgba(0,0,0,.3)]"
            onKeyDown={(event) => {
              if (event.key === "Escape" && reopened) close();
            }}
          >
            <div className="shell grid gap-5 py-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-10">
              <div>
                <h2 id="cookie-preferences-title" ref={heading} tabIndex={-1} className="text-lg font-medium">
                  Your cookie preferences
                </h2>
                <p className="mt-2 max-w-[76ch] text-sm leading-relaxed text-ink2">
                  We use essential storage to remember this choice and protect the contact form.
                  There are no analytics or advertising cookies. You can choose whether we remember your theme on this device.{" "}
                  <Link href="/privacy-policy#cookies" className="font-medium text-ink underline decoration-line2 underline-offset-4 hover:decoration-ink">
                    Read our privacy policy
                  </Link>.
                </p>
                <label className="mt-3 flex w-fit cursor-pointer items-center gap-3 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={preferences}
                    onChange={(event) => setPreferences(event.target.checked)}
                    className="h-5 w-5 shrink-0 cursor-pointer accent-[var(--c-action)]"
                  />
                  Remember my light or dark theme
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[340px]">
                <button
                  type="button"
                  onClick={() => save(false)}
                  className="min-h-11 cursor-pointer rounded-[2px] border border-control px-5 py-3 text-sm font-medium text-ink transition-colors hover:bg-sunken active:bg-sunken"
                >
                  Essential only
                </button>
                <button
                  type="button"
                  onClick={() => save(preferences)}
                  className="min-h-11 cursor-pointer rounded-[2px] border border-control px-5 py-3 text-sm font-medium text-ink transition-colors hover:bg-sunken active:bg-sunken"
                >
                  Save preferences
                </button>
                {reopened && (
                  <button
                    type="button"
                    onClick={close}
                    className="min-h-11 cursor-pointer text-sm text-ink2 underline underline-offset-4 hover:text-ink sm:col-span-2"
                  >
                    Close without changing
                  </button>
                )}
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
