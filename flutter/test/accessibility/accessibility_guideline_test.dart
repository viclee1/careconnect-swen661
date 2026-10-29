import 'package:careconnect_mobile/core/routing/routes.dart';
import 'package:careconnect_mobile/models/caregiver.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../support/harness.dart';

/// Assignment 6 — WCAG 2.1 AA automated accessibility checks.
///
/// These run every top-level screen through Flutter's built-in
/// [AccessibilityGuideline] evaluators:
///
///  * [androidTapTargetGuideline] — every tappable node is at least the
///    48x48 logical-pixel minimum called for in the assignment brief.
///  * [textContrastGuideline] — every text node meets the 4.5:1 (normal) /
///    3:1 (large) contrast ratio against what is directly behind it.
///  * [labeledTapTargetGuideline] — every tappable node exposes a
///    non-empty semantic label, so a screen reader never announces a bare
///    "button".
///
/// A [SemanticsHandle] has to be held open for the guidelines to see a
/// populated semantics tree — see the Flutter cookbook at
/// docs.flutter.dev/cookbook/testing/integration/introduction and the
/// `AccessibilityGuideline` API docs for the pattern this follows.
Future<void> _expectMeetsAllGuidelines(WidgetTester tester) async {
  await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
  await expectLater(tester, meetsGuideline(textContrastGuideline));
  await expectLater(tester, meetsGuideline(labeledTapTargetGuideline));
}

void main() {
  group('WCAG 2.1 AA guideline checks — routed screens', () {
    for (final MapEntry<String, String> route in <String, String>{
      Routes.welcome: 'Welcome',
      Routes.signIn: 'Sign in',
      Routes.signUp: 'Sign up',
      Routes.home: 'Home / Dashboard',
      Routes.myDay: 'My Day',
      Routes.appointments: 'Appointments',
      Routes.medicines: 'Medicines',
      Routes.memories: 'Memories',
      Routes.contacts: 'Contacts',
      Routes.threadPath('c1'): 'Message thread',
      Routes.settings: 'Settings',
    }.entries) {
      testWidgets('${route.value} meets tap target, contrast and label guidelines', (
        WidgetTester tester,
      ) async {
        final SemanticsHandle handle = tester.ensureSemantics();
        usePhoneSurface(tester);
        await pumpApp(tester, initialLocation: route.key);

        await _expectMeetsAllGuidelines(tester);

        handle.dispose();
      });
    }
  });

  group('WCAG 2.1 AA guideline checks — caregiver screens', () {
    for (final MapEntry<String, String> route in <String, String>{
      Routes.roleChooser: 'Role chooser',
      Routes.dashboard: 'Dashboard',
      Routes.manageMedicines: 'Manage medicines',
      Routes.manageAppointments: 'Manage appointments',
      Routes.activity: 'Activity',
      Routes.notes: 'Care notes',
    }.entries) {
      testWidgets('${route.value} meets tap target, contrast and label guidelines', (
        WidgetTester tester,
      ) async {
        final SemanticsHandle handle = tester.ensureSemantics();
        usePhoneSurface(tester);
        await pumpApp(tester, initialLocation: route.key, role: Role.caregiver);

        await _expectMeetsAllGuidelines(tester);

        handle.dispose();
      });
    }

    testWidgets('the medicine form with errors, and the delete confirmation, meet all guidelines', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle handle = tester.ensureSemantics();
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.manageMedicines, role: Role.caregiver);

      await tester.tap(find.bySemanticsLabel('Delete Amlodipine'));
      await tester.pumpAndSettle();
      await _expectMeetsAllGuidelines(tester);

      await tester.tap(find.widgetWithText(FilledButton, 'Add medicine'));
      await tester.pumpAndSettle();
      await tester.tap(find.widgetWithText(FilledButton, 'Add medicine'));
      await tester.pumpAndSettle();
      expect(find.text('3 things need fixing'), findsOneWidget);
      await _expectMeetsAllGuidelines(tester);

      handle.dispose();
    });

    testWidgets('the caregiver sidebar on a tablet meets all guidelines', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();
      useTabletSurface(tester);
      await pumpApp(tester, initialLocation: Routes.dashboard, role: Role.caregiver);

      await _expectMeetsAllGuidelines(tester);

      handle.dispose();
    });
  });

  group('WCAG 2.1 AA guideline checks — tablet layout', () {
    testWidgets('Contacts on a tablet (sidebar shell) meets all guidelines', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle handle = tester.ensureSemantics();
      useTabletSurface(tester);
      await pumpApp(tester, initialLocation: Routes.contacts);

      await _expectMeetsAllGuidelines(tester);

      handle.dispose();
    });
  });

  group('WCAG 2.1 AA guideline checks — Home screen call simulation', () {
    // This flow previously used unlabeled InkResponse/InkWell controls and
    // Colors.red/Colors.green fills that measured 3.68:1 and 2.78:1 — both
    // under the 4.5:1 minimum. The fixes in lib/screens/home/home_screen.dart
    // (AppColors.dangerAction/successAction, explicit Semantics on the call
    // and toggle buttons, and labeled Sliders) are asserted here so a
    // regression trips a test rather than only a manual screen-reader pass.
    testWidgets('incoming call overlay meets all guidelines', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle handle = tester.ensureSemantics();
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.home);

      await tester.tap(find.text('Simulate incoming call'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      await _expectMeetsAllGuidelines(tester);

      handle.dispose();
    });

    testWidgets('active call overlay (sliders + toggles) meets all guidelines', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle handle = tester.ensureSemantics();
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.home);

      await tester.tap(find.text('Simulate incoming call'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));
      await tester.tap(find.text('Answer'));
      await tester.pumpAndSettle();

      await _expectMeetsAllGuidelines(tester);

      handle.dispose();
    });
  });
}
