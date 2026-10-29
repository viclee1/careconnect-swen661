import { canSend, charactersRemaining, maxMessageLength, validateMessage } from '../validators';

describe('validateMessage', () => {
  it('accepts ordinary text', () => {
    expect(validateMessage('Hello Joyce')).toBeNull();
    expect(canSend('Hello Joyce')).toBe(true);
  });

  it('rejects an empty message with a readable explanation', () => {
    expect(validateMessage('')).toBe('Type a message before sending.');
    expect(canSend('')).toBe(false);
  });

  it('rejects whitespace only', () => {
    expect(validateMessage('    \n  ')).not.toBeNull();
    expect(canSend('   ')).toBe(false);
  });

  it('rejects null and undefined', () => {
    expect(canSend(null)).toBe(false);
    expect(canSend(undefined)).toBe(false);
  });

  it('accepts a message exactly at the limit', () => {
    expect(validateMessage('a'.repeat(maxMessageLength))).toBeNull();
  });

  it('rejects a message one character over the limit', () => {
    const error = validateMessage('a'.repeat(maxMessageLength + 1));
    expect(error).toContain(String(maxMessageLength));
  });

  it('measures the trimmed length, so padding does not count', () => {
    expect(validateMessage(`  ${'a'.repeat(maxMessageLength)}  `)).toBeNull();
  });
});

describe('charactersRemaining', () => {
  it('counts down from the maximum', () => {
    expect(charactersRemaining('')).toBe(maxMessageLength);
    expect(charactersRemaining('abc')).toBe(maxMessageLength - 3);
    expect(charactersRemaining(null)).toBe(maxMessageLength);
  });

  it('never goes below zero', () => {
    expect(charactersRemaining('a'.repeat(maxMessageLength + 50))).toBe(0);
  });
});
