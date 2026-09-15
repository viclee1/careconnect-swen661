import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '../components/Icon';
import { colors } from '../theme/colors';
import { layout } from '../theme/layout';
import { destinations, type AppDestination, type NavEntry } from './destinations';

interface TabItem {
  entry: NavEntry;
  key: string;
  selected: boolean;
}

/**
 * The app's persistent navigation chrome.
 *
 * On a phone this is a bottom bar: six destinations, icon above a short
 * label. From the tablet breakpoint up it becomes the prototype's left
 * sidebar instead, with full labels and Settings listed alongside the six
 * tabs — matching the Flutter client's `AppShell`, which swaps its bottom bar
 * for a sidebar the same way.
 *
 * Hand-built rather than using the stock bar for two reasons past the layout
 * switch: the prototype carries six destinations, which is past the
 * three-to-five the stock component is sized for and would clip "Medicines"
 * on a narrow phone. And the selected item has to be legible without colour
 * vision — bold and underlined as well as tinted, and carrying
 * `accessibilityState.selected`.
 *
 * Because it lives in the navigator rather than in a screen, it is mounted
 * once and never animates — switching tabs changes the page underneath and
 * nothing else.
 */
export function TabBar({
  state,
  navigation,
  isTablet,
  onOpenSettings,
}: BottomTabBarProps & { isTablet: boolean; onOpenSettings: () => void }) {
  const insets = useSafeAreaInsets();

  const items: TabItem[] = state.routes.flatMap((route, index) => {
    const entry = destinations.find((item) => item.destination === route.name);
    return entry ? [{ entry, key: route.key, selected: state.index === index }] : [];
  });

  const goTo = (destination: AppDestination, selected: boolean) => {
    if (!selected) navigation.navigate(destination);
  };

  if (isTablet) {
    return (
      <View style={[styles.sidebar, { paddingTop: insets.top + 12 }]}>
        {items.map(({ entry, key, selected }) => (
          <SidebarItem
            key={key}
            testID={`tab-${entry.destination}`}
            icon={entry.icon}
            label={entry.label}
            selected={selected}
            onPress={() => goTo(entry.destination, selected)}
          />
        ))}
        <SidebarItem
          testID="tab-Settings"
          icon="settings"
          label="Settings"
          selected={false}
          onPress={onOpenSettings}
        />
      </View>
    );
  }

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom }]}>
      <View style={styles.row}>
        {items.map(({ entry, key, selected }) => (
          <Pressable
            key={key}
            testID={`tab-${entry.destination}`}
            onPress={() => goTo(entry.destination, selected)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={
              selected ? `${entry.label}, current screen` : `Go to ${entry.label}`
            }
            style={styles.item}
          >
            <Icon name={entry.icon} size={22} color={colors.primaryDark} />
            <Text
              numberOfLines={1}
              style={[styles.label, selected ? styles.labelSelected : null]}
            >
              {entry.shortLabel}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

/** One row of the tablet sidebar: icon, full label, and a tinted background
 * when selected — never colour alone. */
function SidebarItem({
  testID,
  icon,
  label,
  selected,
  onPress,
}: {
  testID: string;
  icon: IconName;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      accessibilityLabel={selected ? `${label}, current screen` : `Go to ${label}`}
      style={[styles.sidebarItem, selected ? styles.sidebarItemSelected : null]}
    >
      <Icon name={icon} size={22} color={selected ? colors.primaryLight : colors.primaryDark} />
      <Text
        numberOfLines={1}
        style={[
          styles.sidebarLabel,
          { color: selected ? colors.primaryLight : colors.primaryDark },
          selected ? styles.labelSelected : null,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.secondaryLight,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  row: { flexDirection: 'row', height: 64 },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  label: {
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'center',
    paddingHorizontal: 2,
    color: colors.primaryDark,
  },
  labelSelected: { fontWeight: '700', textDecorationLine: 'underline' },
  sidebar: {
    width: 220,
    backgroundColor: colors.secondaryLight,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: layout.minTouchTarget,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sidebarItemSelected: { backgroundColor: colors.primaryDark },
  sidebarLabel: { fontSize: 16, lineHeight: 20, flexShrink: 1 },
});
