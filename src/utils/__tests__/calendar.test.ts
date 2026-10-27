import type { Appointment } from '../../models/appointment';
import { calendarFileName, downloadFile, escapeICalText, isExportable, toICalendar } from '../calendar';

const visit = (overrides: Partial<Appointment> = {}): Appointment => ({
  id: 'a1',
  title: 'Heart checkup — Dr. Lee',
  date: '2026-10-25',
  time: '14:30',
  location: { name: 'City Heart Clinic', address: '45 Hospital Way, Westfield', type: 'hospital' },
  caregiver: 'Maria Whitfield',
  notes: 'Bring your list; allow 20 minutes',
  isInMyDay: false,
  ...overrides,
});

const now = new Date(Date.UTC(2026, 9, 25, 12, 0, 0));

describe('escapeICalText', () => {
  it('escapes the characters iCalendar treats specially', () => {
    expect(escapeICalText('a, b; c\\d\ne')).toBe('a\\, b\\; c\\\\d\\ne');
  });
});

describe('isExportable', () => {
  it('needs a YYYY-MM-DD date and an HH:MM time', () => {
    expect(isExportable(visit())).toBe(true);
    expect(isExportable(visit({ date: 'next Tuesday' }))).toBe(false);
    expect(isExportable(visit({ time: '2pm' }))).toBe(false);
  });
});

describe('toICalendar', () => {
  it('writes one event per visit with an hour-long slot', () => {
    const { ics, count, skipped } = toICalendar([visit()], now);
    expect(count).toBe(1);
    expect(skipped).toBe(0);
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('UID:a1@careconnect');
    expect(ics).toContain('DTSTAMP:20261025T120000Z');
    expect(ics).toContain('DTSTART:20261025T143000');
    expect(ics).toContain('DTEND:20261025T153000');
    expect(ics).toContain('SUMMARY:Heart checkup — Dr. Lee');
    expect(ics).toContain('LOCATION:City Heart Clinic\\, 45 Hospital Way\\, Westfield');
    expect(ics).toContain('DESCRIPTION:Bring your list\\; allow 20 minutes Maria Whitfield is taking you.');
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
  });

  it('reminds on screen an hour before and never with sound', () => {
    const { ics } = toICalendar([visit()], now);
    expect(ics).toContain('ACTION:DISPLAY');
    expect(ics).toContain('TRIGGER:-PT1H');
    expect(ics).not.toContain('ACTION:AUDIO');
  });

  it('rolls the end time over midnight', () => {
    expect(toICalendar([visit({ time: '23:30' })], now).ics).toContain('DTEND:20261026T003000');
  });

  it('leaves out visits with no readable date and counts them', () => {
    const { count, skipped, ics } = toICalendar([visit(), visit({ id: 'a2', date: 'soon' })], now);
    expect(count).toBe(1);
    expect(skipped).toBe(1);
    expect(ics).not.toContain('a2@careconnect');
  });

  it('omits DESCRIPTION when there is nothing to say', () => {
    const { ics } = toICalendar([visit({ notes: undefined, caregiver: undefined })], now);
    expect(ics.match(/DESCRIPTION:/g)).toHaveLength(1); // the alarm's only
  });
});

describe('downloadFile', () => {
  it('saves through a temporary download link and cleans up', () => {
    const createObjectURL = jest.fn(() => 'blob:calendar');
    const revokeObjectURL = jest.fn();
    Object.assign(URL, { createObjectURL, revokeObjectURL });
    const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      expect(this.download).toBe(calendarFileName);
      expect(this.getAttribute('href')).toBe('blob:calendar');
    });

    downloadFile(calendarFileName, 'BEGIN:VCALENDAR', 'text/calendar');

    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:calendar');
    expect(document.querySelector('a[download]')).toBeNull();
    click.mockRestore();
  });
});
