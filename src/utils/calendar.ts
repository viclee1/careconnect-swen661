import type { Appointment } from '../models/appointment';

/** The name the exported calendar file is saved under. */
export const calendarFileName = 'careconnect-appointments.ics';

/** How long each visit blocks out in the calendar, in minutes. */
const visitLength = 60;

/** Escapes text for an iCalendar property value (RFC 5545 §3.3.11). */
export function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/** "2026-06-04" + "14:30" → "20260604T143000" (floating local time). */
function stamp(date: string, time: string): string {
  return `${date.replace(/-/g, '')}T${time.replace(':', '')}00`;
}

function endOf(date: string, time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const end = new Date(`${date}T00:00:00`);
  end.setHours(hours, minutes + visitLength, 0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${end.getFullYear()}${pad(end.getMonth() + 1)}${pad(end.getDate())}T${pad(end.getHours())}${pad(end.getMinutes())}00`;
}

function utcStamp(now: Date): string {
  return now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/** Whether the visit has a date and time a calendar can read. */
export function isExportable(appointment: Appointment): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(appointment.date) && /^\d{2}:\d{2}$/.test(appointment.time);
}

/**
 * Builds an .ics file of the visits.
 *
 * Each event carries a DISPLAY alarm an hour before: an on-screen reminder,
 * never an AUDIO one, because a sound-only reminder is exactly what a deaf user
 * would miss. Visits without a readable date are left out and counted.
 */
export function toICalendar(
  appointments: Appointment[],
  now: Date = new Date(),
): { ics: string; count: number; skipped: number } {
  const exportable = appointments.filter(isExportable);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//The Acuity Health Group//CareConnect//EN',
    'CALSCALE:GREGORIAN',
  ];

  for (const appointment of exportable) {
    const where = [appointment.location.name, appointment.location.address].filter(Boolean).join(', ');
    const notes = [appointment.notes, appointment.caregiver && `${appointment.caregiver} is taking you.`]
      .filter(Boolean)
      .join(' ');
    lines.push(
      'BEGIN:VEVENT',
      `UID:${appointment.id}@careconnect`,
      `DTSTAMP:${utcStamp(now)}`,
      `DTSTART:${stamp(appointment.date, appointment.time)}`,
      `DTEND:${endOf(appointment.date, appointment.time)}`,
      `SUMMARY:${escapeICalText(appointment.title)}`,
      `LOCATION:${escapeICalText(where)}`,
    );
    if (notes) lines.push(`DESCRIPTION:${escapeICalText(notes)}`);
    lines.push(
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeICalText(`In one hour: ${appointment.title}`)}`,
      'TRIGGER:-PT1H',
      'END:VALARM',
      'END:VEVENT',
    );
  }

  lines.push('END:VCALENDAR');
  return {
    ics: `${lines.join('\r\n')}\r\n`,
    count: exportable.length,
    skipped: appointments.length - exportable.length,
  };
}

/**
 * Hands the browser a file to save. On the web there is no native Save
 * dialog, so this is the download a link with `download` triggers.
 */
export function downloadFile(fileName: string, contents: string, type: string): void {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.hidden = true;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
