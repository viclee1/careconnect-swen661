import { AlertTriangle, Captions, Check, CheckCheck, Clock, Voicemail, type LucideIcon } from 'lucide-react';

import CaptionedVideo from './CaptionedVideo';
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
 * - a video message is drawn with its caption track and states in words
 *   whether captions are attached, with the words printed in full beneath;
 * - delivery state is written out ("Delivered") next to its tick, never left
 *   to an icon or colour alone.
 *
 * Who wrote a message is shown by which side it sits on and its colour, and
 * written out for screen readers, so position is never the only cue.
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
  const video = kindOf(message) === 'videoMessage';

  return (
    <li>
      {showDayLabel && (
        <h2 className="flex justify-center my-4">
          <span className="rounded-pill bg-neutral-200 px-3 py-0.5 text-sm font-semibold text-neutral-700">
            {dayLabel(message.sentAt, now)}
          </span>
        </h2>
      )}

      {isSystem(message) ? (
        <div className="rounded-xl border-2 border-warning-300 bg-warning-50 p-4 my-3">
          <p className="flex items-center gap-2 font-bold text-warning-900">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            CareConnect alert · {clock(message.sentAt)}
          </p>
          <p className="text-warning-900 mt-1">{message.body}</p>
        </div>
      ) : (
        <div className={`flex flex-col my-3 ${mine ? 'items-end' : 'items-start'}`}>
          <div
            className={[
              'max-w-[85%] md:max-w-[70%] lg:max-w-[32rem] overflow-hidden rounded-2xl',
              mine
                ? 'bg-calm-600 text-white rounded-br-sm'
                : 'bg-white text-neutral-800 rounded-bl-sm shadow-card',
              video ? 'w-full' : '',
            ].join(' ')}
          >
            {video && <CaptionedVideo message={message} contactName={contactName} />}

            <div className="px-4 py-3">
              <p className="sr-only">{mine ? 'You' : contactName}:</p>

              {isTextAlternative(message) && <MediaHeader message={message} />}

              <p className="whitespace-pre-wrap break-words">{message.body}</p>
            </div>
          </div>

          <p className="flex items-center gap-1 text-sm text-neutral-600 mt-1 px-1">
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
    <p className="flex items-center gap-2 text-sm font-bold text-calm-800 bg-calm-50 rounded-md px-2 py-1 mb-2">
      <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
      {text}
    </p>
  );
}
