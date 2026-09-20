"use client";

import { useEffect, useRef, useState } from "react";
import { MARK } from "./mark-geometry";
import { symbols } from "@/lib/content";

type Part = (typeof symbols)[number]["key"];

/**
 * The logo story. Hovering or scrolling through a symbol isolates that part of
 * the mark, so the explanation and the artwork stay locked together.
 */
export function PhilosophyMark() {
  const [focus, setFocus] = useState<Part>("ring");
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const els = itemRefs.current.filter(Boolean) as HTMLLIElement[];
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const key = e.target.getAttribute("data-part") as Part;
            if (key) setFocus(key);
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const dim = (part: Part) =>
    focus === part ? "opacity-100" : "opacity-15";

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[0.85fr_1fr] lg:gap-20">
      <div className="flex flex-col items-center text-center lg:sticky lg:top-28 lg:items-start lg:text-left">
        <svg
          viewBox={MARK.markViewBox}
          aria-hidden
          className="w-[200px] overflow-visible lg:w-[320px]"
        >
          <circle
            cx={MARK.cx}
            cy={MARK.cy}
            r={MARK.r}
            fill="none"
            stroke="var(--c-red)"
            strokeWidth={focus === "ring" ? 5 : 4}
            className={`transition-all duration-500 ${dim("ring")}`}
          />
          <g
            fill="none"
            stroke="var(--c-red)"
            strokeWidth={focus === "star" ? 4.4 : 3.4}
            className={`transition-all duration-500 ${dim("star")}`}
          >
            {MARK.spokes.map((d) => (
              <path key={d} d={d} />
            ))}
          </g>
          <path
            d={MARK.needle}
            fill="var(--c-red)"
            className={`transition-opacity duration-500 ${dim("needle")}`}
          />
        </svg>

        <p className="mt-8 max-w-[36ch] font-light text-ink2">
          Our guiding principle is{" "}
          <strong className="font-medium text-ink">Win Over Yourself</strong>. The
          mark holds the three qualities that principle asks of a leader.
        </p>
      </div>

      <ol role="list" className="grid">
        {symbols.map((s, i) => (
          <li
            key={s.key}
            data-part={s.key}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            onMouseEnter={() => setFocus(s.key)}
            onFocus={() => setFocus(s.key)}
            tabIndex={0}
            className={`border-t border-line py-7 transition-colors duration-300 last:border-b md:py-9 ${
              focus === s.key ? "border-t-red" : "border-t-line"
            }`}
          >
            <h3 className="t-h3">{s.name}</h3>
            <p className="mt-2 text-sm font-medium text-red">{s.lede}</p>
            <p className="mt-4 max-w-[52ch] font-light leading-relaxed text-ink2">
              {s.body}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
