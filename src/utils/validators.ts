/** Longest message CareConnect will send in one go. */
export const maxMessageLength = 500;

/**
 * Validates the message composer.
 *
 * Returns `null` when the value may be sent, or a sentence explaining what to
 * fix. The message is written for the reader, not the developer, because it is
 * rendered directly under the field and read aloud by screen readers.
 */
export function validateMessage(value: string | null | undefined): string | null {
  const text = (value ?? '').trim();
  if (text.length === 0) return 'Type a message before sending.';
  if (text.length > maxMessageLength) {
    return `Messages can be up to ${maxMessageLength} characters. Yours is ${text.length}.`;
  }
  return null;
}

/** Whether the value is a sendable message. */
export function canSend(value: string | null | undefined): boolean {
  return validateMessage(value) === null;
}

/** Characters still available, floored at zero. */
export function charactersRemaining(value: string | null | undefined): number {
  const used = (value ?? '').trim().length;
  return Math.max(0, maxMessageLength - used);
}
