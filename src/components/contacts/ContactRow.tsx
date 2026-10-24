import { Link } from 'react-router-dom';
import { ChevronRight, Star } from 'lucide-react';

import { initialsFor, type Contact } from '../../models/contact';

/**
 * One person in the Contacts list: a lettered avatar, the name, the
 * relationship underneath, a "Primary" pill where it applies, a preview of the
 * conversation and a count of messages waiting.
 *
 * The whole row is a link to the conversation, because that is what it does —
 * it goes somewhere. There is deliberately no call button: a voice call is the
 * one channel this application's users cannot rely on, so every row leads to
 * text.
 *
 * The accessible name is the words printed on the row, in the order printed
 * (WCAG 2.5.3 Label in Name). What the screen does not print — that a contact
 * is an urgent care service — is appended in visually hidden text.
 */
export default function ContactRow({
  contact,
  preview,
  waiting,
}: {
  contact: Contact;
  preview: string;
  waiting: number;
}) {
  return (
    <li>
      <Link
        to={`/app/contacts/${contact.id}`}
        data-testid={`contact-${contact.id}`}
        className={[
          'card card-hover flex items-center gap-4 p-4 no-underline text-neutral-700',
          'min-h-[4.5rem]',
          contact.isPrimary ? 'border-calm-300 bg-calm-50' : '',
        ].join(' ')}
      >
        <span
          className={[
            'w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center',
            'font-bold text-white text-base',
            contact.isEmergency ? 'bg-alert-600' : 'bg-calm-600',
          ].join(' ')}
          aria-hidden="true"
        >
          {initialsFor(contact)}
        </span>

        <span className="flex-1 min-w-0 flex flex-col">
          <span className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-neutral-800 text-lg leading-tight">{contact.name}</span>{' '}
            {contact.isPrimary && (
              <span className="badge badge-calm text-xs">
                <Star className="w-3 h-3" aria-hidden="true" />
                Primary
              </span>
            )}
          </span>{' '}
          <span className="text-sm text-neutral-600">{contact.relationship}</span>{' '}
          <span className="text-sm text-neutral-500 truncate">{preview}</span>
        </span>{' '}

        {/* The count in a circle with the word beneath it, as the mobile app
            draws it: narrow enough that the name and preview keep their room
            at 375px, and never a number without its word. */}
        {waiting > 0 && (
          <span className="flex-shrink-0 flex flex-col items-center gap-0.5 text-warm-800">
            <span className="w-8 h-8 rounded-full bg-warm-100 border-2 border-warm-300 flex items-center justify-center text-sm font-bold">
              {waiting}
            </span>{' '}
            <span className="text-xs font-semibold">waiting</span>
          </span>
        )}

        {contact.isEmergency && (
          <>
            {' '}
            <span className="sr-only">Urgent care service</span>
          </>
        )}

        <ChevronRight className="w-6 h-6 flex-shrink-0 text-neutral-400" aria-hidden="true" />
      </Link>
    </li>
  );
}
