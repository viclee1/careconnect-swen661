import 'package:careconnect_mobile/core/routing/routes.dart';
import 'package:careconnect_mobile/data/appointment_repository.dart';
import 'package:careconnect_mobile/data/medicine_repository.dart';
import 'package:careconnect_mobile/models/appointment.dart';
import 'package:careconnect_mobile/models/caregiver.dart';
import 'package:careconnect_mobile/models/medicine.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../support/harness.dart';

/// The app as a caregiver sees it, on one of their screens.
Future<void> openAsCaregiver(
  WidgetTester tester, {
  String at = Routes.dashboard,
  MedicineRepository? medicines,
  AppointmentRepository? appointments,
}) async {
  usePhoneSurface(tester);
  await pumpApp(
    tester,
    initialLocation: at,
    role: Role.caregiver,
    medicineRepository: medicines,
    appointmentRepository: appointments,
  );
}

Future<void> tapText(WidgetTester tester, String text) async {
  await tester.tap(find.text(text).last);
  await tester.pumpAndSettle();
}

Future<void> tapLabel(WidgetTester tester, Pattern label) async {
  await tester.tap(find.bySemanticsLabel(label).last);
  await tester.pumpAndSettle();
}

Future<void> enter(WidgetTester tester, String field, String text) async {
  await tester.enterText(find.byKey(ValueKey<String>('field-$field')), text);
  await tester.pump();
}

/// Settings › Account switches roles and lands on that role's home.
Future<void> switchView(WidgetTester tester, {required Role to}) async {
  await tester.tap(find.byTooltip('Settings'));
  await tester.pumpAndSettle();
  final Finder button = find.text(
    to == Role.patient
        ? 'Switch to care recipient view'
        : 'Switch to caregiver view',
  );
  // Account sits below the fold; scroll to it as a real user would.
  await tester.scrollUntilVisible(button, 300);
  await tester.tap(button);
  await tester.pumpAndSettle();
}

