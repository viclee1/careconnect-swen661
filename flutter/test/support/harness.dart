import 'package:careconnect_mobile/app.dart';
import 'package:careconnect_mobile/core/routing/routes.dart';
import 'package:careconnect_mobile/data/contact_repository.dart';
import 'package:careconnect_mobile/data/message_repository.dart';
import 'package:careconnect_mobile/data/settings_repository.dart';
import 'package:careconnect_mobile/models/accessibility_settings.dart';
import 'package:careconnect_mobile/models/contact.dart';
import 'package:careconnect_mobile/models/message.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

/// The clock the fixtures are built around: today's date at a fixed time.
///
/// The date has to track the real calendar, because the day separators in a
/// conversation are rendered against `DateTime.now()`. Pinning the time of day
/// keeps everything else about the fixtures deterministic.
final DateTime kTestNow = _todayAt(10, 30);

DateTime _todayAt(int hour, int minute) {
  final DateTime now = DateTime.now();
  return DateTime(now.year, now.month, now.day, hour, minute);
}

/// Sizes the test surface like a phone.
///
/// The default 800x600 surface is past the tablet breakpoint, so without this
/// every layout test would silently exercise the two-column path. The height is
/// deliberately taller than a real handset so a whole screen is laid out in one
/// viewport and assertions do not have to scroll to reach the last row.
void usePhoneSurface(WidgetTester tester) {
  tester.view.physicalSize = const Size(450, 3400);
  tester.view.devicePixelRatio = 1.0;
  addTearDown(tester.view.reset);
}

/// Sizes the test surface like a tablet.
void useTabletSurface(WidgetTester tester) {
  tester.view.physicalSize = const Size(1100, 1400);
  tester.view.devicePixelRatio = 1.0;
  addTearDown(tester.view.reset);
}

/// Pumps the real application with in-memory repositories.
///
/// Using the real [CareConnectApp] rather than a stripped-down test wrapper
/// means these tests exercise the router, the providers and the theme exactly
/// as the shipped app assembles them.
Future<SettingsRepository> pumpApp(
  WidgetTester tester, {
  String initialLocation = Routes.contacts,
  List<Contact>? contacts,
  List<Message>? messages,
  AccessibilitySettings? settings,
  SettingsRepository? settingsRepository,
}) async {
  final SettingsRepository repository = settingsRepository ??
      InMemorySettingsRepository(settings ?? AccessibilitySettings.defaults);

  await tester.pumpWidget(
    CareConnectApp(
      contactRepository: MockContactRepository(seed: contacts),
      messageRepository: MockMessageRepository(now: kTestNow, seed: messages),
      settingsRepository: repository,
      initialLocation: initialLocation,
    ),
  );
  await tester.pumpAndSettle();
  return repository;
}

/// A minimal contact for tests that do not care about the seeded fixtures.
Contact testContact({
  String id = 't1',
  String name = 'Test Person',
  ContactRole role = ContactRole.family,
  String relationship = 'Test relationship',
  bool isPrimary = false,
  bool isEmergency = false,
  String? avatarInitials,
  List<ContactChannel>? channels,
}) {
  return Contact(
    id: id,
    name: name,
    role: role,
    relationship: relationship,
    textNumber: '07700 900 000',
    channels: channels ?? const <ContactChannel>[ContactChannel.message],
    avatarInitials: avatarInitials,
    isPrimary: isPrimary,
    isEmergency: isEmergency,
  );
}

/// A minimal message.
Message testMessage({
  String id = 'x1',
  String contactId = 't1',
  MessageAuthor author = MessageAuthor.them,
  MessageKind kind = MessageKind.text,
  String body = 'Hello there',
  DateTime? sentAt,
  DeliveryStatus status = DeliveryStatus.sent,
  String? mediaLabel,
  bool hasCaptions = false,
}) {
  return Message(
    id: id,
    contactId: contactId,
    author: author,
    kind: kind,
    body: body,
    sentAt: sentAt ?? kTestNow,
    status: status,
    mediaLabel: mediaLabel,
    hasCaptions: hasCaptions,
  );
}
