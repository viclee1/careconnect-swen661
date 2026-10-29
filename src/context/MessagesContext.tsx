import { useCallback, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';

import { seedContacts } from '../data/contactsData';
import { buildSeedMessages } from '../data/messagesData';
import { useLocalStorageState } from '../hooks/useLocalStorageState';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { chronological, previewOf, waitingCount, type Message } from '../models/message';
import { MessagesContext, type MessagesContextValue } from './messages';

// ── Storage ────────────────────────────────────────────────────────────────────

export const MESSAGES_KEY = 'careconnect_messages';

interface StoredConversations {
  messages: Message[];
  /** Contacts whose conversation has been opened since their last message. */
  read: string[];
}

function seed(): StoredConversations {
  return { messages: buildSeedMessages(Date.now()), read: [] };
}

function revive(stored: unknown): StoredConversations {
  const value = stored as Partial<StoredConversations> | null;
  if (!value || !Array.isArray(value.messages)) return seed();
  return { messages: value.messages, read: Array.isArray(value.read) ? value.read : [] };
}

let sequence = 0;
function nextId(): string {
  sequence += 1;
  return `sent-${Date.now()}-${sequence}`;
}

// ── Provider ────────────────────────────────────────────────────────────────────

export function MessagesProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useLocalStorageState<StoredConversations>(MESSAGES_KEY, seed, revive);
  const online = useOnlineStatus();

  // Back online: everything queued goes out.
  useEffect(() => {
    if (!online) return;
    setStore((current) =>
      current.messages.some((m) => m.status === 'sending')
        ? {
            ...current,
            messages: current.messages.map((m) =>
              m.status === 'sending' ? { ...m, status: 'sent' } : m,
            ),
          }
        : current,
    );
  }, [online, setStore]);

  const threads = useMemo(() => {
    const byContact: Record<string, Message[]> = {};
    for (const message of chronological(store.messages)) {
      (byContact[message.contactId] ??= []).push(message);
    }
    return byContact;
  }, [store.messages]);

  const contactById = useCallback(
    (id: string) => seedContacts.find((contact) => contact.id === id),
    [],
  );

  const messagesFor = useCallback((contactId: string) => threads[contactId] ?? [], [threads]);

  const previewFor = useCallback(
    (contactId: string) => previewOf(threads[contactId] ?? []),
    [threads],
  );

  const waitingFor = useCallback(
    (contactId: string) =>
      store.read.includes(contactId) ? 0 : waitingCount(threads[contactId] ?? []),
    [threads, store.read],
  );

  const markRead = useCallback(
    (contactId: string) =>
      setStore((current) =>
        current.read.includes(contactId)
          ? current
          : { ...current, read: [...current.read, contactId] },
      ),
    [setStore],
  );

  const append = useCallback(
    (message: Message) =>
      setStore((current) => ({
        messages: [...current.messages, message],
        // A new incoming message would need a fresh badge; an outgoing one
        // means the user has answered, so the conversation stays read.
        read: current.read,
      })),
    [setStore],
  );

  const send = useCallback(
    (contactId: string, body: string): Message | null => {
      // The composer blocks a blank message first; this is the second line of
      // defence so an empty bubble can never reach a conversation.
      const text = body.trim();
      if (text.length === 0) return null;
      const message: Message = {
        id: nextId(),
        contactId,
        author: 'me',
        kind: 'text',
        body: text,
        sentAt: Date.now(),
        status: online ? 'sent' : 'sending',
      };
      append(message);
      return message;
    },
    [append, online],
  );

  const sendNotify = useCallback(
    (contactId: string, contactName: string): Message => {
      // The alert itself is a flash and a vibration on the other person's
      // phone. What lands in the conversation is the written record of it, so
      // the user can check later that it actually went.
      const message: Message = {
        id: nextId(),
        contactId,
        author: 'system',
        kind: 'alert',
        body:
          `You alerted ${contactName} that you want to talk. Their phone flashed ` +
          'and vibrated. No sound was played.',
        sentAt: Date.now(),
      };
      append(message);
      return message;
    },
    [append],
  );

  const queuedCount = store.messages.filter((m) => m.status === 'sending').length;

  const value = useMemo<MessagesContextValue>(
    () => ({
      contacts: seedContacts,
      contactById,
      messagesFor,
      previewFor,
      waitingFor,
      markRead,
      send,
      sendNotify,
      online,
      queuedCount,
    }),
    [contactById, messagesFor, previewFor, waitingFor, markRead, send, sendNotify, online, queuedCount],
  );

  return <MessagesContext.Provider value={value}>{children}</MessagesContext.Provider>;
}
