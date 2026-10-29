import {
  activityForMedicine,
  activityForTask,
  countLabel,
  formatEventDay,
  formatEventTime,
  isCheckIn,
  seedNotes,
} from '../caregiver';

describe('caregiver rules', () => {
  it('names a medicine tick in both directions', () => {
    expect(activityForMedicine('Metformin', true)).toEqual({ kind: 'med_taken', label: 'Took Metformin' });
    expect(activityForMedicine('Metformin', false)).toEqual({
      kind: 'med_untaken',
      label: 'Unmarked Metformin',
    });
  });

  it('treats the morning check-in on its own and other tasks as finished tasks', () => {
    expect(isCheckIn({ title: 'Morning check-in' })).toBe(true);
    expect(isCheckIn({ title: 'Take Metformin' })).toBe(false);
    expect(activityForTask({ title: 'Morning Check-In' })).toEqual({
      kind: 'check_in',
      label: 'Checked in for the day',
    });
    expect(activityForTask({ title: 'Blood pressure check' })).toEqual({
      kind: 'task_done',
      label: 'Finished: Blood pressure check',
    });
  });

  it('formats times and days the way the log reads them', () => {
    const now = new Date(2026, 5, 4, 10, 0);
    expect(formatEventTime(new Date(2026, 5, 4, 8, 35))).toMatch(/^8:35\s?AM$/);
    expect(formatEventDay(new Date(2026, 5, 4, 7), now)).toBe('Today');
    expect(formatEventDay(new Date(2026, 5, 3, 7), now)).toBe('Yesterday');
    expect(formatEventDay(new Date(2026, 5, 1, 7), now)).toBe('Monday 1 June');
  });

  it('counts in the singular and the plural', () => {
    expect(countLabel(1, 'event')).toBe('1 event');
    expect(countLabel(3, 'event')).toBe('3 events');
    expect(countLabel(0, 'medicine')).toBe('0 medicines');
  });

  it('seeds one note today and one yesterday, newest first', () => {
    const now = new Date(2026, 5, 4, 10);
    const [today, yesterday] = seedNotes(now);
    expect(today.at).toEqual(now);
    expect(today.priority).toBe('note');
    expect(yesterday.at.getDate()).toBe(3);
  });
});
