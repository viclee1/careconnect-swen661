import { chronological, type Message } from '../models/message';
import { buildMockMessages } from './mockMessages';

/** Read and write access to conversations. */
export interface MessageRepository {
  /** Every message for a contact, oldest first. */
  fetchThread(contactId: string): Promise<Message[]>;

  /** Appends an outgoing message from the user and returns the stored copy. */
  send(contactId: string, body: string): Promise<Message>;

  /**
   * Appends a CareConnect alert and returns the stored copy.
   *
   * Declared separately from `send` rather than as an optional argument on it,
   * because the two have genuinely different meanings: one is the user
   * speaking, the other is the app recording something it did.
   */
  recordAlert(contactId: string, body: string): Promise<Message>;
}

export interface MockMessageRepositoryOptions {
  now?: number;
  seed?: Message[];
  /** How many `fetchThread` calls fail before the repository starts working. */
  failures?: number;
}

/**
 * In-memory implementation seeded from the prototype's conversations.
 *
 * Messages sent during a session are kept for the lifetime of the process,
 * which is enough for the Week 5 demo: leaving a conversation and coming back
 * shows what was sent.
 */
export function createMockMessageRepository(
  options: MockMessageRepositoryOptions = {},
): MessageRepository {
  const clock = options.now ?? Date.now();
  const messages: Message[] = [...(options.seed ?? buildMockMessages(clock))];
  const failures = options.failures ?? 0;
  let attempts = 0;
  let sequence = 0;

  const append = (
    contactId: string,
    body: string,
    author: Message['author'],
    kind: Message['kind'],
  ): Message => {
    sequence += 1;
    const message: Message = {
      id: `sent-${sequence}`,
      contactId,
      author,
      kind,
      body: body.trim(),
      // The seeded clock keeps ordering stable in tests; a real backend would
      // stamp this server-side.
      sentAt: clock + sequence * 60_000,
      status: 'sent',
    };
    messages.push(message);
    return message;
  };

  return {
    async fetchThread(contactId) {
      attempts += 1;
      if (attempts <= failures) throw new Error('offline');
      return chronological(messages.filter((message) => message.contactId === contactId));
    },
    async send(contactId, body) {
      return append(contactId, body, 'me', 'text');
    },
    async recordAlert(contactId, body) {
      return append(contactId, body, 'system', 'alert');
    },
  };
}
