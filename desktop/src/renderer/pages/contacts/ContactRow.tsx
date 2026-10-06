import { Icon } from '../../components/Icon';
import { StatusBadge } from '../../components/StatusBadge';
import { contactSemanticLabel, initialsFor, type Contact } from '../../models/contact';

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
 * Space, and announced as a button, all without a line of code. The badge and
 * the chevron are hidden from assistive technology because the button's own
 * accessible name already spells out everything they show.
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
  let label = contactSemanticLabel(contact);
  if (waiting > 0) {
    label += `, ${waiting} message${waiting === 1 ? '' : 's'} waiting`;
  }
  label += `. Latest: ${preview}.`;

  return (
    <li>
      <button
        type="button"
        data-testid={`contact-${contact.id}`}
        className={`contact-row${contact.isPrimary ? ' contact-row--primary' : ''}`}
        aria-label={label}
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
            <span className="contact-row__name">{contact.name}</span>
            {contact.isPrimary ? <StatusBadge icon="primary" label="Primary" /> : null}
          </span>
          <span className="contact-row__relationship">{contact.relationship}</span>
          <span className="contact-row__preview">{preview}</span>
        </span>

        {waiting > 0 ? (
          <span className="contact-row__waiting" aria-hidden="true">
            <span className="contact-row__waiting-count">{waiting}</span>
            <span className="contact-row__waiting-word">waiting</span>
          </span>
        ) : null}

        <Icon name="chevronRight" size={22} />
      </button>
    </li>
  );
}
