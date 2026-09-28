"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { MARK, SOURCE_LOCKUP, SOURCE_SYMBOLS, SOURCE_COMPASS, FORMATION_FRAME } from "./mark-geometry";

// The reference symbols are an introduction to the mark, not replacement artwork.
// The ring, spokes and north marker retain the shared MARK geometry.
const { starOutline } = SOURCE_SYMBOLS;
const compassCrop = SOURCE_COMPASS.crop;

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
    <div ref={ref} aria-hidden="true" data-logo-formation className={`logo-formation relative ${paused ? "is-paused" : ""} ${className}`} style={{ aspectRatio: FORMATION_FRAME.aspectRatio, "--mk-intro-offset": `${FORMATION_FRAME.introOffsetX}px` } as CSSProperties}>
      <svg viewBox={FORMATION_FRAME.viewBox} className="relative h-full w-full overflow-hidden" focusable="false">
        <defs>
          <linearGradient id="woy-sheen" gradientUnits="userSpaceOnUse" x1="70" y1="44" x2="272" y2="160">
            <stop offset="0%" stopColor="var(--c-logo-red)" />
            <stop offset="55%" stopColor="var(--c-logo-accent)" />
            <stop offset="100%" stopColor="var(--c-logo-red)" />
          </linearGradient>
        </defs>

        <g className="mk-drawing">
          <g className="mk-guides" fill="none" stroke="var(--c-logo-red)">
            <path d="M77 94h206" strokeWidth=".35" strokeDasharray="1 3" />
            <path d="M78 64v-6h6M78 124v6h6M277 64v-6h-6M277 124v6h-6" strokeWidth=".65" />
            <circle data-logo-guide cx={MARK.cx} cy={MARK.cy} r="46" strokeWidth=".45" strokeDasharray="1 4" />
            <path className="mk-orbit" d="M134 94a46 46 0 0 1 46-46M226 94a46 46 0 0 1-46 46" strokeWidth=".9" />
          </g>
          <g className="mk-convergence" fill="none" stroke="var(--c-logo-accent)" strokeWidth=".65">
            <path d="M104 94h68m16 0h68" pathLength="1" />
            <circle cx={MARK.cx} cy={MARK.cy} r="3" />
          </g>
          <circle className="mk-lock-pulse" cx={MARK.cx} cy={MARK.cy} r="38" fill="none" stroke="var(--c-logo-accent)" strokeWidth=".8" />

          {/* Circle: enters from the left and becomes the finished logo ring. */}
          <circle className="mk-ring" cx={MARK.cx} cy={MARK.cy} r={MARK.r} pathLength="1" fill="none" stroke="url(#woy-sheen)" strokeWidth={MARK.ringStroke} strokeLinecap="square" />

          {/* The star stays concentric with the guide as the outer symbols converge. */}
          {/* Its outline resolves into WOY's original five internal spokes. */}
          <g className="mk-star" fill="none" stroke="url(#woy-sheen)" strokeLinejoin="round">
            <path className="mk-star-outline" d={starOutline} pathLength="1" strokeWidth="3.1" />
            <g className="mk-star-core" strokeWidth={MARK.spokeStroke} strokeLinecap="square" strokeLinejoin="miter">
              {MARK.spokes.map(d => <path key={d} d={d} pathLength="1" />)}
            </g>
          </g>

          {/* The compass travels as one symbol; its dial dissolves at convergence. */}
          <g className="mk-compass">
            <svg className="mk-compass-detail"
              x={MARK.cx - (SOURCE_COMPASS.cx - compassCrop.x)}
              y={MARK.cy - (SOURCE_COMPASS.cy - compassCrop.y)}
              width={compassCrop.width} height={compassCrop.height}
              viewBox={`${compassCrop.x} ${compassCrop.y} ${compassCrop.width} ${compassCrop.height}`}
              focusable="false">
              <defs>
                {/* Preserve the original compass pixels, removing only the white paper. */}
                <filter id="woy-compass-ink" filterUnits="userSpaceOnUse"
                  {...compassCrop} colorInterpolationFilters="sRGB">
                  <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 -1.085106 0 0 1.085106" />
                </filter>
                <mask id="woy-compass-mask" maskUnits="userSpaceOnUse" {...compassCrop}
                  style={{ maskType: "alpha" }}>
                  <image href={SOURCE_COMPASS.src} width={SOURCE_COMPASS.width}
                    height={SOURCE_COMPASS.height} filter="url(#woy-compass-ink)" />
                </mask>
              </defs>
              <rect {...compassCrop} fill="var(--c-logo-red)" mask="url(#woy-compass-mask)" />
            </svg>
            <path className="mk-needle" d={MARK.needle} fill="var(--c-logo-red)" />
          </g>

        </g>

        {/* Reveal the original artwork itself, so finished letters never swap shape or colour. */}
        <svg className="mk-final-mark" x={SOURCE_LOCKUP.x} y={SOURCE_LOCKUP.y}
          width={SOURCE_LOCKUP.markWidth} height={SOURCE_LOCKUP.markHeight}
          viewBox={SOURCE_LOCKUP.markViewBox} focusable="false">
          <defs>
            <mask id="woy-final-mark-mask" x="216" y="139" width="401" height="155"
              maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }}>
              <image href={SOURCE_LOCKUP.src} width={SOURCE_LOCKUP.width} height={SOURCE_LOCKUP.height} />
            </mask>
            <mask id="woy-source-reveal" x="216" y="139" width="401" height="155"
              maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }}>
              <g className="mk-symbol-reveal" fill="white">
                <circle cx="453.5" cy="229" r="68" />
                <rect x="443" y="138" width="21" height="19" />
              </g>
              <g className="mk-letter-reveal" fill="none" stroke="white" strokeWidth="22" strokeLinecap="square" strokeLinejoin="round">
                {SOURCE_LOCKUP.letterRevealPaths.map((d, index) => <path key={d} data-logo-reveal={index === 0 ? "w" : "y"} d={d} pathLength="1" />)}
              </g>
            </mask>
          </defs>
          <g mask="url(#woy-source-reveal)">
            <image className="mk-source-light" href={SOURCE_LOCKUP.src}
              width={SOURCE_LOCKUP.width} height={SOURCE_LOCKUP.height} />
            <rect className="mk-source-dark" x="216" y="139" width="401" height="155"
              fill="var(--c-logo-red)" mask="url(#woy-final-mark-mask)" />
          </g>
        </svg>
        {/* Original sans-serif caption, expanded to the full WOY width. */}
        <svg className="mk-consulting" x={SOURCE_LOCKUP.x} y={SOURCE_LOCKUP.wordY}
          width={SOURCE_LOCKUP.markWidth} height={SOURCE_LOCKUP.wordHeight}
          viewBox={SOURCE_LOCKUP.wordViewBox} preserveAspectRatio="none" focusable="false">
          <image href={SOURCE_LOCKUP.src} width={SOURCE_LOCKUP.width} height={SOURCE_LOCKUP.height} />
        </svg>
      </svg>
    </div>
  );
}
