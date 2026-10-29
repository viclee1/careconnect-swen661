import { useId, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { BellRing, Search } from 'lucide-react';

import ContactRow from './ContactRow';
import { useMessages } from '../../context/messages';
import { filterContacts, searchResultSummary } from '../../utils/search';

/**
 * The searchable list of contacts: a hint explaining how to get someone's
 * attention without sound, a search box, a live count of what the search
 * found, and one row per contact.
 *
 * Shared by the Contacts screen and, on a desktop, the left-hand pane of an
 * open conversation, so the list looks and behaves the same wherever it is.
 *
 * "/" focuses the search from anywhere in the list — the web convention for a
 * page's search — and Escape clears it. Only while focus is in the list: a
 * single-key shortcut that works page-wide can be set off by speech input or a
 * slip of the finger, and cannot be turned off (WCAG 2.1.4).
 */
export default function ContactList({ selectedId }: { selectedId?: string }) {
  const { contacts, previewFor, waitingFor } = useMessages();
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const searchId = useId();
  const hintId = useId();

  const visible = useMemo(() => filterContacts(contacts, query), [contacts, query]);

  function onKeyDown(event: KeyboardEvent) {
    if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey) return;
    // Never steal a "/" the user is typing into a field.
    if ((event.target as HTMLElement).closest('input, textarea, select, [contenteditable="true"]')) return;
    event.preventDefault();
    searchRef.current?.focus();
  }

  return (
    <div className="space-y-4" onKeyDown={onKeyDown}>
      <p className="flex items-start gap-3 rounded-xl border-l-4 border-calm-600 bg-calm-50 px-4 py-3 text-sm text-calm-900">
        <BellRing className="w-5 h-5 flex-shrink-0 mt-0.5 text-warm-700" aria-hidden="true" />
        <span>
          Open a conversation and choose <strong>Alert</strong> to send a silent screen flash
          and vibration to their phone. No sound needed.
        </span>
      </p>

      <div>
        <label htmlFor={searchId} className="block font-semibold text-neutral-800 mb-1">
          Find a contact
        </label>
        <div className="relative">
          <Search
            className="w-5 h-5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            ref={searchRef}
            id={searchId}
            type="search"
            value={query}
            placeholder="Name, relationship or role"
            aria-describedby={hintId}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              // Escape clears the box rather than leaving the list filtered
              // and the reason for it off screen.
              if (event.key === 'Escape' && query.length > 0) {
                event.preventDefault();
                setQuery('');
              }
            }}
            className="block w-full rounded-xl border-2 border-neutral-400 bg-white pl-11 pr-4 py-2.5 text-base text-neutral-800 placeholder:text-neutral-500 hover:border-neutral-500 focus:border-calm-600 focus:outline-none"
          />
        </div>
        <p id={hintId} className="text-sm text-neutral-600 mt-1">
          In the list, press <kbd className="font-mono font-semibold">/</kbd> to jump here. Escape clears.
        </p>
      </div>

      {/* The only visible evidence that a search worked is rows disappearing,
          which a screen-reader user does not see. */}
      <p role="status" className="text-sm font-medium text-neutral-600">
        {searchResultSummary(visible.length, query)}
      </p>

      {visible.length === 0 ? (
        <div className="rounded-2xl bg-neutral-50 border-2 border-neutral-200 p-6 text-center space-y-3">
          <p className="text-lg font-semibold text-neutral-800">No contacts match your search</p>
          <p className="text-neutral-600">
            Nothing in your list matches “{query.trim()}”. Clear the search box to see everyone
            again.
          </p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setQuery('');
              searchRef.current?.focus();
            }}
          >
            Clear search
          </button>
        </div>
      ) : (
        <ul className="list-none p-0 m-0 space-y-3" role="list" aria-label="Your contacts">
          {visible.map((contact) => (
            <ContactRow
              key={contact.id}
              contact={contact}
              preview={previewFor(contact.id)}
              waiting={waitingFor(contact.id)}
              selected={contact.id === selectedId}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
