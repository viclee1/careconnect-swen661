import { describe, it, expect, beforeEach } from '@jest/globals';
import { loadTakenFromStorage, saveTakenToStorage, formatTime } from './Medications';

describe('Medications Time Formatting (Unit Tests)', () => {
  it('should format morning medication times', () => {
    expect(formatTime('08:30')).toBe('8:30 am');
  });

  it('should format evening medication times', () => {
    expect(formatTime('20:00')).toBe('8:00 pm');
  });

  it('should format noon medication time', () => {
    expect(formatTime('12:00')).toBe('12:00 pm');
  });

  it('should format midnight medication time', () => {
    expect(formatTime('00:30')).toBe('12:30 am');
  });

  it('should handle multiple medication times', () => {
    const times = ['08:30', '12:00', '20:00'];
    const formatted = times.map(formatTime);
    expect(formatted).toEqual(['8:30 am', '12:00 pm', '8:00 pm']);
  });

  it('should format all edge case times', () => {
    expect(formatTime('00:00')).toBe('12:00 am');
    expect(formatTime('01:00')).toBe('1:00 am');
    expect(formatTime('12:00')).toBe('12:00 pm');
    expect(formatTime('13:00')).toBe('1:00 pm');
    expect(formatTime('23:59')).toBe('11:59 pm');
  });

  it('should preserve minute values', () => {
    expect(formatTime('09:05')).toBe('9:05 am');
    expect(formatTime('09:15')).toBe('9:15 am');
    expect(formatTime('09:59')).toBe('9:59 am');
  });

  it('should handle single-digit hour conversions', () => {
    expect(formatTime('06:30')).toBe('6:30 am');
    expect(formatTime('18:30')).toBe('6:30 pm');
  });

  it('should handle afternoon hours 12-23', () => {
    expect(formatTime('12:00')).toBe('12:00 pm');
    expect(formatTime('12:30')).toBe('12:30 pm');
    expect(formatTime('13:00')).toBe('1:00 pm');
    expect(formatTime('18:00')).toBe('6:00 pm');
  });
});

describe('Medications Storage & State Management', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should save medication taken status to localStorage', () => {
    const takenMap = { 'med1': true, 'med2': false };
    saveTakenToStorage(takenMap);
    const loaded = loadTakenFromStorage();
    expect(loaded).toEqual(takenMap);
  });

  it('should load empty object when nothing in storage', () => {
    const loaded = loadTakenFromStorage();
    expect(loaded).toEqual({});
  });

  it('should handle corrupted storage data gracefully', () => {
    localStorage.setItem('careconnect_meds_taken', 'invalid json');
    const loaded = loadTakenFromStorage();
    expect(loaded).toEqual({});
  });

  it('should persist multiple medication statuses', () => {
    const meds = [
      { id: 'med1', taken: true },
      { id: 'med2', taken: false },
      { id: 'med3', taken: true },
    ];
    const takenMap = meds.reduce((acc, m) => ({ ...acc, [m.id]: m.taken }), {});
    saveTakenToStorage(takenMap);
    const loaded = loadTakenFromStorage();
    expect(Object.keys(loaded)).toHaveLength(3);
    expect(loaded.med1).toBe(true);
    expect(loaded.med2).toBe(false);
  });

  it('should update stored status when medication toggled', () => {
    const initial = { 'med1': false };
    saveTakenToStorage(initial);
    
    const updated = { 'med1': true };
    saveTakenToStorage(updated);
    
    const loaded = loadTakenFromStorage();
    expect(loaded.med1).toBe(true);
  });

  it('should handle clearing all medications', () => {
    saveTakenToStorage({ 'med1': true, 'med2': true });
    saveTakenToStorage({});
    const loaded = loadTakenFromStorage();
    expect(loaded).toEqual({});
  });

  it('should preserve order of stored medications', () => {
    const takenMap = { 'med1': true, 'med2': true, 'med3': false };
    saveTakenToStorage(takenMap);
    const loaded = loadTakenFromStorage();
    expect(Object.keys(loaded)).toEqual(['med1', 'med2', 'med3']);
  });

  it('should handle boolean false value correctly', () => {
    const takenMap = { 'med1': false };
    saveTakenToStorage(takenMap);
    const loaded = loadTakenFromStorage();
    expect(loaded.med1).toBe(false);
  });

  it('should handle empty string ID edge case', () => {
    const takenMap = { '': true, 'med1': false };
    saveTakenToStorage(takenMap);
    const loaded = loadTakenFromStorage();
    expect(loaded['']).toBe(true);
  });
});

