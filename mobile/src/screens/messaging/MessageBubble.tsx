import { StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from '../../components/Icon';
import {
  alternativeHeading,
  deliveryStatusLabels,
  isMine,
  isSystem,
  isTextAlternative,
  kindOf,
  messageSemanticLabel,
  type DeliveryStatus,
  type Message,
} from '../../models/message';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/layout';
import { type } from '../../theme/typography';
import { clock, dayLabel } from '../../utils/formatters';

const statusIcons: Record<DeliveryStatus, IconName> = {
  sending: 'schedule',
  sent: 'check',
  delivered: 'done-all',
  read: 'mark-chat-read',
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
  return (
    <View>
      {showDayLabel ? (
        <View style={styles.daySeparator}>
          <View style={styles.rule} />
          <Text accessibilityRole="header" style={styles.dayLabel}>
            {dayLabel(message.sentAt, now)}
          </Text>
          <View style={styles.rule} />
        </View>
      ) : null}

      <View
        accessible
        accessibilityLabel={messageSemanticLabel(message, contactName)}
        style={[
          styles.row,
          isMine(message) ? styles.rowMine : styles.rowTheirs,
        ]}
      >
        {isSystem(message) ? (
          <SystemAlert message={message} />
        ) : (
          <Bubble message={message} contactName={contactName} />
        )}
      </View>
    </View>
  );
}

function Bubble({ message, contactName }: { message: Message; contactName: string }) {
  const mine = isMine(message);
  const fill = mine ? colors.primaryDark : colors.secondaryLight;
  const ink = mine ? colors.primaryLight : colors.primaryDark;

  return (
    <View style={[styles.bubble, { backgroundColor: fill, borderColor: mine ? colors.primaryDark : colors.border }]}>
      <Text style={[styles.author, { color: ink }]}>{mine ? 'You' : contactName}</Text>

      {isTextAlternative(message) ? <MediaHeader message={message} /> : null}

      <Text style={[styles.body, { color: ink }]}>{message.body}</Text>

      <View style={styles.footer}>
        <Text style={[styles.stamp, { color: ink }]}>{clock(message.sentAt)}</Text>
        {mine ? (
          <>
            <Icon name={statusIcons[message.status ?? 'sent']} size={16} color={ink} />
            <Text style={[styles.stamp, { color: ink }]}>
              {deliveryStatusLabels[message.status ?? 'sent']}
            </Text>
          </>
        ) : null}
      </View>
    </View>
  );
}

/** The "Transcript" / "Captions available" heading above a media message. */
function MediaHeader({ message }: { message: Message }) {
  const heading = alternativeHeading(message) ?? '';
  const icon: IconName = kindOf(message) === 'voicemail' ? 'record-voice-over' : 'closed-caption';
  const text = message.mediaLabel ? `${heading} · ${message.mediaLabel}` : heading;

  return (
    <View style={styles.mediaHeader}>
      <Icon name={icon} size={18} color={colors.warningText} />
      <Text style={styles.mediaHeaderText}>{text}</Text>
    </View>
  );
}

/** A CareConnect alert delivered inside the conversation. */
function SystemAlert({ message }: { message: Message }) {
  return (
    <View style={styles.systemAlert}>
      <View style={styles.systemHeading}>
        <Icon name="notifications-active" size={20} color={colors.warningText} />
        <Text style={styles.systemHeadingText}>
          CareConnect alert · {clock(message.sentAt)}
        </Text>
      </View>
      <Text style={styles.systemBody}>{message.body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  daySeparator: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  rule: { flex: 1, height: 1, backgroundColor: colors.border },
  dayLabel: { fontSize: 14, lineHeight: 18, fontWeight: '700', color: colors.secondaryDark },
  row: { paddingVertical: 6, maxWidth: '100%' },
  rowMine: { alignItems: 'flex-end' },
  rowTheirs: { alignItems: 'flex-start' },
  bubble: {
    maxWidth: 420,
    padding: 14,
    borderRadius: layout.radius,
    borderWidth: 1,
    gap: 8,
  },
  author: { fontSize: 14, lineHeight: 18, fontWeight: '700' },
  body: type.body,
  footer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stamp: { fontSize: 13, lineHeight: 17 },
  mediaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.warningText,
    backgroundColor: colors.warningFill,
  },
  mediaHeaderText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    color: colors.warningText,
    flexShrink: 1,
  },
  systemAlert: {
    width: '100%',
    padding: 14,
    borderRadius: layout.radius,
    borderWidth: 1.5,
    borderColor: colors.warningText,
    backgroundColor: colors.warningFill,
    gap: 8,
  },
  systemHeading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  systemHeadingText: { fontSize: 14, lineHeight: 18, fontWeight: '700', color: colors.warningText },
  systemBody: { ...type.body, color: colors.warningText },
});
