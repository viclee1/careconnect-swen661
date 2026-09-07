import '../models/message.dart';

/// Builds the seed conversations.
///
/// Timestamps are derived from [now] rather than `DateTime.now()` so tests can
/// pin the clock and assert on "Today" / "Yesterday" grouping deterministically.
///
/// The unread badges these produce match the Week 3 prototype: one waiting from
/// Joyce, one from Maria, and nothing outstanding elsewhere.
List<Message> buildMockMessages(DateTime now) {
  final DateTime today = DateTime(now.year, now.month, now.day);
  DateTime at(int daysAgo, int hour, int minute) =>
      today.subtract(Duration(days: daysAgo)).add(
            Duration(hours: hour, minutes: minute),
          );

  return <Message>[
    // ── Joyce — caregiver, daughter, primary contact ─────────────────────
    Message(
      id: 'm1',
      contactId: 'c1',
      author: MessageAuthor.me,
      body: 'Goodnight Joyce. See you in the morning.',
      sentAt: at(1, 19, 40),
      status: DeliveryStatus.read,
    ),
    Message(
      id: 'm2',
      contactId: 'c1',
      author: MessageAuthor.them,
      body: 'Good morning Margaret! How are you feeling today?',
      sentAt: at(0, 8, 2),
    ),

    // ── Dr. Sharma — the surgery rang, so the call arrives as text ───────
    Message(
      id: 'm3',
      contactId: 'c2',
      author: MessageAuthor.them,
      kind: MessageKind.voicemail,
      mediaLabel: 'Voicemail · 0:34',
      body: 'This is Greenfield Surgery. Your blood test results are back and '
          'everything is within the normal range. There is nothing you need '
          'to do. Please reply here if you would like to talk it through.',
      sentAt: at(2, 14, 2),
    ),
    Message(
      id: 'm4',
      contactId: 'c2',
      author: MessageAuthor.me,
      body: 'Thank you for typing that out. No questions from me.',
      sentAt: at(2, 15, 40),
      status: DeliveryStatus.read,
    ),

    // ── Maria — daughter ─────────────────────────────────────────────────
    Message(
      id: 'm5',
      contactId: 'c3',
      author: MessageAuthor.me,
      body: 'Thank you for the photographs, they made my morning.',
      sentAt: at(1, 16, 10),
      status: DeliveryStatus.delivered,
    ),
    Message(
      id: 'm6',
      contactId: 'c3',
      author: MessageAuthor.them,
      kind: MessageKind.videoMessage,
      mediaLabel: 'Video message · 1:12',
      hasCaptions: true,
      body: 'Hi Mum, the garden is finally done. Wait until you see the roses '
          'by the back gate. We will bring more photographs on Sunday.',
      sentAt: at(0, 9, 5),
    ),

    // ── James — son. A medication reminder landed in this thread ─────────
    Message(
      id: 'm7',
      contactId: 'c4',
      author: MessageAuthor.system,
      kind: MessageKind.alert,
      body: 'Medication reminder: Amlodipine 5 mg was due at 8:30 am. '
          'James was told you had not marked it as taken.',
      sentAt: at(0, 8, 45),
    ),
    Message(
      id: 'm8',
      contactId: 'c4',
      author: MessageAuthor.me,
      body: 'Taken now, thank you for checking.',
      sentAt: at(0, 8, 52),
      status: DeliveryStatus.read,
    ),
  ];
}
