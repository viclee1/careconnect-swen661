import { addDays, daysBetween, formatLongDate, formatTime12, localISODate } from '../dates';

describe('localISODate', () => {
  it('uses the local calendar day, not UTC', () => {
    // 11:30pm local is still that day here, whatever UTC says.
    expect(localISODate(new Date(2026, 9, 25, 23, 30))).toBe('2026-10-25');
  });

  it('pads single-digit months and days', () => {
    expect(localISODate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('addDays', () => {
  it('moves forward and back across month ends', () => {
    const from = new Date(2026, 9, 30);
    expect(addDays(3, from)).toBe('2026-11-02');
    expect(addDays(-30, from)).toBe('2026-09-30');
  });
});

describe('daysBetween', () => {
  it('counts whole calendar days, positive when the second date is later', () => {
    expect(daysBetween('2026-10-25', '2026-10-25')).toBe(0);
    expect(daysBetween('2026-10-25', '2026-11-01')).toBe(7);
    expect(daysBetween('2026-10-25', '2026-10-24')).toBe(-1);
  });

  it('is not thrown by a daylight-saving change', () => {
    expect(daysBetween('2026-10-31', '2026-11-02')).toBe(2);
    expect(daysBetween('2026-03-07', '2026-03-09')).toBe(2);
  });
});

describe('formatTime12', () => {
  it.each([
    ['00:00', '12:00 am'],
    ['00:30', '12:30 am'],
    ['08:05', '8:05 am'],
    ['12:00', '12:00 pm'],
    ['14:30', '2:30 pm'],
    ['23:59', '11:59 pm'],
  ])('%s → %s', (input, expected) => {
    expect(formatTime12(input)).toBe(expected);
  });
});

describe('formatLongDate', () => {
  it('writes the weekday and month in full', () => {
    expect(formatLongDate('2026-06-04')).toBe('Thursday, 4 June');
    expect(formatLongDate('2026-10-25')).toBe('Sunday, 25 October');
  });
});
