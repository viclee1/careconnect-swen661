import 'package:careconnect_mobile/models/message.dart';
import 'package:flutter_test/flutter_test.dart';

import '../support/harness.dart';

void main() {
  group('Message kinds', () {
    test('a plain text message needs no alternative heading', () {
      final Message message = testMessage();
      expect(message.isTextAlternative, isFalse);
      expect(message.alternativeHeading, isNull);
    });

    test('a voicemail is headed "Transcript"', () {
      final Message message = testMessage(
        kind: MessageKind.voicemail,
        mediaLabel: 'Voicemail · 0:34',
      );
      expect(message.isTextAlternative, isTrue);
      expect(message.alternativeHeading, 'Transcript');
    });

    test('a captioned video says captions are available', () {
      final Message message = testMessage(
        kind: MessageKind.videoMessage,
        hasCaptions: true,
      );
      expect(message.alternativeHeading, 'Captions available');
    });

    test('an uncaptioned video says so rather than staying silent', () {
      final Message message = testMessage(kind: MessageKind.videoMessage);
      expect(message.alternativeHeading, 'Captions unavailable');
    });

    test('an alert carries no media heading', () {
      final Message message = testMessage(kind: MessageKind.alert);
      expect(message.alternativeHeading, isNull);
      expect(message.isTextAlternative, isFalse);
    });
  });

  group('Message authorship', () {
    test('identifies outgoing messages', () {
      expect(testMessage(author: MessageAuthor.me).isMine, isTrue);
      expect(testMessage(author: MessageAuthor.them).isMine, isFalse);
    });

    test('identifies system alerts', () {
      expect(testMessage(author: MessageAuthor.system).isSystem, isTrue);
      expect(testMessage(author: MessageAuthor.them).isSystem, isFalse);
    });
  });

  group('Message.semanticLabel', () {
    test('names the sender and reads the body', () {
      final Message message = testMessage(body: 'Are you alright?');
      expect(
        message.semanticLabel('Maria'),
        'Maria: Are you alright?',
      );
    });

    test('reads the delivery state back for outgoing messages', () {
      final Message message = testMessage(
        author: MessageAuthor.me,
        body: 'All good',
        status: DeliveryStatus.read,
      );
      expect(message.semanticLabel('Maria'), 'You: All good. Read');
    });

    test('announces a transcript before reading it', () {
      final Message message = testMessage(
        kind: MessageKind.voicemail,
        body: 'Your results are back.',
      );
      expect(
        message.semanticLabel('Dr. Sharma'),
        'Dr. Sharma, Transcript: Your results are back.',
      );
    });

    test('announces a system alert as CareConnect, not as a person', () {
      final Message message = testMessage(
        author: MessageAuthor.system,
        kind: MessageKind.alert,
        body: 'Amlodipine is due.',
      );
      expect(
        message.semanticLabel('Maria'),
        'CareConnect alert: Amlodipine is due.',
      );
    });
  });

  group('DeliveryStatus', () {
    test('every status is written out in words', () {
      expect(DeliveryStatus.sending.label, 'Sending');
      expect(DeliveryStatus.sent.label, 'Sent');
      expect(DeliveryStatus.delivered.label, 'Delivered');
      expect(DeliveryStatus.read.label, 'Read');
    });
  });

  group('Message value semantics', () {
    test('copyWith preserves identity fields', () {
      final Message message = testMessage(id: 'm1', contactId: 'c9');
      final Message updated = message.copyWith(
        status: DeliveryStatus.delivered,
        body: 'Edited',
      );
      expect(updated.id, 'm1');
      expect(updated.contactId, 'c9');
      expect(updated.status, DeliveryStatus.delivered);
      expect(updated.body, 'Edited');
    });

    test('equality is by id', () {
      final Message a = testMessage(id: 'same', body: 'One');
      final Message b = testMessage(id: 'same', body: 'Two');
      expect(a, equals(b));
      expect(a.hashCode, b.hashCode);
      expect(a.toString(), contains('same'));
    });
  });
}
