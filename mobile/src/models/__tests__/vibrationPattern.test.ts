import {
  patternDuration,
  patternSemanticLabel,
  vibrateDurations,
  vibrationPatterns,
} from '../vibrationPattern';

describe('vibrationPatterns', () => {
  it('covers the three alert types the prototype names', () => {
    expect(vibrationPatterns.map((p) => p.alertType)).toEqual([
      'Appointment',
      'Medication',
      'Missed / Escalated',
    ]);
    expect(vibrationPatterns.map((p) => p.rhythmName)).toEqual([
      'Long-short-long',
      'Double pulse',
      'Rapid burst',
    ]);
  });

  it('prints every pattern as well as playing it', () => {
    for (const pattern of vibrationPatterns) {
      expect(pattern.glyph.length).toBeGreaterThan(0);
      expect(patternSemanticLabel(pattern)).toContain(pattern.alertType);
      expect(patternSemanticLabel(pattern)).toContain(pattern.rhythmName);
    }
  });

  it('every pattern starts and ends on a vibrate', () => {
    // Pulses alternate vibrate/pause starting with a vibrate, so a well-formed
    // pattern always has an odd number of entries.
    for (const pattern of vibrationPatterns) {
      expect(pattern.pulses.length % 2).toBe(1);
      expect(pattern.pulses.every((ms) => ms > 0)).toBe(true);
    }
  });

  it('the three rhythms are actually distinguishable from each other', () => {
    const shapes = new Set(vibrationPatterns.map((p) => vibrateDurations(p).length));
    expect(shapes.size).toBe(vibrationPatterns.length);
  });

  it('duration is the sum of every pulse and pause', () => {
    expect(patternDuration(vibrationPatterns[0])).toBe(1220);
  });

  it('no pattern runs long enough to be missed as a buzz', () => {
    for (const pattern of vibrationPatterns) {
      expect(patternDuration(pattern)).toBeLessThan(2000);
    }
  });

  it('vibrateDurations returns only the vibrating halves', () => {
    expect(vibrateDurations(vibrationPatterns[0])).toEqual([400, 120, 400]);
  });
});
