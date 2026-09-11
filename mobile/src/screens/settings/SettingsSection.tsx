import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from '../../components/Icon';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/layout';
import { type } from '../../theme/typography';

/**
 * A titled group of settings.
 *
 * The heading is marked as a semantic header so a screen-reader user can jump
 * between sections instead of swiping through every control.
 */
export function SettingsSection({
  icon,
  title,
  description,
  children,
}: {
  icon: IconName;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.headingRow}>
        <Icon name={icon} size={24} color={colors.primaryDark} />
        <Text accessibilityRole="header" style={styles.title}>
          {title}
        </Text>
      </View>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 4, marginBottom: 24 },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { ...type.sectionTitle, color: colors.primaryDark, flex: 1 },
  description: { ...type.bodySmall, color: colors.secondaryDark, marginBottom: 8 },
  card: {
    borderRadius: layout.radius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.primaryLight,
    overflow: 'hidden',
  },
});
