import 'package:flutter/material.dart';

import '../core/theme/app_colors.dart';
import '../core/theme/app_theme.dart';

/// A small pill that always shows **an icon and a word**.
///
/// The Assignment 3 design philosophy is explicit that status is "always a word
/// plus a shape" and that information is never carried by colour alone. Making
/// both [icon] and [label] required means a caller cannot accidentally ship a
/// colour-only indicator.
class StatusBadge extends StatelessWidget {
  const StatusBadge({
    super.key,
    required this.icon,
    required this.label,
    this.fill = AppColors.secondaryLight,
    this.foreground = AppColors.primaryDark,
  });

  /// A badge in the warning accent — action needed.
  const StatusBadge.warning({
    super.key,
    required this.icon,
    required this.label,
  })  : fill = AppColors.warningFill,
        foreground = AppColors.warningText;

  /// A badge in the error accent — something is wrong or urgent.
  const StatusBadge.alert({
    super.key,
    required this.icon,
    required this.label,
  })  : fill = AppColors.errorFill,
        foreground = AppColors.errorText;

  /// A badge in the success accent — everything is in order.
  const StatusBadge.success({
    super.key,
    required this.icon,
    required this.label,
  })  : fill = AppColors.successFill,
        foreground = AppColors.successText;

  final IconData icon;
  final String label;
  final Color fill;
  final Color foreground;

  @override
  Widget build(BuildContext context) {
    // The badge repeats information already in the card's semantic label, so
    // it is hidden from screen readers to avoid a stuttering announcement.
    return ExcludeSemantics(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: fill,
          borderRadius: BorderRadius.circular(AppTheme.radius),
          border: Border.all(color: foreground, width: 1),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Icon(icon, size: 16, color: foreground),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                fontSize: 14,
                height: 1.3,
                fontWeight: FontWeight.w600,
                color: foreground,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
