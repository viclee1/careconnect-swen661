import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { Icon } from '../../components/Icon';
import { colors } from '../../theme/colors';

/**
 * Plays a single bright pulse over the screen when `trigger` changes.
 *
 * This is the visual half of the Notify action — what the other person's phone
 * does instead of ringing, previewed here so the sender can see what they just
 * sent.
 *
 * It is deliberately **one** slow fade rather than a strobe. Anything flashing
 * more than three times a second risks triggering a seizure (WCAG 2.2 success
 * criterion 2.3.1), and this app's users are precisely the people most likely
 * to rely on a visual alert, so the pattern that helps them must not be the
 * pattern that harms someone else.
 */
export function VisualFlash({
  trigger,
  message,
}: {
  /** Increment this to play the pulse. Its value carries no meaning. */
  trigger: number;
  /** The words shown on the pulse, so the flash is never wordless. */
  message: string;
}) {
  // `useState` with an initialiser rather than a ref, so the Animated.Value is
  // created once without reading a ref during render.
  const [opacity] = useState(() => new Animated.Value(0));
  const previous = useRef(trigger);

  useEffect(() => {
    if (trigger === previous.current) return;
    previous.current = trigger;
    opacity.setValue(0);
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 270, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 630, useNativeDriver: true }),
    ]).start();
  }, [trigger, opacity]);

  if (trigger === 0) return null;

  return (
    <Animated.View pointerEvents="none" style={[styles.overlay, { opacity }]}>
      <View style={styles.content}>
        <Icon name="vibration" size={64} color={colors.warningText} />
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.warningFill,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  content: { alignItems: 'center', gap: 16 },
  message: {
    fontSize: 22,
    lineHeight: 31,
    fontWeight: '700',
    textAlign: 'center',
    color: colors.warningText,
  },
});
