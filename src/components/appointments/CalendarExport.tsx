import { useId, useRef, useState } from 'react';
import { CalendarPlus } from 'lucide-react';

import Banner from '../Banner';
import type { Appointment } from '../../models/appointment';
import { calendarFileName, downloadFile, toICalendar } from '../../utils/calendar';

type ExportState =
  | { kind: 'idle' }
  | { kind: 'done'; count: number; skipped: number }
  | { kind: 'failed' };

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;

/**
 * Export to calendar, as on the desktop app: the visits are saved as an .ics
 * file for Outlook, Apple Calendar or Google Calendar. Each carries an
 * on-screen reminder an hour before, never a sound-only one.
 *
 * The result is written in a banner. Dismissing it puts focus back on the
 * button, so a keyboard user is not dropped at the top of the page.
 */
export default function CalendarExport({ appointments }: { appointments: Appointment[] }) {
  const [state, setState] = useState<ExportState>({ kind: 'idle' });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const hintId = useId();

  function runExport() {
    const { ics, count, skipped } = toICalendar(appointments);
    if (count === 0) {
      setState({ kind: 'failed' });
      return;
    }
    downloadFile(calendarFileName, ics, 'text/calendar;charset=utf-8');
    setState({ kind: 'done', count, skipped });
  }

  function dismiss() {
    setState({ kind: 'idle' });
    buttonRef.current?.focus();
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
        <button
          ref={buttonRef}
          type="button"
          onClick={runExport}
          aria-describedby={hintId}
          className="inline-flex items-center justify-center gap-2 min-h-[2.75rem] px-5 py-3 rounded-lg border-2 border-calm-600 bg-white font-semibold text-calm-700 hover:bg-calm-50 hover:text-calm-800 whitespace-nowrap"
        >
          <CalendarPlus className="w-5 h-5" aria-hidden="true" />
          Export to calendar
        </button>
        <p id={hintId} className="text-sm text-neutral-600 leading-snug">
          Saves your visits as a calendar file for Outlook, Apple Calendar or Google Calendar. Each
          visit shows an on-screen reminder an hour before — no sound.
        </p>
      </div>

      {state.kind === 'done' && (
        <Banner
          variant={state.skipped > 0 ? 'warning' : 'success'}
          title={`${plural(state.count, 'appointment')} saved to “${calendarFileName}”`}
          onDismiss={dismiss}
        >
          Open the file from your downloads to add the visits to your calendar.
          {state.skipped > 0 &&
            ` ${plural(state.skipped, 'appointment')} had no date a calendar can read and ${
              state.skipped === 1 ? 'was' : 'were'
            } left out.`}
        </Banner>
      )}
      {state.kind === 'failed' && (
        <Banner variant="error" title="Appointments were not exported" onDismiss={dismiss}>
          None of these visits has a date and time a calendar can read, so no file was made.
        </Banner>
      )}
    </div>
  );
}