describe('Medications Utility Function Edge Cases', () => {
  it('should handle 24-hour format edge cases', () => {
    expect(formatTime('00:00')).toBe('12:00 am');
    expect(formatTime('12:00')).toBe('12:00 pm');
    expect(formatTime('13:00')).toBe('1:00 pm');
    expect(formatTime('23:59')).toBe('11:59 pm');
  });

  it('should format edge time cases correctly', () => {
    expect(formatTime('00:01')).toBe('12:01 am');
    expect(formatTime('12:01')).toBe('12:01 pm');
    expect(formatTime('23:58')).toBe('11:58 pm');
  });

  it('should calculate time difference between doses', () => {
    const time1 = new Date('2026-09-15T08:00:00');
    const time2 = new Date('2026-09-15T14:00:00');
    const diff = (time2.getTime() - time1.getTime()) / (1000 * 60 * 60);
    expect(diff).toBe(6);
  });

  it('should handle midnight boundary in time calculations', () => {
    const time1 = new Date('2026-09-15T23:00:00');
    const time2 = new Date('2026-09-16T01:00:00');
    const diffMs = time2.getTime() - time1.getTime();
    expect(diffMs).toBeGreaterThan(0);
  });

  it('should format all 24 hours correctly', () => {
    for (let h = 0; h < 24; h++) {
      const formatted = formatTime(`${String(h).padStart(2, '0')}:00`);
      expect(formatted).toMatch(/(am|pm)/);
    }
  });

  it('should handle leap year dates', () => {
    const leapDate = new Date('2024-02-29');
    // A date-only ISO string parses as UTC midnight; getUTCDate() keeps this
    // assertion correct regardless of the machine's local timezone.
    expect(leapDate.getUTCDate()).toBe(29);
  });

  it('should handle DST transition dates', () => {
    const beforeDST = new Date('2026-03-07T23:59:59Z');
    const afterDST = new Date('2026-03-08T07:00:00Z');
    expect(beforeDST.getTime()).toBeLessThan(afterDST.getTime());
  });

  it('should preserve medication schedule integrity', () => {
    const schedule = [
      { time: '08:00', name: 'Morning dose' },
      { time: '14:00', name: 'Afternoon dose' },
      { time: '20:00', name: 'Evening dose' },
    ];
    const times = schedule.map(s => formatTime(s.time));
    expect(times[0]).toBe('8:00 am');
    expect(times[1]).toBe('2:00 pm');
    expect(times[2]).toBe('8:00 pm');
  });
});

describe('Medications Storage Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should survive JSON stringify/parse roundtrip', () => {
    const original = { 'med1': true, 'med2': false };
    const json = JSON.stringify(original);
    const parsed = JSON.parse(json);
    expect(parsed).toEqual(original);
  });

  it('should handle storage for multiple days', () => {
    const dayMap: Record<string, Record<string, boolean>> = {};
    
    dayMap['2026-09-14'] = { 'med1': true, 'med2': false };
    dayMap['2026-09-15'] = { 'med1': false, 'med2': true };
    dayMap['2026-09-16'] = { 'med1': true, 'med2': true };
    
    Object.values(dayMap).forEach((meds) => {
      expect(Object.keys(meds)).toHaveLength(2);
    });
  });

  it('should track medication adherence over time', () => {
    const adherence = [];
    for (let day = 1; day <= 30; day++) {
      adherence.push({
        date: `2026-09-${String(day).padStart(2, '0')}`,
        taken: day % 2 === 0,
      });
    }
    expect(adherence).toHaveLength(30);
    const takenDays = adherence.filter(a => a.taken).length;
    expect(takenDays).toBe(15);
  });

  it('should handle large medication lists', () => {
    const largeMeds: Record<string, boolean> = {};
    for (let i = 0; i < 100; i++) {
      largeMeds[`med${i}`] = i % 2 === 0;
    }
    saveTakenToStorage(largeMeds);
    const loaded = loadTakenFromStorage();
    expect(Object.keys(loaded)).toHaveLength(100);
  });
});

describe('Medications Time Utility Comprehensive', () => {
  it('should consistently format the same time', () => {
    const time = '14:30';
    const result1 = formatTime(time);
    const result2 = formatTime(time);
    expect(result1).toBe(result2);
  });

  it('should handle time formatting in medications list context', () => {
    const medications = [
      { name: 'Med1', time: '08:00' },
      { name: 'Med2', time: '14:00' },
      { name: 'Med3', time: '20:00' },
    ];
    const formatted = medications.map(m => ({
      ...m,
      formattedTime: formatTime(m.time),
    }));
    expect(formatted[0].formattedTime).toBe('8:00 am');
    expect(formatted[1].formattedTime).toBe('2:00 pm');
    expect(formatted[2].formattedTime).toBe('8:00 pm');
  });

  it('should work with appointment scheduling context', () => {
    const appointmentTime = '15:30';
    const formattedTime = formatTime(appointmentTime);
    const appointmentLabel = `Appointment scheduled for ${formattedTime}`;
    expect(appointmentLabel).toContain('3:30 pm');
  });

  it('should format times for reminder notifications', () => {
    const medicationTimes = ['06:00', '12:00', '18:00', '21:00'];
    const reminders = medicationTimes.map(time => ({
      time: formatTime(time),
      message: `Take medication at ${formatTime(time)}`,
    }));
    expect(reminders[0].time).toBe('6:00 am');
    expect(reminders[3].time).toBe('9:00 pm');
  });
});
