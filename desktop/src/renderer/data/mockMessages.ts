import type { Message } from '../models/message';

/**
 * Builds the seed conversations.
 *
 * Timestamps are derived from `now` rather than `Date.now()` so tests can pin
 * the clock and assert on "Today" / "Yesterday" grouping deterministically.
 *
 * The waiting badges these produce match the Week 3 prototype: one outstanding
 * from Joyce, one from Maria, and nothing elsewhere.
 */
export function buildMockMessages(now: number): Message[] {
  const reference = new Date(now);
  const midnight = new Date(
    reference.getFullYear(),
    reference.getMonth(),
    reference.getDate(),
  ).getTime();

  const at = (daysAgo: number, hour: number, minute: number): number =>
    midnight - daysAgo * 86_400_000 + hour * 3_600_000 + minute * 60_000;

  return [
    // ── Joyce — caregiver, daughter, primary contact ────────────────────
    {
      id: 'm1',
      contactId: 'c1',
      author: 'me',
      body: 'Goodnight Joyce. See you in the morning.',
      sentAt: at(1, 19, 40),
      status: 'read',
    },
    {
      id: 'm2',
      contactId: 'c1',
      author: 'them',
      body: 'Good morning Margaret! How are you feeling today?',
      sentAt: at(0, 8, 2),
    },

    // ── Dr. Sharma — the surgery rang, so the call arrives as text ──────
    {
      id: 'm3',
      contactId: 'c2',
      author: 'them',
      kind: 'voicemail',
      mediaLabel: 'Voicemail · 0:34',
      body:
        'This is Greenfield Surgery. Your blood test results are back and ' +
        'everything is within the normal range. There is nothing you need to ' +
        'do. Please reply here if you would like to talk it through.',
      sentAt: at(2, 14, 2),
    },
    {
      id: 'm4',
      contactId: 'c2',
      author: 'me',
      body: 'Thank you for typing that out. No questions from me.',
      sentAt: at(2, 15, 40),
      status: 'read',
    },

    // ── Maria — daughter ────────────────────────────────────────────────
    {
      id: 'm5',
      contactId: 'c3',
      author: 'me',
      body: 'Thank you for the photographs, they made my morning.',
      sentAt: at(1, 16, 10),
      status: 'delivered',
    },
    {
      id: 'm6',
      contactId: 'c3',
      author: 'them',
      kind: 'videoMessage',
      mediaLabel: 'Video message · 1:12',
      hasCaptions: true,
      body:
        'Hi Mum, the garden is finally done. Wait until you see the roses by ' +
        'the back gate. We will bring more photographs on Sunday.',
      sentAt: at(0, 9, 5),
    },

    // ── James — son. A medication reminder landed in this conversation ──
    {
      id: 'm7',
      contactId: 'c4',
      author: 'system',
      kind: 'alert',
      body:
        'Medication reminder: Amlodipine 5 mg was due at 8:30 am. James was ' +
        'told you had not marked it as taken.',
      sentAt: at(0, 8, 45),
    },
    {
      id: 'm8',
      contactId: 'c4',
      author: 'me',
      body: 'Taken now, thank you for checking.',
      sentAt: at(0, 8, 52),
      status: 'read',
    },
  ];
}
