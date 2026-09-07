import 'package:flutter/material.dart';

import '../core/theme/app_colors.dart';
import '../core/theme/app_theme.dart';

/// The tone of an [AlertBanner].
enum AlertTone { info, warning, error, success }

/// A prominent, always-visible banner.
///
/// This is the component that satisfies the assigned constraints "No sound-only
/// alerts" and "Clear visual notifications": every alert in CareConnect renders
/// one of these, carrying an icon, a title in words, and a body that says what
/// happened rather than merely that something did.
class AlertBanner extends StatelessWidget {
  const AlertBanner({
    super.key,
    required this.title,
    required this.message,
    this.tone = AlertTone.info,
    this.action,
    this.icon,
  });

  final String title;
  final String message;
  final AlertTone tone;

  /// Optional trailing control, e.g. a "Try again" button.
  final Widget? action;

  /// Overrides the icon the tone would otherwise choose.
  final IconData? icon;

  Color get _fill => switch (tone) {
        AlertTone.info => AppColors.secondaryLight,
        AlertTone.warning => AppColors.warningFill,
        AlertTone.error => AppColors.errorFill,
        AlertTone.success => AppColors.successFill,
      };

  Color get _ink => switch (tone) {
        AlertTone.info => AppColors.primaryDark,
        AlertTone.warning => AppColors.warningText,
        AlertTone.error => AppColors.errorText,
        AlertTone.success => AppColors.successText,
      };

  IconData get _icon {
    final IconData? override = icon;
    if (override != null) return override;
    return switch (tone) {
      AlertTone.info => Icons.info_outline,
      AlertTone.warning => Icons.warning_amber_rounded,
      AlertTone.error => Icons.error_outline,
      AlertTone.success => Icons.check_circle_outline,
    };
  }

  @override
  Widget build(BuildContext context) {
    return Semantics(
      container: true,
      liveRegion: true,
      label: '$title. $message',
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(AppTheme.gutter),
        decoration: BoxDecoration(
          color: _fill,
          borderRadius: BorderRadius.circular(AppTheme.radius),
          border: Border.all(color: _ink, width: 1.5),
        ),
        child: ExcludeSemantics(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Icon(_icon, color: _ink, size: 24),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      title,
                      style: TextStyle(
                        fontSize: 18,
                        height: 1.4,
                        fontWeight: FontWeight.bold,
                        color: _ink,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                message,
                style: TextStyle(fontSize: 16, height: 1.5, color: _ink),
              ),
              if (action != null) ...<Widget>[
                const SizedBox(height: 12),
                Align(alignment: Alignment.centerLeft, child: action),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
