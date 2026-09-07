import 'package:flutter/foundation.dart';

import '../data/message_repository.dart';
import '../models/message.dart';

/// Owns every conversation, keyed by contact id.
///
/// The Contacts screen and the message thread both read from this one object,
/// which is why unread counts on the list update the moment a thread is opened
/// — the state is shared, not copied into each screen with `setState`.
class MessagesController extends ChangeNotifier {
  MessagesController({required MessageRepository repository})
      : _repository = repository;

  final MessageRepository _repository;

  final Map<String, List<Message>> _threads = <String, List<Message>>{};
  final Set<String> _readThreads = <String>{};
  final Set<String> _loading = <String>{};
  Object? _error;

  Object? get error => _error;

  /// Whether the thread for [contactId] is currently being fetched.
  bool isLoading(String contactId) => _loading.contains(contactId);

  /// Messages for [contactId], oldest first. Empty until [loadThread] runs.
  List<Message> messagesFor(String contactId) =>
      List<Message>.unmodifiable(_threads[contactId] ?? const <Message>[]);

  /// The most recent message in a thread, or `null` for an empty thread.
  Message? latestFor(String contactId) {
    final List<Message> thread = _threads[contactId] ?? const <Message>[];
    return thread.isEmpty ? null : thread.last;
  }

  /// A one-line preview of the thread for the contact list.
  ///
  /// Media messages preview their readable payload — the transcript or caption
  /// summary — because a preview that just said "Voicemail" would leave a deaf
  /// user with no idea whether it mattered.
  String previewFor(String contactId) {
    final Message? latest = latestFor(contactId);
    if (latest == null) return 'No messages yet';
    final String prefix = latest.isMine ? 'You: ' : '';
    final String? heading = latest.alternativeHeading;
    final String body = heading == null ? latest.body : '$heading — ${latest.body}';
    return '$prefix$body';
  }

  /// Messages waiting for a reply.
  ///
  /// Counts the incoming messages at the end of a thread — the ones that
  /// arrived after the user last wrote back. A conversation the user has
  /// already answered shows no badge even though it is full of incoming
  /// messages, which is what the prototype's badges show. Opening the thread
  /// clears the count outright.
  ///
  /// CareConnect's own alerts are skipped: they are not somebody waiting.
  int unreadCount(String contactId) {
    if (_readThreads.contains(contactId)) return 0;
    final List<Message> thread = _threads[contactId] ?? const <Message>[];
    int count = 0;
    for (final Message message in thread.reversed) {
      if (message.isMine) break;
      if (message.isSystem) continue;
      count++;
    }
    return count;
  }

  /// Total unread messages across every loaded thread.
  int get totalUnread => _threads.keys
      .map(unreadCount)
      .fold<int>(0, (int sum, int count) => sum + count);

  /// Loads a thread. Re-loading an already loaded thread is a no-op unless
  /// [force] is set, so returning to a conversation does not discard messages
  /// sent during this session.
  Future<void> loadThread(String contactId, {bool force = false}) async {
    if (!force && _threads.containsKey(contactId)) return;
    _loading.add(contactId);
    _error = null;
    notifyListeners();
    try {
      _threads[contactId] = await _repository.fetchThread(contactId);
    } catch (error) {
      _error = error;
      _threads[contactId] = const <Message>[];
    } finally {
      _loading.remove(contactId);
      notifyListeners();
    }
  }

  /// Loads every thread listed in [contactIds], used to populate the previews
  /// and unread badges on the Contacts screen.
  Future<void> loadThreads(Iterable<String> contactIds) async {
    for (final String id in contactIds) {
      await loadThread(id);
    }
  }

  /// Marks a thread as read. Called when the thread screen opens.
  void markRead(String contactId) {
    if (_readThreads.add(contactId)) notifyListeners();
  }

  /// Records that the user sent [contactName] a silent alert.
  ///
  /// The alert itself is a visual flash and a vibration on the other person's
  /// phone. What lands in the thread is the written record of it, because an
  /// action whose only trace was a flash would leave the user with no way to
  /// check later whether it actually went.
  Future<Message> sendNotify(String contactId, String contactName) async {
    final Message message = await _repository.recordAlert(
      contactId: contactId,
      body: 'You alerted $contactName that you want to talk. Their phone '
          'flashed and vibrated. No sound was played.',
    );
    _threads.putIfAbsent(contactId, () => <Message>[]);
    _threads[contactId] = <Message>[..._threads[contactId]!, message];
    notifyListeners();
    return message;
  }

  /// Sends [body] to [contactId].
  ///
  /// Returns the stored message, or `null` when [body] is blank — the composer
  /// blocks that case first, and this is the second line of defence so an empty
  /// bubble can never reach a thread.
  Future<Message?> send(String contactId, String body) async {
    if (body.trim().isEmpty) return null;
    final Message message =
        await _repository.send(contactId: contactId, body: body);
    _threads.putIfAbsent(contactId, () => <Message>[]);
    _threads[contactId] = <Message>[..._threads[contactId]!, message];
    notifyListeners();
    return message;
  }
}
