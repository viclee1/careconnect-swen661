/// The vibration patterns CareConnect uses, one per alert type.
///
/// The Week 3 prototype gives each alert type its own rhythm so a user can tell
/// what has happened without looking at the screen — the tactile equivalent of
/// a distinct ringtone, and the reason a deaf user can leave the phone face
/// down in a pocket.
///
/// [pulses] is the rhythm as alternating vibrate and pause durations in
/// milliseconds, starting with a vibrate. [glyph] is the printed shape shown
/// beside the name on the Settings screen, so the rhythm is legible as well as
/// feelable.
enum VibrationPattern {
  appointment(
    'Appointment',
    'Long-short-long',
    '—  ·  —',
    <int>[400, 150, 120, 150, 400],
  ),
  medication(
    'Medication',
    'Double pulse',
    '··   ··',
    <int>[120, 100, 120, 400, 120, 100, 120],
  ),
  missed(
    'Missed / Escalated',
    'Rapid burst',
    '···· ····',
    <int>[80, 60, 80, 60, 80, 60, 80, 300, 80, 60, 80, 60, 80, 60, 80],
  );

  const VibrationPattern(this.alertType, this.rhythmName, this.glyph, this.pulses);

  /// What kind of alert uses this rhythm.
  final String alertType;

  /// The rhythm's name, as printed in the prototype.
  final String rhythmName;

  /// A printed shape for the rhythm, so it can be read as well as felt.
  final String glyph;

  /// Alternating vibrate and pause lengths in milliseconds, vibrate first.
  final List<int> pulses;

  /// How long the whole pattern takes to play.
  Duration get duration =>
      Duration(milliseconds: pulses.fold<int>(0, (int a, int b) => a + b));

  /// The durations that are vibrations rather than pauses.
  List<int> get vibrateDurations {
    final List<int> result = <int>[];
    for (int i = 0; i < pulses.length; i += 2) {
      result.add(pulses[i]);
    }
    return result;
  }

  /// The sentence a screen reader announces for this row.
  String get semanticLabel =>
      '$alertType alert, $rhythmName. Double tap to feel it.';
}
