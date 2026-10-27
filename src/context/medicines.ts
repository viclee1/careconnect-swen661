import { createContext, useContext } from 'react';

import type { Medication, MedicineProgress } from '../models/medicine';

export interface MedicinesContextValue {
  medications: Medication[];
  /** Whether today's dose is marked taken. */
  isTaken: (id: string) => boolean;
  /** Marks a medicine taken or not taken today, and logs it for the caregiver. */
  setTaken: (id: string, taken: boolean) => void;
  progress: MedicineProgress;
}

export const MedicinesContext = createContext<MedicinesContextValue | null>(null);

/** Today's medicines and which are taken. Provided by MedicinesProvider. */
export function useMedicines(): MedicinesContextValue {
  const ctx = useContext(MedicinesContext);
  if (!ctx) throw new Error('useMedicines must be used inside MedicinesProvider');
  return ctx;
}
