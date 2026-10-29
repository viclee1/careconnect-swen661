import { useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { getAppointments } from '../data/apptStore';
import { useLocalStorageState } from '../hooks/useLocalStorageState';
import { isOnMyDay, reviveMyDayChoices, type MyDayChoices } from '../models/appointment';
import { AppointmentsContext } from './appointments';

// ── Storage ────────────────────────────────────────────────────────────────────

/**
 * The user's own My Day choices, kept apart from the caregiver's list
 * (`careconnect_appointments_list`). Writing the whole list back would freeze
 * the demo's "today" and "in 3 days" dates on the day it was first opened.
 */
export const MY_DAY_KEY = 'careconnect_appointments_my_day';

// ── Provider ────────────────────────────────────────────────────────────────────

export function AppointmentsProvider({ children }: { children: ReactNode }) {
  // Read once: the caregiver's Manage appointments screen writes this list,
  // and nothing on the care recipient's side changes it.
  const [appointments] = useState(getAppointments);
  const [choices, setChoices] = useLocalStorageState<MyDayChoices>(
    MY_DAY_KEY,
    () => ({}),
    reviveMyDayChoices,
  );

  const isInMyDay = useCallback(
    (id: string) => {
      const appointment = appointments.find((a) => a.id === id);
      return appointment ? isOnMyDay(appointment, choices) : false;
    },
    [appointments, choices],
  );

  const setInMyDay = useCallback(
    (id: string, inMyDay: boolean) => setChoices((current) => ({ ...current, [id]: inMyDay })),
    [setChoices],
  );

  const value = useMemo(
    () => ({ appointments, isInMyDay, setInMyDay }),
    [appointments, isInMyDay, setInMyDay],
  );

  return <AppointmentsContext.Provider value={value}>{children}</AppointmentsContext.Provider>;
}
