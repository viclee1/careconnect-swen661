import { useEffect, useRef, useState } from 'react';

import { AlertBanner } from '../../components/AlertBanner';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { PageHeader } from '../../components/PageHeader';
import type { AppointmentInput } from '../../models/appointment';
import { useAppointments } from '../../state/AppointmentsProvider';
import { EditableCard } from './EditableCard';
import { EditForm, type EditField } from './EditForm';
import '../carePages.css';
import './caregiver.css';

const fields: EditField<keyof AppointmentInput>[] = [
  { name: 'doctor', label: 'Who it is with', placeholder: 'e.g. Dr. Sharma' },
  { name: 'specialty', label: 'What it is for', placeholder: 'e.g. Blood pressure check' },
  { name: 'date', label: 'Date', placeholder: 'e.g. Nov 3, 2026' },
  { name: 'time', label: 'Time', placeholder: 'e.g. 10:30 am' },
  { name: 'location', label: 'Where', placeholder: 'e.g. Greenfield Surgery' },
];

const blank: AppointmentInput = { doctor: '', specialty: '', date: '', time: '', location: '' };

type Mode = { kind: 'list' } | { kind: 'add' } | { kind: 'edit'; id: string };

/**
 * The caregiver's appointments list: add, change or cancel Margaret's visits.
 * Every change shows on her Appointments page — it is the same list.
 */
export function ManageAppointmentsPage() {
  const {
    appointments,
    isLoading,
    error,
    hasLoaded,
    load,
    addAppointment,
    updateAppointment,
    removeAppointment,
  } = useAppointments();
  const [mode, setMode] = useState<Mode>({ kind: 'list' });
  const [announcement, setAnnouncement] = useState('');
  const addRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef(false);

  useEffect(() => {
    if (!hasLoaded && !isLoading && !error) void load();
  }, [hasLoaded, isLoading, error, load]);

  useEffect(() => {
    if (mode.kind === 'list' && returnFocus.current) {
      returnFocus.current = false;
      addRef.current?.focus();
    }
  }, [mode]);

  function backToList(message = '') {
    returnFocus.current = true;
    setAnnouncement(message);
    setMode({ kind: 'list' });
  }

  const editing = mode.kind === 'edit' ? appointments.find((a) => a.id === mode.id) : undefined;

  return (
    <>
      <PageHeader title="Manage appointments" subtitle="Add, change or cancel Margaret's visits" />
      <div className="page-body">
        <div className="readable stack">
          <p className="visually-hidden" role="status">
            {announcement}
          </p>

          {error ? (
            <AlertBanner
              tone="error"
              title="Appointments could not be loaded"
              message="Check the connection, then try again."
              action={<Button label="Try again" onClick={() => void load()} />}
            />
          ) : null}

          {mode.kind === 'add' ? (
            <EditForm
              heading="Add an appointment"
              fields={fields}
              initial={blank}
              submitLabel="Add appointment"
              onSubmit={(values) => {
                void addAppointment(values).then(() =>
                  backToList(`Added the appointment with ${values.doctor}.`),
                );
              }}
              onCancel={() => backToList()}
            />
          ) : editing ? (
            <EditForm
              heading={`Edit the appointment with ${editing.doctor}`}
              fields={fields}
              initial={{
                doctor: editing.doctor,
                specialty: editing.specialty,
                date: editing.date,
                time: editing.time,
                location: editing.location,
              }}
              submitLabel="Save changes"
              onSubmit={(values) => {
                void updateAppointment(editing.id, values).then(() =>
                  backToList(`Saved the appointment with ${values.doctor}.`),
                );
              }}
              onCancel={() => backToList()}
            />
          ) : (
            <>
              <div className="care-toolbar">
                <p className="appointments__count">
                  {isLoading && !hasLoaded
                    ? 'Loading appointments…'
                    : appointments.length === 1
                      ? '1 appointment'
                      : `${appointments.length} appointments`}
                </p>
                <Button
                  ref={addRef}
                  icon="add"
                  label="Add appointment"
                  onClick={() => setMode({ kind: 'add' })}
                />
              </div>
              {hasLoaded && appointments.length === 0 ? (
                <EmptyState
                  icon="appointments"
                  title="No appointments booked"
                  message="Add Margaret's next visit and it will appear on her Appointments page."
                />
              ) : (
                <ul className="card-grid" aria-label="Margaret's appointments">
                  {appointments.map((appointment) => (
                    <EditableCard
                      key={appointment.id}
                      icon="appointments"
                      title={`${appointment.doctor} — ${appointment.specialty}`}
                      onEdit={() => setMode({ kind: 'edit', id: appointment.id })}
                      onDelete={() => {
                        void removeAppointment(appointment.id).then(() => {
                          returnFocus.current = true;
                          setAnnouncement(`Deleted the appointment with ${appointment.doctor}.`);
                          setMode({ kind: 'list' });
                        });
                      }}
                    >
                      <p className="info-card__subtitle">
                        {appointment.date} at {appointment.time}
                      </p>
                      <p className="info-card__meta">{appointment.location}</p>
                    </EditableCard>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
