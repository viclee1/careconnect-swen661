import 'package:careconnect_mobile/core/routing/routes.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import '../support/harness.dart';

void main() {
  group('MyDayScreen', () {
    testWidgets('renders daily tasks', (tester) async {
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.myDay);
      final titleFinder = find.descendant(of: find.byType(AppBar), matching: find.text('My Day'));
      expect(titleFinder, findsOneWidget);
      expect(find.text('0 of 7 done'), findsOneWidget);
    });
    testWidgets('toggles task', (tester) async {
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.myDay);
      await tester.tap(find.text('Take Amlodipine'));
      await tester.pump();
      expect(find.text('1 of 7 done'), findsOneWidget);
    });
  });
}
