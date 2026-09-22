"use client";

import { useEffect, useRef, useState } from "react";
import { MARK, SOURCE_SYMBOLS } from "./mark-geometry";

// The reference symbols are an introduction to the mark, not replacement artwork.
// The ring, spokes and north marker retain the shared MARK geometry.
// Animation-only letter coordinates preserve their widths and 4-unit strokes.
// Their square caps and miter tips align to the ring's painted y=58..130 bounds;
// scaling a group would also compress the stroke and leave the W tips too tall.
const formationLetters = {
  w: "M70.4 60.474 L88.4 123.166 L106.4 67.802 L124.4 123.166 L142.4 60.474",
  yFork: "M217.3 60.808 L243.7 94.5 L270.1 60.808",
  yStem: "M243.7 94.5 L243.7 128",
} as const;
const { starOutline, compassPoints } = SOURCE_SYMBOLS;
const dialTicks = Array.from({ length: 48 }, (_, index) => index * 7.5);

/** A synchronized 12-second sequence: reveal, converge, resolve, hold, reset. */
export function LogoFormation({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let inView = true;
    const update = () => setPaused(!inView || document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    }, { rootMargin: "140px" });
    observer.observe(element);
    document.addEventListener("visibilitychange", update);
    update();
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden="true" data-logo-formation className={`logo-formation relative ${paused ? "is-paused" : ""} ${className}`} style={{ aspectRatio: "230 / 150" }}>
      <svg viewBox={MARK.viewBox} className="relative h-full w-full overflow-hidden" focusable="false">
        <defs>
          <linearGradient id="woy-sheen" gradientUnits="userSpaceOnUse" x1="70" y1="44" x2="272" y2="160">
            <stop offset="0%" stopColor="var(--c-logo-red)" />
            <stop offset="55%" stopColor="var(--c-logo-accent)" />
            <stop offset="100%" stopColor="var(--c-logo-red)" />
          </linearGradient>
        </defs>

        <g className="mk-guides" fill="none" stroke="var(--c-logo-red)">
          <path d="M77 94h206" strokeWidth=".35" strokeDasharray="1 3" />
          <path d="M78 64v-6h6M78 124v6h6M277 64v-6h-6M277 124v6h-6" strokeWidth=".65" />
          <circle cx={MARK.cx} cy={MARK.cy} r="46" strokeWidth=".45" strokeDasharray="1 4" />
          <path className="mk-orbit" d="M134 94a46 46 0 0 1 46-46M226 94a46 46 0 0 1-46 46" strokeWidth=".9" />
        </g>
        <g className="mk-convergence" fill="none" stroke="var(--c-logo-accent)" strokeWidth=".65">
          <path d="M104 94h68m16 0h68" pathLength="1" />
          <circle cx={MARK.cx} cy={MARK.cy} r="3" />
        </g>
        <circle className="mk-lock-pulse" cx={MARK.cx} cy={MARK.cy} r="38" fill="none" stroke="var(--c-logo-accent)" strokeWidth=".8" />

        {/* Circle: enters from the left and becomes the finished logo ring. */}
        <circle className="mk-ring" cx={MARK.cx} cy={MARK.cy} r={MARK.r} pathLength="1" fill="none" stroke="url(#woy-sheen)" strokeWidth={MARK.ringStroke} strokeLinecap="square" />

        {/* The outlined star resolves into WOY's original five internal spokes. */}
        <g className="mk-star" fill="none" stroke="url(#woy-sheen)" strokeLinejoin="round">
          <path className="mk-star-outline" d={starOutline} pathLength="1" strokeWidth="3.1" />
          <g className="mk-star-core" strokeWidth={MARK.spokeStroke} strokeLinecap="square" strokeLinejoin="miter">
            {MARK.spokes.map(d => <path key={d} d={d} pathLength="1" />)}
          </g>
        </g>

        {/* The compass travels as one symbol; its dial dissolves at convergence. */}
        <g className="mk-compass">
          <g className="mk-compass-detail" fill="none" stroke="var(--c-logo-red)">
            <circle cx={MARK.cx} cy={MARK.cy} r="34" strokeWidth="1.25" />
            <circle cx={MARK.cx} cy={MARK.cy} r="40" strokeWidth=".65" />
            {dialTicks.map((angle, index) => <path key={angle} d={`M180 ${index % 4 === 0 ? 53 : 55}v${index % 4 === 0 ? 5 : 2.5}`} transform={`rotate(${angle} 180 94)`} strokeWidth={index % 4 === 0 ? .85 : .5} />)}
            <g className="mk-compass-rose" strokeWidth=".9">
              <path d={compassPoints} fill="var(--c-logo-red)" fillOpacity=".08" />
              <path d="M180 63v62M149 94h62M160.2 74.2l39.6 39.6m-39.6 0 39.6-39.6" strokeWidth=".55" />
              <path d="M180 63v31l5-12Z M211 94h-31l12 5Z M180 125V94l-5 12Z M149 94h31l-12-5Z" fill="var(--c-logo-red)" stroke="none" />
              <circle cx={MARK.cx} cy={MARK.cy} r="3" fill="var(--c-bg)" />
            </g>
            <g className="mk-cardinals" fill="var(--c-logo-red)" stroke="none" textAnchor="middle">
              <text x="180" y="45">N</text><text x="230" y="96.5">E</text><text x="180" y="149">S</text><text x="130" y="96.5">W</text>
            </g>
          </g>
          <path className="mk-needle" d={MARK.needle} fill="var(--c-logo-red)" />
        </g>

        <g className="mk-letters" fill="none" stroke="url(#woy-sheen)" strokeWidth={MARK.ringStroke} strokeLinecap="square" strokeLinejoin="miter">
          <path data-logo-letter="w" d={formationLetters.w} pathLength="1" />
          <path data-logo-letter="y" d={formationLetters.yFork} pathLength="1" />
          <path data-logo-letter="y" d={formationLetters.yStem} pathLength="1" />
        </g>
        <text className="mk-consulting" x={MARK.wordX} y={MARK.wordY - 2} textAnchor="middle" fill="var(--c-logo-red)">CONSULTING</text>
      </svg>
    </div>
  );
}
