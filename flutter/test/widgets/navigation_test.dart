import 'package:careconnect_mobile/core/routing/routes.dart';
import 'package:careconnect_mobile/screens/contacts/widgets/contact_card.dart';
import 'package:careconnect_mobile/screens/messaging/widgets/message_composer.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';

import '../support/harness.dart';

void main() {
  group('Navigation between screens', () {
    testWidgets('contacts to a conversation and back again', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester);

      await tester.tap(find.text('Dr. Sharma'));
      await tester.pumpAndSettle();

      expect(find.byType(MessageComposer), findsOneWidget);
      expect(find.text('GP — Greenfield Surgery'), findsOneWidget);
      expect(find.byType(ContactCard), findsNothing);

      await tester.pageBack();
      await tester.pumpAndSettle();

      expect(find.byType(ContactCard), findsNWidgets(5));
      expect(find.byType(MessageComposer), findsNothing);
    });

    testWidgets('opening a conversation clears its badge on the list', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester);

      expect(find.text('waiting'), findsNWidgets(2));

      await tester.tap(find.text('Joyce'));
      await tester.pumpAndSettle();
      await tester.pageBack();
      await tester.pumpAndSettle();

      // Joyce's badge is gone; Maria's is untouched. The two screens share one
      // controller, so nothing had to be passed back through the route.
      expect(find.text('waiting'), findsOneWidget);
    });

    testWidgets('the bottom bar reaches a teammate\'s screen', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester);

      await tester.tap(find.text('Medicines'));
      await tester.pumpAndSettle();

      expect(find.text('Medicines is still being built'), findsOneWidget);
      expect(find.textContaining('Rehman'), findsOneWidget);
      expect(find.byType(ContactCard), findsNothing);

      await tester.tap(find.text('Contacts').last);
      await tester.pumpAndSettle();

      expect(find.byType(ContactCard), findsNWidgets(5));
    });

    testWidgets('the app bar gear opens Settings, which hides the bar', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester);

      expect(find.text('Appts'), findsOneWidget);

      await tester.tap(find.byTooltip('Settings'));
      await tester.pumpAndSettle();

      expect(find.text('Accessibility Settings'), findsOneWidget);
      expect(find.byType(ContactCard), findsNothing);
      // Settings is somewhere you come back from, not a tab.
      expect(find.text('Appts'), findsNothing);

      await tester.tap(find.byTooltip('Back to contacts'));
      await tester.pumpAndSettle();

      expect(find.byType(ContactCard), findsNWidgets(5));
      expect(find.text('Appts'), findsOneWidget);
    });

    testWidgets('the bar stays put while the page underneath changes', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester);

      final Rect before = tester.getRect(find.text('Appts'));

      await tester.tap(find.text('Medicines'));
      await tester.pump();

      // One frame in: if the bar belonged to the page it would be mid-slide.
      expect(
        tester.getRect(find.text('Appts')),
        before,
        reason: 'the navigation bar must not move when a tab changes',
      );
    });

    testWidgets('a tab change swaps the page with no transition', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester);

      await tester.tap(find.text('Memories'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 1));

      // A sliding transition would leave the outgoing page on screen for a few
      // hundred milliseconds. This one is gone on the next frame.
      expect(find.byType(ContactCard), findsNothing);
      expect(find.text('Memories is still being built'), findsOneWidget);
    });

    testWidgets('the tablet sidebar navigates and stays on Settings', (
      WidgetTester tester,
    ) async {
      useTabletSurface(tester);
      await pumpApp(tester);

      await tester.tap(find.text('Settings'));
      await tester.pumpAndSettle();

      expect(find.text('Accessibility Settings'), findsOneWidget);
      // Unlike the phone's bottom bar, the desktop sidebar carries Settings,
      // so it stays visible there — as the prototype's desktop layout shows.
      expect(find.text('Appointments'), findsOneWidget);
      expect(find.text('Memories'), findsOneWidget);

      await tester.tap(find.text('Contacts'));
      await tester.pumpAndSettle();

      expect(find.byType(ContactCard), findsNWidgets(5));
    });

    testWidgets('a conversation can be opened directly by its route', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.threadPath('c3'));

      expect(find.text('Maria'), findsOneWidget);
      expect(find.byType(MessageComposer), findsOneWidget);
    });

    testWidgets('an unknown route explains itself and offers a way back', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: '/nowhere');

      expect(find.text('That screen does not exist'), findsOneWidget);

      await tester.tap(find.text('Back to contacts'));
      await tester.pumpAndSettle();

      expect(find.byType(ContactCard), findsNWidgets(5));
    });

    testWidgets('the caption warning links through to Settings', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.settings);

      await tester.tap(find.text('Show captions'));
      await tester.pumpAndSettle();

      await tester.tap(find.byTooltip('Back to contacts'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Maria'));
      await tester.pumpAndSettle();

      expect(find.text('Captions are turned off'), findsOneWidget);

      await tester.tap(find.text('Open settings'));
      await tester.pumpAndSettle();

      expect(find.text('Accessibility Settings'), findsOneWidget);
    });
  });

  group('Routes', () {
    test('threadPath builds the path the router expects', () {
      expect(Routes.threadPath('c1'), '/contacts/c1');
      expect(Routes.initial, Routes.contacts);
      expect(Routes.messageThread, '/contacts/:contactId');
    });
  });
}
