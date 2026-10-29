import 'package:flutter/foundation.dart';

import '../models/caregiver.dart';

/// Records an event in the caregiver's activity log.
typedef ActivityRecorder = void Function(ActivityKind kind, String label);

/// The caregiver's side of the shared plan: who is using the app, what the
/// care recipient has done (recorded as they tick things off), and the notes
/// caregivers leave for each other. In memory, like the rest of this client's
/// care data; the role is chosen after signing in.
class CaregiverController extends ChangeNotifier {
  CaregiverController({
    Role initialRole = Role.patient,
    this.author = 'Joyce Adeyemi',
    List<CaregiverNote>? initialNotes,
  })  : _role = initialRole,
        _notes = initialNotes ?? seedNotes();

  /// Who a new note is signed by.
  final String author;

  Role _role;
  final List<ActivityEvent> _activity = <ActivityEvent>[];
  List<CaregiverNote> _notes;
  int _nextId = 1;

  Role get role => _role;
  bool get isCaregiver => _role == Role.caregiver;

  /// Newest first.
  List<ActivityEvent> get activity => List<ActivityEvent>.unmodifiable(_activity);

  /// Newest first.
  List<CaregiverNote> get notes => List<CaregiverNote>.unmodifiable(_notes);

  void setRole(Role role) {
    if (role == _role) return;
    _role = role;
    notifyListeners();
  }

  void record(ActivityKind kind, String label) {
    _activity.insert(
      0,
      ActivityEvent(id: 'evt-${_nextId++}', kind: kind, label: label, at: DateTime.now()),
    );
    notifyListeners();
  }

  void addNote(String text, NotePriority priority) {
    _notes = <CaregiverNote>[
      CaregiverNote(
        id: 'note-new-${_nextId++}',
        author: author,
        text: text,
        priority: priority,
        at: DateTime.now(),
      ),
      ..._notes,
    ];
    notifyListeners();
  }
}
