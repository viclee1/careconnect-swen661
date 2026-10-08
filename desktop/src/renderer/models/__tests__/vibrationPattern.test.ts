import {
  patternDuration,
  patternSemanticLabel,
  pulseTimeline,
  vibrateDurations,
  vibrationPatterns,
} from '../vibrationPattern';

describe('vibrationPattern', () => {
  it('offers one rhythm per alert type, each with a printed glyph', () => {
    expect(vibrationPatterns.map((pattern) => pattern.id)).toEqual([
      'appointment',
      'medication',
      'missed',
    ]);
    // The glyph is what makes a rhythm comparable on a screen. A pattern
    // without one is only learnable by feel, which is useless on a desktop.
    for (const pattern of vibrationPatterns) {
      expect(pattern.glyph.trim().length).toBeGreaterThan(0);
    }
  });

  it('starts and ends every pattern on a buzz rather than a pause', () => {
    // An even-length pulse list would end on a silence, which reads as a
    // longer gap before the rhythm repeats.
    for (const pattern of vibrationPatterns) {
      expect(pattern.pulses.length % 2).toBe(1);
    }
  });

  it('sums the whole rhythm, buzzes and pauses alike', () => {
    const pattern = vibrationPatterns[0];
    expect(patternDuration(pattern)).toBe(
      pattern.pulses.reduce((total, ms) => total + ms, 0),
    );
  });

  it('separates the buzzes from the gaps', () => {
    expect(vibrateDurations(vibrationPatterns[0])).toEqual([400, 120, 400]);
  });

  describe('pulseTimeline', () => {
    it('alternates on and off, starting on', () => {
      const steps = pulseTimeline(vibrationPatterns[0]);
      expect(steps.slice(0, 4).map((step) => step.on)).toEqual([true, false, true, false]);
    });

    it('accumulates the offset of each step', () => {
      const steps = pulseTimeline(vibrationPatterns[0]);
      expect(steps.map((step) => step.at)).toEqual([0, 400, 550, 670, 820, 1220]);
    });

    it('ends with an off step, so the lamp cannot be left lit', () => {
      const pattern = vibrationPatterns[2];
      const steps = pulseTimeline(pattern);
      const last = steps[steps.length - 1];
      expect(last.on).toBe(false);
      expect(last.at).toBe(patternDuration(pattern));
    });
  });

  it('describes what the row does, beyond the name it shows', () => {
    expect(patternSemanticLabel(vibrationPatterns[1])).toBe(
      'Activate to see the Double pulse rhythm played back.',
    );
  });
});
