import type { Medication } from '../types';
import { formatTime12 } from '../utils/dates';

export type { Medication };

/** Medicine id → taken today. The shape the caregiver dashboard also reads. */
export type TakenMap = Record<string, boolean>;

/** Whether `medication` is marked taken on `date`, the user's tick winning. */
export function isTaken(medication: Medication, takenMap: TakenMap, date: string): boolean {
  return takenMap[medication.id] ?? medication.taken[date] ?? false;
}

export interface MedicineProgress {
  taken: number;
  total: number;
  /** 0–100, rounded. */
  percent: number;
  allTaken: boolean;
}

export function medicineProgress(
  medications: Medication[],
  takenMap: TakenMap,
  date: string,
): MedicineProgress {
  const total = medications.length;
  const taken = medications.filter((m) => isTaken(m, takenMap, date)).length;
  return {
    taken,
    total,
    percent: total === 0 ? 0 : Math.round((taken / total) * 100),
    allTaken: total > 0 && taken === total,
  };
}

/** "8:30 am and 8:00 pm" — the times as a sentence, not a row of chips alone. */
export function timesSentence(times: string[]): string {
  const formatted = [...times].sort().map(formatTime12);
  if (formatted.length <= 1) return formatted.join('');
  return `${formatted.slice(0, -1).join(', ')} and ${formatted[formatted.length - 1]}`;
}

/** "1 medicine" / "3 medicines" */
export function medicinesCount(count: number): string {
  return `${count} medicine${count === 1 ? '' : 's'}`;
}

/** The one sentence the status line shows and a screen reader announces. */
export function progressSentence({ taken, total, allTaken }: MedicineProgress): string {
  if (total === 0) return 'No medicines on today’s list.';
  if (allTaken) return `All ${medicinesCount(total)} taken today. Well done!`;
  return `${taken} of ${total} taken. ${medicinesCount(total - taken)} still to take today.`;
}

/** Keeps only `id → boolean` pairs from whatever was stored. */
export function reviveTakenMap(stored: unknown): TakenMap {
  if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return {};
  return Object.fromEntries(
    Object.entries(stored as Record<string, unknown>).filter(
      (entry): entry is [string, boolean] => typeof entry[1] === 'boolean',
    ),
  );
}

export interface MedicineReminder {
  medication: Medication;
  /** The dose's time, "HH:MM". */
  time: string;
  /** Its time has passed and it is not ticked. */
  overdue: boolean;
}

/**
 * Which dose the reminder caption should name, at `now` ("HH:MM").
 *
 * An overdue dose comes first — the one that has waited longest — because it
 * is the more urgent thing to say, and the caregiver dashboard already counts
 * it as missed by the same rule (its time has passed and it is not ticked).
 * Otherwise the soonest dose still to come today. `null` when every medicine
 * is taken or nothing left has a time.
 */
export function medicineReminder(
  medications: Medication[],
  isTakenById: (id: string) => boolean,
  now: string,
): MedicineReminder | null {
  const doses = medications
    .filter((medication) => !isTakenById(medication.id))
    .flatMap((medication) => medication.times.map((time) => ({ medication, time })))
    .sort((a, b) => a.time.localeCompare(b.time));
  const overdue = doses.find((dose) => dose.time < now);
  if (overdue) return { ...overdue, overdue: true };
  const next = doses.find((dose) => dose.time >= now);
  return next ? { ...next, overdue: false } : null;
}

/** The caption: "Overdue: …, was due at 12:00 pm." or "Reminder: … — take at 8:00 pm." */
export function reminderSentence({ medication, time, overdue }: MedicineReminder): string {
  const what = `${medication.name}, ${medication.dosage}`;
  const when = overdue ? `was due at ${formatTime12(time)}` : `take at ${formatTime12(time)}`;
  return [`${overdue ? 'Overdue' : 'Reminder'}: ${what} — ${when}.`, medication.instructions]
    .filter(Boolean)
    .join(' ');
}
