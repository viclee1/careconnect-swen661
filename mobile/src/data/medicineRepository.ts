import type { Medicine } from '../models/medicine';
import { mockMedicines } from './mockMedicines';

/**
 * Read and mutate access to today's medicines.
 *
 * Synchronous and in-memory, matching `DailyTasksRepository` — there is no
 * network round trip for a "mark taken" tap, so a promise would only add
 * ceremony to every call site.
 */
export interface MedicineRepository {
  getMedicines(): Medicine[];
  setTaken(id: string, taken: boolean): void;
}

/** In-memory implementation backed by the design's seed data. */
export function createMockMedicineRepository(
  seed: Medicine[] = mockMedicines,
): MedicineRepository {
  let medicines: Medicine[] = seed.map((medicine) => ({ ...medicine }));

  return {
    getMedicines: () => medicines,
    setTaken: (id, taken) => {
      medicines = medicines.map((medicine) =>
        medicine.id === id ? { ...medicine, taken } : medicine,
      );
    },
  };
}
