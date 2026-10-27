/**
 * The screen-flash cues, one per alert type.
 *
 * A deaf user cannot tell alerts apart by ringtone, so each type flashes its
 * own colour. The colour is never the only signal: the flash always carries the
 * alert's name in words, and the Settings screen prints the colour's name next
 * to its swatch.
 *
 * `flashes` is how many slow pulses the cue plays. Two pulses inside the
 * 1.6-second cue is well under the three-flashes-a-second seizure threshold
 * (WCAG 2.3.1).
 */
export type FlashTone = 'warm' | 'calm' | 'alert';

export interface FlashCue {
  id: 'medication' | 'appointment' | 'missed';
  alertType: string;
  colourName: string;
  tone: FlashTone;
  flashes: 1 | 2;
}

export const flashCues: FlashCue[] = [
  { id: 'medication', alertType: 'Medication', colourName: 'Amber flash', tone: 'warm', flashes: 1 },
  { id: 'appointment', alertType: 'Appointment', colourName: 'Teal flash', tone: 'calm', flashes: 1 },
  {
    id: 'missed',
    alertType: 'Missed / Escalated',
    colourName: 'Rapid red double-flash',
    tone: 'alert',
    flashes: 2,
  },
];

/** The sentence shown inside a previewed flash. */
export function flashCueMessage(cue: FlashCue): string {
  return `${cue.alertType} alert\n${cue.colourName}`;
}
