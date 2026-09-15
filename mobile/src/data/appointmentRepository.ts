import type { Appointment } from '../models/appointment';
import { mockAppointments } from './mockAppointments';

/**
 * Read access to the appointment list.
 *
 * The interface exists so the UI never depends on where appointments come
 * from. Week 5 ships the in-memory implementation below; swapping in an HTTP
 * or SQLite backed version later is a one-line change in `App.tsx`.
 */
export interface AppointmentRepository {
  fetchAppointments(): Promise<Appointment[]>;
}

/** In-memory implementation backed by the design's seed data. */
export function createMockAppointmentRepository(
  seed: Appointment[] = mockAppointments,
): AppointmentRepository {
  return {
    async fetchAppointments() {
      return seed;
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
  return {
    async fetchAppointments() {
      attempts += 1;
      if (attempts <= failures) throw new Error('offline');
      return seed;
    },
  };
}
