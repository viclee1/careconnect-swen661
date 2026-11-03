import { appointments } from '../../data/appointmentsData';
import { medications } from '../../data/mockData';
import { buildMyDay, medicationIdOf, reviveMyDayDone, routines, type MyDaySources } from '../myDay';
import { localISODate } from '../../utils/dates';

const today = localISODate();

function sources(overrides: Partial<MyDaySources> = {}): MyDaySources {
  return {
    medications,
    isTaken: (id) => id === 'm1',
    appointments,
    isInMyDay: (id) => appointments.find((a) => a.id === id)?.isInMyDay ?? false,
    today,
    done: {},
    ...overrides,
  };
}

describe('buildMyDay', () => {
  it('lists every medicine, today’s visits on My Day and the routines, earliest first', () => {
    const titles = buildMyDay(sources()).map((item) => `${item.time} ${item.title}`);
    expect(titles).toEqual([
      '08:30 Take Amlodipine',
      '09:00 Morning check-in',
      '09:00 Take Lisinopril',
      '10:30 Blood pressure check — Dr. Sharma',
      '12:00 Take Metformin',
      '14:30 Heart checkup — Dr. Lee',
      '15:00 Video call with Maria',
      '20:00 Take Atorvastatin',
      '21:30 Bedtime rest',
    ]);
  });

  it('takes a medicine’s tick from the Medicines store, not a copy', () => {
    const items = buildMyDay(sources({ isTaken: (id) => id === 'm3' }));
    expect(items.find((item) => item.id === 'med:m3')?.done).toBe(true);
    expect(items.find((item) => item.id === 'med:m1')?.done).toBe(false);
  });

  it('leaves out visits on other days and visits taken off My Day', () => {
    const items = buildMyDay(sources({ isInMyDay: (id) => id !== 'a1' }));
    const visits = items.filter((item) => item.category === 'Appointment').map((item) => item.title);
    // a1 is today's blood pressure check, now off My Day; tomorrow's blood
    // test is on My Day here but is not today.
    expect(visits).toEqual(['Heart checkup — Dr. Lee']);
  });

  it('names a later dose in the description, since a medicine is ticked once a day', () => {
    const twice = [{ ...medications[0], times: ['20:00', '08:30'] }];
    const [item] = buildMyDay(sources({ medications: twice, appointments: [] }));
    expect(item.time).toBe('08:30');
    expect(item.description).toBe('5 mg — 1 tablet. Take with food. — also at 8:00 pm');
  });

  it('skips a medicine with no times rather than placing it at midnight', () => {
    const items = buildMyDay(sources({ medications: [{ ...medications[0], times: [] }], appointments: [] }));
    expect(items.map((item) => item.id)).toEqual(routines.map((routine) => routine.id));
  });

  it('marks routines and visits done from My Day’s own ticks', () => {
    const items = buildMyDay(sources({ done: { checkin: true, 'appt:a1': true } }));
    expect(items.filter((item) => item.done).map((item) => item.id)).toEqual([
      'med:m1',
      'checkin',
      'appt:a1',
    ]);
  });
});

describe('reviveMyDayDone', () => {
  it('keeps today’s ticks', () => {
    expect(reviveMyDayDone({ date: today, done: { checkin: true } }, today)).toEqual({
      date: today,
      done: { checkin: true },
    });
  });

  it('starts fresh on a new day', () => {
    expect(reviveMyDayDone({ date: '2000-01-01', done: { checkin: true } }, today)).toEqual({ date: today, done: {} });
  });

  it.each([null, 'text', [], { date: today }, { date: today, done: [] }])('starts fresh from %p', (stored) => {
    expect(reviveMyDayDone(stored, today)).toEqual({ date: today, done: {} });
  });

  it('drops anything that is not a boolean tick', () => {
    expect(reviveMyDayDone({ date: today, done: { checkin: 'yes', bedtime: true } }, today).done).toEqual({
      bedtime: true,
    });
  });
});

describe('medicationIdOf', () => {
  it('finds the medicine behind a row, and nothing behind a routine or a visit', () => {
    expect(medicationIdOf('med:m3')).toBe('m3');
    expect(medicationIdOf('checkin')).toBeNull();
    expect(medicationIdOf('appt:a1')).toBeNull();
  });
});
