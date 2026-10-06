import { medicineSemanticLabel } from '../medicine';

describe('medicineSemanticLabel', () => {
  it('states the status in words when taken', () => {
    const label = medicineSemanticLabel({
      id: 'm1',
      name: 'Amlodipine',
      dosage: '5 mg — 1 tablet with food',
      time: '8:30 am',
      taken: true,
    });

    expect(label).toBe('Amlodipine, 5 mg — 1 tablet with food, 8:30 am. Taken');
  });

  it('states the status in words when not taken', () => {
    const label = medicineSemanticLabel({
      id: 'm2',
      name: 'Metformin',
      dosage: '500 mg — 1 tablet with lunch',
      time: '12:30 pm',
      taken: false,
    });

    expect(label).toBe('Metformin, 500 mg — 1 tablet with lunch, 12:30 pm. Not taken');
  });
});
