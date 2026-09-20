"use client";

import { useEffect, useRef, useState } from "react";
import { MARK } from "./mark-geometry";

/**
 * The hero mark, assembling itself on an 11 second loop.
 *
 * Story: the circle, the five-point star and the compass draw in separately,
 * converge into the single mark, then the W and Y complete the wordmark before
 * the whole thing releases and repeats. Auto-loops, no replay control.
 *
 * The timeline lives in globals.css so every part shares one duration and can
 * never drift out of sync.
 */
export function LogoFormation({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  /* Stop the loop once it scrolls away so it costs nothing for the rest of
     the page. */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(
      ([entry]) => setPaused(!entry.isIntersecting),
      { rootMargin: "140px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`relative ${paused ? "is-paused" : ""} ${className}`}
      style={{ aspectRatio: "230 / 150" }}
    >
      {/* soft brand halo so the mark is not floating on a flat field */}
      <div
        className="pointer-events-none absolute -inset-x-[6%] -inset-y-[12%]"
        style={{
          background:
            "radial-gradient(60% 55% at 50% 47%, color-mix(in srgb, var(--c-red) 12%, transparent), transparent 72%)",
        }}
      />

      <svg
        viewBox={MARK.viewBox}
        className="relative h-full w-full overflow-visible"
      >
        <defs>
          {/*
            userSpaceOnUse is required. With the default objectBoundingBox
            units, any stroke whose bounding box has zero width or height
            (the vertical spoke, both horizontal spokes, the Y stem) is not
            rendered at all per the SVG spec. Anchoring to the view box also
            gives one continuous sheen across the whole lockup.
          */}
          <linearGradient
            id="woy-sheen"
            gradientUnits="userSpaceOnUse"
            x1="70"
            y1="44"
            x2="272"
            y2="160"
          >
            <stop offset="0%" stopColor="var(--c-red)" />
            <stop offset="55%" stopColor="var(--c-redb)" />
            <stop offset="100%" stopColor="var(--c-red)" />
          </linearGradient>
        </defs>

        {/* slow compass sweep underneath everything */}
        <g className="mk-bezel">
          <circle
            cx={MARK.cx}
            cy={MARK.cy}
            r={47}
            fill="none"
            stroke="var(--c-red)"
            strokeWidth={1}
            strokeDasharray="0.6 5.2"
            strokeLinecap="round"
          />
          <circle
            cx={MARK.cx}
            cy={MARK.cy}
            r={53.5}
            fill="none"
            stroke="var(--c-red)"
            strokeWidth={0.6}
            strokeDasharray="1.4 12"
          />
        </g>

        {/* 1 :: circle, holistic growth and unified vision */}
        <circle
          className="mk-ring"
          cx={MARK.cx}
          cy={MARK.cy}
          r={MARK.r}
          pathLength={1}
          fill="none"
          stroke="url(#woy-sheen)"
          strokeWidth={MARK.ringStroke}
        />

        {/* 2 :: five-point star, excellence and competitive advantage */}
        <g
          className="mk-star"
          fill="none"
          stroke="url(#woy-sheen)"
          strokeWidth={MARK.spokeStroke}
        >
          {MARK.spokes.map((d) => (
            <path key={d} d={d} pathLength={1} />
          ))}
        </g>

        {/* 3 :: compass, strategic agility and adaptability. its own ring is
            absorbed into the main circle as the three symbols merge */}
        <g className="mk-compass">
          <circle
            className="mk-compass-ring"
            cx={MARK.cx}
            cy={MARK.cy}
            r={MARK.r}
            pathLength={1}
            fill="none"
            stroke="var(--c-red)"
            strokeWidth={2.4}
          />
          <path className="mk-needle" d={MARK.needle} fill="var(--c-red)" />
        </g>

        {/* the wordmark completes the lockup */}
        <g
          className="mk-letters"
          fill="none"
          stroke="url(#woy-sheen)"
          strokeWidth={MARK.ringStroke}
          strokeLinecap="square"
          strokeLinejoin="miter"
        >
          <path d={MARK.w} pathLength={1} />
          <path d={MARK.yFork} pathLength={1} />
          <path d={MARK.yStem} pathLength={1} />
        </g>

        <text
          className="mk-consulting"
          x={MARK.wordX}
          y={MARK.wordY}
          textAnchor="middle"
          fill="var(--c-red)"
        >
          CONSULTING
        </text>
      </svg>
    </div>
  );
}
