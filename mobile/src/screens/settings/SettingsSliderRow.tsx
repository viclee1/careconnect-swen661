import Slider from '@react-native-community/slider';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { type } from '../../theme/typography';

/**
 * A labelled slider with its current value written out beside the title.
 *
 * The value is always printed in words or a percentage, never left to the thumb
 * position alone, so someone who cannot judge the thumb precisely still knows
 * exactly where the setting sits.
 */
export function SettingsSliderRow({
  title,
  valueLabel,
  description,
  value,
  minimumValue,
  maximumValue,
  step,
  onValueChange,
  minLabel,
  maxLabel,
  accessibilityValueText,
  testID,
}: {
  title: string;
  valueLabel: string;
  description: string;
  value: number;
  minimumValue: number;
  maximumValue: number;
  step: number;
  onValueChange: (next: number) => void;
  minLabel?: string;
  maxLabel?: string;
  /** The sentence a screen reader announces while dragging. */
  accessibilityValueText: string;
  testID?: string;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.value}>{valueLabel}</Text>
      </View>

      <Slider
        testID={testID}
        value={value}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        onValueChange={onValueChange}
        minimumTrackTintColor={colors.primaryDark}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.primaryDark}
        accessibilityLabel={title}
        accessibilityValue={{ text: accessibilityValueText }}
      />

      {minLabel || maxLabel ? (
        <View
          style={styles.ends}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Text style={styles.endLabel}>{minLabel ?? ''}</Text>
          <Text style={styles.endLabel}>{maxLabel ?? ''}</Text>
        </View>
      ) : null}

      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: 16, paddingVertical: 14, gap: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { ...type.rowTitle, color: colors.primaryDark, flex: 1 },
  value: { ...type.label, color: colors.primaryDark },
  ends: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8 },
  endLabel: { ...type.caption, color: colors.secondaryDark },
  description: { ...type.bodySmall, color: colors.secondaryDark },
});
