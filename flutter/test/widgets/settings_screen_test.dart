import 'package:careconnect_mobile/core/routing/routes.dart';
import 'package:careconnect_mobile/screens/settings/widgets/vibration_pattern_tile.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import '../support/harness.dart';

void main() {
  group('SettingsScreen', () {
    testWidgets('renders accessibility settings', (tester) async {
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.settings);
      expect(find.text('Accessibility Settings'), findsOneWidget);
    });
    testWidgets('tapping sign out returns to splash', (tester) async {
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.settings);
      await tester.tap(find.text('Sign out'));
      await tester.pumpAndSettle();
      expect(find.text('CareConnect'), findsOneWidget);
    });
  });
}
