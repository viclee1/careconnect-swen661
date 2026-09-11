/**
 * The vibration patterns CareConnect uses, one per alert type.
 *
 * The Week 3 prototype gives each alert type its own rhythm so a user can tell
 * what has happened without looking at the screen — the tactile equivalent of a
 * distinct ringtone, and the reason a deaf user can leave the phone face down
 * in a pocket.
 *
 * `pulses` is the rhythm as alternating vibrate and pause durations in
 * milliseconds, starting with a vibrate. `glyph` is the printed shape shown
 * beside the name on the Settings screen, so the rhythm is legible as well as
 * feelable.
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

/** The durations that are vibrations rather than pauses. */
export function vibrateDurations(pattern: VibrationPattern): number[] {
  return pattern.pulses.filter((_, index) => index % 2 === 0);
}

/** The sentence a screen reader announces for this row. */
export function patternSemanticLabel(pattern: VibrationPattern): string {
  return `${pattern.alertType} alert, ${pattern.rhythmName}. Double tap to feel it.`;
}
