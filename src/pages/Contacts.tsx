import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ContactList from '../components/contacts/ContactList';
import ContactsPageHeader from '../components/contacts/ContactsPageHeader';
import ContactsTwoPane from '../components/contacts/ContactsTwoPane';
import Conversation from '../components/messaging/Conversation';
import VideoCallButton from '../components/messaging/VideoCallButton';
import { useMessages } from '../context/messages';
import { useMediaQuery, WIDE_LAYOUT } from '../hooks/useMediaQuery';
import { conversationNameOf, supportsVideoRelay } from '../models/contact';

/**
 * The Contacts screen.
 *
 * On a phone or tablet it is one searchable list, primary contact first, each
 * row opening a written conversation. On a desktop the primary contact's
 * conversation opens beside the list, as the design shows at 1440px.
 *
 * There is no voice-call button anywhere on this page. The header's one action
 * asks the primary contact for a captioned video call, and the hint above the
 * list points at the Alert action that replaces "give me a ring" with a silent
 * flash on the other person's screen.
 */
export default function Contacts() {
  const { contacts } = useMessages();
  const wide = useMediaQuery(WIDE_LAYOUT);
  const navigate = useNavigate();
  const [callRequested, setCallRequested] = useState(false);

  const primary = contacts.find((contact) => contact.isPrimary) ?? contacts[0];
  const primaryName = conversationNameOf(primary);

  function requestCall() {
    // The request is confirmed inside the conversation, so on a phone the
    // button takes the user there first.
    if (wide) setCallRequested(true);
    else navigate(`/app/contacts/${primary.id}`, { state: { requestCall: true } });
  }

  return (
    <div className="space-y-6 page-container">
      <ContactsPageHeader
        title="Contacts"
        subtitle="People who care for you"
        action={
          supportsVideoRelay(primary) && (
            <VideoCallButton contactName={primaryName} onRequest={requestCall} />
          )
        }
      />

      {wide ? (
        <ContactsTwoPane
          list={<ContactList selectedId={primary.id} />}
          conversation={
            <Conversation
              contact={primary}
              headingLevel={2}
              callRequested={callRequested}
              onDismissCall={() => setCallRequested(false)}
              fill
            />
          }
        />
      ) : (
        <ContactList />
      )}
    </div>
  );
}
