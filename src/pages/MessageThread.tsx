import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import ContactList from '../components/contacts/ContactList';
import ContactsPageHeader from '../components/contacts/ContactsPageHeader';
import ContactsTwoPane from '../components/contacts/ContactsTwoPane';
import Conversation from '../components/messaging/Conversation';
import VideoCallButton from '../components/messaging/VideoCallButton';
import { useMessages } from '../context/messages';
import { useMediaQuery, WIDE_LAYOUT } from '../hooks/useMediaQuery';
import { conversationNameOf, supportsVideoRelay } from '../models/contact';

/**
 * The written conversation with one contact, opened from Contacts.
 *
 * Phone and tablet: the conversation fills the screen under a "Back to
 * contacts" link. Desktop: the contact list stays on the left with this
 * contact selected, so the user can move between conversations without going
 * back.
 *
 * Keyboard: Tab moves through Back, the video call request, the Alert button,
 * the scrollable history (arrow keys and Page Up/Down scroll it — WCAG 2.1.1),
 * quick replies, the message field and Send. Ctrl/⌘+Enter sends from the
 * field. Escape returns to Contacts from anywhere except the message field,
 * where it would throw away what is being typed, and an open menu, which it
 * closes instead.
 */
export default function MessageThread() {
  const { contactId = '' } = useParams();
  // A fresh page per contact, so a call request or alert banner never carries
  // over from one conversation to the next.
  return <ThreadPage key={contactId} contactId={contactId} />;
}

function ThreadPage({ contactId }: { contactId: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const wide = useMediaQuery(WIDE_LAYOUT);
  const { contactById } = useMessages();

  // Arriving from the Contacts header's "Video call" button.
  const requestedOnArrival = (location.state as { requestCall?: boolean } | null)?.requestCall === true;
  const [callRequested, setCallRequested] = useState(requestedOnArrival);

  const contact = contactById(contactId);

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
  const callButton = supportsVideoRelay(contact) && (
    <VideoCallButton contactName={name} onRequest={() => setCallRequested(true)} />
  );
  const conversation = (headingLevel: 1 | 2) => (
    <Conversation
      contact={contact}
      headingLevel={headingLevel}
      callRequested={callRequested}
      onDismissCall={() => setCallRequested(false)}
      fill={wide}
    />
  );

  if (wide) {
    return (
      <div className="space-y-6 page-container">
        <ContactsPageHeader
          title="Messages"
          subtitle={`Your conversation with ${contact.name}. Press Escape to return to Contacts.`}
          action={callButton}
        />
        <ContactsTwoPane list={<ContactList selectedId={contact.id} />} conversation={conversation(2)} />
      </div>
    );
  }

  return (
    <div className="space-y-4 page-container max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {backLink}
        {callButton}
      </div>
      {conversation(1)}
    </div>
  );
}
