/**
 * Turns appointments into an iCalendar (`.ics`) file — RFC 5545.
 *
 * Pure functions only — nothing here touches the document, the filesystem or
 * Electron; `exportCalendar.ts` turns the result into a download.
 *
 * Every event carries a `DISPLAY` reminder an hour before and never an `AUDIO`
 * one. The governing rule of the application is that nothing is communicated
 * through sound alone, and a calendar alarm that only chimes is exactly that.
 */

/** The fields of an appointment the calendar file needs. */
export interface CalendarAppointment {
  id: string;
  doctor: string;
  specialty: string;
  /** As the design prints it — "Sept 18, 2026". */
  date: string;
  /** As the design prints it — "10:00 am". */
  time: string;
  location: string;
}

/** A local wall-clock time, deliberately without a zone. */
export interface LocalDateTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

const monthNumbers: Record<string, number> = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  sept: 9,
  oct: 10,
  nov: 11,
  dec: 12,
};

/** How long each exported visit is booked for; the design does not carry one. */
export const appointmentDurationMinutes = 60;

/** How long before the visit the on-screen reminder appears. */
export const reminderMinutesBefore = 60;

/**
 * Reads the date and time exactly as the design prints them — "Sept 18, 2026"
 * and "10:00 am" — or returns null when either is not in that form.
 */
export function parseAppointmentDateTime(date: string, time: string): LocalDateTime | null {
  const dateMatch = /^([A-Za-z]+)\.?\s+(\d{1,2}),?\s+(\d{4})$/.exec(date.trim());
  const timeMatch = /^(\d{1,2}):(\d{2})\s*([ap])\.?m\.?$/i.exec(time.trim());
  if (!dateMatch || !timeMatch) return null;

  const month = monthNumbers[dateMatch[1].toLowerCase()] ??
    monthNumbers[dateMatch[1].toLowerCase().slice(0, 3)];
  const day = Number(dateMatch[2]);
  const year = Number(dateMatch[3]);
  const hour12 = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);
  const isPm = timeMatch[3].toLowerCase() === 'p';

  if (!month || hour12 < 1 || hour12 > 12 || minute > 59) return null;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (day < 1 || day > daysInMonth) return null;

  const hour = (hour12 % 12) + (isPm ? 12 : 0);
  return { year, month, day, hour, minute };
}

const pad = (value: number, width = 2) => String(value).padStart(width, '0');

/**
 * `20260918T100000` — a "floating" time, with no `Z` and no `TZID`.
 *
 * Floating is right here: the visit is at ten o'clock wherever the user's
 * calendar is, which is what the design's "10:00 am" means.
 */
export function formatLocalDateTime(value: LocalDateTime): string {
  return `${pad(value.year, 4)}${pad(value.month)}${pad(value.day)}T${pad(value.hour)}${pad(value.minute)}00`;
}

/** Adds minutes to a wall-clock time, carrying across midnight and month ends. */
export function addMinutes(value: LocalDateTime, minutes: number): LocalDateTime {
  const moved = new Date(
    Date.UTC(value.year, value.month - 1, value.day, value.hour, value.minute + minutes),
  );
  return {
    year: moved.getUTCFullYear(),
    month: moved.getUTCMonth() + 1,
    day: moved.getUTCDate(),
    hour: moved.getUTCHours(),
    minute: moved.getUTCMinutes(),
  };
}

/** `20261004T214200Z` — the UTC stamp RFC 5545 requires on every event. */
export function formatUtcStamp(date: Date): string {
  return (
    `${pad(date.getUTCFullYear(), 4)}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
}

/** Escapes a TEXT value: backslash, semicolon, comma and line breaks. */
export function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\r|\n/g, '\\n');
}

const utf8Length = (codePoint: number) =>
  codePoint < 0x80 ? 1 : codePoint < 0x800 ? 2 : codePoint < 0x10000 ? 3 : 4;

/**
 * Folds a content line at 75 octets, as RFC 5545 §3.1 requires.
 *
 * Counted in UTF-8 bytes rather than characters, and never inside a character,
 * because the design's text carries em dashes and a name may carry accents.
 */
export function foldLine(line: string): string {
  const parts: string[] = [];
  let current = '';
  let bytes = 0;
  // The first line may hold 75 octets; continuation lines start with a space,
  // which leaves 74 for content.
  let limit = 75;

  for (const char of line) {
    const size = utf8Length(char.codePointAt(0) ?? 0);
    if (bytes + size > limit) {
      parts.push(current);
      current = '';
      bytes = 0;
      limit = 74;
    }
    current += char;
    bytes += size;
  }
  parts.push(current);
  return parts.join('\r\n ');
}

/** The event title a calendar will show — "Dr. Robert Chen (Cardiology)". */
export function eventSummary(appointment: CalendarAppointment): string {
  return `${appointment.doctor} (${appointment.specialty})`;
}

/**
 * Builds the whole calendar file. Appointments whose date or time cannot be
 * read are left out and returned in `skipped`, so the caller can say so rather
 * than drop them silently.
 */
export function buildCalendar(
  appointments: CalendarAppointment[],
  now: Date = new Date(),
): { ics: string; exported: CalendarAppointment[]; skipped: CalendarAppointment[] } {
  const exported: CalendarAppointment[] = [];
  const skipped: CalendarAppointment[] = [];
  const stamp = formatUtcStamp(now);

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//The Acuity Health Group//CareConnect//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  for (const appointment of appointments) {
    const start = parseAppointmentDateTime(appointment.date, appointment.time);
    if (!start) {
      skipped.push(appointment);
      continue;
    }
    exported.push(appointment);
    const end = addMinutes(start, appointmentDurationMinutes);

    lines.push(
      'BEGIN:VEVENT',
      `UID:${escapeText(appointment.id)}@careconnect.acuityhealth`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${formatLocalDateTime(start)}`,
      `DTEND:${formatLocalDateTime(end)}`,
      `SUMMARY:${escapeText(eventSummary(appointment))}`,
      `LOCATION:${escapeText(appointment.location)}`,
      `DESCRIPTION:${escapeText(
        `${appointment.specialty} appointment with ${appointment.doctor}. Exported from CareConnect.`,
      )}`,
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeText(`Appointment with ${appointment.doctor} in one hour`)}`,
      `TRIGGER:-PT${reminderMinutesBefore}M`,
      'END:VALARM',
      'END:VEVENT',
    );
  }

  lines.push('END:VCALENDAR');
  return { ics: lines.map(foldLine).join('\r\n') + '\r\n', exported, skipped };
}

/** The file name offered in the Save dialog and used for the browser download. */
export const calendarFileName = 'CareConnect appointments.ics';
