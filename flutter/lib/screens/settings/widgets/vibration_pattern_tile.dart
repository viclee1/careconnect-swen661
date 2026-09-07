import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../models/vibration_pattern.dart';

/// One row of the "Vibration patterns" list: the alert type, the rhythm's name,
/// and a printed shape for it.
///
/// The glyph matters. A rhythm you can only learn by feeling it is useless to
/// someone comparing two of them in a settings screen, so each pattern is drawn
/// as well as played.
class VibrationPatternTile extends StatelessWidget {
  const VibrationPatternTile({
    super.key,
    required this.pattern,
    required this.enabled,
    required this.onPreview,
  });

  final VibrationPattern pattern;

  /// False when vibration is switched off; the row still explains itself but
  /// cannot be played.
  final bool enabled;

  final VoidCallback onPreview;

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);

    return MergeSemantics(
      child: Semantics(
        button: true,
        enabled: enabled,
        label: enabled
            ? pattern.semanticLabel
            : '${pattern.alertType} alert, ${pattern.rhythmName}. '
                'Turn vibration on to feel it.',
        child: InkWell(
          onTap: enabled ? onPreview : null,
          child: ExcludeSemantics(
            child: Container(
              constraints: const BoxConstraints(
                minHeight: AppTheme.minTouchTarget,
              ),
              padding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 12,
              ),
              child: Row(
                children: <Widget>[
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: <Widget>[
                        Text(
                          pattern.alertType,
                          style: theme.textTheme.titleMedium,
                        ),
                        Text(
                          pattern.rhythmName,
                          style: theme.textTheme.bodySmall,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Text(
                    pattern.glyph,
                    style: const TextStyle(
                      fontSize: 20,
                      height: 1.2,
                      letterSpacing: 2,
                      color: AppColors.primaryDark,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Icon(
                    Icons.play_circle_outline,
                    size: 28,
                    color: enabled
                        ? AppColors.primaryDark
                        : AppColors.secondaryDark,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
