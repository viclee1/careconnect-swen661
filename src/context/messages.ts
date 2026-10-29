import { createContext, useContext } from 'react';

import type { Contact } from '../models/contact';
import type { Message } from '../models/message';

export interface MessagesContextValue {
  contacts: Contact[];
  contactById: (id: string) => Contact | undefined;
  /** A contact's conversation, oldest first. */
  messagesFor: (contactId: string) => Message[];
  previewFor: (contactId: string) => string;
  /** Messages waiting for a reply, or zero once the conversation is opened. */
  waitingFor: (contactId: string) => number;
  markRead: (contactId: string) => void;
  /** Sends a message. Offline, it is kept as "Sending" until the connection returns. */
  send: (contactId: string, body: string) => Message | null;
  /** Records that the user sent someone a silent visual alert. */
  sendNotify: (contactId: string, contactName: string) => Message;
  online: boolean;
  /** Messages typed offline that have not gone out yet. */
  queuedCount: number;
}

export const MessagesContext = createContext<MessagesContextValue | null>(null);

/** Contacts and conversations. Provided by MessagesProvider. */
export function useMessages(): MessagesContextValue {
  const ctx = useContext(MessagesContext);
  if (!ctx) throw new Error('useMessages must be used inside MessagesProvider');
  return ctx;
}
