import 'package:flutter/material.dart';

/// The CareConnect palette, taken verbatim from the Team 2 Assignment 3 design
/// system. Every pairing below was measured against WCAG 2.2 contrast rules and
/// the recorded ratio is noted beside each constant so the value can be audited
/// without re-running a contrast checker.
///
/// Colours are declared as fully opaque ARGB literals rather than derived with
/// opacity helpers, so the palette stays stable across Flutter versions and the
/// measured ratios above remain accurate.
abstract final class AppColors {
  /// Primary dark — body copy, headings and primary buttons. 8.5:1 on white.
  static const Color primaryDark = Color(0xFF0F5272);

  /// Primary light — the default page background.
  static const Color primaryLight = Color(0xFFFFFFFF);

  /// Secondary dark — supporting text and icons. 5.11:1 on white.
  static const Color secondaryDark = Color(0xFF346E8A);

  /// Secondary light — card and section fills behind primary dark text.
  static const Color secondaryLight = Color(0xFFEDF6FA);

  /// Warning / action-needed accent. Text 7.73:1 on the fill.
  static const Color warningFill = Color(0xFFFBDC8B);
  static const Color warningText = Color(0xFF573B04);

  /// Success accent. Text 7.5:1 on the fill.
  static const Color successFill = Color(0xFFEDFAF5);
  static const Color successText = Color(0xFF075C3F);

  /// Failure / error accent. Text 7.35:1 on the fill.
  static const Color errorFill = Color(0xFFFFD9DC);
  static const Color errorText = Color(0xFF7F2433);

  /// Hairline borders. Decorative only — never the sole carrier of meaning.
  static const Color border = Color(0xFFC7DCE6);

  /// High-contrast overrides, used when the user enables the high contrast
  /// setting. Pure black on pure white measures 21:1.
  static const Color highContrastText = Color(0xFF000000);
  static const Color highContrastFill = Color(0xFFFFFFFF);
}
