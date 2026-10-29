/// Input validation used by the message composer.
///
/// Pure functions again, so the rules can be unit tested without pumping a
/// widget, and so the same rule can be reused by a future caregiver-side
/// composer without duplicating the logic.
abstract final class Validators {
  /// Longest message CareConnect will send in one go.
  static const int maxMessageLength = 500;

  /// Validates the message composer.
  ///
  /// Returns `null` when [value] may be sent, or a sentence explaining what to
  /// fix. The message is written for the reader, not the developer, because it
  /// is rendered directly under the field and read aloud by screen readers.
  static String? message(String? value) {
    final String text = (value ?? '').trim();
    if (text.isEmpty) {
      return 'Type a message before sending.';
    }
    if (text.length > maxMessageLength) {
      return 'Messages can be up to $maxMessageLength characters. '
          'Yours is ${text.length}.';
    }
    return null;
  }

  /// Whether [value] is a sendable message.
  static bool canSend(String? value) => message(value) == null;

  /// Characters still available, floored at zero.
  static int remaining(String? value) {
    final int used = (value ?? '').trim().length;
    final int left = maxMessageLength - used;
    return left < 0 ? 0 : left;
  }

  /// Validates a caregiver form where every field is required.
  ///
  /// Returns one sentence per empty field, keyed by field, in the order given
  /// — empty when the form may be saved.
  static Map<String, String> requiredFields(
    List<({String name, String label})> fields,
    Map<String, String> values,
  ) {
    final Map<String, String> errors = <String, String>{};
    for (final field in fields) {
      if ((values[field.name] ?? '').trim().isEmpty) {
        errors[field.name] = '${field.label} is required.';
      }
    }
    return errors;
  }

  /// "1 thing needs fixing" / "3 things need fixing".
  static String fixSummary(int count) =>
      count == 1 ? '1 thing needs fixing' : '$count things need fixing';
}
