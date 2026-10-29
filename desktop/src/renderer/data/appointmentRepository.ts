import type { Appointment, AppointmentInput } from '../models/appointment';
import { mockAppointments } from './mockAppointments';

/**
 * Read access to the appointment list.
 *
 * The interface exists so the UI never depends on where appointments come
 * from. The desktop client ships the in-memory implementation below; swapping in an HTTP
 * or SQLite backed version later is a one-line change in `App.tsx`.
 */
export interface AppointmentRepository {
  fetchAppointments(): Promise<Appointment[]>;
  /** The caregiver's edits. Each resolves once the change is stored. */
  addAppointment(input: AppointmentInput): Promise<Appointment>;
  updateAppointment(id: string, input: AppointmentInput): Promise<void>;
  removeAppointment(id: string): Promise<void>;
}

/** In-memory implementation backed by the design's seed data. */
export function createMockAppointmentRepository(
  seed: Appointment[] = mockAppointments,
): AppointmentRepository {
  let appointments = seed.map((appointment) => ({ ...appointment }));
  let nextId = appointments.length + 1;
  return {
    async fetchAppointments() {
      return appointments;
    },
    async addAppointment(input) {
      const appointment: Appointment = { id: `appt-added-${nextId++}`, ...input };
      appointments = [...appointments, appointment];
      return appointment;
    },
    async updateAppointment(id, input) {
      appointments = appointments.map((appointment) =>
        appointment.id === id ? { ...appointment, ...input } : appointment,
      );
    },
    async removeAppointment(id) {
      appointments = appointments.filter((appointment) => appointment.id !== id);
    },
  };
}

/**
 * A repository whose first `failures` loads fail, for exercising the error
 * path — and the recovery from it — through the real screen.
 */
export function createFlakyAppointmentRepository(
  failures = 1,
  seed: Appointment[] = mockAppointments,
): AppointmentRepository {
  let attempts = 0;
  const store = createMockAppointmentRepository(seed);
  return {
    ...store,
    async fetchAppointments() {
      attempts += 1;
      if (attempts <= failures) throw new Error('offline');
      return store.fetchAppointments();
    },
  };
}
