import { useCallback, useEffect, useRef, useState } from 'react';

import { AlertBanner } from '../components/AlertBanner';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { Icon, type IconName } from '../components/Icon';
import { PageHeader } from '../components/PageHeader';
import {
  conversationNameOf,
  initialsFor,
  supportsVideoRelay,
  type ContactRole,
} from '../models/contact';
import { kindOf, startsNewDay } from '../models/message';
import { useNavigation } from '../navigation/NavigationProvider';
import { useCommand } from '../platform/CommandProvider';
import { useContacts } from '../state/ContactsProvider';
import { useMessages } from '../state/MessagesProvider';
import { useSettings } from '../state/SettingsProvider';
import { MessageBubble } from './messaging/MessageBubble';
import { MessageComposer, type ComposerHandle } from './messaging/MessageComposer';
import { NotifyButton } from './messaging/NotifyButton';
import { VisualFlash } from './messaging/VisualFlash';

const roleIcons: Record<ContactRole, IconName> = {
  careTeam: 'care',
  family: 'family',
  doctor: 'care',
  helpline: 'help',
};

/**
 * The conversation with one contact, opened from the Contacts page.
 *
 * The contact is identified by the route's `contactId`, so the page works from
 * a click on a row and from a restored route alike, and an id that no longer
 * exists lands on a recoverable state rather than a blank window.
 *
 * Two commands are registered here rather than handled locally, so the File
 * menu, the accelerator and the on-screen button are the same action: Send
 * (Ctrl/Cmd+Enter) and Alert (Ctrl/Cmd+Shift+N).
 */
