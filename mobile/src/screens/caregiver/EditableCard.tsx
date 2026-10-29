import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { Icon, type IconName } from '../../components/Icon';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/layout';
import { type } from '../../theme/typography';

/**
 * One item a caregiver can change: its details, then Edit and Delete.
 *
 * Delete asks first, in place — "Delete Amlodipine?" with Yes / Cancel —
 * rather than in a dialog, so nothing covers the screen and nothing times out.
 */
export function EditableCard({
  icon,
  title,
  details,
  onEdit,
  onDelete,
  testID,
}: {
  icon: IconName;
  title: string;
  /** Lines under the title, also read as part of the card's label. */
  details: string[];
  onEdit: () => void;
  onDelete: () => void;
  testID?: string;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <View style={styles.card} testID={testID}>
      <View style={styles.row} accessible accessibilityLabel={[title, ...details].join(', ')}>
        <View style={styles.iconCircle}>
          <Icon name={icon} size={22} color={colors.primaryLight} />
        </View>
        <View style={styles.titles}>
          <Text style={styles.title}>{title}</Text>
          {details.map((line) => (
            <Text key={line} style={styles.detail}>
              {line}
            </Text>
          ))}
        </View>
      </View>
      {confirming ? (
        <View style={styles.actions}>
          <Text style={styles.question}>Delete {title}?</Text>
          <AppButton
            label="Yes, delete"
            tone={colors.errorText}
            onPress={onDelete}
            accessibilityLabel={`Yes, delete ${title}`}
          />
          <AppButton label="Cancel" variant="outlined" onPress={() => setConfirming(false)} />
        </View>
      ) : (
        <View style={styles.actions}>
          <AppButton
            label="Edit"
            icon="edit"
            variant="outlined"
            onPress={onEdit}
            accessibilityLabel={`Edit ${title}`}
          />
          <AppButton
            label="Delete"
            icon="delete-outline"
            variant="outlined"
            tone={colors.errorText}
            onPress={() => setConfirming(true)}
            accessibilityLabel={`Delete ${title}`}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    padding: layout.gutter,
    borderRadius: layout.radius,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.secondaryLight,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryDark,
  },
  titles: { flex: 1, gap: 2 },
  title: { ...type.cardTitle, color: colors.primaryDark },
  detail: { ...type.bodySmall, color: colors.secondaryDark },
  actions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12 },
  question: { ...type.label, color: colors.errorText, width: '100%' },
});

/** A dismissible confirmation — "Added Vitamin D." — in place of a toast. */
export function Notice({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <View style={noticeStyles.notice} accessibilityLiveRegion="polite">
      <Icon name="check" size={20} color={colors.successText} />
      <Text style={noticeStyles.text}>{message}</Text>
      <AppButton label="OK" variant="outlined" onPress={onDismiss} accessibilityLabel="OK, dismiss" />
    </View>
  );
}

const noticeStyles = StyleSheet.create({
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: layout.radius,
    backgroundColor: colors.successFill,
    borderWidth: 1.5,
    borderColor: colors.successText,
  },
  text: { ...type.label, color: colors.successText, flex: 1 },
});
