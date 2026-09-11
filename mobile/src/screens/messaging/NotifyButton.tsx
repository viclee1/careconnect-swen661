import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '../../components/Icon';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/layout';

/**
 * The Notify action from the Week 3 prototype.
 *
 * This is CareConnect's answer to "give me a ring": it lights up the other
 * person's screen and buzzes their phone, and plays nothing. The second line
 * says exactly what will happen, because a user who cannot hear a ringtone has
 * no way to verify it afterwards and should not have to guess.
 */
export function NotifyButton({
  contactName,
  vibrationEnabled,
  onPress,
}: {
  contactName: string;
  vibrationEnabled: boolean;
  onPress: () => void;
}) {
  const subtitle = vibrationEnabled
    ? 'Sends a visual flash and vibration — no sound'
    : 'Sends a visual flash — vibration is off in Settings';

  return (
    <Pressable
      testID="notify-button"
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Alert ${contactName} you want to talk. ${subtitle}.`}
      style={({ pressed }) => [styles.button, pressed ? styles.pressed : null]}
    >
      <Icon name="vibration" size={28} color={colors.warningText} />
      <View style={styles.text}>
        <Text style={styles.title}>Alert {contactName} you want to talk</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    width: '100%',
    minHeight: 64,
    paddingHorizontal: layout.gutter,
    paddingVertical: 12,
    borderRadius: layout.radius,
    borderWidth: 1.5,
    borderColor: colors.warningText,
    backgroundColor: colors.warningFill,
  },
  pressed: { opacity: 0.85 },
  text: { flex: 1, gap: 2 },
  title: { fontSize: 17, lineHeight: 22, fontWeight: '700', color: colors.warningText },
  subtitle: { fontSize: 14, lineHeight: 18, color: colors.warningText },
});
