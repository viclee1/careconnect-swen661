import { clock, dayLabel } from '../formatters';

const on = (y: number, m: number, d: number, h: number, min: number) =>
  new Date(y, m - 1, d, h, min).getTime();

describe('clock', () => {
  it('formats a morning time the way the prototype prints it', () => {
    expect(clock(on(2026, 9, 4, 8, 2))).toBe('8:02 am');
  });

  it('formats an afternoon time', () => {
    expect(clock(on(2026, 9, 4, 15, 5))).toBe('3:05 pm');
  });

  it('renders midnight as 12 am, not 0 am', () => {
    expect(clock(on(2026, 9, 4, 0, 0))).toBe('12:00 am');
  });

  it('renders noon as 12 pm', () => {
    expect(clock(on(2026, 9, 4, 12, 0))).toBe('12:00 pm');
  });

  it('pads single-digit minutes', () => {
    expect(clock(on(2026, 9, 4, 8, 7))).toBe('8:07 am');
  });
});

describe('dayLabel', () => {
  const now = on(2026, 9, 4, 10, 0);

  it('says Today for the same calendar day', () => {
    expect(dayLabel(on(2026, 9, 4, 1, 0), now)).toBe('Today');
  });

  it('says Yesterday for the previous calendar day', () => {
    expect(dayLabel(on(2026, 9, 3, 23, 30), now)).toBe('Yesterday');
  });

  it('compares calendar days, not elapsed hours', () => {
    // 11pm yesterday is under 12 hours ago but is still "Yesterday".
    expect(dayLabel(on(2026, 9, 3, 23, 0), on(2026, 9, 4, 1, 0))).toBe('Yesterday');
  });

  it('falls back to an absolute date for anything older', () => {
    expect(dayLabel(on(2026, 9, 1, 9, 0), now)).toBe('Tue 1 Sep');
  });

  it('handles a date in a previous month', () => {
    expect(dayLabel(on(2026, 8, 31, 9, 0), now)).toBe('Mon 31 Aug');
  });

  it('defaults to the real clock when no reference is given', () => {
    expect(dayLabel(Date.now())).toBe('Today');
  });
});
