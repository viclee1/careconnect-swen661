/**
 * Who a contact is to the care recipient.
 *
 * The role drives the icon shown beside a contact in the conversation header.
 * It never carries meaning on its own — the card and the header always print
 * the relationship in words next to it, per the Assignment 3 rule that no
 * information travels on a single channel.
 */
export type ContactRole = 'careTeam' | 'family' | 'doctor' | 'helpline';

export const contactRoleLabels: Record<ContactRole, string> = {
  careTeam: 'Carer',
  family: 'Family',
  doctor: 'Doctor',
  helpline: 'Helpline',
};

/**
 * Parses a stored role, falling back to `family` so a corrupt fixture or
 * preference can never crash the contact list.
 */
export function contactRoleFrom(value: string | null | undefined): ContactRole {
  const roles = Object.keys(contactRoleLabels) as ContactRole[];
  return roles.includes(value as ContactRole) ? (value as ContactRole) : 'family';
}

/**
 * How this person can be reached.
 *
 * CareConnect is built for users who cannot rely on a voice call, so every
 * contact exposes at least one non-voice channel. `textRelay` is the accessible
 * route to a hearing-only service such as a medical helpline.
 */
export type ContactChannel = 'message' | 'videoRelay' | 'textRelay';

export const contactChannelLabels: Record<ContactChannel, string> = {
  message: 'Message',
  videoRelay: 'Video call with captions',
  textRelay: 'Text relay',
};

/** A person or service on the Contacts screen. */
export interface Contact {
  id: string;
  /** The name as the prototype prints it — "Joyce", "Dr. Sharma", "NHS 111". */
  name: string;
  role: ContactRole;
  /**
   * The line under the name: "Caregiver · Daughter", "GP — Greenfield Surgery",
   * "Son", "Medical helpline".
   */
  relationship: string;
  /**
   * The SMS or text-relay number. CareConnect never surfaces a voice-only
   * number as a contact's primary action.
   */
  textNumber: string;
  /** Channels this contact can be reached on, in the order they are offered. */
  channels: ContactChannel[];
  /**
   * Avatar initials taken straight from the Week 3 prototype. The prototype
   * does not derive these mechanically — "Joyce" is JO and "NHS 111" is NH — so
   * the design's own value wins, and {@link initialsFor} derives them only when
   * one is not supplied.
   */
  avatarInitials?: string;
  /** The contact to reach first. Rendered as a "Primary" pill on the card. */
  isPrimary?: boolean;
  /** An emergency or urgent-care service rather than a person. */
  isEmergency?: boolean;
}

/**
 * Up to two uppercase initials for the avatar.
 *
 * Extra whitespace is tolerated and a name that is entirely whitespace yields
 * `'?'` rather than an empty avatar.
 */
export function initialsFor(contact: Contact): string {
  const supplied = contact.avatarInitials?.trim();
  if (supplied) return supplied.toUpperCase();

  const parts = contact.name.split(/\s+/).filter((part) => part.trim().length > 0);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return (parts[0].slice(0, 1) + parts[parts.length - 1].slice(0, 1)).toUpperCase();
}

/** The action offered first, when a contact supports more than one channel. */
export function primaryChannelOf(contact: Contact): ContactChannel {
  return contact.channels[0];
}

/** True when this contact can be reached over a captioned video call. */
export function supportsVideoRelay(contact: Contact): boolean {
  return contact.channels.includes('videoRelay');
}

const honorifics = new Set([
  'dr',
  'dr.',
  'mr',
  'mr.',
  'mrs',
  'mrs.',
  'ms',
  'ms.',
  'prof',
  'prof.',
]);

/**
 * The name to address this contact by in a short label.
 *
 * A leading honorific is skipped, so the GP reads as "Sharma" rather than
 * "Dr.". Services return an empty string: they are not people, and
 * "Message NHS" would read oddly.
 */
export function givenNameOf(contact: Contact): string {
  if (contact.role === 'helpline') return '';
  const parts = contact.name.split(/\s+/).filter((part) => part.trim().length > 0);
  if (parts.length === 0) return '';
  if (parts.length > 1 && honorifics.has(parts[0].toLowerCase())) return parts[1];
  return parts[0];
}

/**
 * How the conversation screen refers to this contact — "Message Joyce…",
 * "Alert Joyce you want to talk".
 */
export function conversationNameOf(contact: Contact): string {
  return givenNameOf(contact) || contact.name;
}

/**
 * The single sentence assistive technology announces for this contact.
 *
 * It repeats in words everything the card shows visually, including the Primary
 * pill, which is otherwise only a shape.
 */
export function contactSemanticLabel(contact: Contact): string {
  let label = `${contact.name}, ${contact.relationship}`;
  if (contact.isPrimary) label += ', primary contact';
  if (contact.isEmergency) label += ', urgent care service';
  return label;
}
