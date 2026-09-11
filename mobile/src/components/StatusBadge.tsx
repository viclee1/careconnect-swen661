import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { layout } from '../theme/layout';
import { Icon, type IconName } from './Icon';

/**
 * A small pill that always shows **an icon and a word**.
 *
 * The Assignment 3 design philosophy is explicit that status is "always a word
 * plus a shape" and that information is never carried by colour alone. Making
 * both `icon` and `label` required means a caller cannot accidentally ship a
 * colour-only indicator.
 */
export function StatusBadge({
  icon,
  label,
  fill = colors.secondaryLight,
  foreground = colors.primaryDark,
}: {
  icon: IconName;
  label: string;
  fill?: string;
  foreground?: string;
}) {
  return (
    <View
      style={[styles.pill, { backgroundColor: fill, borderColor: foreground }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Icon name={icon} size={16} color={foreground} />
      <Text style={[styles.label, { color: foreground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: layout.radius,
    borderWidth: 1,
  },
  label: { fontSize: 14, lineHeight: 18, fontWeight: '600' },
});
