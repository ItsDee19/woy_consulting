import { MARK } from "./mark-geometry";

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
      viewBox={MARK.viewBox}
      className={className}
      role="img"
      aria-label="WOY Consulting"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth={MARK.ringStroke}
        strokeLinecap="square"
        strokeLinejoin="miter"
      >
        <path data-logo-letter="w" d={MARK.w} />
        <path data-logo-letter="y" d={MARK.yFork} />
        <path data-logo-letter="y" d={MARK.yStem} />
        <circle data-logo-ring cx={MARK.cx} cy={MARK.cy} r={MARK.r} />
        <g strokeWidth={MARK.spokeStroke}>
          {MARK.spokes.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
      </g>
      <path d={MARK.needle} fill="currentColor" />
      {showWord && (
        <text
          x={MARK.wordX}
          y={MARK.wordY - 2}
          textAnchor="middle"
          fill="currentColor"
          style={{ fontSize: 13, fontWeight: 500, letterSpacing: "6.5px" }}
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
