"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/**
 * Enter-on-scroll, built on IntersectionObserver and a CSS transition.
 *
 * Deliberately not using an animation library: the sequence only communicates
 * reading order, and a dependency that can silently leave content at opacity 0
 * is not worth that.
 *
 * Three safeguards, because the failure mode here is invisible content:
 *   1. The hidden state is scoped to [data-js] in globals.css, so if scripting
 *      never runs the content renders visible.
 *   2. Anything already inside the viewport at mount is shown immediately
 *      rather than waiting on an observer callback, which can be deferred
 *      while the tab is not painting.
 *   3. A timer backstops the observer for anything still hidden.
 */
export function Reveal({
  children,
  delay = 0,
  y = 16,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const show = () => { el.classList.remove("is-ready"); el.classList.add("is-in"); };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      show();
      return;
    }

    // Content starts visible. The observer supplies layout measurements in a
    // batch, avoiding a synchronous layout read for every revealed section.
    const io = new IntersectionObserver(
      ([entry], obs) => {
        const rect = entry.boundingClientRect;
        if (entry.isIntersecting || (rect.top < window.innerHeight && rect.bottom > 0)) {
          show();
          obs.disconnect();
        } else {
          el.classList.add("is-ready");
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    io.observe(el);

    /* backstop, in case the callback never arrives */
    const failsafe = window.setTimeout(() => {
      show();
      io.disconnect();
    }, 2500);

    return () => {
      io.disconnect();
      window.clearTimeout(failsafe);
    };
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal ${className}`}
      style={
        {
          "--rd": `${Math.round(delay * 1000)}ms`,
          "--ry": `${y}px`,
        } as React.CSSProperties
      }
    >
      {children}
    </Tag>
  );
}
