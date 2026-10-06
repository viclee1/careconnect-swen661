import { buildCalendar, calendarFileName, type CalendarAppointment } from './calendar';

/**
 * Saves appointments as an `.ics` calendar file.
 *
 * The file is built here and handed over as a download. Inside Electron that
 * opens the native Save dialog — Electron's default for a download nobody has
 * claimed — so the user chooses where it goes, and the renderer needs no IPC
 * channel and no filesystem access of its own. In a browser it lands in
 * Downloads.
 *
 * Throws when none of the appointments has a date a calendar can read, so the
 * page can say so instead of saving an empty calendar.
 */
export function exportAppointments(appointments: CalendarAppointment[]): {
  count: number;
  skipped: number;
} {
  const { ics, exported, skipped } = buildCalendar(appointments);
  if (exported.length === 0) {
    throw new Error('None of the appointments has a date and time a calendar can read');
  }

  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = calendarFileName;
  link.hidden = true;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  return { count: exported.length, skipped: skipped.length };
}
