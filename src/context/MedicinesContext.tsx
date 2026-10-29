import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { appendActivityEvent } from '../data/caregiverStore';
import { getMedications } from '../data/medsStore';
import { useLocalStorageState } from '../hooks/useLocalStorageState';
import { isTaken, medicineProgress, reviveTakenMap, type TakenMap } from '../models/medicine';
import { localISODate } from '../utils/dates';
import { MedicinesContext } from './medicines';

// ── Storage ────────────────────────────────────────────────────────────────────

/** Medicine id → taken today. The caregiver dashboard reads the same key. */
export const MEDS_TAKEN_KEY = 'careconnect_meds_taken';
/** The day those ticks belong to, so yesterday's never carry into today. */
export const MEDS_TAKEN_DATE_KEY = 'careconnect_meds_taken_date';

function readStoredDate(): string | null {
  try {
    return localStorage.getItem(MEDS_TAKEN_DATE_KEY);
  } catch {
    return null;
  }
}

// ── Provider ────────────────────────────────────────────────────────────────────

/**
 * Today's medicines, held above the router so ticking one and visiting another
 * page does not quietly un-tick it. Ticks are saved in localStorage, so they
 * survive a reload and work with no connection.
 */
export function MedicinesProvider({ children }: { children: ReactNode }) {
  const [today] = useState(() => localISODate());
  const [medications] = useState(getMedications);
  const [takenMap, setTakenMap] = useLocalStorageState<TakenMap>(
    MEDS_TAKEN_KEY,
    () => ({}),
    (stored) => (readStoredDate() === today ? reviveTakenMap(stored) : {}),
  );

  useEffect(() => {
    try {
      localStorage.setItem(MEDS_TAKEN_DATE_KEY, today);
    } catch {
      // Storage unavailable — the ticks still work for this session.
    }
  }, [today]);

  const isTakenById = useCallback(
    (id: string) => {
      const medication = medications.find((m) => m.id === id);
      return medication ? isTaken(medication, takenMap, today) : false;
    },
    [medications, takenMap, today],
  );

  const setTaken = useCallback(
    (id: string, taken: boolean) => {
      const medication = medications.find((m) => m.id === id);
      if (!medication) return;
      setTakenMap((current) => ({ ...current, [id]: taken }));
      appendActivityEvent({
        kind: taken ? 'med_taken' : 'med_skipped',
        label: taken ? `Marked ${medication.name} as taken` : `Unmarked ${medication.name} (not taken)`,
        timestamp: new Date().toISOString(),
      });
    },
    [medications, setTakenMap],
  );

  const progress = useMemo(
    () => medicineProgress(medications, takenMap, today),
    [medications, takenMap, today],
  );

  const value = useMemo(
    () => ({ medications, isTaken: isTakenById, setTaken, progress }),
    [medications, isTakenById, setTaken, progress],
  );

  return <MedicinesContext.Provider value={value}>{children}</MedicinesContext.Provider>;
}
