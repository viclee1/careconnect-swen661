import { useEffect, useState } from 'react';
import { AccessibilityInfo, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AlertBanner } from '../../components/AlertBanner';
import { AppButton } from '../../components/AppButton';
import { AppHeader } from '../../components/AppHeader';
import { EmptyState } from '../../components/EmptyState';
import { ReadableWidth } from '../../components/ReadableWidth';
import type { AppointmentInput } from '../../models/appointment';
import { countLabel } from '../../models/caregiver';
import { useAppointments } from '../../state/AppointmentsProvider';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/layout';
import { type } from '../../theme/typography';
import { EditableCard, Notice } from './EditableCard';
import { EditForm, type EditField } from './EditForm';

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
 * Every change shows on her Appointments screen — it is the same list.
 */
export function ManageAppointmentsScreen({ onOpenSettings }: { onOpenSettings?: () => void }) {
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
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!hasLoaded && !isLoading && !error) void load();
  }, [hasLoaded, isLoading, error, load]);

  function done(message: string) {
    setNotice(message);
    AccessibilityInfo.announceForAccessibility(message);
    setMode({ kind: 'list' });
  }

  const editing = mode.kind === 'edit' ? appointments.find((a) => a.id === mode.id) : undefined;

  return (
    <View style={styles.container}>
      <AppHeader
        title="Manage appointments"
        subtitle="Add, change or cancel Margaret's visits"
        onOpenSettings={onOpenSettings}
      />
      <ReadableWidth>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {error ? (
            // A failed load is its own fact — never shown as "no appointments".
            <AlertBanner
              tone="error"
              title="Appointments could not be loaded"
              message="Check the connection, then try again."
              action={<AppButton label="Try again" icon="refresh" onPress={() => void load()} />}
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
                  done(`Added the appointment with ${values.doctor}.`),
                );
              }}
              onCancel={() => setMode({ kind: 'list' })}
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
                  done(`Saved the appointment with ${values.doctor}.`),
                );
              }}
              onCancel={() => setMode({ kind: 'list' })}
            />
          ) : (
            <>
              {notice ? <Notice message={notice} onDismiss={() => setNotice('')} /> : null}
              <View style={styles.toolbar}>
                <Text style={styles.count}>
                  {isLoading && !hasLoaded
                    ? 'Loading appointments…'
                    : countLabel(appointments.length, 'appointment')}
                </Text>
                <AppButton
                  label="Add appointment"
                  icon="add"
                  onPress={() => {
                    setNotice('');
                    setMode({ kind: 'add' });
                  }}
                />
              </View>
              {hasLoaded && appointments.length === 0 ? (
                <EmptyState
                  icon="event"
                  title="No appointments booked"
                  message="Add Margaret's next visit and it will appear on her Appointments screen."
                />
              ) : (
                appointments.map((appointment) => {
                  const title = `${appointment.doctor} — ${appointment.specialty}`;
                  return (
                    <EditableCard
                      key={appointment.id}
                      testID={`manage-${appointment.id}`}
                      icon="event"
                      title={title}
                      details={[`${appointment.date} at ${appointment.time}`, appointment.location]}
                      onEdit={() => setMode({ kind: 'edit', id: appointment.id })}
                      onDelete={() => {
                        void removeAppointment(appointment.id).then(() =>
                          done(`Deleted the appointment with ${appointment.doctor}.`),
                        );
                      }}
                    />
                  );
                })
              )}
            </>
          )}
        </ScrollView>
      </ReadableWidth>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primaryLight },
  content: { padding: layout.gutter, gap: 16, paddingBottom: 32 },
  toolbar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  count: { ...type.label, color: colors.secondaryDark },
});
