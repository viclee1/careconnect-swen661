import 'package:careconnect_mobile/models/vibration_pattern.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('VibrationPattern', () {
    test('covers the three alert types the prototype names', () {
      expect(
        VibrationPattern.values.map((VibrationPattern p) => p.alertType),
        <String>['Appointment', 'Medication', 'Missed / Escalated'],
      );
      expect(VibrationPattern.appointment.rhythmName, 'Long-short-long');
      expect(VibrationPattern.medication.rhythmName, 'Double pulse');
      expect(VibrationPattern.missed.rhythmName, 'Rapid burst');
    });

    test('every pattern is printed as well as felt', () {
      for (final VibrationPattern pattern in VibrationPattern.values) {
        expect(pattern.glyph, isNotEmpty);
        expect(pattern.semanticLabel, contains(pattern.alertType));
        expect(pattern.semanticLabel, contains(pattern.rhythmName));
      }
    });

    test('every pattern starts with a vibration and has an odd pulse count',
        () {
      // Pulses alternate vibrate/pause starting with a vibrate, so a
      // well-formed pattern always ends on a vibrate too.
      for (final VibrationPattern pattern in VibrationPattern.values) {
        expect(pattern.pulses, isNotEmpty);
        expect(pattern.pulses.length.isOdd, isTrue,
            reason: '${pattern.name} should not end on a pause');
        expect(pattern.pulses.every((int ms) => ms > 0), isTrue);
      }
    });

    test('the three rhythms are actually distinguishable from each other', () {
      final Set<int> lengths = VibrationPattern.values
          .map((VibrationPattern p) => p.vibrateDurations.length)
          .toSet();
      expect(lengths.length, VibrationPattern.values.length);
    });

    test('duration is the sum of every pulse and pause', () {
      expect(
        VibrationPattern.appointment.duration,
        const Duration(milliseconds: 1220),
      );
    });

    test('no pattern runs long enough to be missed as a buzz', () {
      for (final VibrationPattern pattern in VibrationPattern.values) {
        expect(pattern.duration, lessThan(const Duration(seconds: 2)));
      }
    });

    test('vibrateDurations returns only the vibrating halves', () {
      expect(
        VibrationPattern.appointment.vibrateDurations,
        <int>[400, 120, 400],
      );
    });
  });
}
