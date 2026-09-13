import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '../../components/Icon';
import {
  patternSemanticLabel,
  type VibrationPattern,
} from '../../models/vibrationPattern';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/layout';
import { type } from '../../theme/typography';

/**
 * One row of the "Vibration patterns" list: the alert type, the rhythm's name,
 * and a printed shape for it.
 *
 * The glyph matters. A rhythm you can only learn by feeling it is useless to
 * someone comparing two of them in a settings screen, so each pattern is drawn
 * as well as played.
 */
export function VibrationPatternRow({
  pattern,
  enabled,
  onPreview,
}: {
  pattern: VibrationPattern;
  /** False when vibration is switched off; the row still explains itself. */
  enabled: boolean;
  onPreview: () => void;
}) {
  return (
    <Pressable
      testID={`pattern-${pattern.id}`}
      onPress={onPreview}
      disabled={!enabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !enabled }}
      accessibilityLabel={
        enabled
          ? patternSemanticLabel(pattern)
          : `${pattern.alertType} alert, ${pattern.rhythmName}. Turn vibration on to feel it.`
      }
      style={styles.row}
    >
      <View style={styles.text}>
        <Text style={styles.alertType}>{pattern.alertType}</Text>
        <Text style={styles.rhythm}>{pattern.rhythmName}</Text>
      </View>
      <Text style={styles.glyph}>{pattern.glyph}</Text>
      <Icon
        name="play-circle-outline"
        size={28}
        color={enabled ? colors.primaryDark : colors.secondaryDark}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: layout.minTouchTarget,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  text: { flex: 1 },
  alertType: { ...type.rowTitle, color: colors.primaryDark },
  rhythm: { ...type.bodySmall, color: colors.secondaryDark },
  glyph: { fontSize: 20, lineHeight: 24, letterSpacing: 2, color: colors.primaryDark },
});
