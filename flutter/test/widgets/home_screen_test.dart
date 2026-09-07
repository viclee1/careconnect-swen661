import 'package:careconnect_mobile/core/routing/routes.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import '../support/harness.dart';

void main() {
  group('HomeScreen', () {
    testWidgets('renders dashboard', (tester) async {
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.home);
      expect(find.text('Dashboard'), findsOneWidget);
    });
    testWidgets('simulates and cancels call', (tester) async {
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.home);
      await tester.tap(find.text('Simulate incoming call'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));
      expect(find.text('Decline'), findsOneWidget);
      await tester.tap(find.text('Decline'));
      await tester.pumpAndSettle();
      expect(find.text('Decline'), findsNothing);
    });
    testWidgets('answers call and toggles controls', (tester) async {
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.home);
      await tester.tap(find.text('Simulate incoming call'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));
      await tester.tap(find.text('Answer'));
      await tester.pumpAndSettle();
      expect(find.text('LIVE'), findsOneWidget);
      await tester.tap(find.text('Mute'));
      await tester.pump();
      await tester.tap(find.text('End call'));
      await tester.pumpAndSettle();
      expect(find.text("Here's your day, Margaret"), findsOneWidget);
    });
  });
}
