import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';

/// A labelled slider with its current value written out beside the title.
///
/// The value is always printed in words or a percentage, never left to the
/// thumb's position alone, so someone who cannot judge the thumb precisely
/// still knows exactly where the setting sits.
class SettingsSliderTile extends StatelessWidget {
  const SettingsSliderTile({
    super.key,
    required this.title,
    required this.description,
    required this.valueLabel,
    required this.value,
    required this.min,
    required this.max,
    required this.divisions,
    required this.onChanged,
    required this.semanticFormatter,
    this.minLabel,
    this.maxLabel,
  });

  final String title;
  final String description;

  /// The current value in words — "70%", "Centre", "25% right".
  final String valueLabel;

  final double value;
  final double min;
  final double max;
  final int divisions;
  final ValueChanged<double> onChanged;

  /// Builds the sentence a screen reader announces while dragging.
  final String Function(double) semanticFormatter;

  /// Optional end captions under the track, e.g. "L" and "R".
  final String? minLabel;
  final String? maxLabel;

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            children: <Widget>[
              Expanded(
                child: Text(title, style: theme.textTheme.titleMedium),
              ),
              const SizedBox(width: 8),
              Text(valueLabel, style: theme.textTheme.labelLarge),
            ],
          ),
          Slider(
            value: value,
            min: min,
            max: max,
            divisions: divisions,
            label: valueLabel,
            onChanged: onChanged,
            semanticFormatterCallback: semanticFormatter,
          ),
          if (minLabel != null || maxLabel != null)
            ExcludeSemantics(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: <Widget>[
                    Text(minLabel ?? '', style: theme.textTheme.labelMedium),
                    Text(maxLabel ?? '', style: theme.textTheme.labelMedium),
                  ],
                ),
              ),
            ),
          const SizedBox(height: 4),
          Text(
            description,
            style: theme.textTheme.bodySmall?.copyWith(
              color: AppColors.secondaryDark,
            ),
          ),
        ],
      ),
    );
  }
}
