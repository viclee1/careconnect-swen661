import 'package:careconnect_mobile/screens/contacts/widgets/contact_card.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../support/harness.dart';

void main() {
  group('ContactsScreen rendering', () {
    testWidgets('shows the heading the prototype uses', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester);

      // Twice: the app bar heading and the bottom navigation label.
      expect(find.text('Contacts'), findsNWidgets(2));
      expect(find.text('People who care for you'), findsOneWidget);
    });

    testWidgets('explains the Notify action at the top', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester);

      expect(find.textContaining('Open a chat and tap Notify'), findsOneWidget);
      expect(find.textContaining('No sound needed'), findsOneWidget);
    });

    testWidgets('lists the five contacts from the design, in order', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester);

      expect(find.byType(ContactCard), findsNWidgets(5));
      expect(find.text('Joyce'), findsOneWidget);
      expect(find.text('Dr. Sharma'), findsOneWidget);
      expect(find.text('Maria'), findsOneWidget);
      expect(find.text('James'), findsOneWidget);
      expect(find.text('NHS 111'), findsOneWidget);
    });

    testWidgets('prints each relationship under the name', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester);

      expect(find.text('Caregiver · Daughter'), findsOneWidget);
      expect(find.text('GP — Greenfield Surgery'), findsOneWidget);
      expect(find.text('Daughter'), findsOneWidget);
      expect(find.text('Son'), findsOneWidget);
      expect(find.text('Medical helpline'), findsOneWidget);
    });

    testWidgets('marks the primary contact with a pill', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester);

      expect(find.text('Primary'), findsOneWidget);
    });

    testWidgets('uses the avatar initials from the design', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester);

      for (final String initials in <String>['JO', 'DS', 'MA', 'JA', 'NH']) {
        expect(find.text(initials), findsOneWidget);
      }
    });

    testWidgets('shows waiting counts as a number and a word', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester);

      // Joyce and Maria have each written since Margaret last replied.
      expect(find.text('1'), findsNWidgets(2));
      expect(find.text('waiting'), findsNWidgets(2));
    });

    testWidgets('previews a conversation by its text', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester);

      expect(
        find.text('Good morning Margaret! How are you feeling today?'),
        findsOneWidget,
      );
      expect(find.text('No messages yet'), findsOneWidget);
    });

    testWidgets('previews a video message by its captions, not its type', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester);

      expect(
        find.textContaining('Captions available — Hi Mum'),
        findsOneWidget,
      );
    });

    testWidgets('offers no voice-call affordance anywhere', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester);

      // The point of this screen for a deaf user: there is no phone call to
      // reach for, only text and a silent alert.
      expect(find.byIcon(Icons.phone), findsNothing);
      expect(find.byIcon(Icons.call), findsNothing);
      expect(find.text('Call'), findsNothing);
    });
  });

  group('ContactsScreen navigation affordances', () {
    testWidgets('carries the six destinations the prototype shows', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester);

      for (final String label in <String>[
        'Home',
        'My Day',
        'Appts',
        'Medicines',
        'Memories',
      ]) {
        expect(find.text(label), findsOneWidget);
      }
    });

    testWidgets('reaches Settings from the app bar on a phone', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester);

      expect(find.byTooltip('Settings'), findsOneWidget);
    });

    testWidgets('tapping a card opens that conversation', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester);

      await tester.tap(find.text('Joyce'));
      await tester.pumpAndSettle();

      expect(find.byType(ContactCard), findsNothing);
      expect(find.text('Caregiver · Daughter'), findsOneWidget);
    });
  });

  group('ContactsScreen layout', () {
    testWidgets('stacks cards in one column on a phone', (
      WidgetTester tester,
    ) async {
      usePhoneSurface(tester);
      await pumpApp(tester);

      final double cardWidth =
          tester.getSize(find.byType(ContactCard).first).width;
      expect(cardWidth, greaterThan(300));
    });

    testWidgets('lays cards two across and shows a sidebar on a tablet', (
      WidgetTester tester,
    ) async {
      useTabletSurface(tester);
      await pumpApp(tester);

      final double cardWidth =
          tester.getSize(find.byType(ContactCard).first).width;
      expect(cardWidth, lessThan(460));

      // The sidebar uses full labels and includes Settings, as the desktop
      // prototype lays it out.
      expect(find.text('Appointments'), findsOneWidget);
      expect(find.text('Settings'), findsOneWidget);
      expect(find.text('Appts'), findsNothing);
    });
  });
}
