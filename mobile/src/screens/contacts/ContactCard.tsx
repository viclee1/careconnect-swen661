import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '../../components/Icon';
import { StatusBadge } from '../../components/StatusBadge';
import {
  contactSemanticLabel,
  initialsFor,
  type Contact,
} from '../../models/contact';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/layout';
import { type } from '../../theme/typography';

/**
 * One person in the Contacts list, laid out as the Week 3 prototype draws it:
 * a lettered avatar, the name, the relationship underneath, a "Primary" pill
 * where it applies, and a count of messages waiting.
 *
 * The whole row opens the conversation. There is deliberately no call button
 * here — a voice call is the one channel this app's users cannot use.
 */
export function ContactCard({
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
    <Pressable
      testID={`contact-${contact.id}`}
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint="Opens the conversation"
      style={({ pressed }) => [
        styles.card,
        contact.isPrimary ? styles.primaryCard : null,
        pressed ? styles.pressed : null,
      ]}
    >
      <View
        style={[
          styles.avatar,
          { backgroundColor: contact.isEmergency ? colors.errorText : colors.primaryDark },
        ]}
      >
        <Text style={styles.avatarText}>{initialsFor(contact)}</Text>
      </View>

      <View style={styles.details}>
        <View style={styles.nameRow}>
          <Text numberOfLines={1} style={styles.name}>
            {contact.name}
          </Text>
          {contact.isPrimary ? <StatusBadge icon="star-outline" label="Primary" /> : null}
        </View>
        <Text numberOfLines={1} style={styles.relationship}>
          {contact.relationship}
        </Text>
        <Text numberOfLines={1} style={styles.preview}>
          {preview}
        </Text>
      </View>

      {waiting > 0 ? (
        <View
          style={styles.waiting}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <View style={styles.waitingCircle}>
            <Text style={styles.waitingCount}>{waiting}</Text>
          </View>
          <Text style={styles.waitingWord}>waiting</Text>
        </View>
      ) : null}

      <Icon name="chevron-right" size={24} color={colors.secondaryDark} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 76,
    padding: layout.gutter,
    borderRadius: layout.radius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.primaryLight,
  },
  primaryCard: { borderWidth: 2, borderColor: colors.primaryDark },
  pressed: { backgroundColor: colors.secondaryLight },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.primaryLight, fontSize: 18, fontWeight: '700' },
  details: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { ...type.rowTitle, color: colors.primaryDark, flexShrink: 1 },
  relationship: { ...type.bodySmall, color: colors.secondaryDark },
  preview: { ...type.caption, color: colors.secondaryDark },
  waiting: { alignItems: 'center', gap: 2 },
  waitingCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.warningFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitingCount: { fontSize: 15, fontWeight: '700', color: colors.warningText },
  waitingWord: { fontSize: 11, lineHeight: 14, color: colors.warningText },
});
