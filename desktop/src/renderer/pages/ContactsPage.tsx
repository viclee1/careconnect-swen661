import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';

import { AlertBanner } from '../components/AlertBanner';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { useNavigation } from '../navigation/NavigationProvider';
import { useCommand } from '../platform/CommandProvider';
import { useContacts } from '../state/ContactsProvider';
import { useMessages } from '../state/MessagesProvider';
import { filterContacts, searchResultSummary } from '../utils/search';
import { ContactRow } from './contacts/ContactRow';

/**
 * The Contacts page, laid out as the Week 3 prototype draws it: one list,
 * primary contact first, each row opening a written conversation.
 *
 * There is no call button anywhere on this page. A voice call is the one
 * channel a deaf or hard-of-hearing user cannot rely on, so every row leads to
 * text, and the banner at the top points at the Notify action that replaces
 * "give me a ring" with a silent flash on the other person's screen.
 *
 * What the desktop adds over the phone is the search box: a wider window can
 * afford a persistent toolbar, and Ctrl/Cmd+F puts the cursor in it from
 * anywhere on the page — the Find convention every desktop application shares,
 * bound here to the only thing on this page worth finding.
 */
export function ContactsPage() {
  const contacts = useContacts();
  const messages = useMessages();
  const { navigate } = useNavigation();

  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const searchId = useId();

  const { load } = contacts;
  const { loadThreads } = messages;

  const bootstrap = useCallback(async () => {
    await load();
  }, [load]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  // Previews and waiting counts come from the conversations, so they are
  // fetched once the roster is known.
  useEffect(() => {
    if (contacts.contacts.length === 0) return;
    void loadThreads(contacts.contacts.map((contact) => contact.id));
  }, [contacts.contacts, loadThreads]);

  useCommand('contacts:find', () => {
    searchRef.current?.focus();
    searchRef.current?.select();
  });

  const visible = useMemo(
    () => filterContacts(contacts.contacts, query),
    [contacts.contacts, query],
  );

  return (
    <>
      <PageHeader title="Contacts" subtitle="People who care for you" />

      <div className="page-body">
        <div className="readable readable--wide stack">
          <AlertBanner
            tone="info"
            icon="notify"
            title="Getting someone's attention"
            message="Open a conversation and choose Alert to send a silent visual flash and vibration to their phone. No sound needed."
          />

          {contacts.isLoading ? (
            <p role="status">Loading contacts…</p>
          ) : contacts.error ? (
            <AlertBanner
              tone="error"
              title="Contacts could not be loaded"
              message="Your contacts are saved on this computer, so nothing has been lost. Try again in a moment."
              action={
                <Button label="Try again" icon="refresh" onClick={() => void bootstrap()} />
              }
            />
          ) : contacts.contacts.length === 0 ? (
            <EmptyState
              icon="contacts"
              title="No contacts yet"
              message="Your care team will appear here once someone is added to your circle."
            />
          ) : (
            <>
              <div className="contacts__toolbar">
                <div className="field">
                  <label className="field__label" htmlFor={searchId}>
                    Find a contact
                  </label>
                  <input
                    ref={searchRef}
                    id={searchId}
                    type="search"
                    className="field__input"
                    value={query}
                    placeholder="Search by name, relationship or role"
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => {
                      // Escape clears the box rather than leaving the list
                      // filtered and the reason for it off screen.
                      if (event.key === 'Escape' && query.length > 0) {
                        event.stopPropagation();
                        setQuery('');
                      }
                    }}
                  />
                </div>
              </div>

              {/* The only visible evidence that a search worked is rows
                  disappearing, which a screen-reader user does not see. */}
              <p role="status" className="field__hint">
                {searchResultSummary(visible.length, query)}
              </p>

              {visible.length === 0 ? (
                <EmptyState
                  icon="search"
                  title="No contacts match your search"
                  message={`Nothing in your list matches "${query.trim()}". Clear the search box to see everyone again.`}
                  action={<Button label="Clear search" onClick={() => setQuery('')} />}
                />
              ) : (
                <ul className="contact-list">
                  {visible.map((contact) => (
                    <ContactRow
                      key={contact.id}
                      contact={contact}
                      preview={messages.previewFor(contact.id)}
                      waiting={messages.waitingFor(contact.id)}
                      onOpen={() =>
                        navigate({ name: 'MessageThread', contactId: contact.id })
                      }
                    />
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
