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

/**
 * Validates a caregiver form where every field is required.
 *
 * Returns one sentence per empty field, keyed by field, in the order given —
 * empty when the form may be saved.
 */
export function requiredFieldErrors<K extends string>(
  fields: { name: K; label: string }[],
  values: Record<K, string>,
): Partial<Record<K, string>> {
  const errors: Partial<Record<K, string>> = {};
  for (const field of fields) {
    if (!(values[field.name] ?? '').trim()) errors[field.name] = `${field.label} is required.`;
  }
  return errors;
}

/** "1 thing needs fixing" / "3 things need fixing". */
export function fixSummary(count: number): string {
  return count === 1 ? '1 thing needs fixing' : `${count} things need fixing`;
}

// ── Sign in and sign up ─────────────────────────────────────────────────────
// The same rules and the same sentences as the web and desktop clients, so a
// user who moves between them is told the same thing in the same words.

/** Shortest password Sign up accepts. */
export const minPasswordLength = 6;

function emailError(email: string): string | undefined {
  if (!email.trim()) return 'Please enter your email address.';
  if (!/\S+@\S+\.\S+/.test(email)) return 'Please enter a valid email address.';
  return undefined;
}

/** Without the keys whose value is `undefined`, so "no errors" is `{}`. */
function defined<K extends string>(errors: Record<K, string | undefined>): Partial<Record<K, string>> {
  return Object.fromEntries(
    Object.entries(errors).filter((entry) => entry[1] !== undefined),
  ) as Partial<Record<K, string>>;
}

export type SignInField = 'email' | 'password';

/** One sentence per field to fix, in screen order; `{}` when it may be sent. */
export function validateSignIn(values: Record<SignInField, string>): Partial<Record<SignInField, string>> {
  return defined<SignInField>({
    email: emailError(values.email),
    password: values.password ? undefined : 'Please enter your password.',
  });
}

export type SignUpField = 'name' | 'email' | 'password' | 'confirm';

/** One sentence per field to fix, in screen order; `{}` when it may be sent. */
export function validateSignUp(values: Record<SignUpField, string>): Partial<Record<SignUpField, string>> {
  const { name, email, password, confirm } = values;
  return defined<SignUpField>({
    name: name.trim() ? undefined : 'Please enter your name.',
    email: emailError(email),
    password: !password
      ? 'Please create a password.'
      : password.length < minPasswordLength
        ? `Password must be at least ${minPasswordLength} characters.`
        : undefined,
    confirm: !confirm
      ? 'Please confirm your password.'
      : confirm !== password
        ? 'Passwords do not match.'
        : undefined,
  });
}

/** The summary read out when a form is refused, as on the web. */
export const formErrorSummary = 'Please correct the errors below to continue.';
