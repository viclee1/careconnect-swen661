const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Formats a timestamp as a 12-hour clock reading, e.g. `8:02 am`.
 *
 * Lower case, matching the Week 3 prototype's "8:02 am". Written by hand rather
 * than with `Intl` so the output is identical on every device and in tests.
 */
export function clock(timestamp: number): string {
  const date = new Date(timestamp);
  const rawHour = date.getHours() % 12;
  const hour = rawHour === 0 ? 12 : rawHour;
  const minute = String(date.getMinutes()).padStart(2, '0');
  const suffix = date.getHours() < 12 ? 'am' : 'pm';
  return `${hour}:${minute} ${suffix}`;
}

/**
 * Formats the day a message was sent, relative to `now`.
 *
 * Returns `Today`, `Yesterday`, or an absolute date such as `Mon 1 Sep`.
 * Comparison is done on calendar days, not elapsed hours, so a message sent at
 * 11pm still reads as "Yesterday" at 1am rather than "Today".
 */
export function dayLabel(timestamp: number, now: number = Date.now()): string {
  const then = new Date(timestamp);
  const reference = new Date(now);

  const day = new Date(then.getFullYear(), then.getMonth(), then.getDate());
  const today = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate());
  const difference = Math.round((today.getTime() - day.getTime()) / 86_400_000);

  if (difference === 0) return 'Today';
  if (difference === 1) return 'Yesterday';
  return `${weekdays[day.getDay()]} ${day.getDate()} ${months[day.getMonth()]}`;
}
