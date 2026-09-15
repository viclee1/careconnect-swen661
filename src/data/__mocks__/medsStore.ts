export const getMedications = jest.fn(() => [
  {
    id: '1',
    name: 'Amlodipine',
    dosage: '5 mg',
    frequency: 'once daily',
    time: '08:30',
    reason: 'Blood pressure',
    taken: {},
  },
  {
    id: '2',
    name: 'Atorvastatin',
    dosage: '20 mg',
    frequency: 'once daily',
    time: '20:00',
    reason: 'Cholesterol',
    taken: {},
  },
  {
    id: '3',
    name: 'Sertraline',
    dosage: '50 mg',
    frequency: 'once daily',
    time: '09:00',
    reason: 'Depression',
    taken: {},
  },
]);

export const addMedication = jest.fn();
export const removeMedication = jest.fn();
export const updateMedication = jest.fn();
