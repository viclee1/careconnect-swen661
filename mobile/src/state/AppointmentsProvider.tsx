import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { AppointmentRepository } from '../data/appointmentRepository';
import type { Appointment, AppointmentInput } from '../models/appointment';

export interface AppointmentsValue {
  appointments: Appointment[];
  isLoading: boolean;
  /** Non-null when the last load failed; the screen renders a banner for it. */
  error: Error | null;
  load: () => Promise<void>;
  /** True once a load has succeeded, so a screen can tell "none" from "not yet". */
  hasLoaded: boolean;
  addAppointment: (input: AppointmentInput) => Promise<void>;
  updateAppointment: (id: string, input: AppointmentInput) => Promise<void>;
  removeAppointment: (id: string) => Promise<void>;
}

const AppointmentsContext = createContext<AppointmentsValue | null>(null);

export function AppointmentsProvider({
  repository,
  children,
}: {
  repository: AppointmentRepository;
  children: ReactNode;
}) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const loaded = await repository.fetchAppointments();
      setAppointments(loaded);
      setHasLoaded(true);
    } catch (caught) {
      setAppointments([]);
      setError(caught instanceof Error ? caught : new Error(String(caught)));
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  // Each edit is stored first, then the list is read back, so the screen shows
  // what the repository holds rather than what it was asked to hold.
  const refresh = useCallback(async () => {
    setAppointments(await repository.fetchAppointments());
    setHasLoaded(true);
  }, [repository]);

  const addAppointment = useCallback(
    async (input: AppointmentInput) => {
      await repository.addAppointment(input);
      await refresh();
    },
    [repository, refresh],
  );

  const updateAppointment = useCallback(
    async (id: string, input: AppointmentInput) => {
      await repository.updateAppointment(id, input);
      await refresh();
    },
    [repository, refresh],
  );

  const removeAppointment = useCallback(
    async (id: string) => {
      await repository.removeAppointment(id);
      await refresh();
    },
    [repository, refresh],
  );

  const value = useMemo<AppointmentsValue>(
    () => ({
      appointments,
      isLoading,
      error,
      load,
      hasLoaded,
      addAppointment,
      updateAppointment,
      removeAppointment,
    }),
    [appointments, isLoading, error, load, hasLoaded, addAppointment, updateAppointment, removeAppointment],
  );

  return <AppointmentsContext.Provider value={value}>{children}</AppointmentsContext.Provider>;
}

export function useAppointments(): AppointmentsValue {
  const value = useContext(AppointmentsContext);
  if (!value) throw new Error('useAppointments must be used inside an AppointmentsProvider');
  return value;
}
