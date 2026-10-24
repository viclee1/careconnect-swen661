import { flashCueMessage, flashCues } from '../flashCue';

describe('flashCues', () => {
  it('gives each alert type its own colour', () => {
    const tones = flashCues.map((cue) => cue.tone);
    expect(new Set(tones).size).toBe(flashCues.length);
  });

  it('never flashes more than twice in a cue (WCAG 2.3.1)', () => {
    for (const cue of flashCues) expect(cue.flashes).toBeLessThanOrEqual(2);
  });

  it('names the alert and its colour in words inside the flash', () => {
    const missed = flashCues.find((cue) => cue.id === 'missed')!;
    expect(flashCueMessage(missed)).toBe('Missed / Escalated alert\nRapid red double-flash');
  });
});
