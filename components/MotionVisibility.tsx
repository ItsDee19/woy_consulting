"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Pause CSS motion outside the viewport without hydrating the server artwork. */
export function MotionVisibility({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let inView = false;
    const update = () => element.toggleAttribute("data-motion-paused", !inView || document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    }, { rootMargin: "140px" });

    update();
    observer.observe(element);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  return <div ref={ref} className={className}>{children}</div>;
}
