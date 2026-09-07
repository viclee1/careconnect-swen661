/// Who wrote a message in a thread.
enum MessageAuthor { me, them, system }

/// What kind of content a message carries.
///
/// CareConnect's governing rule is that anything communicated through sound
/// must also be communicated visually or in text. The non-text kinds below
/// therefore all carry a readable payload:
///
/// * [voicemail] renders its transcript, never a bare "play" button.
/// * [videoMessage] states whether a caption track is attached.
/// * [alert] renders a visible banner with an icon and a word.
enum MessageKind { text, voicemail, videoMessage, alert }

/// Delivery state of an outgoing message.
///
/// The state is always rendered as a word next to its icon so it is never
/// carried by a tick colour alone.
enum DeliveryStatus {
  sending('Sending'),
  sent('Sent'),
  delivered('Delivered'),
  read('Read');

  const DeliveryStatus(this.label);

  final String label;
}

/// A single entry in a conversation with a contact.
class Message {
  const Message({
    required this.id,
    required this.contactId,
    required this.author,
    required this.body,
    required this.sentAt,
    this.kind = MessageKind.text,
    this.status = DeliveryStatus.sent,
    this.mediaLabel,
    this.hasCaptions = false,
  });

  final String id;
  final String contactId;
  final MessageAuthor author;

  /// The readable payload. For a [MessageKind.voicemail] this is the
  /// transcript; for a [MessageKind.videoMessage] it is the caption summary.
  final String body;

  final DateTime sentAt;
  final MessageKind kind;
  final DeliveryStatus status;

  /// Short description of the attached media, e.g. "Voicemail · 0:34".
  final String? mediaLabel;

  /// Whether an attached video carries a synchronized caption track
  /// (WCAG 2.2 success criterion 1.2.2).
  final bool hasCaptions;

  bool get isMine => author == MessageAuthor.me;
  bool get isSystem => author == MessageAuthor.system;

  /// True when the message body stands in for audio the user cannot hear.
  bool get isTextAlternative =>
      kind == MessageKind.voicemail || kind == MessageKind.videoMessage;

  /// Heading shown above the readable payload for media messages.
  ///
  /// Returns `null` for a plain text message, which needs no heading.
  String? get alternativeHeading {
    switch (kind) {
      case MessageKind.voicemail:
        return 'Transcript';
      case MessageKind.videoMessage:
        return hasCaptions ? 'Captions available' : 'Captions unavailable';
      case MessageKind.text:
      case MessageKind.alert:
        return null;
    }
  }

  /// The sentence assistive technology announces for this message.
  String semanticLabel(String contactName) {
    final String who = switch (author) {
      MessageAuthor.me => 'You',
      MessageAuthor.them => contactName,
      MessageAuthor.system => 'CareConnect alert',
    };
    final StringBuffer buffer = StringBuffer(who);
    final String? heading = alternativeHeading;
    if (heading != null) buffer.write(', $heading');
    buffer.write(': $body');
    if (isMine) buffer.write('. ${status.label}');
    return buffer.toString();
  }

  Message copyWith({
    String? body,
    DeliveryStatus? status,
    MessageKind? kind,
    String? mediaLabel,
    bool? hasCaptions,
    DateTime? sentAt,
  }) {
    return Message(
      id: id,
      contactId: contactId,
      author: author,
      body: body ?? this.body,
      sentAt: sentAt ?? this.sentAt,
      kind: kind ?? this.kind,
      status: status ?? this.status,
      mediaLabel: mediaLabel ?? this.mediaLabel,
      hasCaptions: hasCaptions ?? this.hasCaptions,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) || (other is Message && other.id == id);

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() => 'Message($id, ${author.name}, ${kind.name})';
}
