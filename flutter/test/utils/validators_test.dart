import 'package:careconnect_mobile/core/utils/validators.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('message validation', () {
    test('accepts ordinary text', () {
      expect(Validators.message('Hello Maria'), isNull);
      expect(Validators.canSend('Hello Maria'), isTrue);
    });

    test('rejects an empty message with a readable explanation', () {
      expect(Validators.message(''), 'Type a message before sending.');
      expect(Validators.canSend(''), isFalse);
    });

    test('rejects whitespace only', () {
      expect(Validators.message('    \n  '), isNotNull);
      expect(Validators.canSend('   '), isFalse);
    });

    test('rejects null', () {
      expect(Validators.message(null), isNotNull);
      expect(Validators.canSend(null), isFalse);
    });

    test('accepts a message exactly at the limit', () {
      final String text = 'a' * Validators.maxMessageLength;
      expect(Validators.message(text), isNull);
    });

    test('rejects a message one character over the limit', () {
      final String text = 'a' * (Validators.maxMessageLength + 1);
      final String? error = Validators.message(text);
      expect(error, isNotNull);
      expect(error, contains('${Validators.maxMessageLength}'));
    });

    test('measures the trimmed length, so padding does not count', () {
      final String text = '  ${'a' * Validators.maxMessageLength}  ';
      expect(Validators.message(text), isNull);
    });
  });

  group('remaining', () {
    test('counts down from the maximum', () {
      expect(Validators.remaining(''), Validators.maxMessageLength);
      expect(Validators.remaining('abc'), Validators.maxMessageLength - 3);
      expect(Validators.remaining(null), Validators.maxMessageLength);
    });

    test('never goes below zero', () {
      final String text = 'a' * (Validators.maxMessageLength + 50);
      expect(Validators.remaining(text), 0);
    });
  });
}
