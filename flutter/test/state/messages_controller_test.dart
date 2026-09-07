import 'package:careconnect_mobile/data/message_repository.dart';
import 'package:careconnect_mobile/models/message.dart';
import 'package:careconnect_mobile/state/messages_controller.dart';
import 'package:flutter_test/flutter_test.dart';

import '../support/harness.dart';

/// A repository that always fails, so the error path can be exercised.
class _FailingMessageRepository implements MessageRepository {
  @override
  Future<List<Message>> fetchThread(String contactId) async {
    throw StateError('offline');
  }

  @override
  Future<Message> send({required String contactId, required String body}) {
    throw StateError('offline');
  }

  @override
  Future<Message> recordAlert({
    required String contactId,
    required String body,
  }) {
    throw StateError('offline');
  }
}

void main() {
  late List<Message> seed;

  setUp(() {
    seed = <Message>[
      // c1 — answered, then a new message arrived: one waiting.
      testMessage(
        id: 'a1',
        contactId: 'c1',
        author: MessageAuthor.me,
        body: 'Goodnight Joyce.',
        sentAt: kTestNow.subtract(const Duration(days: 1, hours: 2)),
        status: DeliveryStatus.read,
      ),
      testMessage(
        id: 'a2',
        contactId: 'c1',
        author: MessageAuthor.them,
        body: 'Good morning Margaret!',
        sentAt: kTestNow.subtract(const Duration(hours: 2)),
      ),
      // c2 — a voicemail that has already been answered: nothing waiting.
      testMessage(
        id: 'b1',
        contactId: 'c2',
        author: MessageAuthor.them,
        kind: MessageKind.voicemail,
        mediaLabel: 'Voicemail · 0:20',
        body: 'Your results are back.',
        sentAt: kTestNow.subtract(const Duration(days: 2)),
      ),
      testMessage(
        id: 'b2',
        contactId: 'c2',
        author: MessageAuthor.me,
        body: 'Thank you.',
        sentAt: kTestNow.subtract(const Duration(days: 2, minutes: -30)),
        status: DeliveryStatus.read,
      ),
      // c3 — two messages in a row from them: two waiting.
      testMessage(
        id: 'c1m',
        contactId: 'c3',
        author: MessageAuthor.them,
        body: 'Are you awake?',
        sentAt: kTestNow.subtract(const Duration(hours: 3)),
      ),
      testMessage(
        id: 'c2m',
        contactId: 'c3',
        author: MessageAuthor.them,
        body: 'No rush.',
        sentAt: kTestNow.subtract(const Duration(hours: 2)),
      ),
    ];
  });

  MessagesController build() => MessagesController(
        repository: MockMessageRepository(now: kTestNow, seed: seed),
      );

  group('loadThread', () {
    test('loads a thread in chronological order', () async {
      final MessagesController controller = build();
      await controller.loadThread('c1');

      expect(
        controller.messagesFor('c1').map((Message m) => m.id),
        <String>['a1', 'a2'],
      );
    });

    test('an unloaded thread is empty rather than null', () {
      final MessagesController controller = build();
      expect(controller.messagesFor('c9'), isEmpty);
      expect(controller.latestFor('c9'), isNull);
    });

    test('re-loading a cached thread keeps what was sent this session',
        () async {
      final MessagesController controller = build();
      await controller.loadThread('c1');
      await controller.send('c1', 'Something new');

      await controller.loadThread('c1');

      expect(controller.messagesFor('c1'), hasLength(3));
    });

    test('force re-loads from the repository', () async {
      final MessagesController controller = build();
      await controller.loadThread('c1');
      await controller.loadThread('c1', force: true);
      expect(controller.messagesFor('c1'), hasLength(2));
    });

    test('records an error and leaves an empty thread on failure', () async {
      final MessagesController controller =
          MessagesController(repository: _FailingMessageRepository());

      await controller.loadThread('c1');

      expect(controller.error, isA<StateError>());
      expect(controller.messagesFor('c1'), isEmpty);
      expect(controller.isLoading('c1'), isFalse);
    });

    test('loadThreads fetches every id it is given', () async {
      final MessagesController controller = build();
      await controller.loadThreads(<String>['c1', 'c2', 'c3']);

      expect(controller.messagesFor('c1'), hasLength(2));
      expect(controller.messagesFor('c2'), hasLength(2));
      expect(controller.messagesFor('c3'), hasLength(2));
    });
  });

  group('previews', () {
    test('shows the most recent message', () async {
      final MessagesController controller = build();
      await controller.loadThread('c1');
      expect(controller.previewFor('c1'), 'Good morning Margaret!');
    });

    test('marks an outgoing preview with "You:"', () async {
      final MessagesController controller = build();
      await controller.loadThread('c2');
      expect(controller.previewFor('c2'), 'You: Thank you.');
    });

    test('previews a voicemail by its transcript, not by the word Voicemail',
        () async {
      // A thread whose last message is the voicemail itself.
      final MessagesController fresh = MessagesController(
        repository: MockMessageRepository(
          now: kTestNow,
          seed: <Message>[seed[2]],
        ),
      );
      await fresh.loadThread('c2');
      expect(fresh.previewFor('c2'), 'Transcript — Your results are back.');
    });

    test('says so plainly when a thread is empty', () {
      final MessagesController controller = build();
      expect(controller.previewFor('c9'), 'No messages yet');
    });
  });

  group('messages waiting', () {
    test('counts the incoming messages at the end of a thread', () async {
      final MessagesController controller = build();
      await controller.loadThread('c1');
      expect(controller.unreadCount('c1'), 1);
    });

    test('counts a run of unanswered incoming messages', () async {
      final MessagesController controller = build();
      await controller.loadThread('c3');
      expect(controller.unreadCount('c3'), 2);
    });

    test('an answered conversation has nothing waiting', () async {
      final MessagesController controller = build();
      await controller.loadThread('c2');
      expect(controller.unreadCount('c2'), 0);
    });

    test("CareConnect's own alerts do not count as somebody waiting", () async {
      final MessagesController controller = build();
      await controller.loadThread('c1');
      await controller.sendNotify('c1', 'Joyce');
      // The alert lands after Joyce's message but is not a person waiting.
      expect(controller.unreadCount('c1'), 1);
    });

    test('opening a thread clears its count', () async {
      final MessagesController controller = build();
      await controller.loadThread('c1');

      controller.markRead('c1');

      expect(controller.unreadCount('c1'), 0);
    });

    test('marking an already-read thread does not notify again', () async {
      final MessagesController controller = build();
      await controller.loadThread('c1');
      controller.markRead('c1');

      int notifications = 0;
      controller.addListener(() => notifications++);
      controller.markRead('c1');

      expect(notifications, 0);
    });

    test('totalUnread adds up across loaded threads', () async {
      final MessagesController controller = build();
      await controller.loadThreads(<String>['c1', 'c2', 'c3']);
      expect(controller.totalUnread, 3);

      controller.markRead('c3');
      expect(controller.totalUnread, 1);
    });
  });

  group('send', () {
    test('appends an outgoing message and notifies', () async {
      final MessagesController controller = build();
      await controller.loadThread('c1');

      int notifications = 0;
      controller.addListener(() => notifications++);

      final Message? sent = await controller.send('c1', 'On my way now');

      expect(sent, isNotNull);
      expect(sent!.isMine, isTrue);
      expect(sent.body, 'On my way now');
      expect(controller.messagesFor('c1').last.body, 'On my way now');
      expect(notifications, 1);
    });

    test('trims the body before storing it', () async {
      final MessagesController controller = build();
      await controller.loadThread('c1');
      final Message? sent = await controller.send('c1', '   padded   ');
      expect(sent?.body, 'padded');
    });

    test('refuses a blank message', () async {
      final MessagesController controller = build();
      await controller.loadThread('c1');

      expect(await controller.send('c1', '   '), isNull);
      expect(controller.messagesFor('c1'), hasLength(2));
    });

    test('starts a thread that has not been loaded yet', () async {
      final MessagesController controller = build();
      final Message? sent = await controller.send('c9', 'First message');
      expect(sent, isNotNull);
      expect(controller.messagesFor('c9'), hasLength(1));
    });

    test('the exposed thread list is unmodifiable', () async {
      final MessagesController controller = build();
      await controller.loadThread('c1');
      expect(
        () => controller.messagesFor('c1').add(testMessage(id: 'nope')),
        throwsUnsupportedError,
      );
    });
  });

  group('sendNotify', () {
    test('writes the silent alert into the conversation', () async {
      final MessagesController controller = build();
      await controller.loadThread('c1');

      final Message alert = await controller.sendNotify('c1', 'Joyce');

      expect(alert.isSystem, isTrue);
      expect(alert.kind, MessageKind.alert);
      expect(alert.body, contains('Joyce'));
      // The written record is what lets the user check later that it went.
      expect(alert.body, contains('No sound was played'));
      expect(controller.messagesFor('c1').last, alert);
    });

    test('works on a conversation that has never been opened', () async {
      final MessagesController controller = build();
      final Message alert = await controller.sendNotify('c9', 'Someone');
      expect(controller.messagesFor('c9'), <Message>[alert]);
    });
  });
}
