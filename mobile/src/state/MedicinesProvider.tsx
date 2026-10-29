import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { MedicineRepository } from '../data/medicineRepository';
import { activityForMedicine } from '../models/caregiver';
import type { Medicine, MedicineInput } from '../models/medicine';
import { useActivityRecorder } from './CaregiverProvider';

export interface MedicinesValue {
  medicines: Medicine[];
  takenCount: number;
  totalCount: number;
  toggleTaken: (id: string) => void;
  addMedicine: (input: MedicineInput) => Medicine;
  updateMedicine: (id: string, input: MedicineInput) => void;
  removeMedicine: (id: string) => void;
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
  const record = useActivityRecorder();

  const takenCount = useMemo(() => medicines.filter((m) => m.taken).length, [medicines]);
  const totalCount = medicines.length;

  const toggleTaken = useCallback(
    (id: string) => {
      const medicine = medicines.find((m) => m.id === id);
      if (medicine) {
        repository.setTaken(id, !medicine.taken);
        setMedicines(repository.getMedicines());
        const event = activityForMedicine(medicine.name, !medicine.taken);
        record(event.kind, event.label);
      }
    },
    [medicines, repository, record],
  );

  const addMedicine = useCallback(
    (input: MedicineInput) => {
      const added = repository.addMedicine(input);
      setMedicines(repository.getMedicines());
      return added;
    },
    [repository],
  );

  const updateMedicine = useCallback(
    (id: string, input: MedicineInput) => {
      repository.updateMedicine(id, input);
      setMedicines(repository.getMedicines());
    },
    [repository],
  );

  const removeMedicine = useCallback(
    (id: string) => {
      repository.removeMedicine(id);
      setMedicines(repository.getMedicines());
    },
    [repository],
  );

  const value = useMemo<MedicinesValue>(
    () => ({
      medicines,
      takenCount,
      totalCount,
      toggleTaken,
      addMedicine,
      updateMedicine,
      removeMedicine,
    }),
    [medicines, takenCount, totalCount, toggleTaken, addMedicine, updateMedicine, removeMedicine],
  );

  return <MedicinesContext.Provider value={value}>{children}</MedicinesContext.Provider>;
}

export function useMedicines(): MedicinesValue {
  const value = useContext(MedicinesContext);
  if (!value) throw new Error('useMedicines must be used inside a MedicinesProvider');
  return value;
}
