import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

import type { ContactRepository } from '../data/contactRepository';
import type { Contact } from '../models/contact';

export interface ContactsValue {
  contacts: Contact[];
  isLoading: boolean;
  /** Non-null when the last load failed; the screen renders a banner for it. */
  error: Error | null;
  load: () => Promise<void>;
  /** Looks a contact up by id, returning undefined when it is not in the list. */
  byId: (id: string) => Contact | undefined;
}

const ContactsContext = createContext<ContactsValue | null>(null);

export function ContactsProvider({
  repository,
  children,
}: {
  repository: ContactRepository;
  children: ReactNode;
}) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Kept in a ref as well as state so `byId` can be stable without going stale,
  // which matters because the conversation screen calls it during render.
  const latest = useRef<Contact[]>([]);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const loaded = await repository.fetchContacts();
      latest.current = loaded;
      setContacts(loaded);
    } catch (caught) {
      latest.current = [];
      setContacts([]);
      setError(caught instanceof Error ? caught : new Error(String(caught)));
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  const byId = useCallback(
    (id: string) => latest.current.find((contact) => contact.id === id),
    [],
  );

  const value = useMemo<ContactsValue>(
    () => ({ contacts, isLoading, error, load, byId }),
    [contacts, isLoading, error, load, byId],
  );

  return <ContactsContext.Provider value={value}>{children}</ContactsContext.Provider>;
}

export function useContacts(): ContactsValue {
  const value = useContext(ContactsContext);
  if (!value) throw new Error('useContacts must be used inside a ContactsProvider');
  return value;
}
