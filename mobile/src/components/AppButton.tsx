import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { layout } from '../theme/layout';
import { type } from '../theme/typography';
import { Icon, type IconName } from './Icon';

/**
 * The app's button.
 *
 * A disabled button is dimmed *and* carries `accessibilityState.disabled`, so
 * the state reaches a screen reader rather than living only in the colour.
 */
export function AppButton({
  label,
  onPress,
  icon,
  variant = 'filled',
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  fullWidth = false,
  tone = colors.primaryDark,
  testID,
}: {
  label: string;
  onPress: () => void;
  icon?: IconName;
  variant?: 'filled' | 'outlined';
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  fullWidth?: boolean;
  tone?: string;
  testID?: string;
}) {
  const filled = variant === 'filled';
  const ink = filled ? colors.primaryLight : tone;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        fullWidth && styles.fullWidth,
        {
          backgroundColor: filled ? tone : 'transparent',
          borderColor: tone,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={styles.content}>
        {icon ? <Icon name={icon} size={20} color={ink} /> : null}
        <Text style={[styles.label, { color: ink }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: layout.minTouchTarget,
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderRadius: layout.radius,
    borderWidth: 1.5,
  },
  fullWidth: { width: '100%' },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  label: type.label,
});
