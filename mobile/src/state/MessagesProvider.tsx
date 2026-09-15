import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import type { MessageRepository } from '../data/messageRepository';
import { previewOf, waitingCount, type Message } from '../models/message';

export interface MessagesValue {
  /** Messages for a contact, oldest first. Empty until the thread is loaded. */
  messagesFor: (contactId: string) => Message[];
  isLoading: (contactId: string) => boolean;
  error: Error | null;
  /** A one-line preview of the conversation for the contact list. */
  previewFor: (contactId: string) => string;
  /** Messages waiting for a reply, or zero once the thread has been opened. */
  waitingFor: (contactId: string) => number;
  loadThread: (contactId: string, force?: boolean) => Promise<void>;
  loadThreads: (contactIds: string[]) => Promise<void>;
  markRead: (contactId: string) => void;
  send: (contactId: string, body: string) => Promise<Message | null>;
  /** Records that the user sent someone a silent alert. */
  sendNotify: (contactId: string, contactName: string) => Promise<Message>;
}

const MessagesContext = createContext<MessagesValue | null>(null);

export function MessagesProvider({
  repository,
  children,
}: {
  repository: MessageRepository;
  children: ReactNode;
}) {
  const [threads, setThreads] = useState<Record<string, Message[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [readThreads, setReadThreads] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Error | null>(null);

  const messagesFor = useCallback(
    (contactId: string): Message[] => threads[contactId] ?? [],
    [threads],
  );

  const isLoading = useCallback(
    (contactId: string): boolean => loading[contactId] === true,
    [loading],
  );

  const previewFor = useCallback(
    (contactId: string): string => previewOf(threads[contactId] ?? []),
    [threads],
  );

  const waitingFor = useCallback(
    (contactId: string): number =>
      readThreads[contactId] ? 0 : waitingCount(threads[contactId] ?? []),
    [threads, readThreads],
  );

  const loadThread = useCallback(
    async (contactId: string, force = false) => {
      if (!force && threads[contactId] !== undefined) return;
      setLoading((current) => ({ ...current, [contactId]: true }));
      setError(null);
      try {
        const loaded = await repository.fetchThread(contactId);
        setThreads((current) => ({ ...current, [contactId]: loaded }));
      } catch (caught) {
        setThreads((current) => ({ ...current, [contactId]: [] }));
        setError(caught instanceof Error ? caught : new Error(String(caught)));
      } finally {
        setLoading((current) => ({ ...current, [contactId]: false }));
      }
    },
    [repository, threads],
  );

  const loadThreads = useCallback(
    async (contactIds: string[]) => {
      const loaded: Record<string, Message[]> = {};
      let failure: Error | null = null;
      for (const contactId of contactIds) {
        try {
          loaded[contactId] = await repository.fetchThread(contactId);
        } catch (caught) {
          loaded[contactId] = [];
          failure = caught instanceof Error ? caught : new Error(String(caught));
        }
      }
      setThreads((current) => ({ ...current, ...loaded }));
      setError(failure);
    },
    [repository],
  );

  // Opening a conversation is what clears its badge on the Contacts screen.
  // The two screens share this provider, so nothing has to be passed back
  // through the route.
  const markRead = useCallback((contactId: string) => {
    setReadThreads((current) =>
      current[contactId] ? current : { ...current, [contactId]: true },
    );
  }, []);

  const append = useCallback((contactId: string, message: Message) => {
    setThreads((current) => ({
      ...current,
      [contactId]: [...(current[contactId] ?? []), message],
    }));
  }, []);

  const send = useCallback(
    async (contactId: string, body: string): Promise<Message | null> => {
      // The composer blocks a blank message first; this is the second line of
      // defence so an empty bubble can never reach a conversation.
      if (body.trim().length === 0) return null;
      const message = await repository.send(contactId, body);
      append(contactId, message);
      return message;
    },
    [repository, append],
  );

  const sendNotify = useCallback(
    async (contactId: string, contactName: string): Promise<Message> => {
      // The alert itself is a flash and a vibration on the other person's
      // phone. What lands in the conversation is the written record of it,
      // because an action whose only trace was a flash would leave the user no
      // way to check later whether it actually went.
      const message = await repository.recordAlert(
        contactId,
        `You alerted ${contactName} that you want to talk. Their phone flashed ` +
          'and vibrated. No sound was played.',
      );
      append(contactId, message);
      return message;
    },
    [repository, append],
  );

  const value = useMemo<MessagesValue>(
    () => ({
      messagesFor,
      isLoading,
      error,
      previewFor,
      waitingFor,
      loadThread,
      loadThreads,
      markRead,
      send,
      sendNotify,
    }),
    [
      messagesFor,
      isLoading,
      error,
      previewFor,
      waitingFor,
      loadThread,
      loadThreads,
      markRead,
      send,
      sendNotify,
    ],
  );

  return <MessagesContext.Provider value={value}>{children}</MessagesContext.Provider>;
}

export function useMessages(): MessagesValue {
  const value = useContext(MessagesContext);
  if (!value) throw new Error('useMessages must be used inside a MessagesProvider');
  return value;
}
