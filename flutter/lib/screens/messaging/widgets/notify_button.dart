import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';

/// The Notify action from the Week 3 prototype.
///
/// This is CareConnect's answer to "give me a ring": it lights up the other
/// person's screen and buzzes their phone, and plays nothing. The second line
/// says exactly what will happen, because a user who cannot hear a ringtone has
/// no way to verify it afterwards and should not have to guess.
class NotifyButton extends StatelessWidget {
  const NotifyButton({
    super.key,
    required this.contactName,
    required this.onPressed,
    required this.vibrationEnabled,
  });

  final String contactName;
  final VoidCallback onPressed;

  /// Whether vibration is switched on in Settings. The flash is sent either
  /// way; the sub-line tells the truth about the buzz.
  final bool vibrationEnabled;

  String get _subtitle => vibrationEnabled
      ? 'Sends a visual flash and vibration — no sound'
      : 'Sends a visual flash — vibration is off in Settings';

  @override
  Widget build(BuildContext context) {
    return MergeSemantics(
      child: Semantics(
        button: true,
        label: 'Alert $contactName you want to talk. $_subtitle.',
        child: Material(
          color: AppColors.warningFill,
          borderRadius: BorderRadius.circular(AppTheme.radius),
          child: InkWell(
            onTap: onPressed,
            borderRadius: BorderRadius.circular(AppTheme.radius),
            child: ExcludeSemantics(
              child: Container(
                width: double.infinity,
                constraints: const BoxConstraints(minHeight: 64),
                padding: const EdgeInsets.symmetric(
                  horizontal: AppTheme.gutter,
                  vertical: 12,
                ),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(AppTheme.radius),
                  border: Border.all(
                    color: AppColors.warningText,
                    width: 1.5,
                  ),
                ),
                child: Row(
                  children: <Widget>[
                    const Icon(
                      Icons.vibration,
                      size: 28,
                      color: AppColors.warningText,
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: <Widget>[
                          Text(
                            'Alert $contactName you want to talk',
                            style: const TextStyle(
                              fontSize: 17,
                              height: 1.3,
                              fontWeight: FontWeight.bold,
                              color: AppColors.warningText,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            _subtitle,
                            style: const TextStyle(
                              fontSize: 14,
                              height: 1.3,
                              color: AppColors.warningText,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
