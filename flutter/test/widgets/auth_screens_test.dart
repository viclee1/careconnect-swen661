import 'package:careconnect_mobile/core/routing/routes.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import '../support/harness.dart';

void main() {
  group('SignInScreen', () {
    testWidgets('renders sign in', (tester) async {
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.signIn);
      expect(find.text('Welcome back'), findsOneWidget);
    });
    testWidgets('navigates to Home', (tester) async {
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.signIn);
      await tester.tap(find.widgetWithText(FilledButton, 'Sign in'));
      await tester.pumpAndSettle();
      expect(find.text("Here's your day, Margaret"), findsOneWidget);
    });
  });
  group('SignUpScreen', () {
    testWidgets('renders sign up', (tester) async {
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.signUp);
      expect(find.text('Create your account'), findsOneWidget);
    });
  });
}
