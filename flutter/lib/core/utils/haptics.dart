import 'package:flutter/services.dart';

import '../../models/vibration_pattern.dart';

/// Plays CareConnect's vibration patterns.
///
/// Flutter's [HapticFeedback] exposes named impacts rather than an arbitrary
/// waveform, so a pattern is approximated by firing an impact for each pulse
/// and waiting out the gap between them. That is enough to make the three
/// rhythms distinguishable by feel, which is the point; a true waveform needs a
/// platform channel and is noted as a limitation in the README.
abstract final class Haptics {
  /// Plays [pattern] once. Does nothing when [enabled] is false, so a user who
  /// has switched vibration off never gets a buzz from a preview button.
  static Future<void> play(
    VibrationPattern pattern, {
    bool enabled = true,
  }) async {
    if (!enabled) return;
    final List<int> pulses = pattern.pulses;
    for (int i = 0; i < pulses.length; i += 2) {
      await HapticFeedback.mediumImpact();
      final int gap = i + 1 < pulses.length ? pulses[i + 1] : 0;
      if (gap > 0) {
        await Future<void>.delayed(Duration(milliseconds: gap));
      }
    }
  }
}
