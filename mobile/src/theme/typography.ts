import type { TextStyle } from 'react-native';

/**
 * The Assignment 3 typography scale.
 *
 * Body text is never smaller than 16px and every style carries 1.5em leading
 * (1.3 on single-line chrome, where a taller line box only adds dead space).
 * No font family is declared, so each platform supplies its own sans-serif
 * system face — which is what lets the app inherit the reader's platform-level
 * font size settings for free.
 */
export const type = {
  screenTitle: { fontSize: 24, lineHeight: 31, fontWeight: '700' },
  screenSubtitle: { fontSize: 14, lineHeight: 18 },
  sectionTitle: { fontSize: 22, lineHeight: 33, fontWeight: '700' },
  cardTitle: { fontSize: 18, lineHeight: 27, fontWeight: '700' },
  rowTitle: { fontSize: 18, lineHeight: 27, fontWeight: '600' },
  body: { fontSize: 17, lineHeight: 26 },
  bodySmall: { fontSize: 16, lineHeight: 24 },
  label: { fontSize: 16, lineHeight: 24, fontWeight: '600' },
  caption: { fontSize: 14, lineHeight: 20 },
  tiny: { fontSize: 11, lineHeight: 14 },
} satisfies Record<string, TextStyle>;
