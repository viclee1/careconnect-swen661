/** Who wrote a message in a conversation. */
export type MessageAuthor = 'me' | 'them' | 'system';

/**
 * What kind of content a message carries.
 *
 * CareConnect's governing rule is that anything communicated through sound must
 * also be communicated visually or in text. The non-text kinds below therefore
 * all carry a readable payload: a voicemail renders its transcript, a video
 * states whether a caption track is attached, and an alert renders a visible
 * banner with an icon and a word.
 */
export type MessageKind = 'text' | 'voicemail' | 'videoMessage' | 'alert';

/**
 * Delivery state of an outgoing message. Always rendered as a word next to its
 * tick, so it is never carried by a tick colour alone.
 */
export type DeliveryStatus = 'sending' | 'sent' | 'delivered' | 'read';

export const deliveryStatusLabels: Record<DeliveryStatus, string> = {
  sending: 'Sending',
  sent: 'Sent',
  delivered: 'Delivered',
  read: 'Read',
};

/** A single entry in a conversation with a contact. */
export interface Message {
  id: string;
  contactId: string;
  author: MessageAuthor;
  /**
   * The readable payload. For a voicemail this is the transcript; for a video
   * message it is the caption summary.
   */
  body: string;
  /** Milliseconds since the epoch, so a message is trivially serialisable. */
  sentAt: number;
  kind?: MessageKind;
  status?: DeliveryStatus;
  /** Short description of the attached media, e.g. "Voicemail · 0:34". */
  mediaLabel?: string;
  /**
   * Whether an attached video carries a synchronized caption track
   * (WCAG 2.2 success criterion 1.2.2).
   */
  hasCaptions?: boolean;
}

export const isMine = (message: Message): boolean => message.author === 'me';
export const isSystem = (message: Message): boolean => message.author === 'system';
export const kindOf = (message: Message): MessageKind => message.kind ?? 'text';

/** True when the message body stands in for audio the user cannot hear. */
export function isTextAlternative(message: Message): boolean {
  const kind = kindOf(message);
  return kind === 'voicemail' || kind === 'videoMessage';
}

/**
 * Heading shown above the readable payload for media messages.
 *
 * Returns `null` for a plain text message, which needs no heading.
 */
export function alternativeHeading(message: Message): string | null {
  switch (kindOf(message)) {
    case 'voicemail':
      return 'Transcript';
    case 'videoMessage':
      return message.hasCaptions ? 'Captions available' : 'Captions unavailable';
    default:
      return null;
  }
}

/** The sentence assistive technology announces for this message. */
export function messageSemanticLabel(message: Message, contactName: string): string {
  const who =
    message.author === 'me'
      ? 'You'
      : message.author === 'system'
        ? 'CareConnect alert'
        : contactName;

  let label = who;
  const heading = alternativeHeading(message);
  if (heading) label += `, ${heading}`;
  label += `: ${message.body}`;
  if (isMine(message)) {
    label += `. ${deliveryStatusLabels[message.status ?? 'sent']}`;
  }
  return label;
}

/** The most recent message in a conversation, or null for an empty one. */
export function latestOf(thread: Message[]): Message | null {
  return thread.length === 0 ? null : thread[thread.length - 1];
}

/**
 * A one-line preview of the conversation for the contact list.
 *
 * Media messages preview their readable payload — the transcript or caption
 * summary — because a preview that just said "Voicemail" would leave a deaf
 * user with no idea whether it mattered.
 */
export function previewOf(thread: Message[]): string {
  const latest = latestOf(thread);
  if (!latest) return 'No messages yet';
  const prefix = isMine(latest) ? 'You: ' : '';
  const heading = alternativeHeading(latest);
  const body = heading ? `${heading} — ${latest.body}` : latest.body;
  return `${prefix}${body}`;
}

/**
 * Messages waiting for a reply.
 *
 * Counts the incoming messages at the end of a conversation — the ones that
 * arrived after the user last wrote back. A conversation the user has already
 * answered shows no badge even though it is full of incoming messages, which is
 * what the prototype's badges show.
 *
 * CareConnect's own alerts are skipped: they are not somebody waiting.
 */
export function waitingCount(thread: Message[]): number {
  let count = 0;
  for (let i = thread.length - 1; i >= 0; i -= 1) {
    const message = thread[i];
    if (isMine(message)) break;
    if (isSystem(message)) continue;
    count += 1;
  }
  return count;
}

/** Sorts a conversation oldest-first without mutating the input. */
export function chronological(thread: Message[]): Message[] {
  return [...thread].sort((a, b) => a.sentAt - b.sentAt);
}

/** True when `message` is the first of its calendar day within `thread`. */
export function startsNewDay(thread: Message[], index: number): boolean {
  if (index === 0) return true;
  const previous = new Date(thread[index - 1].sentAt);
  const current = new Date(thread[index].sentAt);
  return (
    previous.getFullYear() !== current.getFullYear() ||
    previous.getMonth() !== current.getMonth() ||
    previous.getDate() !== current.getDate()
  );
}
