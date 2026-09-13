import * as Haptics from 'expo-haptics';

import type { VibrationPattern } from '../models/vibrationPattern';

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Plays one of CareConnect's vibration patterns.
 *
 * `expo-haptics` exposes named impacts rather than an arbitrary waveform, so a
 * pattern is approximated by firing an impact for each pulse and waiting out the
 * gap between them. That is enough to make the three rhythms distinguishable by
 * feel, which is the point; a true waveform needs a native module and is noted
 * as a limitation in the README.
 *
 * Does nothing when `enabled` is false, so a user who has switched vibration off
 * never gets a buzz from a preview button.
 */
export async function playPattern(
  pattern: VibrationPattern,
  enabled = true,
): Promise<void> {
  if (!enabled) return;
  for (let i = 0; i < pattern.pulses.length; i += 2) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const gap = i + 1 < pattern.pulses.length ? pattern.pulses[i + 1] : 0;
    if (gap > 0) await wait(gap);
  }
}

/** The single firm buzz that accompanies a Notify alert. */
export async function notifyBuzz(enabled = true): Promise<void> {
  if (!enabled) return;
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
}