export function MessageThreadPage({
  contactId,
  now,
}: {
  contactId: string;
  /** Injectable clock for deterministic day grouping in tests. */
  now?: number;
}) {
  const contacts = useContacts();
  const messages = useMessages();
  const { settings } = useSettings();
  const { navigate, back, canGoBack } = useNavigation();

  const scrollRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<ComposerHandle>(null);

  // Local, transient state — exactly what useState is for.
  const [flashTrigger, setFlashTrigger] = useState(0);
  const [callRequested, setCallRequested] = useState(false);

  const { load: loadContacts, byId } = contacts;
  const { loadThread, markRead } = messages;
  const contactsLoaded = contacts.contacts.length > 0;

  useEffect(() => {
    // Contacts may not be loaded yet if this page was reached without passing
    // through the list — a restored route, or a menu command.
    if (!contactsLoaded) void loadContacts();
  }, [contactsLoaded, loadContacts]);

  useEffect(() => {
    void loadThread(contactId).then(() => {
      // Opening the conversation is what clears its badge on the Contacts
      // page — the two share one provider, so nothing is passed back.
      markRead(contactId);
    });
  }, [contactId, loadThread, markRead]);

  const contact = byId(contactId);
  const thread = messages.messagesFor(contactId);

  const goBack = useCallback(() => {
    if (canGoBack) back();
    else navigate({ name: 'Contacts' });
  }, [canGoBack, back, navigate]);

  const scrollToEnd = useCallback(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, []);

  // Newest message in view whenever the conversation grows.
  useEffect(() => {
    scrollToEnd();
  }, [thread.length, scrollToEnd]);

  const handleSend = useCallback(
    async (body: string) => {
      await messages.send(contactId, body);
      scrollToEnd();
    },
    [messages, contactId, scrollToEnd],
  );

  const handleNotify = useCallback(async () => {
    if (!contact) return;
    setFlashTrigger((current) => current + 1);
    await messages.sendNotify(contactId, conversationNameOf(contact));
    scrollToEnd();
  }, [contact, contactId, messages, scrollToEnd]);

  // Ctrl/Cmd+Enter sends from anywhere on the page, not only from inside the
  // textarea — the desktop expectation, and one fewer Tab for a keyboard user
  // who has just finished typing somewhere else.
  useCommand('message:send', () => {
    composerRef.current?.submit();
  });

  useCommand('message:notify', () => {
    void handleNotify();
  }, Boolean(contact));

  useCommand('navigate:back', goBack);

  if (!contact) {
    return (
      <>
        <PageHeader title="Conversation" onBack={goBack} backLabel="Back to contacts" />
        <div className="page-body">
          <div className="readable">
            {contacts.isLoading ? (
              <p role="status">Loading conversation…</p>
            ) : (
              <EmptyState
                icon="missingPerson"
                title="That contact is not in your list"
                message="They may have been removed. Go back to Contacts to see everyone you can message."
                action={
                  <Button label="See all contacts" icon="contacts" onClick={goBack} />
                }
              />
            )}
          </div>
        </div>
      </>
    );
  }

  const name = conversationNameOf(contact);
  const threadHasVideo = thread.some((message) => kindOf(message) === 'videoMessage');

  return (
    <div
      className="thread-layout"
      onKeyDown={(event) => {
        // Esc leaves the conversation, matching the Assignment 7 table's
        // "close an open dialog, menu, popover, or other temporary interface".
        if (event.key === 'Escape') goBack();
      }}
    >
      <PageHeader
        title={contact.name}
        subtitle={contact.relationship}
        onBack={goBack}
        backLabel="Back to contacts"
        trailing={
          supportsVideoRelay(contact) ? (
            <Button
              variant="onDark"
              icon="video"
              label={`Call ${name}`}
              aria-label={`Call ${name} now with live captions`}
              onClick={() => setCallRequested(true)}
            />
          ) : undefined
        }
      />

      <div className="thread-identity">
        <span className="avatar avatar--small" aria-hidden="true">
          {initialsFor(contact)}
        </span>
        <Icon name={roleIcons[contact.role]} size={16} />
        <span>{contact.relationship}</span>
      </div>

      <div className="thread-scroll" ref={scrollRef}>
        <div className="readable stack">
          {callRequested ? (
            <AlertBanner
              tone="info"
              icon="video"
              title="Captioned video call requested"
              message={`We have asked ${contact.name} to join a video call with live captions turned on. You will get a banner here as soon as they answer. Nothing will ring — you can leave the window and carry on.`}
              action={<Button label="OK" onClick={() => setCallRequested(false)} />}
            />
          ) : null}

          {threadHasVideo && !settings.captionsEnabled ? (
            <AlertBanner
              tone="warning"
              title="Captions are turned off"
              message="This conversation contains a video message. Turn captions back on so its words appear on screen."
              action={
                <Button
                  label="Open settings"
                  icon="settings"
                  onClick={() => navigate({ name: 'Settings' })}
                />
              }
            />
          ) : null}

          {messages.isLoading(contactId) ? (
            <p role="status">Loading conversation…</p>
          ) : messages.error && thread.length === 0 ? (
            <AlertBanner
              tone="error"
              title="This conversation could not be loaded"
              message={`Nothing has been lost. Your messages with ${name} are still there — try again in a moment.`}
              action={
                <Button
                  label="Try again"
                  icon="refresh"
                  onClick={() => void messages.loadThread(contactId, true)}
                />
              }
            />
          ) : thread.length === 0 ? (
            <EmptyState
              icon="message"
              title="No messages yet"
              message={`Send ${name} the first message. They will see it as text, not as a call.`}
            />
          ) : (
            <ul className="thread" aria-label={`Conversation with ${contact.name}`}>
              {thread.map((message, index) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  contactName={contact.name}
                  showDayLabel={startsNewDay(thread, index)}
                  now={now}
                />
              ))}
            </ul>
          )}

          <div ref={endRef} />
        </div>
      </div>

      <div className="readable">
        <NotifyButton
          contactName={name}
          vibrationEnabled={settings.vibrationEnabled}
          onActivate={() => void handleNotify()}
        />
      </div>

      <MessageComposer
        ref={composerRef}
        contactName={name}
        onSend={(body) => void handleSend(body)}
      />

      <VisualFlash
        trigger={flashTrigger}
        message={`Alert sent to ${name}.\nTheir screen flashed and their phone buzzed.`}
      />
    </div>
  );
}
