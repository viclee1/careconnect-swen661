import {
  isTaken,
  medicineProgress,
  medicinesCount,
  progressSentence,
  reviveTakenMap,
  timesSentence,
  type Medication,
} from '../medicine';

const today = '2026-10-25';
const med = (id: string, takenToday?: boolean, times = ['08:30']): Medication => ({
  id,
  name: `Medicine ${id}`,
  dosage: '5 mg',
  times,
  colour: 'bg-calm-200',
  taken: takenToday === undefined ? {} : { [today]: takenToday },
});

describe('isTaken', () => {
  it('uses the user’s tick, then the record for today, then “not taken”', () => {
    expect(isTaken(med('a', true), { a: false }, today)).toBe(false);
    expect(isTaken(med('a', true), {}, today)).toBe(true);
    expect(isTaken(med('a'), {}, today)).toBe(false);
    expect(isTaken(med('a', true), {}, '2026-10-26')).toBe(false);
  });
});

describe('medicineProgress', () => {
  it('counts taken medicines and rounds the percentage', () => {
    expect(medicineProgress([med('a', true), med('b'), med('c')], {}, today)).toEqual({
      taken: 1,
      total: 3,
      percent: 33,
      allTaken: false,
    });
  });

  it('is complete only when every medicine is taken', () => {
    expect(medicineProgress([med('a')], { a: true }, today).allTaken).toBe(true);
    expect(medicineProgress([], {}, today)).toEqual({ taken: 0, total: 0, percent: 0, allTaken: false });
  });
});

describe('sentences', () => {
  it('says what is left in words', () => {
    expect(progressSentence({ taken: 1, total: 3, percent: 33, allTaken: false })).toBe(
      '1 of 3 taken. 2 medicines still to take today.',
    );
    expect(progressSentence({ taken: 3, total: 4, percent: 75, allTaken: false })).toBe(
      '3 of 4 taken. 1 medicine still to take today.',
    );
    expect(progressSentence({ taken: 2, total: 2, percent: 100, allTaken: true })).toBe(
      'All 2 medicines taken today. Well done!',
    );
    expect(progressSentence({ taken: 0, total: 0, percent: 0, allTaken: false })).toBe(
      'No medicines on today’s list.',
    );
  });

  it('pluralises', () => {
    expect(medicinesCount(1)).toBe('1 medicine');
    expect(medicinesCount(2)).toBe('2 medicines');
  });

  it('reads times as a sentence, in order', () => {
    expect(timesSentence([])).toBe('');
    expect(timesSentence(['08:30'])).toBe('8:30 am');
    expect(timesSentence(['20:00', '08:00'])).toBe('8:00 am and 8:00 pm');
    expect(timesSentence(['08:00', '13:00', '20:00'])).toBe('8:00 am, 1:00 pm and 8:00 pm');
  });
});

describe('reviveTakenMap', () => {
  it('keeps only id → boolean pairs', () => {
    expect(reviveTakenMap({ a: true, b: 1, c: false })).toEqual({ a: true, c: false });
    expect(reviveTakenMap([true])).toEqual({});
    expect(reviveTakenMap('x')).toEqual({});
    expect(reviveTakenMap(null)).toEqual({});
  });
});
