import { Icon, type IconName } from '../../components/Icon';
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

const statusIcons: Record<DeliveryStatus, IconName> = {
  sending: 'sending',
  sent: 'check',
  delivered: 'delivered',
  read: 'read',
};

/**
 * One message in a conversation.
 *
 * Three of the assigned constraints land in this component:
 *
 * - a voicemail renders its **transcript**, so audio always has a text
 *   alternative;
 * - a video message states in words whether captions are attached;
 * - delivery state is written out ("Delivered") next to its tick, so it is
 *   never carried by an icon colour alone.
 *
 * Unlike the React Native version, nothing here is collapsed into a single
 * `aria-label`. Every fact the bubble shows — who wrote it, the transcript
 * heading, the time, the delivery state — is real text in the document, so a
 * desktop screen reader's browse mode can walk it a line at a time and
 * Ctrl/Cmd+C copies what the user can see. Only the icons are hidden, because
 * each one sits beside the word it stands for.
 */
export function MessageBubble({
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
  const system = isSystem(message);

  return (
    <li>
      {showDayLabel ? (
        <div className="day-separator">
          <h2 className="day-separator__label">{dayLabel(message.sentAt, now)}</h2>
        </div>
      ) : null}

      <div
        className={`bubble-row bubble-row--${system ? 'system' : mine ? 'mine' : 'theirs'}`}
      >
        {system ? (
          <SystemAlert message={message} />
        ) : (
          <div className={`bubble${mine ? ' bubble--mine' : ''}`}>
            <span className="bubble__author">{mine ? 'You' : contactName}</span>

            {isTextAlternative(message) ? <MediaHeader message={message} /> : null}

            <p className="bubble__body">{message.body}</p>

            <span className="bubble__footer">
              <span>{clock(message.sentAt)}</span>
              {mine ? (
                <>
                  <Icon name={statusIcons[message.status ?? 'sent']} size={16} />
                  <span>{deliveryStatusLabels[message.status ?? 'sent']}</span>
                </>
              ) : null}
            </span>
          </div>
        )}
      </div>
    </li>
  );
}

/**
 * The "Transcript" / "Captions available" heading above a media message.
 *
 * This is the text alternative's own label, not decoration — a deaf user needs
 * to know that what follows is what was *said*, not what was typed.
 */
function MediaHeader({ message }: { message: Message }) {
  const heading = alternativeHeading(message) ?? '';
  const icon: IconName = kindOf(message) === 'voicemail' ? 'voicemail' : 'captions';
  const text = message.mediaLabel ? `${heading} · ${message.mediaLabel}` : heading;

  return (
    <span className="media-header">
      <Icon name={icon} size={18} />
      {text}
    </span>
  );
}

/** A CareConnect alert delivered inside the conversation. */
function SystemAlert({ message }: { message: Message }) {
  return (
    <div className="system-alert">
      <span className="system-alert__heading">
        <Icon name="alert" size={20} />
        CareConnect alert · {clock(message.sentAt)}
      </span>
      <p className="system-alert__body">{message.body}</p>
    </div>
  );
}
