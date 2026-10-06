import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { MedicineRepository } from '../data/medicineRepository';
import type { Medicine } from '../models/medicine';

export interface MedicinesValue {
  medicines: Medicine[];
  takenCount: number;
  totalCount: number;
  toggleTaken: (id: string) => void;
}

const MedicinesContext = createContext<MedicinesValue | null>(null);

export function MedicinesProvider({
  repository,
  children,
}: {
  repository: MedicineRepository;
  children: ReactNode;
}) {
  const [medicines, setMedicines] = useState(() => repository.getMedicines());

  const takenCount = useMemo(() => medicines.filter((m) => m.taken).length, [medicines]);
  const totalCount = medicines.length;

  const toggleTaken = useCallback(
    (id: string) => {
      const medicine = medicines.find((m) => m.id === id);
      if (medicine) {
        repository.setTaken(id, !medicine.taken);
        setMedicines(repository.getMedicines());
      }
    },
    [medicines, repository],
  );

  const value = useMemo<MedicinesValue>(
    () => ({ medicines, takenCount, totalCount, toggleTaken }),
    [medicines, takenCount, totalCount, toggleTaken],
  );

  return <MedicinesContext.Provider value={value}>{children}</MedicinesContext.Provider>;
}

export function useMedicines(): MedicinesValue {
  const value = useContext(MedicinesContext);
  if (!value) throw new Error('useMedicines must be used inside a MedicinesProvider');
  return value;
}
