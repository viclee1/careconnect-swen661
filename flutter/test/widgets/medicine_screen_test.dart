import 'package:careconnect_mobile/core/routing/routes.dart';
import 'package:careconnect_mobile/data/medicine_repository.dart';
import 'package:careconnect_mobile/models/medicine.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../support/harness.dart';

void main() {
  group('MedicineScreen', () {
    testWidgets('lists the shared medicines with their dose, time and a taken count', (WidgetTester tester) async {
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.medicines);

      expect(find.text('Amlodipine'), findsOneWidget);
      expect(find.text('Metformin'), findsOneWidget);
      expect(find.text('Atorvastatin'), findsOneWidget);
      expect(find.text('5 mg — 1 tablet with food\n8:30 am'), findsOneWidget);
      expect(find.text('1 of 3 taken'), findsOneWidget);
    });

    testWidgets('ticking a medicine marks it taken and updates the count', (WidgetTester tester) async {
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.medicines);

      final Finder metformin = find.byKey(const ValueKey<String>('medicine-med2'));
      expect(tester.widget<CheckboxListTile>(metformin).value, isFalse);
      await tester.tap(metformin);
      await tester.pumpAndSettle();
      expect(tester.widget<CheckboxListTile>(metformin).value, isTrue);
      expect(find.text('2 of 3 taken'), findsOneWidget);
    });

    testWidgets('says so when there are no medicines today', (WidgetTester tester) async {
      usePhoneSurface(tester);
      await pumpApp(
        tester,
        initialLocation: Routes.medicines,
        medicineRepository: InMemoryMedicineRepository(const <Medicine>[]),
      );
      expect(find.text('No medicines today'), findsOneWidget);
    });
  });
}
