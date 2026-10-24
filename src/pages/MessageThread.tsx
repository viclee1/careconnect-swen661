import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Settings, Video, WifiOff } from 'lucide-react';

import Banner from '../components/Banner';
import MessageBubble from '../components/messaging/MessageBubble';
import MessageComposer, { type ComposerHandle } from '../components/messaging/MessageComposer';
import NotifyButton from '../components/messaging/NotifyButton';
import VisualFlash from '../components/messaging/VisualFlash';
import { useMessages } from '../context/messages';
import { useSettings } from '../context/settings';
import { conversationNameOf, initialsFor, supportsVideoRelay } from '../models/contact';
import { kindOf, startsNewDay } from '../models/message';

/**
 * The written conversation with one contact, opened from Contacts.
 *
 * Keyboard: Tab moves through Back, the call request, the scrollable history
 * (arrow keys and Page Up/Down scroll it — WCAG 2.1.1), the Alert button, the
 * message field and Send. Ctrl/⌘+Enter sends from the field. Escape returns to
 * Contacts from anywhere except the message field, where it would throw away
 * what is being typed.
 */
export default function MessageThread() {
  const { contactId = '' } = useParams();
  const navigate = useNavigate();
  const { contactById, messagesFor, markRead, send, sendNotify, online, queuedCount } =
    useMessages();
  const { settings } = useSettings();

  const scrollRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<ComposerHandle>(null);
  const [flashTrigger, setFlashTrigger] = useState(0);
  const [callRequested, setCallRequested] = useState(false);

  const contact = contactById(contactId);
  const thread = messagesFor(contactId);

  // Opening a conversation is what clears its waiting badge on Contacts.
  useEffect(() => {
    if (contact) markRead(contactId);
  }, [contact, contactId, markRead]);

  // Newest message in view whenever the conversation grows.
  useEffect(() => {
    const region = scrollRef.current;
    if (region) region.scrollTop = region.scrollHeight;
  }, [thread.length]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      if ((event.target as HTMLElement | null)?.closest('textarea')) return;
      navigate('/app/contacts');
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [navigate]);

  const backLink = (
    <Link
      to="/app/contacts"
      className="inline-flex items-center gap-2 font-semibold min-h-[2.75rem] px-1"
    >
      <ArrowLeft className="w-5 h-5" aria-hidden="true" />
      Back to contacts
    </Link>
  );

  if (!contact) {
    return (
      <div className="space-y-6 page-container">
        {backLink}
        <h1 className="text-2xl font-bold text-neutral-800">That contact is not in your list</h1>
        <p className="text-neutral-600">
          They may have been removed. Go back to Contacts to see everyone you can message.
        </p>
      </div>
    );
  }

  const name = conversationNameOf(contact);
  const threadHasVideo = thread.some((message) => kindOf(message) === 'videoMessage');
  const now = Date.now();

  function handleNotify() {
    setFlashTrigger((n) => n + 1);
    sendNotify(contactId, name);
  }

  return (
    <div className="space-y-4 page-container max-w-3xl">
      {backLink}

      <div className="flex flex-wrap items-center gap-4">
        <span
          className={`w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white text-lg ${
            contact.isEmergency ? 'bg-alert-600' : 'bg-calm-600'
          }`}
          aria-hidden="true"
        >
          {initialsFor(contact)}
        </span>
        <div className="flex-1 min-w-[10rem]">
          <h1 className="text-2xl font-bold text-neutral-800">{contact.name}</h1>
          <p className="text-neutral-600">{contact.relationship}</p>
        </div>
        {supportsVideoRelay(contact) && (
          <button
            type="button"
            className="btn btn-secondary w-full sm:w-auto"
            onClick={() => setCallRequested(true)}
            aria-label={`Call ${name} with live captions`}
          >
            <Video className="w-5 h-5" aria-hidden="true" />
            Call {name}
          </button>
        )}
      </div>

      {!online && (
        <Banner variant="warning" title="You are offline">
          <span className="inline-flex items-center gap-2">
            <WifiOff className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            You can keep writing. Messages are kept on this device and marked “Sending” until
            the connection returns.
          </span>
        </Banner>
      )}
      {online && queuedCount > 0 && (
        <Banner variant="info">Sending messages written while you were offline…</Banner>
      )}

      {callRequested && (
        <Banner
          variant="info"
          title="Captioned video call requested"
          onDismiss={() => setCallRequested(false)}
        >
          We have asked {contact.name} to join a video call with live captions turned on. A
          banner will appear here when they answer. Nothing will ring.
        </Banner>
      )}

      {threadHasVideo && !settings.captionsEnabled && (
        <Banner variant="warning" title="Captions are turned off">
          This conversation contains a video message. Turn captions back on so its words
          appear on screen.{' '}
          <Link to="/app/settings" className="inline-flex items-center gap-1 font-semibold">
            <Settings className="w-4 h-4" aria-hidden="true" />
            Open accessibility settings
          </Link>
        </Banner>
      )}

      {/* Focusable so a keyboard user can scroll the history without a mouse. */}
      <div
        ref={scrollRef}
        tabIndex={0}
        role="region"
        aria-label={`Conversation with ${name}`}
        className="card p-3 md:p-4 max-h-[50vh] overflow-y-auto"
      >
        {thread.length === 0 ? (
          <p className="text-center text-neutral-600 py-6">
            No messages yet. Send {name} the first message — they will see it as text, not as a
            call.
          </p>
        ) : (
          <ul className="list-none p-0 m-0" aria-label={`Messages with ${contact.name}`}>
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
      </div>

      <NotifyButton
        contactName={name}
        vibrationEnabled={settings.vibrationEnabled}
        onActivate={handleNotify}
      />

      <MessageComposer ref={composerRef} contactName={name} onSend={(body) => send(contactId, body)} />

      <VisualFlash
        trigger={flashTrigger}
        message={`Alert sent to ${name}.\nTheir screen flashed and their phone buzzed.`}
      />
    </div>
  );
}
