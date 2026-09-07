import 'package:flutter/material.dart';

import 'app_colors.dart';

/// Builds the single [ThemeData] used by the whole application.
///
/// Only [ColorScheme] and [TextTheme] are configured here. Component themes
/// (cards, inputs, app bars) are applied at the widget level instead, which
/// keeps the theme portable across Flutter releases that periodically rename
/// the component theme data classes.
///
/// The typography scale mirrors the Assignment 3 design system:
///
/// | Role | Size | Weight | Line height |
/// |------|------|--------|-------------|
/// | H1   | 40   | Bold   | 2.0em       |
/// | H2   | 36   | Bold   | 2.0em       |
/// | H3   | 34   | Normal | 1.5em       |
/// | H4   | 30   | Normal | 1.5em       |
/// | H5   | 26   | Normal | 1.5em       |
/// | H6   | 22   | Normal | 1.5em       |
/// | Body | 16–20| Normal | 1.5em       |
///
/// No font family is declared, so each platform supplies its own sans-serif
/// system face (Roboto on Android, SF Pro on iOS). The design system permits
/// "the default font if it is sans-serif", and using the system face means the
/// app inherits the reader's platform-level font settings for free.
abstract final class AppTheme {
  /// Minimum touch target required by both Material and the iOS HIG.
  static const double minTouchTarget = 48.0;

  /// Standard page gutter.
  static const double gutter = 16.0;

  /// Corner radius shared by cards, chips and buttons.
  static const double radius = 14.0;

  /// Builds the light theme.
  ///
  /// [highContrast] is kept as a hook for the accessibility work in a later
  /// week: the Week 3 prototype's Settings screen does not offer the control,
  /// so nothing switches it on yet.
  static ThemeData light({bool highContrast = false}) {
    final Color onSurface =
        highContrast ? AppColors.highContrastText : AppColors.primaryDark;
    final Color muted =
        highContrast ? AppColors.highContrastText : AppColors.secondaryDark;
    final Color surfaceContainer =
        highContrast ? AppColors.highContrastFill : AppColors.secondaryLight;

    final ColorScheme scheme = ColorScheme.fromSeed(
      seedColor: AppColors.primaryDark,
      brightness: Brightness.light,
    ).copyWith(
      primary: AppColors.primaryDark,
      onPrimary: AppColors.primaryLight,
      secondary: AppColors.secondaryDark,
      onSecondary: AppColors.primaryLight,
      surface: AppColors.primaryLight,
      onSurface: onSurface,
      surfaceContainerHighest: surfaceContainer,
      error: AppColors.errorText,
      onError: AppColors.primaryLight,
      outline: highContrast ? AppColors.highContrastText : AppColors.border,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      scaffoldBackgroundColor: AppColors.primaryLight,
      textTheme: _textTheme(onSurface, muted),
      visualDensity: VisualDensity.standard,
    );
  }

  static TextTheme _textTheme(Color onSurface, Color muted) {
    return TextTheme(
      // H1 / H2 — reserved for the largest hero headings.
      displayLarge: TextStyle(
        fontSize: 40,
        height: 2.0,
        fontWeight: FontWeight.bold,
        color: onSurface,
      ),
      displayMedium: TextStyle(
        fontSize: 36,
        height: 2.0,
        fontWeight: FontWeight.bold,
        color: onSurface,
      ),
      // H3 / H4
      headlineLarge: TextStyle(
        fontSize: 34,
        height: 1.5,
        fontWeight: FontWeight.normal,
        color: onSurface,
      ),
      headlineMedium: TextStyle(
        fontSize: 30,
        height: 1.5,
        fontWeight: FontWeight.normal,
        color: onSurface,
      ),
      // H5 — the default screen title on a phone.
      headlineSmall: TextStyle(
        fontSize: 26,
        height: 1.5,
        fontWeight: FontWeight.bold,
        color: onSurface,
      ),
      // H6 — section headings.
      titleLarge: TextStyle(
        fontSize: 22,
        height: 1.5,
        fontWeight: FontWeight.bold,
        color: onSurface,
      ),
      titleMedium: TextStyle(
        fontSize: 18,
        height: 1.5,
        fontWeight: FontWeight.w600,
        color: onSurface,
      ),
      titleSmall: TextStyle(
        fontSize: 16,
        height: 1.5,
        fontWeight: FontWeight.w600,
        color: muted,
      ),
      // Body — never smaller than 16px, always 1.5em leading.
      bodyLarge: TextStyle(fontSize: 18, height: 1.5, color: onSurface),
      bodyMedium: TextStyle(fontSize: 16, height: 1.5, color: onSurface),
      bodySmall: TextStyle(fontSize: 16, height: 1.5, color: muted),
      labelLarge: TextStyle(
        fontSize: 16,
        height: 1.5,
        fontWeight: FontWeight.w600,
        color: onSurface,
      ),
      labelMedium: TextStyle(fontSize: 14, height: 1.5, color: muted),
    );
  }
}
