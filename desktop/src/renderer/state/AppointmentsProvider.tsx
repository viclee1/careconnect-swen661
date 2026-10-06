import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { AppointmentRepository } from '../data/appointmentRepository';
import type { Appointment } from '../models/appointment';

export interface AppointmentsValue {
  appointments: Appointment[];
  isLoading: boolean;
  /** Non-null when the last load failed; the screen renders a banner for it. */
  error: Error | null;
  load: () => Promise<void>;
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

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const loaded = await repository.fetchAppointments();
      setAppointments(loaded);
    } catch (caught) {
      setAppointments([]);
      setError(caught instanceof Error ? caught : new Error(String(caught)));
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  const value = useMemo<AppointmentsValue>(
    () => ({ appointments, isLoading, error, load }),
    [appointments, isLoading, error, load],
  );

  return <AppointmentsContext.Provider value={value}>{children}</AppointmentsContext.Provider>;
}

export function useAppointments(): AppointmentsValue {
  const value = useContext(AppointmentsContext);
  if (!value) throw new Error('useAppointments must be used inside an AppointmentsProvider');
  return value;
}
