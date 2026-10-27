import {
  byStartTime,
  directionsUrl,
  escortFirstName,
  groupAppointments,
  isOnMyDay,
  needsTravel,
  reviveMyDayChoices,
  upcomingCount,
  whenLabel,
  type Appointment,
} from '../appointment';

const visit = (id: string, date: string, time = '10:00', overrides: Partial<Appointment> = {}): Appointment => ({
  id,
  title: `Visit ${id}`,
  date,
  time,
  location: { name: 'Greenfield Surgery', address: '12 Greenfield Road', type: 'clinic' },
  isInMyDay: false,
  ...overrides,
});

const today = '2026-10-25';

describe('groupAppointments', () => {
  const list = [
    visit('later', '2026-11-01'), // 7 days → Coming up
    visit('past', '2026-10-24'),
    visit('pm', today, '14:30'),
    visit('am', today, '09:00'),
    visit('tomorrow', '2026-10-26'),
    visit('sixDays', '2026-10-31'),
  ];

  it('splits visits into Today, Later this week and Coming up, earliest first', () => {
    const groups = groupAppointments(list, today);
    expect(groups.today.map((a) => a.id)).toEqual(['am', 'pm']);
    expect(groups.thisWeek.map((a) => a.id)).toEqual(['tomorrow', 'sixDays']);
    expect(groups.comingUp.map((a) => a.id)).toEqual(['later']);
  });

  it('drops visits that have already happened', () => {
    expect(upcomingCount(groupAppointments(list, today))).toBe(5);
  });

  it('does not reorder the list it was given', () => {
    groupAppointments(list, today);
    expect(list[0].id).toBe('later');
  });
});

describe('byStartTime', () => {
  it('orders by date, then by time', () => {
    expect(byStartTime(visit('a', '2026-10-25'), visit('b', '2026-10-26'))).toBeLessThan(0);
    expect(byStartTime(visit('a', today, '15:00'), visit('b', today, '09:00'))).toBeGreaterThan(0);
    expect(byStartTime(visit('a', today), visit('b', today))).toBe(0);
  });
});

describe('travel and directions', () => {
  it('offers a map search for clinic and hospital visits with an address', () => {
    const appointment = visit('a', today);
    expect(needsTravel(appointment)).toBe(true);
    expect(directionsUrl(appointment)).toBe(
      'https://www.google.com/maps/search/?api=1&query=Greenfield%20Surgery%2C%2012%20Greenfield%20Road',
    );
  });

  it('offers no directions for telephone or home visits, or without an address', () => {
    expect(directionsUrl(visit('t', today, '10:00', { location: { name: 'Phone', type: 'telephone' } }))).toBeNull();
    expect(directionsUrl(visit('h', today, '10:00', { location: { name: 'Home', address: '1 Lane', type: 'home' } }))).toBeNull();
    expect(directionsUrl(visit('n', today, '10:00', { location: { name: 'Clinic', type: 'clinic' } }))).toBeNull();
  });
});

describe('labels', () => {
  it('writes the date and time in full words', () => {
    expect(whenLabel({ date: today, time: '14:30' })).toBe('Sunday, 25 October — 2:30 pm');
  });

  it('names who is taking the user by first name', () => {
    expect(escortFirstName(visit('a', today, '10:00', { caregiver: 'Joyce Adeyemi' }))).toBe('Joyce');
    expect(escortFirstName(visit('a', today))).toBeNull();
  });
});

describe('My Day choices', () => {
  it('lets the user’s own choice win over the caregiver’s', () => {
    const appointment = visit('a', today, '10:00', { isInMyDay: true });
    expect(isOnMyDay(appointment, {})).toBe(true);
    expect(isOnMyDay(appointment, { a: false })).toBe(false);
    expect(isOnMyDay(visit('b', today), { b: true })).toBe(true);
  });

  it('repairs whatever was stored', () => {
    expect(reviveMyDayChoices({ a: true, b: 'yes', c: false })).toEqual({ a: true, c: false });
    expect(reviveMyDayChoices(['a'])).toEqual({});
    expect(reviveMyDayChoices(null)).toEqual({});
  });
});
