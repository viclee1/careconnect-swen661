/// Who a contact is to the care recipient.
///
/// The role drives the icon shown beside a contact in the conversation header.
/// It never carries meaning on its own — the card and the header always print
/// the relationship in words next to it, per the Assignment 3 rule that no
/// information travels on a single channel.
enum ContactRole {
  careTeam('Carer'),
  family('Family'),
  doctor('Doctor'),
  helpline('Helpline');

  const ContactRole(this.label);

  /// Human-readable label, used when a contact has no written relationship.
  final String label;

  /// Parses a stored role name, falling back to [ContactRole.family] so a
  /// corrupt preference or fixture can never crash the contact list.
  static ContactRole fromName(String? name) {
    for (final ContactRole role in ContactRole.values) {
      if (role.name == name) return role;
    }
    return ContactRole.family;
  }
}

/// How this person can be reached.
///
/// CareConnect is built for users who cannot rely on a voice call, so every
/// contact exposes at least one non-voice channel. [ContactChannel.textRelay]
/// is the accessible route to a hearing-only service such as a medical
/// helpline.
enum ContactChannel {
  message('Message'),
  videoRelay('Video call with captions'),
  textRelay('Text relay');

  const ContactChannel(this.label);

  final String label;
}

/// A person or service on the Contacts screen.
class Contact {
  const Contact({
    required this.id,
    required this.name,
    required this.role,
    required this.relationship,
    required this.textNumber,
    required this.channels,
    this.avatarInitials,
    this.isPrimary = false,
    this.isEmergency = false,
  });

  final String id;

  /// The name as the prototype prints it — "Joyce", "Dr. Sharma", "NHS 111".
  final String name;

  final ContactRole role;

  /// The line under the name: "Caregiver · Daughter", "GP — Greenfield
  /// Surgery", "Son", "Medical helpline".
  final String relationship;

  /// The SMS or text-relay number. CareConnect never surfaces a voice-only
  /// number as a contact's primary action.
  final String textNumber;

  /// Channels this contact can be reached on, in the order they are offered.
  final List<ContactChannel> channels;

  /// Avatar initials taken straight from the Week 3 prototype.
  ///
  /// The prototype does not derive these mechanically — "Joyce" is JO and
  /// "NHS 111" is NH — so the design's own value wins when one is supplied,
  /// and [initials] derives them only when it is not.
  final String? avatarInitials;

  /// The contact to reach first. Rendered as a "Primary" pill on the card.
  final bool isPrimary;

  /// An emergency or urgent-care service rather than a person.
  final bool isEmergency;

  /// Up to two uppercase initials for the avatar.
  ///
  /// Extra whitespace is tolerated and a name that is entirely whitespace
  /// yields `'?'` rather than an empty avatar.
  String get initials {
    final String? fromDesign = avatarInitials;
    if (fromDesign != null && fromDesign.trim().isNotEmpty) {
      return fromDesign.trim().toUpperCase();
    }
    final List<String> parts = name
        .split(RegExp(r'\s+'))
        .where((String part) => part.trim().isNotEmpty)
        .toList();
    if (parts.isEmpty) return '?';
    if (parts.length == 1) {
      return parts.first.substring(0, 1).toUpperCase();
    }
    return (parts.first.substring(0, 1) + parts.last.substring(0, 1))
        .toUpperCase();
  }

  /// The action offered first, when a contact supports more than one channel.
  ContactChannel get primaryChannel => channels.first;

  /// True when this contact can be reached over a captioned video call.
  bool get supportsVideoRelay => channels.contains(ContactChannel.videoRelay);

  static const Set<String> _honorifics = <String>{
    'dr',
    'dr.',
    'mr',
    'mr.',
    'mrs',
    'mrs.',
    'ms',
    'ms.',
    'prof',
    'prof.',
  };

  /// The name to address this contact by in a short label.
  ///
  /// A leading honorific is skipped, so the GP reads as "Sharma" rather than
  /// "Dr.". Services return an empty string: they are not people, and
  /// "Message NHS" would read oddly.
  String get givenName {
    if (role == ContactRole.helpline) return '';
    final List<String> parts = name
        .split(RegExp(r'\s+'))
        .where((String part) => part.trim().isNotEmpty)
        .toList();
    if (parts.isEmpty) return '';
    if (parts.length > 1 && _honorifics.contains(parts.first.toLowerCase())) {
      return parts[1];
    }
    return parts.first;
  }

  /// How the conversation screen refers to this contact — "Message Joyce…",
  /// "Alert Joyce you want to talk".
  String get conversationName => givenName.isEmpty ? name : givenName;

  /// The single sentence assistive technology announces for this contact.
  ///
  /// It repeats in words everything the card shows visually, including the
  /// Primary pill, which is otherwise only a shape.
  String get semanticLabel {
    final StringBuffer buffer = StringBuffer('$name, $relationship');
    if (isPrimary) buffer.write(', primary contact');
    if (isEmergency) buffer.write(', urgent care service');
    return buffer.toString();
  }

  Contact copyWith({
    String? name,
    ContactRole? role,
    String? relationship,
    String? textNumber,
    List<ContactChannel>? channels,
    String? avatarInitials,
    bool? isPrimary,
    bool? isEmergency,
  }) {
    return Contact(
      id: id,
      name: name ?? this.name,
      role: role ?? this.role,
      relationship: relationship ?? this.relationship,
      textNumber: textNumber ?? this.textNumber,
      channels: channels ?? this.channels,
      avatarInitials: avatarInitials ?? this.avatarInitials,
      isPrimary: isPrimary ?? this.isPrimary,
      isEmergency: isEmergency ?? this.isEmergency,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) || (other is Contact && other.id == id);

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() => 'Contact($id, $name, ${role.name})';
}
