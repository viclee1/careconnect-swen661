import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';

/// A single on/off preference.
///
/// The current state is written out as the word "On" or "Off" beside the
/// switch. A switch communicates its state through position and colour, and
/// the design philosophy rules out colour-only signals, so the word carries the
/// state for anyone who finds the thumb position ambiguous.
class SettingsSwitchTile extends StatelessWidget {
  const SettingsSwitchTile({
    super.key,
    required this.title,
    required this.description,
    required this.value,
    required this.onChanged,
    this.locked = false,
    this.lockedReason,
  });

  final String title;
  final String description;
  final bool value;
  final ValueChanged<bool> onChanged;

  /// When true the control is shown but cannot be switched off, and
  /// [lockedReason] explains why.
  final bool locked;
  final String? lockedReason;

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final String stateWord = value ? 'On' : 'Off';

    return MergeSemantics(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 4),
        child: SwitchListTile(
          value: value,
          onChanged: locked ? null : onChanged,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 12,
            vertical: 8,
          ),
          title: Row(
            children: <Widget>[
              Expanded(
                child: Text(title, style: theme.textTheme.titleMedium),
              ),
              const SizedBox(width: 8),
              Text(
                stateWord,
                style: theme.textTheme.labelLarge?.copyWith(
                  color: AppColors.secondaryDark,
                ),
              ),
            ],
          ),
          subtitle: Padding(
            padding: const EdgeInsets.only(top: 4),
            child: Text(
              locked && lockedReason != null ? lockedReason! : description,
              style: theme.textTheme.bodySmall,
            ),
          ),
        ),
      ),
    );
  }
}
