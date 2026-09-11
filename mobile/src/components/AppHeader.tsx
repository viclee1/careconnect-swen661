import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../theme/colors';
import { layout } from '../theme/layout';
import { type } from '../theme/typography';
import { Icon } from './Icon';

/**
 * The header every screen wears.
 *
 * Written by hand rather than using the navigator's header so the two-line
 * title, the fixed palette and the accessibility roles match the Flutter client
 * exactly. The title is marked as a header so a screen reader can jump to it.
 */
export function AppHeader({
  title,
  subtitle,
  onBack,
  backLabel = 'Back',
  onOpenSettings,
  trailing,
}: {
  title: string;
  subtitle?: string;
  /** Renders a back button when supplied. */
  onBack?: () => void;
  backLabel?: string;
  /** Renders the settings gear when supplied. */
  onOpenSettings?: () => void;
  trailing?: ReactNode;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
      {onBack ? (
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel={backLabel}
          style={styles.iconButton}
        >
          <Icon name="arrow-back" size={24} color={colors.primaryLight} />
        </Pressable>
      ) : null}

      <View style={styles.titles}>
        <Text
          accessibilityRole="header"
          numberOfLines={1}
          style={styles.title}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {trailing}

      {onOpenSettings ? (
        <Pressable
          onPress={onOpenSettings}
          accessibilityRole="button"
          accessibilityLabel="Settings"
          style={styles.iconButton}
        >
          <Icon name="settings" size={24} color={colors.primaryLight} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 12,
    backgroundColor: colors.primaryDark,
  },
  titles: { flex: 1, paddingHorizontal: 4 },
  title: { ...type.screenTitle, color: colors.primaryLight },
  subtitle: { ...type.screenSubtitle, color: colors.primaryLight },
  iconButton: {
    width: layout.minTouchTarget,
    height: layout.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
