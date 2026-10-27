import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, LifeBuoy, Settings, Stethoscope, Users, WifiOff, type LucideIcon } from 'lucide-react';

import Banner from '../Banner';
import ContactAvatar from '../contacts/ContactAvatar';
import MessageBubble from './MessageBubble';
import MessageComposer from './MessageComposer';
import NotifyButton from './NotifyButton';
import VisualFlash from './VisualFlash';
import { useMessages } from '../../context/messages';
import { useSettings } from '../../context/settings';
import { conversationNameOf, type Contact, type ContactRole } from '../../models/contact';
import { kindOf, startsNewDay } from '../../models/message';

// The same role icons the desktop and mobile conversation headers use. Always
// beside the relationship in words, never on their own.
const roleIcons: Record<ContactRole, LucideIcon> = {
  careTeam: HeartHandshake,
  family: Users,
  doctor: Stethoscope,
  helpline: LifeBuoy,
};

/** A short buzz on this phone confirming the Alert went, as the mobile app does. */
const CONFIRM_BUZZ_MS = 200;

/**
 * The written conversation with one contact: who it is with, the Alert button,
 * any status banners, the scrollable history and the message field.
 *
 * Rendered full-width on a phone or tablet, and beside the contact list on a
 * desktop — where the page already has its own h1, so the contact's name
 * becomes an h2 there (`headingLevel`).
 *
 * The captioned-video-call request belongs to the page header, which owns the
 * button; this panel only shows the banner while a request is outstanding.
 */
export default function Conversation({
  contact,
  headingLevel,
  callRequested,
  onDismissCall,
  fill = false,
}: {
  contact: Contact;
  headingLevel: 1 | 2;
  callRequested: boolean;
  onDismissCall: () => void;
  /** Stretch to the height of the desktop pane instead of a capped history. */
  fill?: boolean;
}) {
  const { messagesFor, markRead, send, sendNotify, online, queuedCount } = useMessages();
  const { settings } = useSettings();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [flashTrigger, setFlashTrigger] = useState(0);
  const [alertSent, setAlertSent] = useState(false);

  const thread = messagesFor(contact.id);
  const name = conversationNameOf(contact);
  const threadHasVideo = thread.some((message) => kindOf(message) === 'videoMessage');
  const RoleIcon = roleIcons[contact.role];
  const Heading = headingLevel === 1 ? 'h1' : 'h2';
  const now = Date.now();

  // Opening a conversation is what clears its waiting badge on Contacts.
  useEffect(() => {
    markRead(contact.id);
    setAlertSent(false);
  }, [contact.id, markRead]);

  // Newest message in view whenever the conversation grows.
  useEffect(() => {
    const region = scrollRef.current;
    if (region) region.scrollTop = region.scrollHeight;
  }, [thread.length, contact.id]);

  function handleNotify() {
    setFlashTrigger((n) => n + 1);
    setAlertSent(true);
    // Confirmation on the sender's own phone, where the browser supports it.
    if (settings.vibrationEnabled && typeof navigator.vibrate === 'function') {
      navigator.vibrate(CONFIRM_BUZZ_MS);
    }
    sendNotify(contact.id, name);
  }

  return (
    <div
      className={[
        // Not overflow-hidden: the quick-replies menu opens upward out of the
        // composer and must not be clipped by the panel.
        'flex flex-col rounded-2xl border-2 border-neutral-200 bg-white',
        fill ? 'h-full min-h-0' : '',
      ].join(' ')}
    >
      <div className="flex items-center gap-3 md:gap-4 px-4 py-3 border-b-2 border-neutral-100">
        <ContactAvatar contact={contact} size="lg" />
        <div className="flex-1 min-w-0">
          <Heading className="text-xl font-bold text-neutral-800 leading-tight">{contact.name}</Heading>
          <p className="flex items-center gap-1.5 text-neutral-600">
            <RoleIcon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            {contact.relationship}
          </p>
        </div>
      </div>

      <div className="space-y-3 px-3 pt-3 md:px-4">
        <NotifyButton
          contactName={name}
          vibrationEnabled={settings.vibrationEnabled}
          onActivate={handleNotify}
        />

        {alertSent && (
          <Banner variant="success" title={`Alert sent to ${name}`} onDismiss={() => setAlertSent(false)}>
            Their screen flashed{settings.vibrationEnabled ? ' and their phone buzzed' : ''}. Nothing
            made a sound.
          </Banner>
        )}

        {callRequested && (
          <Banner variant="info" title="Captioned video call requested" onDismiss={onDismissCall}>
            We have asked {contact.name} to join a video call with live captions turned on. A
            banner will appear here when they answer. Nothing will ring.
          </Banner>
        )}

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

        {threadHasVideo && !settings.captionsEnabled && (
          <Banner variant="warning" title="Captions are turned off">
            This conversation contains a video message. Turn captions back on so its words
            appear on screen.{' '}
            <Link to="/app/settings" className="inline-flex items-center gap-1 font-semibold">
              <Settings className="w-4 h-4" aria-hidden="true" />
              Open settings
            </Link>
          </Banner>
        )}
      </div>

      {/* Focusable so a keyboard user can scroll the history without a mouse. */}
      <div
        ref={scrollRef}
        tabIndex={0}
        role="region"
        aria-label={`Conversation with ${name}`}
        className={[
          'mt-3 bg-[#f3f6f8] px-3 md:px-6 py-2 overflow-y-auto',
          fill ? 'flex-1 min-h-[8rem]' : 'max-h-[55vh] min-h-[12rem]',
        ].join(' ')}
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

      <div className="rounded-b-2xl bg-white">
        <MessageComposer contactName={name} onSend={(body) => send(contact.id, body)} />
      </div>

      <VisualFlash
        trigger={flashTrigger}
        message={`Alert sent to ${name}.\nTheir screen flashed and their phone buzzed.`}
      />
    </div>
  );
}
