/* =============================================================================
   WOY mark geometry.

   These numbers were measured off WOY's own logo artwork at 900 DPI, not
   approximated. The five-point star is drawn as five spokes at 0, 90, 180, 230
   and 310 degrees; the horizontal pair is deliberately levelled rather than
   sitting at a true 72 degree spacing, which is how the original is drawn.
   Each spoke reaches 0.745 of the ring's centreline radius.
   ============================================================================= */

export const MARK = {
  /** framing for the full W O Y CONSULTING lockup */
  viewBox: "55 30 230 150",
  /** framing for the mark on its own */
  markViewBox: "110 24 140 140",

  cx: 180,
  cy: 94,
  r: 34,

  ringStroke: 4,
  spokeStroke: 3.4,

  /**
   * Letter heights align square caps and miter tips to the ring's painted
   * y=58..130 bounds. Coordinates preserve the original widths and 4-unit
   * strokes; scaling a group would also compress their stroke weight.
   */
  w: "M70.4 60.474 L88.4 123.166 L106.4 67.802 L124.4 123.166 L142.4 60.474",
  /** Y, as the fork and the stem */
  yFork: "M217.3 60.808 L243.7 94.5 L270.1 60.808",
  yStem: "M243.7 94.5 L243.7 128",

  /** five spokes, ordered north, east, west, south west, south east */
  spokes: [
    "M180 94 L180 68.7",
    "M180 94 L205.3 94",
    "M180 94 L154.7 94",
    "M180 94 L163.73 113.38",
    "M180 94 L196.27 113.38",
  ],

  /** compass north marker */
  needle: "M175 52.5 L185 52.5 L180 44.5 Z",

  wordX: 170.25,
  wordY: 157,
} as const;

/** Explanatory source symbols used before the finished WOY mark forms. */
export const SOURCE_SYMBOLS = {
  starOutline: "M180 60 L188.2 82.7 L212.3 83.5 L193.3 98.3 L200 121.5 L180 108 L160 121.5 L166.7 98.3 L147.7 83.5 L171.8 82.7 Z",
  compassPoints: "M180 63 L185 82 L199.8 74.2 L192 89 L211 94 L192 99 L199.8 113.8 L185 106 L180 125 L175 106 L160.2 113.8 L168 99 L149 94 L168 89 L160.2 74.2 L175 82 Z",
} as const;
