/// Small, dependency-free formatting helpers.
///
/// These live outside the widget tree on purpose: they are pure functions, so
/// they are cheap to unit test and can be reused by any screen. Formatting is
/// done by hand rather than with `intl` to keep the dependency list short.
abstract final class Formatters {
  static const List<String> _weekdays = <String>[
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
    'Sun',
  ];

  static const List<String> _months = <String>[
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  /// Formats [time] as a 12-hour clock reading, e.g. `9:42 am`.
  ///
  /// Lower case, matching the Week 3 prototype's "8:02 am".
  static String clock(DateTime time) {
    final int rawHour = time.hour % 12;
    final int hour = rawHour == 0 ? 12 : rawHour;
    final String minute = time.minute.toString().padLeft(2, '0');
    final String suffix = time.hour < 12 ? 'am' : 'pm';
    return '$hour:$minute $suffix';
  }

  /// Formats the day a message was sent, relative to [now].
  ///
  /// Returns `Today`, `Yesterday`, or an absolute date such as `Mon 1 Sep`.
  /// Comparison is done on calendar days, not elapsed hours, so a message sent
  /// at 11pm still reads as "Yesterday" at 1am rather than "Today".
  static String dayLabel(DateTime time, {DateTime? now}) {
    final DateTime reference = now ?? DateTime.now();
    final DateTime day = DateTime(time.year, time.month, time.day);
    final DateTime today =
        DateTime(reference.year, reference.month, reference.day);
    final int difference = today.difference(day).inDays;

    if (difference == 0) return 'Today';
    if (difference == 1) return 'Yesterday';
    return '${_weekdays[day.weekday - 1]} ${day.day} ${_months[day.month - 1]}';
  }
}
