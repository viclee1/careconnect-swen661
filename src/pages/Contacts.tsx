import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';

import Banner from '../components/Banner';
import ContactRow from '../components/contacts/ContactRow';
import { useMessages } from '../context/messages';
import { filterContacts, searchResultSummary } from '../utils/search';

/**
 * The Contacts screen: one list, primary contact first, each row opening a
 * written conversation.
 *
 * There is no call button anywhere on this page. A voice call is the one
 * channel a deaf or hard-of-hearing user cannot rely on, so every row leads to
 * text, and the banner at the top points at the Alert action that replaces
 * "give me a ring" with a silent flash on the other person's screen.
 *
 * The search box filters by name, relationship or role. "/" focuses it from
 * anywhere on the page — the web convention for a page's search — and Escape
 * clears it.
 */
export default function Contacts() {
  const { contacts, previewFor, waitingFor } = useMessages();
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const searchId = useId();
  const hintId = useId();

  const visible = useMemo(() => filterContacts(contacts, query), [contacts, query]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      // Never steal a "/" the user is typing into a field.
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
      event.preventDefault();
      searchRef.current?.focus();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="space-y-6 page-container">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">Contacts</h1>
        <p className="text-neutral-600 mt-1">People who care for you</p>
      </div>

      <Banner variant="info" title="Getting someone's attention">
        Open a conversation and choose <strong>Alert</strong> to send a silent visual flash
        and vibration to their phone. No sound needed.
      </Banner>

      <div className="max-w-xl">
        <label htmlFor={searchId} className="block text-base font-semibold text-neutral-800 mb-1">
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
            className="block w-full rounded-lg border-2 border-neutral-400 bg-white pl-11 pr-4 py-3 text-base text-neutral-800 placeholder:text-neutral-500 hover:border-neutral-500 focus:border-calm-600 focus:outline-none"
          />
        </div>
        <p id={hintId} className="text-sm text-neutral-600 mt-1">
          Press <kbd className="font-mono font-semibold">/</kbd> to jump here, Escape to clear.
        </p>
      </div>

      {/* The only visible evidence that a search worked is rows disappearing,
          which a screen-reader user does not see. */}
      <p role="status" className="text-sm font-medium text-neutral-600">
        {searchResultSummary(visible.length, query)}
      </p>

      {visible.length === 0 ? (
        <div className="card p-6 text-center space-y-3">
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
        <ul className="card-grid" role="list" aria-label="Your contacts">
          {visible.map((contact) => (
            <ContactRow
              key={contact.id}
              contact={contact}
              preview={previewFor(contact.id)}
              waiting={waitingFor(contact.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
