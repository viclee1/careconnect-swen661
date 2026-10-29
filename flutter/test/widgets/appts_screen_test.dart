import 'package:careconnect_mobile/core/routing/routes.dart';
import 'package:careconnect_mobile/data/appointment_repository.dart';
import 'package:careconnect_mobile/models/appointment.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../support/harness.dart';

void main() {
  group('ApptsScreen', () {
    testWidgets('lists the shared appointments, each read as one sentence', (WidgetTester tester) async {
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.appointments);

      expect(find.text('Dr. Robert Chen'), findsOneWidget);
      expect(find.text('Dr. Sarah Jenkins'), findsOneWidget);
      expect(
        find.bySemanticsLabel(
          'Appointment with Dr. Robert Chen, Cardiology, on Sept 18, 2026 at 10:00 am, '
          'at Annapolis Medical Center',
        ),
        findsOneWidget,
      );
    });

    testWidgets('shows a failed load as an error, not an empty list, and recovers', (WidgetTester tester) async {
      usePhoneSurface(tester);
      await pumpApp(
        tester,
        initialLocation: Routes.appointments,
        appointmentRepository: FlakyAppointmentRepository(),
      );
      expect(find.text('Appointments could not be loaded'), findsOneWidget);
      expect(find.text('No appointments booked'), findsNothing);

      await tester.tap(find.widgetWithText(FilledButton, 'Try again'));
      await tester.pumpAndSettle();
      expect(find.text('Dr. Robert Chen'), findsOneWidget);
    });

    testWidgets('says so when none are booked', (WidgetTester tester) async {
      usePhoneSurface(tester);
      await pumpApp(
        tester,
        initialLocation: Routes.appointments,
        appointmentRepository: InMemoryAppointmentRepository(const <Appointment>[]),
      );
      expect(find.text('No appointments booked'), findsOneWidget);
    });
  });
}
