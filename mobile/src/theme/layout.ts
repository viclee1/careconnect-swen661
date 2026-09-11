/**
 * Spacing, sizing and breakpoints shared by every screen.
 */
export const layout = {
  /** Minimum touch target required by both Material and the iOS HIG. */
  minTouchTarget: 48,

  /** Standard page gutter. */
  gutter: 16,

  /** Corner radius shared by cards, chips and buttons. */
  radius: 14,

  /**
   * The Material window-size-class boundary between a compact (phone) and a
   * medium (small tablet) window. One number, used everywhere, so "is this a
   * tablet?" is answered the same way on every screen.
   */
  tabletBreakpoint: 720,

  /**
   * Widest a single column of text is allowed to get. Past roughly this width a
   * line becomes hard to track back to the start.
   */
  readableWidth: 680,
} as const;
