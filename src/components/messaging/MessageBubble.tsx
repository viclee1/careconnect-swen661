import { AlertTriangle, Captions, Check, CheckCheck, Clock, Voicemail, type LucideIcon } from 'lucide-react';

import {
  alternativeHeading,
  deliveryStatusLabels,
  isMine,
  isSystem,
  isTextAlternative,
  kindOf,
  type DeliveryStatus,
  type Message,
} from '../../models/message';
import { clock, dayLabel } from '../../utils/formatters';

const statusIcons: Record<DeliveryStatus, LucideIcon> = {
  sending: Clock,
  sent: Check,
  delivered: CheckCheck,
  read: CheckCheck,
};

/**
 * One message in a conversation.
 *
 * Three of the assigned hearing constraints land here:
 * - a voicemail renders its **transcript**, so audio always has a text
 *   alternative;
 * - a video message states in words whether captions are attached;
 * - delivery state is written out ("Delivered") next to its tick, never left
 *   to an icon or colour alone.
 *
 * Every fact is real text in the document, so a screen reader's browse mode
 * can walk it line by line. Only the icons are hidden, each sitting beside the
 * word it stands for.
 */
export default function MessageBubble({
  message,
  contactName,
  showDayLabel,
  now,
}: {
  message: Message;
  contactName: string;
  showDayLabel: boolean;
  now?: number;
}) {
  const mine = isMine(message);
  const status = message.status ?? 'sent';
  const StatusIcon = statusIcons[status];

  return (
    <li>
      {showDayLabel && (
        <h2 className="text-center text-sm font-semibold text-neutral-600 uppercase tracking-wide my-4">
          {dayLabel(message.sentAt, now)}
        </h2>
      )}

      {isSystem(message) ? (
        <div className="rounded-xl border-2 border-warning-300 bg-warning-50 p-4 my-2">
          <p className="flex items-center gap-2 font-bold text-warning-900">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            CareConnect alert · {clock(message.sentAt)}
          </p>
          <p className="text-warning-900 mt-1">{message.body}</p>
        </div>
      ) : (
        <div className={`flex my-2 ${mine ? 'justify-end' : 'justify-start'}`}>
          <div
            className={[
              'max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 border-2',
              mine
                ? 'bg-calm-600 border-calm-600 text-white rounded-br-sm'
                : 'bg-white border-neutral-200 text-neutral-800 rounded-bl-sm',
            ].join(' ')}
          >
            <p className={`text-sm font-semibold ${mine ? 'text-calm-50' : 'text-neutral-600'}`}>
              {mine ? 'You' : contactName}
            </p>

            {isTextAlternative(message) && <MediaHeader message={message} />}

            <p className="whitespace-pre-wrap break-words">{message.body}</p>

            <p
              className={`flex items-center justify-end gap-1 text-sm mt-1 ${
                mine ? 'text-calm-50' : 'text-neutral-600'
              }`}
            >
              <span>{clock(message.sentAt)}</span>
              {mine && (
                <>
                  <span aria-hidden="true">·</span>
                  <StatusIcon className="w-4 h-4" aria-hidden="true" />
                  <span>{deliveryStatusLabels[status]}</span>
                </>
              )}
            </p>
          </div>
        </div>
      )}
    </li>
  );
}

/**
 * The "Transcript" / "Captions available" heading above a media message: it
 * tells a deaf user that what follows is what was *said*, not what was typed.
 */
function MediaHeader({ message }: { message: Message }) {
  const heading = alternativeHeading(message) ?? '';
  const Icon = kindOf(message) === 'voicemail' ? Voicemail : Captions;
  const text = message.mediaLabel ? `${heading} · ${message.mediaLabel}` : heading;

  return (
    <p className="flex items-center gap-2 text-sm font-bold text-calm-800 bg-calm-50 rounded-md px-2 py-1 my-1">
      <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
      {text}
    </p>
  );
}
