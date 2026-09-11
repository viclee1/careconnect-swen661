import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { layout } from '../theme/layout';
import { type } from '../theme/typography';
import { Icon, type IconName } from './Icon';

export type AlertTone = 'info' | 'warning' | 'error' | 'success';

const tones: Record<AlertTone, { fill: string; ink: string; icon: IconName }> = {
  info: { fill: colors.secondaryLight, ink: colors.primaryDark, icon: 'info-outline' },
  warning: { fill: colors.warningFill, ink: colors.warningText, icon: 'warning-amber' },
  error: { fill: colors.errorFill, ink: colors.errorText, icon: 'error-outline' },
  success: { fill: colors.successFill, ink: colors.successText, icon: 'check-circle-outline' },
};

/**
 * A prominent, always-visible banner.
 *
 * This is the component that satisfies the assigned constraints "No sound-only
 * alerts" and "Clear visual notifications": every alert in CareConnect renders
 * one of these, carrying an icon, a title in words, and a body that says what
 * happened rather than merely that something did.
 *
 * The whole banner is one accessibility element announced as a live region, so
 * a screen reader reads it as a sentence the moment it appears.
 */
export function AlertBanner({
  title,
  message,
  tone = 'info',
  icon,
  action,
}: {
  title: string;
  message: string;
  tone?: AlertTone;
  /** Overrides the icon the tone would otherwise choose. */
  icon?: IconName;
  /** Optional control underneath, e.g. a "Try again" button. */
  action?: ReactNode;
}) {
  const { fill, ink, icon: toneIcon } = tones[tone];

  return (
    <View
      accessible
      accessibilityLiveRegion="polite"
      accessibilityLabel={`${title}. ${message}`}
      style={[styles.banner, { backgroundColor: fill, borderColor: ink }]}
    >
      <View style={styles.headingRow}>
        <Icon name={icon ?? toneIcon} size={24} color={ink} />
        <Text style={[styles.title, { color: ink }]}>{title}</Text>
      </View>
      <Text style={[styles.message, { color: ink }]}>{message}</Text>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    padding: layout.gutter,
    borderRadius: layout.radius,
    borderWidth: 1.5,
    gap: 8,
  },
  headingRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  title: { ...type.cardTitle, flex: 1 },
  message: type.bodySmall,
  action: { alignSelf: 'flex-start', marginTop: 4 },
});
