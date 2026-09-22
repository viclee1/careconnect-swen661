/**
 * The CareConnect palette, taken verbatim from the Team 2 Assignment 3 design
 * system and shared with the Flutter client.
 *
 * Every pairing below was measured against WCAG 2.2 contrast rules and the
 * recorded ratio is noted beside each constant, so the value can be audited
 * without re-running a contrast checker. Colours are fully opaque hex literals
 * rather than rgba() so those measured ratios stay accurate.
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

  /**
   * Destructive call action (decline / end call). White text/icon on this
   * fill measures 5.62:1 — the more obvious `#FF4B5C` only reaches 3.27:1
   * and fails the 4.5:1 normal-text/UI-icon requirement. Shared with the
   * Flutter client's `AppColors.dangerAction`.
   */
  dangerAction: '#C62828',

  /**
   * Affirmative call action (answer). White text/icon on this fill measures
   * 5.13:1 — the more obvious `#4BCB66` only reaches 2.09:1. Shared with the
   * Flutter client's `AppColors.successAction`.
   */
  successAction: '#2E7D32',
} as const;

export type AppColor = (typeof colors)[keyof typeof colors];
