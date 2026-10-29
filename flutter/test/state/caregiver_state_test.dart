import 'package:careconnect_mobile/data/appointment_repository.dart';
import 'package:careconnect_mobile/data/daily_tasks_repository.dart';
import 'package:careconnect_mobile/data/medicine_repository.dart';
import 'package:careconnect_mobile/models/appointment.dart';
import 'package:careconnect_mobile/models/caregiver.dart';
import 'package:careconnect_mobile/models/daily_task.dart';
import 'package:careconnect_mobile/state/appointments_controller.dart';
import 'package:careconnect_mobile/state/caregiver_controller.dart';
import 'package:careconnect_mobile/state/daily_tasks_controller.dart';
import 'package:careconnect_mobile/state/medicines_controller.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('CaregiverController', () {
    test('switches role, records events and signs notes, newest first', () {
      final CaregiverController c = CaregiverController(
          author: 'Maria Thompson', initialNotes: const <CaregiverNote>[]);
      int notified = 0;
      c.addListener(() => notified++);
      expect(c.isCaregiver, isFalse);
      c.setRole(Role.caregiver);
      c.setRole(Role.caregiver); // no change, no notification
      expect(c.isCaregiver, isTrue);
      c.record(ActivityKind.checkIn, 'Checked in for the day');
      c.record(ActivityKind.medTaken, 'Took Metformin');
      expect(c.activity.map((ActivityEvent e) => e.label),
          <String>['Took Metformin', 'Checked in for the day']);
      c.addNote('Bring the blue folder.', NotePriority.urgent);
      expect(c.notes.single.author, 'Maria Thompson');
      expect(notified, 4);
    });
  });

  group('MedicinesController', () {
    test('logs ticks, and adds, changes and removes medicines', () {
      final CaregiverController log = CaregiverController();
      final MedicinesController m = MedicinesController(
          repository: InMemoryMedicineRepository(), record: log.record);
      m.toggleTaken('med2');
      expect(m.takenCount, 2);
      expect(log.activity.single.label, 'Took Metformin');

      final String id =
          m.addMedicine(name: 'Aspirin', dosage: '75 mg', time: '9:00 am').id;
      expect(m.totalCount, 4);
      m.updateMedicine(id, name: 'Aspirin', dosage: '150 mg', time: '9:00 am');
      expect(m.medicines.firstWhere((m) => m.id == id).dosage, '150 mg');
      m.removeMedicine(id);
      expect(m.totalCount, 3);
    });
  });

  group('DailyTasksController', () {
    test('logs a finished task and the check-in, not an un-ticked one', () {
      final CaregiverController log = CaregiverController();
      final DailyTasksController t = DailyTasksController(
          repository: InMemoryDailyTasksRepository(), record: log.record);
      final DailyTask checkIn = t.tasks.firstWhere(isCheckIn);
      t.toggleTask(checkIn.id);
      t.toggleTask(checkIn.id);
      expect(log.activity.map((ActivityEvent e) => e.kind),
          <ActivityKind>[ActivityKind.checkIn]);
    });
  });

  group('AppointmentsController', () {
    test('loads once, and stores edits before showing them', () async {
      final AppointmentsController a =
          AppointmentsController(repository: InMemoryAppointmentRepository());
      expect(a.hasLoaded, isFalse);
      a.ensureLoaded();
      await Future<void>.delayed(Duration.zero);
      expect(a.appointments, hasLength(2));
      const Appointment input = Appointment(
        id: '',
        doctor: 'Dr. Okafor',
        specialty: 'Eyes',
        date: 'Dec 1',
        time: '9:15 am',
        location: 'Vision Centre',
      );
      await a.addAppointment(input);
      final String id = a.appointments.last.id;
      await a.updateAppointment(id, input);
      await a.removeAppointment(id);
      expect(a.appointments, hasLength(2));
    });

    test('keeps a failed load as an error until it is retried', () async {
      final AppointmentsController a =
          AppointmentsController(repository: FlakyAppointmentRepository());
      await a.load();
      expect(a.error, isNotNull);
      expect(a.hasLoaded, isFalse);
      a.ensureLoaded(); // does not hammer a failing store
      expect(a.isLoading, isFalse);
      await a.load();
      expect(a.error, isNull);
      expect(a.appointments, hasLength(2));
    });
  });
}
