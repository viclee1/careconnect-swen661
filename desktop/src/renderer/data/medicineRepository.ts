import type { Medicine, MedicineInput } from '../models/medicine';
import { mockMedicines } from './mockMedicines';

/**
 * Read and mutate access to today's medicines.
 *
 * Synchronous and in-memory, matching the React Native client — there is no
 * network round trip for a "mark taken" tap, so a promise would only add
 * ceremony to every call site.
 */
export interface MedicineRepository {
  getMedicines(): Medicine[];
  setTaken(id: string, taken: boolean): void;
  /** The caregiver's edits. A new medicine starts the day not taken. */
  addMedicine(input: MedicineInput): Medicine;
  updateMedicine(id: string, input: MedicineInput): void;
  removeMedicine(id: string): void;
}

/** In-memory implementation backed by the design's seed data. */
export function createMockMedicineRepository(
  seed: Medicine[] = mockMedicines,
): MedicineRepository {
  let medicines: Medicine[] = seed.map((medicine) => ({ ...medicine }));
  let nextId = medicines.length + 1;

  return {
    getMedicines: () => medicines,
    setTaken: (id, taken) => {
      medicines = medicines.map((medicine) =>
        medicine.id === id ? { ...medicine, taken } : medicine,
      );
    },
    addMedicine: (input) => {
      const medicine: Medicine = { id: `med-added-${nextId++}`, ...input, taken: false };
      medicines = [...medicines, medicine];
      return medicine;
    },
    updateMedicine: (id, input) => {
      medicines = medicines.map((medicine) =>
        medicine.id === id ? { ...medicine, ...input } : medicine,
      );
    },
    removeMedicine: (id) => {
      medicines = medicines.filter((medicine) => medicine.id !== id);
    },
  };
}
