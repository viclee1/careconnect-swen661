import type { Medicine } from '../models/medicine';

/** Today's medications, seeded with the same doses the Flutter client shows. */
export const mockMedicines: Medicine[] = [
  { id: 'med1', name: 'Amlodipine', dosage: '5 mg — 1 tablet with food', time: '8:30 am', taken: true },
  { id: 'med2', name: 'Metformin', dosage: '500 mg — 1 tablet with lunch', time: '12:30 pm', taken: false },
  { id: 'med3', name: 'Atorvastatin', dosage: '20 mg — 1 tablet', time: '5:00 pm', taken: false },
];
