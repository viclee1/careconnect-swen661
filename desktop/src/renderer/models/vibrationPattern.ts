/**
 * The vibration patterns CareConnect uses, one per alert type.
 *
 * The Week 3 prototype gives each alert type its own rhythm so a user can tell
 * what has happened without looking at the screen — the tactile equivalent of a
 * distinct ringtone, and the reason a deaf user can leave the phone face down
 * in a pocket.
 *
 * A desktop machine has no vibration motor, so this screen is where the
 * rhythms are *configured and learned* rather than felt: the pattern is drawn
 * as a glyph, and previewing it plays the rhythm back as a visual pulse in the
 * same timing the paired phone would buzz it. The setting itself still travels
 * with the account, which is why it is edited here at all.
 *
 * `pulses` is the rhythm as alternating buzz and pause durations in
 * milliseconds, starting with a buzz. `glyph` is the printed shape shown beside
 * the name, so the rhythm is legible as well as feelable.
 */
export interface VibrationPattern {
  id: 'appointment' | 'medication' | 'missed';
  alertType: string;
  rhythmName: string;
  glyph: string;
  pulses: number[];
}

export const vibrationPatterns: VibrationPattern[] = [
  {
    id: 'appointment',
    alertType: 'Appointment',
    rhythmName: 'Long-short-long',
    glyph: '—  ·  —',
    pulses: [400, 150, 120, 150, 400],
  },
  {
    id: 'medication',
    alertType: 'Medication',
    rhythmName: 'Double pulse',
    glyph: '··   ··',
    pulses: [120, 100, 120, 400, 120, 100, 120],
  },
  {
    id: 'missed',
    alertType: 'Missed / Escalated',
    rhythmName: 'Rapid burst',
    glyph: '···· ····',
    pulses: [80, 60, 80, 60, 80, 60, 80, 300, 80, 60, 80, 60, 80, 60, 80],
  },
];

/** How long the whole pattern takes to play, in milliseconds. */
export function patternDuration(pattern: VibrationPattern): number {
  return pattern.pulses.reduce((total, ms) => total + ms, 0);
}

/** The durations that are buzzes rather than pauses. */
export function vibrateDurations(pattern: VibrationPattern): number[] {
  return pattern.pulses.filter((_, index) => index % 2 === 0);
}

/**
 * The rhythm as a list of `{ on, at }` steps, for playing it back visually.
 *
 * `at` is the offset from the start of the pattern in milliseconds, so a
 * caller can schedule each step without re-deriving the running total.
 */
export function pulseTimeline(pattern: VibrationPattern): { on: boolean; at: number }[] {
  const steps: { on: boolean; at: number }[] = [];
  let elapsed = 0;
  pattern.pulses.forEach((duration, index) => {
    steps.push({ on: index % 2 === 0, at: elapsed });
    elapsed += duration;
  });
  steps.push({ on: false, at: elapsed });
  return steps;
}

/** The sentence a screen reader announces for this row. */
export function patternSemanticLabel(pattern: VibrationPattern): string {
  return `Activate to see the ${pattern.rhythmName} rhythm played back.`;
}
