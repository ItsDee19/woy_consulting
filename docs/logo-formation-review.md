# Logo formation and CTA refinement

Implemented on 21 September 2026 from the owner-supplied circle, outlined-star and compass reference.

## Visual sequence

The opening now shows three distinct red symbols: a circle, an outlined five-point star and a detailed compass rose with dial ticks and cardinal labels. They hold separately, then converge. The star outline contracts and resolves into the original five spokes; the compass dial dissolves while its north marker joins the ring. W, Y and CONSULTING complete the existing lockup.

Fine alignment guides, rotating compass detail and one low-opacity alignment ring give the formation a futuristic character. These details disappear during the completed-logo hold. All tracks share a 12-second CSS timeline and no delayed independent loops. There is no new animation dependency, canvas, heavy filter or flashing effect.

Circle dimensions, spokes, north marker and type placement retain the canonical `MARK` artwork. On 22 September 2026, the owner requested shorter W/Y letterforms in the animation. Their paths now align their painted top and bottom to the ring at y=58 and y=130, accounting for square caps and W miter tips without scaling their width or four-unit stroke weight. Shared static logo geometry is unchanged. All art remains in the fixed red palette in both themes. Reduced motion shows the complete static logo; the whole sequence pauses off screen and when the document is hidden. The owner-requested absence of visible animation controls is preserved.

All shared CTA labels now read **Start a conversation**, including Navbar, homepage, footer and the existing contact form button. Email links continue to use `mailto:hello@woyconsulting.com`; the contact form retains its separate submission behavior.

## Verification

- Production build, TypeScript, ESLint and 31 unit tests passed.
- `npm run test:logo` samples separate, merging and completed states at 320, 390, 768, 1440 and 1920px. It verifies symbol order, convergence to one center, synchronized durations, completed strokes, a stable layout, reduced motion and off-screen pause/resume. The 22 September checks also rasterize the live paths to verify matching painted top/bottom bounds for W, Y and the ring, including caps and miter tips, at every tested width and under reduced motion.
- Desktop and mobile frames were visually inspected. The final ring has no draw-seam, and the completed mark is clear of precursor symbols and alignment effects.
- `npm run test:browser` passed across 15 public pages, both themes and eight widths: no detected JavaScript errors, automated WCAG A/AA violations, horizontal overflow or broken internal links/assets. The updated CTA label and email destinations are checked on every page.
- Strict premium audit returned zero findings. Official `designmd lint DESIGN.md` returned zero errors or warnings.
- Independent source review checked timeline synchronization, exact-logo geometry and motion fallbacks; the identified spoke-cap mismatch was corrected.

Sampled screenshots and animation state reports are retained in the ignored `reports/` directory. Local animation checks do not substitute for live-host performance measurements.
