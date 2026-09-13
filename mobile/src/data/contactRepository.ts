import type { Contact } from '../models/contact';
import { mockContacts } from './mockContacts';

/**
 * Read access to the contact list.
 *
 * The interface exists so the UI never depends on where contacts come from.
 * Week 5 ships the in-memory implementation below; swapping in an HTTP or
 * SQLite backed version later is a one-line change in `App.tsx`.
 */
export interface ContactRepository {
  fetchContacts(): Promise<Contact[]>;
}

/** In-memory implementation backed by the prototype's roster. */
export function createMockContactRepository(seed: Contact[] = mockContacts): ContactRepository {
  return {
    async fetchContacts() {
      return seed;
    },
  };
}

/**
 * A repository whose first `failures` loads fail, for exercising the error path
 * — and the recovery from it — through the real screen.
 */
export function createFlakyContactRepository(
  failures = 1,
  seed: Contact[] = mockContacts,
): ContactRepository {
  let attempts = 0;
  return {
    async fetchContacts() {
      attempts += 1;
      if (attempts <= failures) throw new Error('offline');
      return seed;
    },
  };
}
