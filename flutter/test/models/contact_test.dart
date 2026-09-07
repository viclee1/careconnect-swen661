import 'package:careconnect_mobile/models/contact.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('Contact.initials', () {
    test('uses the value the design supplies', () {
      // The prototype writes "Joyce" as JO, which no mechanical rule produces.
      const Contact contact = Contact(
        id: 'a',
        name: 'Joyce',
        role: ContactRole.careTeam,
        relationship: 'Caregiver · Daughter',
        textNumber: '1',
        channels: <ContactChannel>[ContactChannel.message],
        avatarInitials: 'JO',
      );
      expect(contact.initials, 'JO');
    });

    test('upper-cases and trims a supplied value', () {
      const Contact contact = Contact(
        id: 'a',
        name: 'Maria',
        role: ContactRole.family,
        relationship: 'Daughter',
        textNumber: '1',
        channels: <ContactChannel>[ContactChannel.message],
        avatarInitials: ' ma ',
      );
      expect(contact.initials, 'MA');
    });

    test('derives first and last initials when none is supplied', () {
      const Contact contact = Contact(
        id: 'a',
        name: 'Maria Thompson',
        role: ContactRole.family,
        relationship: 'Daughter',
        textNumber: '1',
        channels: <ContactChannel>[ContactChannel.message],
      );
      expect(contact.initials, 'MT');
    });

    test('falls back to one letter for a single-word name', () {
      const Contact contact = Contact(
        id: 'a',
        name: 'Joyce',
        role: ContactRole.careTeam,
        relationship: 'Carer',
        textNumber: '1',
        channels: <ContactChannel>[ContactChannel.message],
      );
      expect(contact.initials, 'J');
    });

    test('tolerates extra whitespace', () {
      const Contact contact = Contact(
        id: 'a',
        name: '  maria   thompson  ',
        role: ContactRole.family,
        relationship: 'Daughter',
        textNumber: '1',
        channels: <ContactChannel>[ContactChannel.message],
      );
      expect(contact.initials, 'MT');
    });

    test('returns a question mark rather than an empty avatar', () {
      const Contact contact = Contact(
        id: 'a',
        name: '   ',
        role: ContactRole.family,
        relationship: 'Daughter',
        textNumber: '1',
        channels: <ContactChannel>[ContactChannel.message],
      );
      expect(contact.initials, '?');
    });

    test('an empty supplied value falls back to deriving one', () {
      const Contact contact = Contact(
        id: 'a',
        name: 'Maria Thompson',
        role: ContactRole.family,
        relationship: 'Daughter',
        textNumber: '1',
        channels: <ContactChannel>[ContactChannel.message],
        avatarInitials: '   ',
      );
      expect(contact.initials, 'MT');
    });
  });

  group('Contact naming', () {
    const Contact doctor = Contact(
      id: 'd',
      name: 'Dr. Sharma',
      role: ContactRole.doctor,
      relationship: 'GP — Greenfield Surgery',
      textNumber: '01234 567 890',
      channels: <ContactChannel>[
        ContactChannel.message,
        ContactChannel.videoRelay,
      ],
    );

    const Contact helpline = Contact(
      id: 'h',
      name: 'NHS 111',
      role: ContactRole.helpline,
      relationship: 'Medical helpline',
      textNumber: '18001 111',
      channels: <ContactChannel>[ContactChannel.textRelay],
      isEmergency: true,
    );

    test('skips an honorific so the composer reads "Message Sharma"', () {
      expect(doctor.givenName, 'Sharma');
      expect(doctor.conversationName, 'Sharma');
    });

    test('uses the plain first name when there is no honorific', () {
      const Contact person = Contact(
        id: 'p',
        name: 'Joyce',
        role: ContactRole.careTeam,
        relationship: 'Caregiver · Daughter',
        textNumber: '1',
        channels: <ContactChannel>[ContactChannel.message],
      );
      expect(person.givenName, 'Joyce');
      expect(person.conversationName, 'Joyce');
    });

    test('a helpline keeps its full name', () {
      expect(helpline.givenName, isEmpty);
      expect(helpline.conversationName, 'NHS 111');
    });
  });

  group('Contact channels', () {
    test('primaryChannel is the first channel offered', () {
      const Contact contact = Contact(
        id: 'a',
        name: 'Joyce',
        role: ContactRole.careTeam,
        relationship: 'Caregiver · Daughter',
        textNumber: '1',
        channels: <ContactChannel>[
          ContactChannel.videoRelay,
          ContactChannel.message,
        ],
      );
      expect(contact.primaryChannel, ContactChannel.videoRelay);
      expect(contact.supportsVideoRelay, isTrue);
    });

    test('supportsVideoRelay is false when no video channel is offered', () {
      const Contact contact = Contact(
        id: 'a',
        name: 'James',
        role: ContactRole.family,
        relationship: 'Son',
        textNumber: '1',
        channels: <ContactChannel>[ContactChannel.message],
      );
      expect(contact.supportsVideoRelay, isFalse);
    });

    test('every channel exposes a human-readable label', () {
      for (final ContactChannel channel in ContactChannel.values) {
        expect(channel.label, isNotEmpty);
      }
    });
  });

  group('Contact.semanticLabel', () {
    test('announces the relationship, the pill and the service flag', () {
      const Contact contact = Contact(
        id: 'a',
        name: 'Joyce',
        role: ContactRole.careTeam,
        relationship: 'Caregiver · Daughter',
        textNumber: '1',
        channels: <ContactChannel>[ContactChannel.message],
        isPrimary: true,
      );
      expect(
        contact.semanticLabel,
        'Joyce, Caregiver · Daughter, primary contact',
      );
    });

    test('marks an urgent-care service', () {
      const Contact contact = Contact(
        id: 'a',
        name: 'NHS 111',
        role: ContactRole.helpline,
        relationship: 'Medical helpline',
        textNumber: '1',
        channels: <ContactChannel>[ContactChannel.textRelay],
        isEmergency: true,
      );
      expect(
        contact.semanticLabel,
        'NHS 111, Medical helpline, urgent care service',
      );
    });

    test('omits the parts that do not apply', () {
      const Contact contact = Contact(
        id: 'a',
        name: 'James',
        role: ContactRole.family,
        relationship: 'Son',
        textNumber: '1',
        channels: <ContactChannel>[ContactChannel.message],
      );
      expect(contact.semanticLabel, 'James, Son');
    });
  });

  group('ContactRole', () {
    test('fromName round-trips every value', () {
      for (final ContactRole role in ContactRole.values) {
        expect(ContactRole.fromName(role.name), role);
      }
    });

    test('fromName falls back rather than throwing on bad input', () {
      expect(ContactRole.fromName('not-a-role'), ContactRole.family);
      expect(ContactRole.fromName(null), ContactRole.family);
    });
  });

  group('Contact value semantics', () {
    const Contact base = Contact(
      id: 'same',
      name: 'Joyce',
      role: ContactRole.careTeam,
      relationship: 'Caregiver · Daughter',
      textNumber: '1',
      channels: <ContactChannel>[ContactChannel.message],
      isPrimary: true,
    );

    test('copyWith changes only what it is given', () {
      final Contact updated = base.copyWith(name: 'Joyce A.');
      expect(updated.name, 'Joyce A.');
      expect(updated.id, base.id);
      expect(updated.relationship, 'Caregiver · Daughter');
      expect(updated.isPrimary, isTrue);
    });

    test('two contacts are equal when their ids match', () {
      final Contact other = base.copyWith(name: 'Someone else');
      expect(base, equals(other));
      expect(base.hashCode, other.hashCode);
      expect(base.toString(), contains('same'));
    });
  });
}
