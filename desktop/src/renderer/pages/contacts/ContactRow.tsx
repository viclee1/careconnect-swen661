import { Icon } from '../../components/Icon';
import { StatusBadge } from '../../components/StatusBadge';
import { initialsFor, type Contact } from '../../models/contact';

/**
 * One person in the Contacts list, laid out as the Week 3 prototype draws it:
 * a lettered avatar, the name, the relationship underneath, a "Primary" pill
 * where it applies, and a count of messages waiting.
 *
 * The whole row opens the conversation. There is deliberately no call button
 * here — a voice call is the one channel this application's users cannot use,
 * and a test asserts that none of these rows ever grows one.
 *
 * The row is a `<button>`, so it is reachable by Tab, activated by Enter *and*
 * Space, and announced as a button, all without a line of code. Its accessible
 * name is built from the words printed on it, in the order they are printed
 * (WCAG 2.5.3 Label in Name), so a voice-control user can say what they see.
 * What the screen does not print — that a contact is an urgent care service —
 * is appended in visually hidden text after it.
 */
export function ContactRow({
  contact,
  preview,
  waiting,
  onOpen,
}: {
  contact: Contact;
  preview: string;
  waiting: number;
  onOpen: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        data-testid={`contact-${contact.id}`}
        className={`contact-row${contact.isPrimary ? ' contact-row--primary' : ''}`}
        onClick={onOpen}
      >
        <span
          className={`avatar${contact.isEmergency ? ' avatar--emergency' : ''}`}
          aria-hidden="true"
        >
          {initialsFor(contact)}
        </span>

        <span className="contact-row__details">
          <span className="contact-row__name-line">
            <span className="contact-row__name">{contact.name}</span>{' '}
            {contact.isPrimary ? (
              <StatusBadge icon="primary" label="Primary" announce />
            ) : null}
          </span>{' '}
          <span className="contact-row__relationship">{contact.relationship}</span>{' '}
          <span className="contact-row__preview">{preview}</span>
        </span>{' '}

        {waiting > 0 ? (
          <span className="contact-row__waiting">
            <span className="contact-row__waiting-count">{waiting}</span>{' '}
            <span className="contact-row__waiting-word">waiting</span>
          </span>
        ) : null}

        {contact.isEmergency ? (
          <>
            {' '}
            <span className="visually-hidden">Urgent care service</span>
          </>
        ) : null}

        <Icon name="chevronRight" size={22} />
      </button>
    </li>
  );
}
