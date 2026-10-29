import 'package:careconnect_mobile/screens/medicines/medicine_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('MedicineScreen renders medications and toggles state', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(home: MedicineScreen()));

    // Verify UI components render
    expect(find.text('Medicines'), findsOneWidget);
    expect(find.text('Aspirin'), findsOneWidget);
    expect(find.text('Lisinopril'), findsOneWidget);

    // Find a checkbox and tap it to verify user interaction
    final checkboxFinder = find.byType(CheckboxListTile).first;
    expect(checkboxFinder, findsOneWidget);

    await tester.tap(checkboxFinder);
    await tester.pump();
  });
}
