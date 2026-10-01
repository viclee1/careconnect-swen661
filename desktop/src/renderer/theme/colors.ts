/**
 * The CareConnect palette, taken verbatim from the Team 2 Assignment 3 design
 * system and shared with the Flutter and React Native clients.
 *
 * Every pairing below was measured against WCAG 2.2 contrast rules and the
 * recorded ratio is noted beside each constant, so the value can be audited
 * without re-running a contrast checker. Colours are fully opaque hex literals
 * rather than rgba() so those measured ratios stay accurate.
 *
 * The same values are emitted as CSS custom properties in `index.css`. This
 * module is for the handful of places that need a colour in TypeScript — an
 * inline caption preview colour, for instance. Everything else uses the
 * variables, so a colour never has to be kept in step in two places by hand.
 */
export const colors = {
  /** Primary dark — body copy, headings and primary buttons. 8.5:1 on white. */
  primaryDark: '#0F5272',

  /** Primary light — the default page background. */
  primaryLight: '#FFFFFF',

  /** Secondary dark — supporting text and icons. 5.11:1 on white. */
  secondaryDark: '#346E8A',

  /** Secondary light — card and section fills behind primary dark text. */
  secondaryLight: '#EDF6FA',

  /** Warning / action-needed accent. Text 7.73:1 on the fill. */
  warningFill: '#FBDC8B',
  warningText: '#573B04',

  /** Success accent. Text 7.5:1 on the fill. */
  successFill: '#EDFAF5',
  successText: '#075C3F',

  /** Failure / error accent. Text 7.35:1 on the fill. */
  errorFill: '#FFD9DC',
  errorText: '#7F2433',

  /** Hairline borders. Decorative only — never the sole carrier of meaning. */
  border: '#C7DCE6',

  /** Destructive action. White on this fill measures 5.62:1. */
  dangerAction: '#C62828',

  /** Affirmative action. White on this fill measures 5.13:1. */
  successAction: '#2E7D32',
} as const;

export type AppColor = (typeof colors)[keyof typeof colors];
