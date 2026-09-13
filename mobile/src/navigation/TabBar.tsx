import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '../components/Icon';
import { colors } from '../theme/colors';
import { destinations, type AppDestination } from './destinations';

/**
 * The bottom navigation bar: six destinations, icon above a short label.
 *
 * Hand-built rather than using the default bar for two reasons. The prototype
 * carries six destinations, which is past the three-to-five the stock component
 * is sized for and would clip "Medicines" on a narrow phone. And the selected
 * tab has to be legible without colour vision: here it is bold and underlined
 * as well as tinted, and carries `accessibilityState.selected`.
 *
 * Because it lives in the navigator rather than in a screen, it is mounted once
 * and never animates — switching tabs changes the page underneath and nothing
 * else.
 */
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom }]}>
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const entry = destinations.find((item) => item.destination === route.name);
          if (!entry) return null;
          const selected = state.index === index;

          return (
            <Pressable
              key={route.key}
              testID={`tab-${entry.destination}`}
              onPress={() => {
                if (!selected) navigation.navigate(route.name as AppDestination);
              }}
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
          );
        })}
      </View>
    </View>
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
});
