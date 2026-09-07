import 'package:careconnect_mobile/core/utils/formatters.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('clock', () {
    test('formats a morning time the way the prototype prints it', () {
      expect(Formatters.clock(DateTime(2026, 9, 4, 8, 2)), '8:02 am');
    });

    test('formats an afternoon time', () {
      expect(Formatters.clock(DateTime(2026, 9, 4, 15, 5)), '3:05 pm');
    });

    test('renders midnight as 12 am, not 0 am', () {
      expect(Formatters.clock(DateTime(2026, 9, 4, 0, 0)), '12:00 am');
    });

    test('renders noon as 12 pm', () {
      expect(Formatters.clock(DateTime(2026, 9, 4, 12, 0)), '12:00 pm');
    });

    test('pads single-digit minutes', () {
      expect(Formatters.clock(DateTime(2026, 9, 4, 8, 7)), '8:07 am');
    });
  });

  group('dayLabel', () {
    final DateTime now = DateTime(2026, 9, 4, 10, 0);

    test('says Today for the same calendar day', () {
      expect(Formatters.dayLabel(DateTime(2026, 9, 4, 1, 0), now: now), 'Today');
    });

    test('says Yesterday for the previous calendar day', () {
      expect(
        Formatters.dayLabel(DateTime(2026, 9, 3, 23, 30), now: now),
        'Yesterday',
      );
    });

    test('compares calendar days, not elapsed hours', () {
      // 11pm yesterday is under 12 hours ago but is still "Yesterday".
      final DateTime earlyMorning = DateTime(2026, 9, 4, 1, 0);
      expect(
        Formatters.dayLabel(DateTime(2026, 9, 3, 23, 0), now: earlyMorning),
        'Yesterday',
      );
    });

    test('falls back to an absolute date for anything older', () {
      expect(
        Formatters.dayLabel(DateTime(2026, 9, 1, 9, 0), now: now),
        'Tue 1 Sep',
      );
    });

    test('handles a date in a previous month', () {
      expect(
        Formatters.dayLabel(DateTime(2026, 8, 31, 9, 0), now: now),
        'Mon 31 Aug',
      );
    });
  });
}
