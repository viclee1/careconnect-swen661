import 'package:careconnect_mobile/core/utils/validators.dart';
import 'package:careconnect_mobile/models/appointment.dart';
import 'package:careconnect_mobile/models/caregiver.dart';
import 'package:careconnect_mobile/models/daily_task.dart';
import 'package:careconnect_mobile/models/medicine.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

DailyTask task(String title) => DailyTask(
    id: 't', title: title, subtitle: '', time: '9:00 am', icon: Icons.check);

void main() {
  group('caregiver rules', () {
    test('a medicine tick is named in both directions', () {
      expect(activityForMedicine('Metformin', true),
          (kind: ActivityKind.medTaken, label: 'Took Metformin'));
      expect(activityForMedicine('Metformin', false),
          (kind: ActivityKind.medUntaken, label: 'Unmarked Metformin'));
    });

    test('the morning check-in is told apart from other tasks', () {
      expect(isCheckIn(task('Morning Check-In')), isTrue);
      expect(activityForTask(task('Morning check-in')),
          (kind: ActivityKind.checkIn, label: 'Checked in for the day'));
      expect(activityForTask(task('Blood pressure check')), (
        kind: ActivityKind.taskDone,
        label: 'Finished: Blood pressure check'
      ));
    });

    test('times and days read the way the log shows them', () {
      final DateTime now = DateTime(2026, 6, 4, 10);
      expect(formatEventTime(DateTime(2026, 6, 4, 8, 5)), '8:05 AM');
      expect(formatEventTime(DateTime(2026, 6, 4, 0, 30)), '12:30 AM');
      expect(formatEventTime(DateTime(2026, 6, 4, 13, 45)), '1:45 PM');
      expect(formatEventDay(DateTime(2026, 6, 4, 7), now: now), 'Today');
      expect(formatEventDay(DateTime(2026, 6, 3, 7), now: now), 'Yesterday');
      expect(
          formatEventDay(DateTime(2026, 6, 1, 7), now: now), 'Monday 1 June');
    });

    test('counts in the singular and the plural', () {
      expect(countLabel(1, 'event'), '1 event');
      expect(countLabel(2, 'event'), '2 events');
      expect(countLabel(0, 'medicine'), '0 medicines');
    });

    test('seeds one note today and one yesterday, newest first', () {
      final List<CaregiverNote> notes =
          seedNotes(now: DateTime(2026, 6, 4, 10));
      expect(notes.first.priority, NotePriority.note);
      expect(notes.last.at.day, 3);
    });

    test('labels state status in words', () {
      const Medicine taken = Medicine(
          id: 'm',
          name: 'Aspirin',
          dosage: '75 mg',
          time: '9:00 am',
          taken: true);
      expect(taken.semanticLabel, 'Aspirin, 75 mg, 9:00 am. Taken');
      expect(taken.copyWith(taken: false).semanticLabel, endsWith('Not taken'));
      const Appointment visit = Appointment(
        id: 'a',
        doctor: 'Dr. Lee',
        specialty: 'Eyes',
        date: 'Dec 1',
        time: '9:00 am',
        location: 'Clinic',
      );
      expect(visit.semanticLabel,
          'Appointment with Dr. Lee, Eyes, on Dec 1 at 9:00 am, at Clinic');
    });
  });

  group('Validators.requiredFields', () {
    test('names each blank field, and is empty when all are filled', () {
      const List<({String name, String label})> fields =
          <({String name, String label})>[
        (name: 'name', label: 'Medicine name'),
        (name: 'dose', label: 'Dose'),
      ];
      expect(
          Validators.requiredFields(fields, <String, String>{'name': '  '}),
          <String, String>{
            'name': 'Medicine name is required.',
            'dose': 'Dose is required.',
          });
      expect(
          Validators.requiredFields(
              fields, <String, String>{'name': 'A', 'dose': 'B'}),
          isEmpty);
      expect(Validators.fixSummary(1), '1 thing needs fixing');
      expect(Validators.fixSummary(3), '3 things need fixing');
    });
  });
}
