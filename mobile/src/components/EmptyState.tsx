import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { layout } from '../theme/layout';
import { type } from '../theme/typography';
import { Icon, type IconName } from './Icon';

/**
 * Shown in place of a list when there is nothing to show.
 *
 * An empty state always says what happened and what to do next, rather than
 * leaving a blank area the user has to interpret.
 */
export function EmptyState({
  icon,
  title,
  message,
  action,
}: {
  icon: IconName;
  title: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <View
      accessible
      accessibilityLabel={`${title}. ${message}`}
      style={styles.container}
    >
      <Icon name={icon} size={48} color={colors.secondaryDark} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: layout.gutter,
    paddingVertical: 40,
    gap: 8,
  },
  title: { ...type.sectionTitle, color: colors.primaryDark, textAlign: 'center' },
  message: { ...type.bodySmall, color: colors.primaryDark, textAlign: 'center' },
  action: { marginTop: 12 },
});
