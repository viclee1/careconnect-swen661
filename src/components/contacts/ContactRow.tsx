import { Link } from 'react-router-dom';
import { ChevronRight, Star } from 'lucide-react';

import ContactAvatar from './ContactAvatar';
import type { Contact } from '../../models/contact';

/**
 * One person in the Contacts list: a lettered avatar, the name, the
 * relationship underneath, a "Primary" pill where it applies, a preview of the
 * conversation and how many messages are waiting.
 *
 * The whole row is a link to the conversation, because that is what it does —
 * it goes somewhere. There is deliberately no voice-call button: a voice call
 * is the one channel this application's users cannot rely on, so every row
 * leads to text.
 *
 * The accessible name is the words printed on the row, in the order printed
 * (WCAG 2.5.3 Label in Name). The waiting count is drawn as a red badge on the
 * avatar and also written out in words; what the screen does not print — that
 * a contact is an urgent care service — is appended in visually hidden text.
 *
 * On a desktop the open conversation sits beside the list, so its row is
 * marked `aria-current` and drawn selected.
 */
export default function ContactRow({
  contact,
  preview,
  waiting,
  selected = false,
}: {
  contact: Contact;
  preview: string;
  waiting: number;
  selected?: boolean;
}) {
  return (
    <li>
      <Link
        to={`/app/contacts/${contact.id}`}
        data-testid={`contact-${contact.id}`}
        aria-current={selected ? 'true' : undefined}
        className={[
          'flex items-center gap-3 md:gap-4 rounded-2xl border-2 px-4 py-3 no-underline min-h-[4.5rem]',
          'transition-colors duration-150',
          selected
            ? 'border-calm-600 bg-calm-50'
            : contact.isPrimary
              ? 'border-calm-200 bg-calm-50 hover:border-calm-400'
              : 'border-transparent bg-neutral-50 hover:border-neutral-300 hover:bg-white',
        ].join(' ')}
      >
        <ContactAvatar contact={contact} waiting={waiting} />

        <span className="flex-1 min-w-0 flex flex-col">
          <span className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-neutral-800 leading-tight">{contact.name}</span>{' '}
            {contact.isPrimary && (
              <span className="inline-flex items-center gap-1 rounded-pill bg-calm-100 px-2 py-0.5 text-xs font-semibold text-calm-800">
                <Star className="w-3 h-3" aria-hidden="true" />
                Primary
              </span>
            )}
          </span>{' '}
          <span className="text-sm text-neutral-600">{contact.relationship}</span>{' '}
          <span
            className={`text-sm truncate ${waiting > 0 ? 'font-semibold text-calm-800' : 'text-neutral-600'}`}
          >
            {preview}
          </span>
        </span>

        {waiting > 0 && (
          <>
            {' '}
            <span className="sr-only">
              {waiting} {waiting === 1 ? 'message' : 'messages'} waiting
            </span>
          </>
        )}

        {contact.isEmergency && (
          <>
            {' '}
            <span className="sr-only">Urgent care service</span>
          </>
        )}

        <ChevronRight className="w-5 h-5 flex-shrink-0 text-neutral-500" aria-hidden="true" />
      </Link>
    </li>
  );
}
