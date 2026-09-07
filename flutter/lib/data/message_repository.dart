import '../models/message.dart';
import 'mock_messages.dart';

/// Read and write access to conversations.
abstract interface class MessageRepository {
  /// Every message for [contactId], oldest first.
  Future<List<Message>> fetchThread(String contactId);

  /// Appends an outgoing message from the user and returns the stored copy.
  Future<Message> send({required String contactId, required String body});

  /// Appends a CareConnect alert to the thread and returns the stored copy.
  ///
  /// Declared separately from [send] rather than as an optional argument on it,
  /// because the two have genuinely different meanings: one is the user
  /// speaking, the other is the app recording something it did.
  Future<Message> recordAlert({
    required String contactId,
    required String body,
  });
}

/// In-memory implementation seeded from [buildMockMessages].
///
/// Messages sent during a session are kept for the lifetime of the process,
/// which is enough for the Week 4 demo: leaving a thread and coming back shows
/// what was sent.
class MockMessageRepository implements MessageRepository {
  MockMessageRepository({DateTime? now, List<Message>? seed})
      : _clock = now ?? DateTime.now(),
        _messages = List<Message>.of(
          seed ?? buildMockMessages(now ?? DateTime.now()),
        );

  final DateTime _clock;
  final List<Message> _messages;
  int _sequence = 0;

  @override
  Future<List<Message>> fetchThread(String contactId) async {
    final List<Message> thread = _messages
        .where((Message message) => message.contactId == contactId)
        .toList()
      ..sort((Message a, Message b) => a.sentAt.compareTo(b.sentAt));
    return thread;
  }

  @override
  Future<Message> send({
    required String contactId,
    required String body,
  }) async {
    return _append(
      contactId: contactId,
      body: body,
      author: MessageAuthor.me,
      kind: MessageKind.text,
    );
  }

  @override
  Future<Message> recordAlert({
    required String contactId,
    required String body,
  }) async {
    return _append(
      contactId: contactId,
      body: body,
      author: MessageAuthor.system,
      kind: MessageKind.alert,
    );
  }

  Message _append({
    required String contactId,
    required String body,
    required MessageAuthor author,
    required MessageKind kind,
  }) {
    _sequence++;
    final Message message = Message(
      id: 'sent-$_sequence',
      contactId: contactId,
      author: author,
      kind: kind,
      body: body.trim(),
      // The seeded clock keeps ordering stable in tests; a real backend would
      // stamp this server-side.
      sentAt: _clock.add(Duration(minutes: _sequence)),
      status: DeliveryStatus.sent,
    );
    _messages.add(message);
    return message;
  }
}
