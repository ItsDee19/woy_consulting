/**
 * Reading position for the longer pages. Hairline, brand red, no chrome.
 *
 * Driven by a CSS scroll-driven animation, so it runs on the compositor with
 * no scroll listener and no JavaScript at all. Browsers without
 * `animation-timeline` simply leave the bar at scaleX(0).
 */
export function ScrollProgress() {
  return (
    <div
      aria-hidden
      className="scroll-progress fixed left-0 top-0 z-[60] h-[2px] w-full bg-red"
    />
  );
}
