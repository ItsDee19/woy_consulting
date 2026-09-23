import { MARK, STATIC_MARK } from "./mark-geometry";

/** The static WOY lockup. Inherits colour from `currentColor`. */
export function Mark({
  className = "",
  showWord = true,
}: {
  className?: string;
  showWord?: boolean;
}) {
  return (
    <svg
      viewBox={STATIC_MARK.viewBox}
      className={className}
      role="img"
      aria-label="WOY Consulting"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth={STATIC_MARK.ringStroke}
        strokeLinecap="square"
        strokeLinejoin="miter"
      >
        <path data-logo-letter="w" d={STATIC_MARK.w} />
        <path data-logo-letter="y" d={STATIC_MARK.yFork} />
        <path data-logo-letter="y" d={STATIC_MARK.yStem} />
        <circle data-logo-ring cx={STATIC_MARK.cx} cy={STATIC_MARK.cy} r={STATIC_MARK.r} />
        <g strokeWidth={STATIC_MARK.spokeStroke}>
          {STATIC_MARK.spokes.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
      </g>
      <path d={STATIC_MARK.needle} fill="currentColor" />
      {showWord && (
        <text
          x={STATIC_MARK.wordX}
          y={STATIC_MARK.wordY - 2}
          textAnchor="middle"
          textLength={STATIC_MARK.wordWidth}
          lengthAdjust="spacing"
          fill="currentColor"
          style={{ fontFamily: "var(--font-interface, Arial, Helvetica, sans-serif)", fontSize: 13, fontWeight: 400 }}
        >
          CONSULTING
        </text>
      )}
    </svg>
  );
}

/** Just the circle, star and compass, without the letters. */
export function MarkGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox={MARK.markViewBox} className={className} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth={MARK.ringStroke}>
        <circle cx={MARK.cx} cy={MARK.cy} r={MARK.r} />
        <g strokeWidth={MARK.spokeStroke}>
          {MARK.spokes.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
      </g>
      <path d={MARK.needle} fill="currentColor" />
    </svg>
  );
}
