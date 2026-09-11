import * as Haptics from 'expo-haptics';

import { vibrationPatterns } from '../../models/vibrationPattern';
import { notifyBuzz, playPattern } from '../haptics';

const impactAsync = Haptics.impactAsync as jest.Mock;

beforeEach(() => {
  impactAsync.mockClear();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

/** Runs a pattern to completion, advancing the fake clock between pulses. */
async function playToCompletion(promise: Promise<void>): Promise<void> {
  for (let i = 0; i < 20; i += 1) {
    await Promise.resolve();
    jest.advanceTimersByTime(500);
  }
  await promise;
}

describe('playPattern', () => {
  it('fires one impact per vibrating pulse', async () => {
    const pattern = vibrationPatterns[0];
    await playToCompletion(playPattern(pattern, true));
    // Appointment is long-short-long: three buzzes.
    expect(impactAsync).toHaveBeenCalledTimes(3);
  });

  it('does nothing when vibration is switched off', async () => {
    await playPattern(vibrationPatterns[1], false);
    expect(impactAsync).not.toHaveBeenCalled();
  });
});

describe('notifyBuzz', () => {
  it('fires a single heavy impact', async () => {
    await notifyBuzz(true);
    expect(impactAsync).toHaveBeenCalledTimes(1);
    expect(impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Heavy);
  });

  it('stays silent when vibration is off', async () => {
    await notifyBuzz(false);
    expect(impactAsync).not.toHaveBeenCalled();
  });
});
