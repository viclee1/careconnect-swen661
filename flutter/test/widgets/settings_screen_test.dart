import 'package:careconnect_mobile/core/routing/routes.dart';
import 'package:careconnect_mobile/data/settings_repository.dart';
import 'package:careconnect_mobile/models/accessibility_settings.dart';
import 'package:careconnect_mobile/screens/settings/widgets/vibration_pattern_tile.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../support/harness.dart';

void main() {
  group('SettingsScreen rendering', () {
    testWidgets('uses the heading and sections from the prototype', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.settings);

      expect(find.text('Accessibility Settings'), findsOneWidget);
      expect(
        find.text('Adjust how CareConnect alerts and informs you'),
        findsOneWidget,
      );
      expect(find.text('Visual Alerts'), findsOneWidget);
      expect(find.text('Captions'), findsOneWidget);
      expect(find.text('Audio'), findsOneWidget);
      expect(find.text('Vibration'), findsOneWidget);
      expect(find.text('Account'), findsOneWidget);
    });

    testWidgets('shows the conformance badge as met by default', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.settings);

      expect(find.text('WCAG 2.2 Compliant'), findsOneWidget);
      expect(
        find.text('Hearing-accessibility requirements met'),
        findsOneWidget,
      );
    });

    testWidgets('writes the state of each switch out as a word', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.settings);

      // Banners, escalation, captions and vibration all start on.
      expect(find.text('On'), findsNWidgets(4));
      expect(find.text('Off'), findsNothing);
    });

    testWidgets('the visual banner is present but cannot be switched off', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.settings);

      expect(find.text('Visual alert banners'), findsOneWidget);
      expect(find.textContaining('Always on.'), findsOneWidget);

      final SwitchListTile tile = tester.widget<SwitchListTile>(
        find.ancestor(
          of: find.text('Visual alert banners'),
          matching: find.byType(SwitchListTile),
        ),
      );
      expect(tile.onChanged, isNull);
    });

    testWidgets('shows the prototype values for volume and balance', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.settings);

      expect(find.text('Alert volume'), findsOneWidget);
      expect(find.text('70%'), findsOneWidget);
      expect(find.text('Audio balance'), findsOneWidget);
      expect(find.text('Centre'), findsOneWidget);
      expect(find.text('L'), findsOneWidget);
      expect(find.text('R'), findsOneWidget);
    });

    testWidgets('names all three vibration rhythms and draws each one', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.settings);

      expect(find.byType(VibrationPatternTile), findsNWidgets(3));
      expect(find.text('Appointment'), findsOneWidget);
      expect(find.text('Long-short-long'), findsOneWidget);
      expect(find.text('Medication'), findsOneWidget);
      expect(find.text('Double pulse'), findsOneWidget);
      expect(find.text('Missed / Escalated'), findsOneWidget);
      expect(find.text('Rapid burst'), findsOneWidget);
    });

    testWidgets('renders the caption preview from the prototype', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.settings);

      expect(
        find.text('[Preview] Reminder: Take your morning medication.'),
        findsOneWidget,
      );
      expect(find.text('Currently medium.'), findsOneWidget);
    });
  });

  group('SettingsScreen interaction', () {
    testWidgets('turning captions off flips the badge and persists', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      final SettingsRepository repository =
          await pumpApp(tester, initialLocation: Routes.settings);

      await tester.tap(find.text('Show captions'));
      await tester.pumpAndSettle();

      expect(find.text('WCAG 2.2 Compliant'), findsNothing);
      expect(find.text('Check your captions'), findsOneWidget);
      expect((await repository.load()).captionsEnabled, isFalse);
    });

    testWidgets('turning captions off disables the size control', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.settings);

      await tester.tap(find.text('Show captions'));
      await tester.pumpAndSettle();

      expect(
        find.text('Captions are off, so the size cannot be changed yet.'),
        findsOneWidget,
      );
      expect(
        find.text('Captions are off. Nothing will appear here.'),
        findsOneWidget,
      );
    });

    testWidgets('changing the caption size updates the live preview', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      final SettingsRepository repository =
          await pumpApp(tester, initialLocation: Routes.settings);

      await tester.tap(find.text('Large'));
      await tester.pumpAndSettle();

      expect(find.text('Currently large.'), findsOneWidget);
      expect((await repository.load()).captionSize, CaptionSize.large);
    });

    testWidgets('changing the caption colour repaints the preview', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      final SettingsRepository repository =
          await pumpApp(tester, initialLocation: Routes.settings);

      await tester.tap(find.text('Yellow'));
      await tester.pumpAndSettle();

      expect((await repository.load()).captionColor, CaptionColor.yellow);

      final Text preview = tester.widget<Text>(
        find.text('[Preview] Reminder: Take your morning medication.'),
      );
      expect(preview.style?.color, const Color(0xFFFFFF00));
    });

    testWidgets('the volume slider reports its value as a percentage', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.settings);

      // Two sliders on this screen: volume first, then balance.
      await tester.drag(find.byType(Slider).at(0), const Offset(-400, 0));
      await tester.pumpAndSettle();

      // Dragged hard left: silent, which is a legitimate setting here.
      expect(find.text('0%'), findsNWidgets(2));
    });

    testWidgets('the balance slider names the side it favours', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.settings);

      await tester.drag(find.byType(Slider).at(1), const Offset(400, 0));
      await tester.pumpAndSettle();

      expect(find.text('100% right'), findsOneWidget);
    });

    testWidgets('turning vibration off disables the pattern previews', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      final SettingsRepository repository =
          await pumpApp(tester, initialLocation: Routes.settings);

      await tester.tap(find.text('Vibration alerts'));
      await tester.pumpAndSettle();

      expect((await repository.load()).vibrationEnabled, isFalse);
      expect(
        find.text('Turn vibration on above to feel these.'),
        findsOneWidget,
      );
    });

    testWidgets('a pattern can be previewed without changing anything', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      final SettingsRepository repository =
          await pumpApp(tester, initialLocation: Routes.settings);

      await tester.tap(find.text('Medication'));
      // The preview plays as a chain of waits, each created only after the
      // previous one finishes, so the clock has to be advanced repeatedly
      // rather than once by the pattern's whole duration.
      for (int i = 0; i < 10; i++) {
        await tester.pump(const Duration(milliseconds: 500));
      }

      expect(await repository.load(), AccessibilitySettings.defaults);
    });

    testWidgets('sign out says plainly that it is not wired up yet', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.settings);

      await tester.tap(find.text('Sign out'));
      await tester.pumpAndSettle();

      expect(find.text('Sign out is not ready yet'), findsOneWidget);

      await tester.tap(find.text('OK'));
      await tester.pumpAndSettle();

      expect(find.text('Sign out is not ready yet'), findsNothing);
    });
  });

  group('Settings persistence across screens', () {
    testWidgets('a stored preference is applied on first paint', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(
        tester,
        initialLocation: Routes.settings,
        settings: AccessibilitySettings.defaults.copyWith(
          alertVolume: 0.3,
          audioBalance: -0.5,
          captionSize: CaptionSize.small,
        ),
      );

      expect(find.text('30%'), findsOneWidget);
      expect(find.text('50% left'), findsOneWidget);
      expect(find.text('Currently small.'), findsOneWidget);
    });
  });
}
