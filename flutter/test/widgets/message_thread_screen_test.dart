import 'package:careconnect_mobile/core/routing/routes.dart';
import 'package:careconnect_mobile/models/accessibility_settings.dart';
import 'package:careconnect_mobile/screens/messaging/widgets/message_bubble.dart';
import 'package:careconnect_mobile/screens/messaging/widgets/notify_button.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../support/harness.dart';

void main() {
  group('MessageThreadScreen rendering', () {
    testWidgets('opens on the contact named by the route', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.threadPath('c1'));

      expect(find.text('Joyce'), findsOneWidget);
      expect(find.text('Caregiver · Daughter'), findsOneWidget);
      expect(find.text('JO'), findsOneWidget);
    });

    testWidgets('renders the conversation in order', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.threadPath('c1'));

      expect(find.byType(MessageBubble), findsNWidgets(2));
      expect(find.text('Goodnight Joyce. See you in the morning.'),
          findsOneWidget);
      expect(find.text('Good morning Margaret! How are you feeling today?'),
          findsOneWidget);
    });

    testWidgets('writes the delivery state out next to the tick', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.threadPath('c1'));

      expect(find.text('Read'), findsOneWidget);
    });

    testWidgets('stamps messages the way the prototype does', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.threadPath('c1'));

      expect(find.text('8:02 am'), findsOneWidget);
    });

    testWidgets('groups messages under a day heading', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.threadPath('c1'));

      expect(find.text('Yesterday'), findsOneWidget);
      expect(find.text('Today'), findsOneWidget);
    });

    testWidgets('a voicemail arrives as a readable transcript', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.threadPath('c2'));

      expect(find.text('Transcript · Voicemail · 0:34'), findsOneWidget);
      expect(
        find.textContaining('blood test results are back'),
        findsOneWidget,
      );
    });

    testWidgets('a video message states that captions are available', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.threadPath('c3'));

      expect(
        find.text('Captions available · Video message · 1:12'),
        findsOneWidget,
      );
    });

    testWidgets('a medication alert appears as a written banner', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.threadPath('c4'));

      expect(find.textContaining('CareConnect alert'), findsOneWidget);
      expect(
        find.textContaining('Amlodipine 5 mg was due at 8:30 am'),
        findsOneWidget,
      );
    });

    testWidgets('an empty conversation explains what to do next', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.threadPath('c5'));

      expect(find.text('No messages yet'), findsOneWidget);
      expect(find.textContaining('not as a call'), findsOneWidget);
    });

    testWidgets('an unknown contact id lands on a recoverable state', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.threadPath('nobody'));

      expect(find.text('That contact is not in your list'), findsOneWidget);

      await tester.tap(find.text('Back to contacts'));
      await tester.pumpAndSettle();

      expect(find.text('People who care for you'), findsOneWidget);
    });
  });

  group('Notify', () {
    testWidgets('offers the alert with its consequences written out', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.threadPath('c1'));

      expect(find.byType(NotifyButton), findsOneWidget);
      expect(find.text('Alert Joyce you want to talk'), findsOneWidget);
      expect(
        find.text('Sends a visual flash and vibration — no sound'),
        findsOneWidget,
      );
    });

    testWidgets('says so when vibration has been switched off', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(
        tester,
        initialLocation: Routes.threadPath('c1'),
        settings: AccessibilitySettings.defaults.copyWith(
          vibrationEnabled: false,
        ),
      );

      expect(
        find.text('Sends a visual flash — vibration is off in Settings'),
        findsOneWidget,
      );
    });

    testWidgets('plays a flash and writes the alert into the conversation', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.threadPath('c1'));

      await tester.tap(find.byType(NotifyButton));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 350));

      // Mid-pulse: the flash is on screen and carries words, not just light.
      expect(find.textContaining('Alert sent to Joyce'), findsOneWidget);

      await tester.pumpAndSettle();

      // The pulse is over, and the written record remains.
      expect(find.byType(MessageBubble), findsNWidgets(3));
      expect(
        find.textContaining('You alerted Joyce that you want to talk'),
        findsOneWidget,
      );
      expect(find.textContaining('No sound was played'), findsOneWidget);
    });

    testWidgets('can also be sent from the app bar', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.threadPath('c1'));

      await tester.tap(find.byTooltip('Alert Joyce you want to talk'));
      await tester.pumpAndSettle();

      expect(find.byType(MessageBubble), findsNWidgets(3));
    });
  });

  group('MessageComposer', () {
    testWidgets('refuses an empty message and says why', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.threadPath('c1'));

      await tester.tap(find.text('Send'));
      await tester.pumpAndSettle();

      expect(find.text('Type a message before sending.'), findsOneWidget);
      expect(find.byType(MessageBubble), findsNWidgets(2));
    });

    testWidgets('refuses a whitespace-only message', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.threadPath('c1'));

      await tester.enterText(find.byType(TextField), '     ');
      await tester.tap(find.text('Send'));
      await tester.pumpAndSettle();

      expect(find.text('Type a message before sending.'), findsOneWidget);
    });

    testWidgets('sends a typed message and shows it in the conversation', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.threadPath('c1'));

      await tester.enterText(find.byType(TextField), 'See you on Sunday');
      await tester.pumpAndSettle();
      await tester.tap(find.text('Send'));
      await tester.pumpAndSettle();

      expect(find.text('See you on Sunday'), findsOneWidget);
      expect(find.byType(MessageBubble), findsNWidgets(3));
      expect(find.text('Sent'), findsOneWidget);
    });

    testWidgets('counts the characters left', (WidgetTester tester) async {
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.threadPath('c1'));

      expect(find.text('500 characters left'), findsOneWidget);

      await tester.enterText(find.byType(TextField), 'hello');
      await tester.pumpAndSettle();

      expect(find.text('495 characters left'), findsOneWidget);
    });
  });

  group('Cross-screen accessibility state', () {
    testWidgets('warns when captions are off and the thread has video', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(
        tester,
        initialLocation: Routes.threadPath('c3'),
        settings: AccessibilitySettings.defaults.copyWith(
          captionsEnabled: false,
        ),
      );

      expect(find.text('Captions are turned off'), findsOneWidget);
      expect(find.text('Open settings'), findsOneWidget);
    });

    testWidgets('shows no caption warning when captions are on', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.threadPath('c3'));

      expect(find.text('Captions are turned off'), findsNothing);
    });

    testWidgets('shows no caption warning on a thread without video', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(
        tester,
        initialLocation: Routes.threadPath('c1'),
        settings: AccessibilitySettings.defaults.copyWith(
          captionsEnabled: false,
        ),
      );

      expect(find.text('Captions are turned off'), findsNothing);
    });
  });

  group('Tablet layout', () {
    testWidgets('offers a captioned call, named as the design names it', (
      WidgetTester tester,
    ) async {
      useTabletSurface(tester);
      await pumpApp(tester, initialLocation: Routes.threadPath('c1'));

      expect(find.text('Call Joyce now'), findsOneWidget);

      await tester.tap(find.text('Call Joyce now'));
      await tester.pumpAndSettle();

      expect(find.text('Captioned video call requested'), findsOneWidget);
      expect(find.textContaining('Nothing will ring'), findsOneWidget);

      await tester.tap(find.text('OK'));
      await tester.pumpAndSettle();

      expect(find.text('Captioned video call requested'), findsNothing);
    });

    testWidgets('offers no call to a contact without captioned video', (
      WidgetTester tester,
    ) async {
      useTabletSurface(tester);
      await pumpApp(tester, initialLocation: Routes.threadPath('c4'));

      expect(find.textContaining('Call '), findsNothing);
    });
  });
}
