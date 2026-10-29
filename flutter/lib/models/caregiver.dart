import 'daily_task.dart';

/// Who is using the app: the person cared for, or someone caring for them.
enum Role { patient, caregiver }

/// What the care recipient did, as the caregiver's activity log names it.
enum ActivityKind {
  medTaken('Medicine taken'),
  medUntaken('Medicine unmarked'),
  taskDone('Task finished'),
  checkIn('Checked in');

  const ActivityKind(this.label);
  final String label;
}

class ActivityEvent {
  const ActivityEvent({
    required this.id,
    required this.kind,
    required this.label,
    required this.at,
  });

  final String id;
  final ActivityKind kind;

  /// The sentence the log shows — "Took Amlodipine".
  final String label;
  final DateTime at;
}

enum NotePriority {
  routine('Routine'),
  note('Note'),
  urgent('Urgent');

  const NotePriority(this.label);
  final String label;
}

class CaregiverNote {
  const CaregiverNote({
    required this.id,
    required this.author,
    required this.text,
    required this.priority,
    required this.at,
  });

  final String id;
  final String author;
  final String text;
  final NotePriority priority;
  final DateTime at;
}

/// The event logged when the care recipient ticks a medicine one way or the other.
({ActivityKind kind, String label}) activityForMedicine(String name, bool nowTaken) =>
    nowTaken
        ? (kind: ActivityKind.medTaken, label: 'Took $name')
        : (kind: ActivityKind.medUntaken, label: 'Unmarked $name');

/// Whether a My Day task is the morning check-in, tracked on its own.
bool isCheckIn(DailyTask task) => task.title.toLowerCase().contains('check-in');

/// The event logged when the care recipient finishes a My Day task.
({ActivityKind kind, String label}) activityForTask(DailyTask task) => isCheckIn(task)
    ? (kind: ActivityKind.checkIn, label: 'Checked in for the day')
    : (kind: ActivityKind.taskDone, label: 'Finished: ${task.title}');

/// "8:35 AM".
String formatEventTime(DateTime at) {
  final int hour = at.hour % 12 == 0 ? 12 : at.hour % 12;
  final String minute = at.minute.toString().padLeft(2, '0');
  return '$hour:$minute ${at.hour < 12 ? 'AM' : 'PM'}';
}

const List<String> _weekdays = <String>[
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
];
const List<String> _months = <String>[
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/// "Today", "Yesterday", or "Wednesday 3 June".
String formatEventDay(DateTime at, {DateTime? now}) {
  final DateTime today = now ?? DateTime.now();
  bool sameDay(DateTime a, DateTime b) =>
      a.year == b.year && a.month == b.month && a.day == b.day;
  if (sameDay(at, today)) return 'Today';
  if (sameDay(at, today.subtract(const Duration(days: 1)))) return 'Yesterday';
  return '${_weekdays[at.weekday - 1]} ${at.day} ${_months[at.month - 1]}';
}

/// "1 event" / "3 events".
String countLabel(int count, String singular, [String? plural]) =>
    '$count ${count == 1 ? singular : (plural ?? '${singular}s')}';

/// The caregiver's notes the design starts with, newest first.
List<CaregiverNote> seedNotes({DateTime? now}) {
  final DateTime today = now ?? DateTime.now();
  return <CaregiverNote>[
    CaregiverNote(
      id: 'note-2',
      author: 'Joyce Adeyemi',
      text: 'Margaret mentioned her left knee is a little sore today. She '
          'skipped the garden walk but did gentle seated exercises instead. '
          'Worth raising at the GP review.',
      priority: NotePriority.note,
      at: today,
    ),
    CaregiverNote(
      id: 'note-1',
      author: 'Maria Thompson',
      text: "Lovely video call with Mum yesterday. She remembered Ella's "
          'school play and asked about the cat.',
      priority: NotePriority.routine,
      at: today.subtract(const Duration(days: 1)),
    ),
  ];
}
