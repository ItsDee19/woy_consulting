"use client";

import { useEffect, useRef, useState } from "react";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type Stat = { label: string; value: string; count?: number; suffix?: string };

const STATS: Stat[] = [
  { label: "Established", value: "2015" },
  { label: "Former CEOs and CXOs", value: "10+", count: 10, suffix: "+" },
  { label: "Coaches in the consortium", value: "25+", count: 25, suffix: "+" },
  { label: "Delivery model", value: "Partner-led" },
];

/** Counts up once, when the row first comes into view. */
function Value({ stat }: { stat: Stat }) {
  const ref = useRef<HTMLElement>(null);
  /* start on the final string so the value is correct before hydration and
     for anyone who does not want motion */
  const [shown, setShown] = useState<number | null>(null);

  useEffect(() => {
    if (stat.count == null || prefersReducedMotion()) return;
    const el = ref.current;
    if (!el) return;
    setShown(0);

    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const dur = 1100;
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / dur);
          const eased = 1 - Math.pow(1 - t, 3);
          setShown(Math.round(eased * stat.count!));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [stat.count]);

  return (
    <dd
      ref={ref as React.Ref<HTMLElement>}
      className="m-0 text-[clamp(1.45rem,1.1rem+1.2vw,2.1rem)] font-normal tracking-[-0.03em] text-red"
    >
      {shown === null ? stat.value : `${shown}${stat.suffix ?? ""}`}
    </dd>
  );
}

export function Stats() {
  return (
    <dl className="m-0 grid grid-cols-2 gap-6 border-t border-line pt-8 md:grid-cols-4">
      {STATS.map((s) => (
        <div key={s.label}>
          <dt className="mb-1.5 text-sm text-ink3">{s.label}</dt>
          <Value stat={s} />
        </div>
      ))}
    </dl>
  );
}
