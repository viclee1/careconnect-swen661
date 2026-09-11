import { StyleSheet, Switch, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { type } from '../../theme/typography';

/**
 * A single on/off preference.
 *
 * The current state is written out as the word "On" or "Off" beside the switch.
 * A switch communicates its state through position and colour, and the design
 * philosophy rules out colour-only signals, so the word carries the state for
 * anyone who finds the thumb position ambiguous.
 */
export function SettingsSwitchRow({
  title,
  description,
  value,
  onValueChange,
  locked = false,
  lockedReason,
  testID,
}: {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
  /** When true the control is shown but cannot be changed. */
  locked?: boolean;
  lockedReason?: string;
  testID?: string;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.state}>{value ? 'On' : 'Off'}</Text>
        </View>
        <Text style={styles.description}>
          {locked && lockedReason ? lockedReason : description}
        </Text>
      </View>
      <Switch
        testID={testID}
        value={value}
        onValueChange={onValueChange}
        disabled={locked}
        accessibilityRole="switch"
        accessibilityLabel={title}
        accessibilityState={{ checked: value, disabled: locked }}
        accessibilityHint={locked && lockedReason ? lockedReason : description}
        trackColor={{ true: colors.primaryDark, false: colors.border }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  text: { flex: 1, gap: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { ...type.rowTitle, color: colors.primaryDark, flex: 1 },
  state: { ...type.label, color: colors.secondaryDark },
  description: { ...type.bodySmall, color: colors.secondaryDark },
});