void main() {
  group('Role chooser', () {
    testWidgets('a caregiver lands on the Dashboard with their own tabs',
        (WidgetTester tester) async {
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.signUp);
      await tester.tap(find.widgetWithText(FilledButton, 'Create account'));
      await tester.pumpAndSettle();
      await tapLabel(tester, RegExp('^I am a caregiver'));

      expect(find.text("How Margaret's day is going"), findsOneWidget);
      for (final String tab in <String>[
        'Dashboard',
        'Medicines',
        'Appts',
        'Activity',
        'Notes'
      ]) {
        expect(find.text(tab), findsWidgets);
      }
      expect(find.bySemanticsLabel('Go to My Day'), findsNothing);
      expect(
          find.bySemanticsLabel('Dashboard, current screen'), findsOneWidget);
    });
  });

  group('Switching views', () {
    testWidgets('Settings switches to the care recipient view and back',
        (WidgetTester tester) async {
      await openAsCaregiver(tester);
      await tester.tap(find.byTooltip('Settings'));
      await tester.pumpAndSettle();
      await tester.scrollUntilVisible(
          find.text('Margaret Whitfield · Caregiver view'), 300);
      expect(find.text('Margaret Whitfield · Caregiver view'), findsOneWidget);
      await tester.tap(find.text('Switch to care recipient view'));
      await tester.pumpAndSettle();
      expect(find.text("Here's your day, Margaret"), findsOneWidget);
      expect(find.bySemanticsLabel('Go to My Day'), findsOneWidget);

      await switchView(tester, to: Role.caregiver);
      expect(find.text("How Margaret's day is going"), findsOneWidget);
    });

    testWidgets('the tablet sidebar lists the caregiver pages and Settings',
        (WidgetTester tester) async {
      useTabletSurface(tester);
      await pumpApp(tester,
          initialLocation: Routes.notes, role: Role.caregiver);
      expect(find.bySemanticsLabel('Notes, current screen'), findsOneWidget);
      expect(find.bySemanticsLabel('Go to Settings'), findsOneWidget);
      expect(find.bySemanticsLabel('Go to Appointments'), findsOneWidget);
    });
  });

  group('Dashboard', () {
    testWidgets('sums up the day and loads the next appointment',
        (WidgetTester tester) async {
      await openAsCaregiver(tester);
      expect(find.bySemanticsLabel('Medicines: 1 of 3 taken today'),
          findsOneWidget);
      expect(find.bySemanticsLabel(RegExp(r'^My Day: \d+ of \d+ tasks done$')),
          findsOneWidget);
      expect(find.bySemanticsLabel('Check-in: Not checked in yet'),
          findsOneWidget);
      expect(
        find.bySemanticsLabel(
            'Next appointment: Dr. Robert Chen, Sept 18, 2026 at 10:00 am'),
        findsOneWidget,
      );
      expect(find.textContaining('Nothing yet today'), findsOneWidget);
    });

    testWidgets('shows what the care recipient just did, newest first',
        (WidgetTester tester) async {
      await openAsCaregiver(tester);
      await switchView(tester, to: Role.patient);
      await tapText(tester, 'Medicines');
      await tester.tap(find.byKey(const ValueKey<String>('medicine-med2')));
      await tester.pumpAndSettle();
      await tapText(tester, 'My Day');
      await tester.tap(find.text('Morning check-in'));
      await tester.pumpAndSettle();

      await switchView(tester, to: Role.caregiver);
      expect(
          find.bySemanticsLabel('Check-in: Checked in today'), findsOneWidget);
      expect(find.bySemanticsLabel('Medicines: 2 of 3 taken today'),
          findsOneWidget);
      final List<String> rows = tester
          .widgetList<Semantics>(find.byWidgetPredicate((Widget w) =>
              w is Semantics &&
              (w.properties.label ?? '')
                  .contains(RegExp(r', \d{1,2}:\d{2} [AP]M$'))))
          .map((Semantics s) => s.properties.label!)
          .toList();
      expect(rows.first, startsWith('Checked in for the day'));
      expect(rows[1], startsWith('Took Metformin'));
    });

    testWidgets('opens each Manage screen and the activity log',
        (WidgetTester tester) async {
      await openAsCaregiver(tester);
      await tapText(tester, 'Manage medicines');
      expect(
          find.bySemanticsLabel('Medicines, current screen'), findsOneWidget);
      await tapText(tester, 'Dashboard');
      await tapText(tester, 'Manage appointments');
      expect(find.bySemanticsLabel('Appointments, current screen'),
          findsOneWidget);
      await tapText(tester, 'Dashboard');
      await tapText(tester, 'View all activity');
      expect(find.bySemanticsLabel('Activity, current screen'), findsOneWidget);
    });

    testWidgets('says when no appointment is booked',
        (WidgetTester tester) async {
      await openAsCaregiver(tester,
          appointments: InMemoryAppointmentRepository(const <Appointment>[]));
      expect(find.bySemanticsLabel('Next appointment: None booked'),
          findsOneWidget);
    });
  });

  group('Manage medicines', () {
    testWidgets('refuses an empty medicine, naming each field',
        (WidgetTester tester) async {
      await openAsCaregiver(tester, at: Routes.manageMedicines);
      await tapText(tester, 'Add medicine');
      await tapText(tester, 'Add medicine');
      expect(find.text('3 things need fixing'), findsOneWidget);
      expect(find.text('Medicine name is required.'), findsOneWidget);
      expect(find.text('Dose is required.'), findsOneWidget);
      expect(find.text('Time to take it is required.'), findsOneWidget);

      await enter(tester, 'name', 'Aspirin');
      expect(find.text('Medicine name is required.'), findsNothing);
      expect(find.text('2 things need fixing'), findsOneWidget);
    });

    testWidgets(
        "adds a medicine that then appears, not taken, on the care recipient's screen",
        (WidgetTester tester) async {
      await openAsCaregiver(tester, at: Routes.manageMedicines);
      await tapText(tester, 'Add medicine');
      await enter(tester, 'name', '  Vitamin D ');
      await enter(tester, 'dosage', '1000 IU');
      await enter(tester, 'time', '9:00 am');
      await tapText(tester, 'Add medicine');

      expect(find.text('Added Vitamin D.'), findsOneWidget);
      expect(find.text('Vitamin D'), findsOneWidget);
      expect(find.text('4 medicines'), findsOneWidget);
      await tapLabel(tester, 'OK, dismiss');
      expect(find.text('Added Vitamin D.'), findsNothing);

      await switchView(tester, to: Role.patient);
      await tapText(tester, 'Medicines');
      expect(find.text('Vitamin D'), findsOneWidget);
      expect(find.text('1 of 4 taken'), findsOneWidget);
    });

    testWidgets('edits a medicine, and cancelling changes nothing',
        (WidgetTester tester) async {
      await openAsCaregiver(tester, at: Routes.manageMedicines);
      await tapLabel(tester, 'Edit Metformin');
      expect(find.text('Edit Metformin'), findsOneWidget);
      await enter(tester, 'dosage', '850 mg');
      await tapText(tester, 'Save changes');
      expect(find.text('Saved Metformin.'), findsOneWidget);
      expect(find.text('850 mg'), findsOneWidget);

      await tapText(tester, 'Add medicine');
      await enter(tester, 'name', 'Never saved');
      await tapText(tester, 'Cancel');
      expect(find.text('3 medicines'), findsOneWidget);
    });

    testWidgets('asks before deleting, and empties to a message',
        (WidgetTester tester) async {
      await openAsCaregiver(
        tester,
        at: Routes.manageMedicines,
        medicines: InMemoryMedicineRepository(const <Medicine>[
          Medicine(
              id: 'm1', name: 'Amlodipine', dosage: '5 mg', time: '8:30 am'),
        ]),
      );
      expect(find.text('1 medicine'), findsOneWidget);
      await tapLabel(tester, 'Delete Amlodipine');
      expect(find.text('Delete Amlodipine?'), findsOneWidget);
      await tapText(tester, 'Cancel');
      expect(find.text('Delete Amlodipine?'), findsNothing);

      await tapLabel(tester, 'Delete Amlodipine');
      await tapLabel(tester, 'Yes, delete Amlodipine');
      expect(find.text('No medicines yet'), findsOneWidget);
      expect(find.text('Deleted Amlodipine.'), findsOneWidget);
    });
  });

  group('Manage appointments', () {
    testWidgets('adds an appointment the care recipient then sees',
        (WidgetTester tester) async {
      await openAsCaregiver(tester, at: Routes.manageAppointments);
      expect(find.text('2 appointments'), findsOneWidget);
      await tapText(tester, 'Add appointment');
      await tapText(tester, 'Add appointment');
      expect(find.text('5 things need fixing'), findsOneWidget);

      await enter(tester, 'doctor', 'Dr. Okafor');
      await enter(tester, 'specialty', 'Eye test');
      await enter(tester, 'date', 'Dec 1, 2026');
      await enter(tester, 'time', '9:15 am');
      await enter(tester, 'location', 'Vision Centre');
      await tapText(tester, 'Add appointment');

      expect(
          find.text('Added the appointment with Dr. Okafor.'), findsOneWidget);
      expect(find.text('Dr. Okafor — Eye test'), findsOneWidget);
      expect(find.text('3 appointments'), findsOneWidget);

      await switchView(tester, to: Role.patient);
      await tapText(tester, 'Appts');
      expect(find.text('Dr. Okafor'), findsOneWidget);
    });

    testWidgets('edits, then deletes after confirming',
        (WidgetTester tester) async {
      await openAsCaregiver(tester, at: Routes.manageAppointments);
      const String title = 'Dr. Robert Chen — Cardiology';
      await tapLabel(tester, 'Edit $title');
      await enter(tester, 'location', 'Westfield Hospital');
      await tapText(tester, 'Save changes');
      expect(find.text('Westfield Hospital'), findsOneWidget);

      await tapLabel(tester, 'Delete $title');
      await tapLabel(tester, 'Yes, delete $title');
      expect(find.text('Deleted the appointment with Dr. Robert Chen.'),
          findsOneWidget);
      expect(find.text(title), findsNothing);
    });

    testWidgets('says when there are none', (WidgetTester tester) async {
      await openAsCaregiver(
        tester,
        at: Routes.manageAppointments,
        appointments: InMemoryAppointmentRepository(const <Appointment>[]),
      );
      expect(find.text('No appointments booked'), findsOneWidget);
    });

    testWidgets(
        'shows a failed load as an error, not an empty list, and recovers',
        (WidgetTester tester) async {
      await openAsCaregiver(tester,
          at: Routes.manageAppointments,
          appointments: FlakyAppointmentRepository());
      expect(find.text('Appointments could not be loaded'), findsOneWidget);
      expect(find.text('No appointments booked'), findsNothing);
      await tapText(tester, 'Try again');
      expect(find.text('2 appointments'), findsOneWidget);
      expect(find.text('Appointments could not be loaded'), findsNothing);
    });
  });

  group('Activity', () {
    testWidgets('explains the empty log, then lists an event with its kind',
        (WidgetTester tester) async {
      await openAsCaregiver(tester, at: Routes.activity);
      expect(find.text('Nothing yet'), findsOneWidget);

      await switchView(tester, to: Role.patient);
      await tapText(tester, 'Medicines');
      await tester.tap(find.byKey(
          const ValueKey<String>('medicine-med1'))); // was taken: unmarks
      await tester.pumpAndSettle();
      await switchView(tester, to: Role.caregiver);
      await tapText(tester, 'Activity');

      expect(find.text('1 event this session'), findsOneWidget);
      expect(
          find.bySemanticsLabel(
              RegExp(r'^Unmarked Amlodipine\. Medicine unmarked, ')),
          findsOneWidget);
    });
  });

  group('Care notes', () {
    testWidgets(
        'shows the notes so far, newest first, with priority and author',
        (WidgetTester tester) async {
      await openAsCaregiver(tester, at: Routes.notes);
      expect(
          find.bySemanticsLabel(
              RegExp(r'^Note note from Joyce Adeyemi, Today')),
          findsOneWidget);
      expect(
          find.bySemanticsLabel(
              RegExp(r'^Routine note from Maria Thompson, Yesterday')),
          findsOneWidget);
    });

    testWidgets('refuses an empty note, then saves an urgent one at the top',
        (WidgetTester tester) async {
      await openAsCaregiver(tester, at: Routes.notes);
      await tapText(tester, 'Save note');
      expect(find.text('Write the note before saving it.'), findsOneWidget);

      await tester.enterText(find.byKey(const ValueKey<String>('note-text')),
          'Fell in the garden — no injury.');
      await tester.pump();
      expect(find.text('Write the note before saving it.'), findsNothing);
      await tapText(tester, 'Urgent');
      await tapText(tester, 'Save note');

      expect(find.text('Urgent note saved.'), findsOneWidget);
      expect(
        find.bySemanticsLabel(RegExp(
            r'^Urgent note from Joyce Adeyemi, Today, .+\. Fell in the garden — no injury\.$')),
        findsOneWidget,
      );
      final TextField field = tester
          .widget<TextField>(find.byKey(const ValueKey<String>('note-text')));
      expect(field.controller!.text, isEmpty);
    });
  });
}
