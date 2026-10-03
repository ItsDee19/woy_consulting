/** Remove the paper from the original exports without changing their silhouettes. */
export function BrandArtworkFilters() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" className="pointer-events-none absolute">
      <defs>
        {[
          // Normalize each export's solid ink to full opacity: 255 / (255 - green).
          { id: "woy-philosophy-ink", scale: 255 / (255 - 20) },
          { id: "woy-emblem-ink", scale: 255 / (255 - 58) },
        ].map(({ id, scale }) => (
          <filter key={id} id={id} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feColorMatrix in="SourceGraphic" type="matrix"
              values={`0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 ${-scale} 0 0 ${scale}`}
              result="paperRemoved" />
            <feComposite in="paperRemoved" in2="SourceAlpha" operator="in" result="ink" />
            <feFlood floodColor="var(--c-logo-red)" result="brandRed" />
            <feComposite in="brandRed" in2="ink" operator="in" />
          </filter>
        ))}
      </defs>
    </svg>
  );
}
