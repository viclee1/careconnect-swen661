import { createContext, useContext } from 'react';

import type { Appointment } from '../models/appointment';

export interface AppointmentsContextValue {
  /** Every visit the caregiver has booked, in saved order. */
  appointments: Appointment[];
  /** Whether a visit shows on the My Day schedule. */
  isInMyDay: (id: string) => boolean;
  /** Adds a visit to My Day, or takes it off again. */
  setInMyDay: (id: string, inMyDay: boolean) => void;
}

export const AppointmentsContext = createContext<AppointmentsContextValue | null>(null);

/** Upcoming visits and the user's My Day choices. Provided by AppointmentsProvider. */
export function useAppointments(): AppointmentsContextValue {
  const ctx = useContext(AppointmentsContext);
  if (!ctx) throw new Error('useAppointments must be used inside AppointmentsProvider');
  return ctx;
}
