/**
 * @jest-environment node
 */
import {
  addMinutes,
  buildCalendar,
  escapeText,
  eventSummary,
  foldLine,
  formatLocalDateTime,
  formatUtcStamp,
  parseAppointmentDateTime,
  type CalendarAppointment,
} from '../calendar';

const chen: CalendarAppointment = {
  id: 'appt1',
  doctor: 'Dr. Robert Chen',
  specialty: 'Cardiology',
  date: 'Sept 18, 2026',
  time: '10:00 am',
  location: 'Annapolis Medical Center',
};

const now = new Date(Date.UTC(2026, 9, 4, 21, 42, 5));

/** Undoes RFC 5545 line folding, so assertions can read whole properties. */
const unfold = (ics: string) => ics.replace(/\r\n /g, '');

describe('parseAppointmentDateTime', () => {
  it('reads the date and time exactly as the design prints them', () => {
    expect(parseAppointmentDateTime('Sept 18, 2026', '10:00 am')).toEqual({
      year: 2026,
      month: 9,
      day: 18,
      hour: 10,
      minute: 0,
    });
  });

  it.each([
    ['2:30 pm', 14, 30],
    ['12:00 pm', 12, 0],
    ['12:15 am', 0, 15],
    ['9:05 AM', 9, 5],
    ['11:59 p.m.', 23, 59],
  ])('turns %s into %i:%i on the 24-hour clock', (time, hour, minute) => {
    expect(parseAppointmentDateTime('Oct 2, 2026', time)).toMatchObject({ hour, minute });
  });

  it.each(['Oct 2, 2026', 'October 2, 2026', 'oct. 2 2026', 'Sep 2, 2026'])(
    'accepts the month written as %s',
    (date) => {
      expect(parseAppointmentDateTime(date, '9:00 am')?.month).toBe(
        date.toLowerCase().startsWith('sep') ? 9 : 10,
      );
    },
  );

  it.each([
    ['Smarch 3, 2026', '9:00 am'],
    ['Feb 30, 2026', '9:00 am'],
    ['Feb 29, 2026', '9:00 am'],
    ['Sept 0, 2026', '9:00 am'],
    ['Sept 18, 2026', '13:00 pm'],
    ['Sept 18, 2026', '0:30 am'],
    ['Sept 18, 2026', '10:60 am'],
    ['Sept 18, 2026', '10:00'],
    ['2026-09-18', '10:00 am'],
    ['', ''],
  ])('refuses %s at %s rather than guessing', (date, time) => {
    expect(parseAppointmentDateTime(date, time)).toBeNull();
  });

  it('knows a leap year has a 29 February', () => {
    expect(parseAppointmentDateTime('Feb 29, 2028', '9:00 am')).not.toBeNull();
  });
});

describe('date arithmetic and formatting', () => {
  it('formats a floating local time with no zone', () => {
    expect(
      formatLocalDateTime({ year: 2026, month: 9, day: 18, hour: 10, minute: 5 }),
    ).toBe('20260918T100500');
  });

  it('carries an hour past midnight into the next month', () => {
    expect(addMinutes({ year: 2026, month: 9, day: 30, hour: 23, minute: 30 }, 60)).toEqual({
      year: 2026,
      month: 10,
      day: 1,
      hour: 0,
      minute: 30,
    });
  });

  it('stamps in UTC', () => {
    expect(formatUtcStamp(now)).toBe('20261004T214205Z');
  });
});

describe('escapeText', () => {
  it('escapes the characters RFC 5545 reserves', () => {
    expect(escapeText('a\\b;c,d\ne\r\nf')).toBe('a\\\\b\\;c\\,d\\ne\\nf');
  });
});

describe('foldLine', () => {
  it('leaves a short line alone', () => {
    expect(foldLine('SUMMARY:Short')).toBe('SUMMARY:Short');
  });

  it('folds at 75 octets and indents each continuation with one space', () => {
    const folded = foldLine(`DESCRIPTION:${'x'.repeat(200)}`);
    const lines = folded.split('\r\n');
    expect(lines.length).toBeGreaterThan(1);
    expect(Buffer.byteLength(lines[0])).toBe(75);
    for (const line of lines.slice(1)) {
      expect(line.startsWith(' ')).toBe(true);
      expect(Buffer.byteLength(line)).toBeLessThanOrEqual(75);
    }
    expect(unfold(folded)).toBe(`DESCRIPTION:${'x'.repeat(200)}`);
  });

  it('counts bytes, not characters, and never splits a character', () => {
    // An em dash is three bytes in UTF-8.
    const line = `DESCRIPTION:${'—'.repeat(60)}`;
    const lines = foldLine(line).split('\r\n');
    for (const part of lines) {
      expect(Buffer.byteLength(part)).toBeLessThanOrEqual(75);
      expect(part).not.toContain('�');
    }
    expect(unfold(foldLine(line))).toBe(line);
  });
});

describe('buildCalendar', () => {
  it('writes one event per appointment, wrapped in a calendar', () => {
    const { ics, exported, skipped } = buildCalendar([chen], now);
    const text = unfold(ics);

    expect(exported).toEqual([chen]);
    expect(skipped).toEqual([]);
    expect(text.startsWith('BEGIN:VCALENDAR\r\nVERSION:2.0\r\n')).toBe(true);
    expect(text.endsWith('END:VCALENDAR\r\n')).toBe(true);
    expect(text).toContain('UID:appt1@careconnect.acuityhealth');
    expect(text).toContain('DTSTAMP:20261004T214205Z');
    expect(text).toContain('DTSTART:20260918T100000');
    expect(text).toContain('DTEND:20260918T110000');
    expect(text).toContain(`SUMMARY:${eventSummary(chen)}`);
    expect(text).toContain('LOCATION:Annapolis Medical Center');
  });

  it('uses CRLF line endings throughout', () => {
    const { ics } = buildCalendar([chen], now);
    expect(ics.replace(/\r\n/g, '')).not.toMatch(/[\r\n]/);
  });

  it('reminds on screen and never with a sound', () => {
    // The governing rule: nothing is communicated through sound alone.
    const text = unfold(buildCalendar([chen], now).ics);
    expect(text).toContain('ACTION:DISPLAY');
    expect(text).toContain('TRIGGER:-PT60M');
    expect(text).not.toContain('ACTION:AUDIO');
  });

  it('escapes what a calendar would otherwise misread', () => {
    const text = unfold(
      buildCalendar([{ ...chen, location: 'Suite 4, Floor 2; East Wing' }], now).ics,
    );
    expect(text).toContain('LOCATION:Suite 4\\, Floor 2\\; East Wing');
  });

  it('leaves out an appointment with no readable date and reports it', () => {
    const broken = { ...chen, id: 'appt9', date: 'sometime soon' };
    const { ics, exported, skipped } = buildCalendar([chen, broken], now);

    expect(exported).toEqual([chen]);
    expect(skipped).toEqual([broken]);
    expect(ics).not.toContain('appt9');
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(1);
  });

  it('still produces a valid, empty calendar when given nothing', () => {
    const { ics, exported } = buildCalendar([], now);
    expect(exported).toEqual([]);
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).not.toContain('BEGIN:VEVENT');
  });
});
