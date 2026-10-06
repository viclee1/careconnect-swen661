import { useCallback, useEffect, useId, useRef, useState } from 'react';

import { AlertBanner } from '../components/AlertBanner';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { useAppointments } from '../state/AppointmentsProvider';
import { AppointmentCard } from './appointments/AppointmentCard';
import { calendarFileName } from './appointments/calendar';
import { exportAppointments } from './appointments/exportCalendar';
import './carePages.css';

type ExportState =
  | { kind: 'idle' }
  | { kind: 'done'; count: number; skipped: number }
  | { kind: 'failed' };

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;

/**
 * The Appointments page: upcoming medical visits, as the React Native client
 * shows them, laid out two to a row where the window is wide enough.
 *
 * What the desktop adds is Export to calendar, which saves the visits as an
 * `.ics` file through the native Save dialog, so they land in the calendar the
 * user already reads. Each event carries an on-screen reminder, never a
 * sound-only one.
 */
export function AppointmentsPage() {
  const { appointments, isLoading, error, load } = useAppointments();
  const [exportState, setExportState] = useState<ExportState>({ kind: 'idle' });
  const exportButtonRef = useRef<HTMLButtonElement>(null);
  const hintId = useId();

  const bootstrap = useCallback(async () => {
    await load();
  }, [load]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const runExport = () => {
    try {
      setExportState({ kind: 'done', ...exportAppointments(appointments) });
    } catch {
      setExportState({ kind: 'failed' });
    }
  };

  const dismiss = () => {
    setExportState({ kind: 'idle' });
    // The banner and its button are about to disappear; focus would otherwise
    // fall to the document body and a keyboard user would lose their place.
    exportButtonRef.current?.focus();
  };

  return (
    <>
      <PageHeader title="Appointments" subtitle="Upcoming medical visits" />

      <div className="page-body">
        <div className="readable readable--wide stack">
          {isLoading ? (
            <p role="status">Loading appointments…</p>
          ) : error ? (
            <AlertBanner
              tone="error"
              title="Appointments could not be loaded"
              message="Your appointments are saved on this computer, so nothing has been lost. Try again in a moment."
              action={
                <Button label="Try again" icon="refresh" onClick={() => void bootstrap()} />
              }
            />
          ) : appointments.length === 0 ? (
            <EmptyState
              icon="appointments"
              title="No appointments yet"
              message="Upcoming visits will appear here once one is scheduled."
            />
          ) : (
            <>
              <div className="appointments__toolbar">
                <p className="appointments__count">
                  {plural(appointments.length, 'upcoming visit')}
                </p>
                <Button
                  ref={exportButtonRef}
                  label="Export to calendar"
                  icon="appointments"
                  variant="outlined"
                  aria-describedby={hintId}
                  onClick={runExport}
                />
              </div>
              <p id={hintId} className="field__hint">
                Saves these visits as a calendar file for Outlook, Apple Calendar or Google
                Calendar. Each visit shows an on-screen reminder an hour before — no sound.
              </p>

              <ExportBanner state={exportState} onDismiss={dismiss} />

              <ul className="card-grid" aria-label="Upcoming appointments">
                {appointments.map((appointment) => (
                  <li key={appointment.id}>
                    <AppointmentCard appointment={appointment} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function ExportBanner({ state, onDismiss }: { state: ExportState; onDismiss: () => void }) {
  const dismissButton = (
    <Button label="Dismiss" variant="quiet" icon="close" onClick={onDismiss} />
  );

  if (state.kind === 'failed') {
    return (
      <AlertBanner
        tone="error"
        title="Appointments were not exported"
        message="None of these visits has a date and time a calendar can read, so no file was made."
        action={dismissButton}
      />
    );
  }
  if (state.kind !== 'done') return null;

  const skippedNote =
    state.skipped > 0
      ? ` ${plural(state.skipped, 'appointment')} had no date a calendar can read and ${
          state.skipped === 1 ? 'was' : 'were'
        } left out.`
      : '';

  return (
    <AlertBanner
      tone={state.skipped > 0 ? 'warning' : 'success'}
      title={`${plural(state.count, 'appointment')} ready to save`}
      message={`Choose where to save "${calendarFileName}", then open it to add the visits to your calendar.${skippedNote}`}
      action={dismissButton}
    />
  );
}
