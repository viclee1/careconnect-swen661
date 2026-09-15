import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { layout } from '../../theme/layout';
import { type } from '../../theme/typography';

export interface Segment<T extends string> {
  value: T;
  label: string;
}

/**
 * A row of mutually exclusive choices.
 *
 * The selected segment is filled *and* carries `accessibilityState.selected`,
 * so the choice is legible without colour vision and audible to a screen
 * reader.
 */
export function SegmentedChoice<T extends string>({
  segments,
  value,
  onChange,
  disabled = false,
  groupLabel,
}: {
  segments: Segment<T>[];
  value: T;
  onChange: (next: T) => void;
  disabled?: boolean;
  groupLabel: string;
}) {
  return (
    <View style={styles.group} accessibilityLabel={groupLabel}>
      {segments.map((segment) => {
        const selected = segment.value === value;
        return (
          <Pressable
            key={segment.value}
            testID={`segment-${segment.value}`}
            onPress={() => onChange(segment.value)}
            disabled={disabled}
            accessibilityRole="radio"
            accessibilityLabel={segment.label}
            accessibilityState={{ selected, disabled }}
            style={[
              styles.segment,
              selected ? styles.selected : null,
              disabled ? styles.disabled : null,
            ]}
          >
            <Text style={[styles.label, selected ? styles.labelSelected : null]}>
              {segment.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    flexDirection: 'row',
    borderRadius: layout.radius,
    borderWidth: 1.5,
    borderColor: colors.primaryDark,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    minHeight: layout.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  selected: { backgroundColor: colors.primaryDark },
  disabled: { opacity: 0.5 },
  label: { ...type.label, color: colors.primaryDark, textAlign: 'center' },
  labelSelected: { color: colors.primaryLight },
});
