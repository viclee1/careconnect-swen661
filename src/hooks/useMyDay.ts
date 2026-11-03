import { useCallback, useMemo, useState } from 'react';

import { useAppointments } from '../context/appointments';
import { useMedicines } from '../context/medicines';
import { buildMyDay, medicationIdOf, reviveMyDayDone, type MyDayDone, type MyDayItem } from '../models/myDay';
import { localISODate } from '../utils/dates';
import { useLocalStorageState } from './useLocalStorageState';

/** Today's ticks on routines and visits. Medicine ticks live with Medicines. */
export const MY_DAY_DONE_KEY = 'careconnect_myday_done';

export interface MyDay {
  items: MyDayItem[];
  doneCount: number;
  totalCount: number;
  /** Ticks or unticks a row; a medicine row ticks the medicine itself. */
  toggle: (id: string) => void;
}

/** My Day's list, shared by the My Day screen and Home's progress line. */
export function useMyDay(): MyDay {
  const { medications, isTaken, setTaken } = useMedicines();
  const { appointments, isInMyDay } = useAppointments();
  const [today] = useState(() => localISODate());
  const [stored, setStored] = useLocalStorageState<MyDayDone>(
    MY_DAY_DONE_KEY,
    () => ({ date: today, done: {} }),
    (value) => reviveMyDayDone(value, today),
  );

  const items = useMemo(
    () => buildMyDay({ medications, isTaken, appointments, isInMyDay, today, done: stored.done }),
    [medications, isTaken, appointments, isInMyDay, today, stored.done],
  );

  const toggle = useCallback(
    (id: string) => {
      const item = items.find((candidate) => candidate.id === id);
      if (!item) return;
      const medicationId = medicationIdOf(id);
      if (medicationId) {
        setTaken(medicationId, !item.done);
      } else {
        setStored((current) => ({ date: today, done: { ...current.done, [id]: !item.done } }));
      }
    },
    [items, setTaken, setStored, today],
  );

  const doneCount = items.filter((item) => item.done).length;
  return { items, doneCount, totalCount: items.length, toggle };
}
