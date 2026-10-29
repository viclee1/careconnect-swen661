/**
 * Calendar-day helpers for the Appointments and Medicines screens.
 *
 * Dates are "YYYY-MM-DD" strings in the user's own time zone. `toISOString()`
 * is UTC, so in the evening on the US east coast it already reads tomorrow and
 * the day's appointments would slip into "Later this week".
 */

/** The local calendar date of `date` as "YYYY-MM-DD". */
export function localISODate(date: Date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** The local date `days` after `from` (negative for earlier), as "YYYY-MM-DD". */
export function addDays(days: number, from: Date = new Date()): string {
  const date = new Date(from);
  date.setDate(date.getDate() + days);
  return localISODate(date);
}

/** Whole calendar days from `a` to `b` (positive when `b` is later). */
export function daysBetween(a: string, b: string): number {
  // Noon keeps a daylight-saving change from turning one day into 23 hours.
  const from = new Date(`${a}T12:00:00`).getTime();
  const to = new Date(`${b}T12:00:00`).getTime();
  return Math.round((to - from) / 86_400_000);
}

/** "14:30" → "2:30 pm". Lower case, matching the rest of the app. */
export function formatTime12(hhmm: string): string {
  const [hours, minutes] = hhmm.split(':').map(Number);
  const suffix = hours >= 12 ? 'pm' : 'am';
  return `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${suffix}`;
}

const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * "2026-06-04" → "Thursday, 4 June". Full words, never "Thu 4/6", which is
 * read differently on each side of the Atlantic. Written by hand rather than
 * with `Intl` so the output is the same in every browser and in tests.
 */
export function formatLongDate(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00`);
  return `${weekdays[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
}
