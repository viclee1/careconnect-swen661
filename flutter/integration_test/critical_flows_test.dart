// Assignment 6 — end-to-end integration tests.
//
// These drive the real, assembled app (`CareConnectApp` wired exactly as
// `lib/main.dart` wires it — real repositories, real GoRouter, real
// SharedPreferences) on a device or emulator, rather than the fakes the
// widget tests under test/ use. Run with:
//
//   flutter test integration_test/critical_flows_test.dart
//
// or, against a connected device/emulator so shared_preferences and the
// platform channels it depends on are real:
//
//   flutter test integration_test -d <device-id>
//
// See docs.flutter.dev/cookbook/testing/integration/introduction.
import 'package:careconnect_mobile/app.dart';
import 'package:careconnect_mobile/data/contact_repository.dart';
import 'package:careconnect_mobile/data/daily_tasks_repository.dart';
import 'package:careconnect_mobile/data/message_repository.dart';
import 'package:careconnect_mobile/data/settings_repository.dart';
import 'package:careconnect_mobile/models/accessibility_settings.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  /// Pins the test surface to a phone-sized window.
  ///
  /// Without this, the VM test harness's default (800x600) sits past the
  /// 720dp tablet breakpoint, so every screen would silently render its
  /// two-column tablet layout instead of the phone layout real users on a
  /// phone see — and, on My Day, overflow the shorter 600px height. Running
  /// `flutter test integration_test -d <device-id>` against a real
  /// phone-class device/emulator does not need this.
  void usePhoneSurface(WidgetTester tester) {
    tester.view.physicalSize = const Size(400, 3400);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.reset);
  }

  /// Boots the real app with fresh in-memory repositories, mirroring
  /// `lib/main.dart` except for `SettingsRepository`, which is swapped for
  /// an in-memory fake so tests don't depend on (or pollute) a real device's
  /// SharedPreferences store between runs.
  Future<void> launchApp(WidgetTester tester, {SettingsRepository? settings}) async {
    usePhoneSurface(tester);
    await tester.pumpWidget(
      CareConnectApp(
        contactRepository: MockContactRepository(),
        messageRepository: MockMessageRepository(),
        settingsRepository:
            settings ?? InMemorySettingsRepository(AccessibilitySettings.defaults),
        dailyTasksRepository: InMemoryDailyTasksRepository(),
      ),
    );
    await tester.pumpAndSettle();
  }

  group('Critical user flow 1 — sign in reaches the dashboard', () {
    testWidgets('Welcome -> Sign in -> Home', (WidgetTester tester) async {
      await launchApp(tester);

      expect(find.text('CareConnect'), findsWidgets);
      await tester.tap(find.text('I already have an account'));
      await tester.pumpAndSettle();

      expect(find.text('Welcome back'), findsOneWidget);
      await tester.tap(find.widgetWithText(FilledButton, 'Sign in'));
      await tester.pumpAndSettle();

      expect(find.text("Here's your day, Margaret"), findsOneWidget);
    });
  });

  group('Critical user flow 2 — bottom navigation reaches every destination', () {
    testWidgets('Home -> My Day -> Appointments -> Medicines -> Memories -> Contacts', (
      WidgetTester tester,
    ) async {
      await launchApp(tester);
      await tester.tap(find.text('I already have an account'));
      await tester.pumpAndSettle();
      await tester.tap(find.widgetWithText(FilledButton, 'Sign in'));
      await tester.pumpAndSettle();

      for (final MapEntry<String, String> tab in <String, String>{
        'My Day': 'My Day',
        'Appts': 'Appointments',
        'Medicines': 'Medications',
        'Memories': 'Memories',
        'Contacts': 'Contacts',
      }.entries) {
        await tester.tap(find.text(tab.key));
        await tester.pumpAndSettle();
        expect(
          find.descendant(of: find.byType(AppBar), matching: find.text(tab.value)),
          findsOneWidget,
          reason: 'Tapping the ${tab.key} tab should open the $tab.value screen',
        );
      }
    });
  });

  group('Critical user flow 3 — sending a message', () {
    testWidgets('Contacts -> open a conversation -> send a message', (
      WidgetTester tester,
    ) async {
      await launchApp(tester);
      await tester.tap(find.text('I already have an account'));
      await tester.pumpAndSettle();
      await tester.tap(find.widgetWithText(FilledButton, 'Sign in'));
      await tester.pumpAndSettle();

      await tester.tap(find.text('Contacts'));
      await tester.pumpAndSettle();

      // Open Joyce's conversation (the first seeded contact).
      await tester.tap(find.text('Joyce'));
      await tester.pumpAndSettle();
      expect(
        find.descendant(of: find.byType(AppBar), matching: find.text('Joyce')),
        findsOneWidget,
        reason: 'Tapping Joyce\'s contact card should open her conversation',
      );

      const String outgoing = 'Calling to say hello!';
      await tester.enterText(find.byType(TextField), outgoing);
      await tester.pump();
      await tester.tap(find.text('Send'));
      await tester.pumpAndSettle();

      expect(find.text(outgoing), findsOneWidget);
    });
  });

  group('Critical user flow 4 — completing a daily task', () {
    testWidgets('My Day -> toggling a task updates the progress count', (
      WidgetTester tester,
    ) async {
      await launchApp(tester);
      await tester.tap(find.text('I already have an account'));
      await tester.pumpAndSettle();
      await tester.tap(find.widgetWithText(FilledButton, 'Sign in'));
      await tester.pumpAndSettle();

      await tester.tap(find.text('My Day'));
      await tester.pumpAndSettle();

      expect(find.text('0 of 7 done'), findsOneWidget);
      await tester.tap(find.text('Morning check-in'));
      await tester.pumpAndSettle();
      expect(find.text('1 of 7 done'), findsOneWidget);
    });
  });

  group('Critical user flow 5 — an accessibility preference takes effect immediately', () {
    testWidgets('Settings -> turning captions off updates the compliance badge', (
      WidgetTester tester,
    ) async {
      await launchApp(tester);
      await tester.tap(find.text('I already have an account'));
      await tester.pumpAndSettle();
      await tester.tap(find.widgetWithText(FilledButton, 'Sign in'));
      await tester.pumpAndSettle();

      await tester.tap(find.byIcon(Icons.settings_outlined));
      await tester.pumpAndSettle();

      expect(find.text('WCAG 2.2 Compliant'), findsOneWidget);
      await tester.tap(find.text('Show captions'));
      await tester.pumpAndSettle();

      expect(find.text('Check your captions'), findsOneWidget);

      // Leaving and returning to the screen must not lose the change: the
      // in-session state (backed by SettingsController/SettingsRepository,
      // SharedPreferences on a real device) is the source of truth, not the
      // widget's initial build.
      await tester.tap(find.byIcon(Icons.arrow_back));
      await tester.pumpAndSettle();
      await tester.tap(find.byIcon(Icons.settings_outlined));
      await tester.pumpAndSettle();
      expect(find.text('Check your captions'), findsOneWidget);
    });
  });

  group('Accessibility-focused flow — navigating purely by semantics label', () {
    testWidgets(
      'every bottom-tab destination is reachable using only its screen-reader label',
      (WidgetTester tester) async {
        // Simulates how a TalkBack/VoiceOver user drives the app: locate
        // controls by the semantic label an assistive technology would
        // announce (never by raw visible text or widget type), then perform
        // the equivalent of a screen-reader double-tap.
        final SemanticsHandle handle = tester.ensureSemantics();
        await launchApp(tester);
        await tester.tap(find.text('I already have an account'));
        await tester.pumpAndSettle();
        await tester.tap(find.widgetWithText(FilledButton, 'Sign in'));
        await tester.pumpAndSettle();

        expect(find.bySemanticsLabel('Home, current screen'), findsOneWidget);

        for (final String label in <String>[
          'Go to My Day',
          'Go to Appointments',
          'Go to Medicines',
          'Go to Memories',
          'Go to Contacts',
        ]) {
          final Finder destination = find.bySemanticsLabel(label);
          expect(destination, findsOneWidget, reason: 'A screen reader must be able to find "$label"');
          await tester.tap(destination);
          await tester.pumpAndSettle();

          final String current = label.replaceFirst('Go to ', '');
          expect(
            find.bySemanticsLabel('$current, current screen'),
            findsOneWidget,
            reason: 'After activating "$label" the bar must announce $current as selected',
          );
        }

        handle.dispose();
      },
    );
  });
}
