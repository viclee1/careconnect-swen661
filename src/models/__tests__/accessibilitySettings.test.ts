import {
  balanceLabel,
  captionColorFrom,
  captionColors,
  captionFontSize,
  captionSizeFrom,
  captionSizes,
  clampBalance,
  clampVolume,
  conformanceMessage,
  defaultSettings,
  meetsHearingConstraints,
  settingsEqual,
  settingsFromStored,
  volumePercent,
  withSettings,
} from '../accessibilitySettings';

describe('defaults', () => {
  it('ship in a configuration a deaf user can rely on', () => {
    expect(defaultSettings.visualAlertBanners).toBe(true);
    expect(defaultSettings.captionsEnabled).toBe(true);
    expect(defaultSettings.vibrationEnabled).toBe(true);
    expect(defaultSettings.smartEscalation).toBe(true);
    expect(meetsHearingConstraints(defaultSettings)).toBe(true);
  });

  it('match the values the prototype screenshots show', () => {
    expect(volumePercent(defaultSettings)).toBe(70);
    expect(balanceLabel(defaultSettings)).toBe('Centre');
    expect(defaultSettings.captionSize).toBe('medium');
    expect(defaultSettings.captionColor).toBe('white');
  });
});

describe('caption size', () => {
  it('scales upwards through the three sizes', () => {
    expect(captionSizes.small.scale).toBeLessThan(captionSizes.medium.scale);
    expect(captionSizes.medium.scale).toBeLessThan(captionSizes.large.scale);
  });

  it('falls back to medium on bad input', () => {
    expect(captionSizeFrom('large')).toBe('large');
    expect(captionSizeFrom('gigantic')).toBe('medium');
    expect(captionSizeFrom(null)).toBe('medium');
  });

  it('caption font size follows the chosen scale', () => {
    expect(captionFontSize(withSettings(defaultSettings, { captionSize: 'large' }))).toBeGreaterThan(
      captionFontSize(withSettings(defaultSettings, { captionSize: 'small' })),
    );
  });
});

describe('caption colour', () => {
  it('offers exactly the two choices the prototype shows', () => {
    expect(Object.values(captionColors).map((c) => c.label)).toEqual(['White', 'Yellow']);
  });

  it('carries opaque six-digit hex values', () => {
    for (const colour of Object.values(captionColors)) {
      expect(colour.hex).toMatch(/^#[0-9A-F]{6}$/);
    }
  });

  it('falls back to white on bad input', () => {
    expect(captionColorFrom('yellow')).toBe('yellow');
    expect(captionColorFrom('chartreuse')).toBe('white');
    expect(captionColorFrom(undefined)).toBe('white');
  });
});

describe('volume and balance', () => {
  it('volume clamps to its range', () => {
    expect(clampVolume(0.5)).toBe(0.5);
    expect(clampVolume(-2)).toBe(0);
    expect(clampVolume(9)).toBe(1);
    expect(clampVolume(Number.NaN)).toBe(0);
  });

  it('balance clamps to its range and treats NaN as centred', () => {
    expect(clampBalance(-0.5)).toBe(-0.5);
    expect(clampBalance(-9)).toBe(-1);
    expect(clampBalance(9)).toBe(1);
    expect(clampBalance(Number.NaN)).toBe(0);
  });

  it('volume is reported as a whole percentage', () => {
    expect(volumePercent(withSettings(defaultSettings, { alertVolume: 0 }))).toBe(0);
    expect(volumePercent(withSettings(defaultSettings, { alertVolume: 0.256 }))).toBe(26);
    expect(volumePercent(withSettings(defaultSettings, { alertVolume: 1 }))).toBe(100);
  });

  it('balance is written out with its side', () => {
    expect(balanceLabel(withSettings(defaultSettings, { audioBalance: 0 }))).toBe('Centre');
    expect(balanceLabel(withSettings(defaultSettings, { audioBalance: -0.6 }))).toBe('60% left');
    expect(balanceLabel(withSettings(defaultSettings, { audioBalance: 0.25 }))).toBe('25% right');
  });

  it('silence is a valid setting, because sound is never the only cue', () => {
    const silent = withSettings(defaultSettings, { alertVolume: 0 });
    expect(volumePercent(silent)).toBe(0);
    expect(meetsHearingConstraints(silent)).toBe(true);
  });
});

describe('withSettings', () => {
  it('changes only the named field', () => {
    const updated = withSettings(defaultSettings, { captionsEnabled: false });
    expect(updated.captionsEnabled).toBe(false);
    expect(updated.vibrationEnabled).toBe(true);
    expect(updated.captionSize).toBe('medium');
  });

  it('clamps anything numeric passed through it', () => {
    expect(withSettings(defaultSettings, { alertVolume: 4 }).alertVolume).toBe(1);
    expect(withSettings(defaultSettings, { audioBalance: -4 }).audioBalance).toBe(-1);
  });

  it('refuses to switch the visual banner off', () => {
    // The banner is not the user's to disable; doing so would leave an alert
    // that could reach them by sound alone.
    expect(withSettings(defaultSettings, { visualAlertBanners: false }).visualAlertBanners).toBe(
      true,
    );
  });
});

describe('conformance', () => {
  it('is met by the defaults', () => {
    expect(conformanceMessage(defaultSettings)).toBe('Hearing-accessibility requirements met');
  });

  it('fails, and says why, when captions are switched off', () => {
    const settings = withSettings(defaultSettings, { captionsEnabled: false });
    expect(meetsHearingConstraints(settings)).toBe(false);
    expect(conformanceMessage(settings)).toContain('no text');
  });
});

describe('settingsFromStored', () => {
  it('round-trips a full object', () => {
    const original = withSettings(defaultSettings, {
      smartEscalation: false,
      captionsEnabled: false,
      captionSize: 'large',
      captionColor: 'yellow',
      alertVolume: 0.3,
      audioBalance: -0.5,
      vibrationEnabled: false,
    });
    expect(settingsFromStored({ ...original })).toEqual(original);
  });

  it('an empty object yields the defaults', () => {
    expect(settingsFromStored({})).toEqual(defaultSettings);
  });

  it('values of the wrong type fall back instead of throwing', () => {
    expect(
      settingsFromStored({ captionsEnabled: 'yes please', alertVolume: 'loud', captionSize: 42 }),
    ).toEqual(defaultSettings);
  });

  it('a partially written store keeps the values it does have', () => {
    const restored = settingsFromStored({ vibrationEnabled: false });
    expect(restored.vibrationEnabled).toBe(false);
    expect(restored.captionsEnabled).toBe(true);
  });

  it('an out-of-range stored volume is clamped on read', () => {
    expect(settingsFromStored({ alertVolume: 12 }).alertVolume).toBe(1);
  });

  it('the visual banner cannot be switched off through storage', () => {
    // Editing the stored preferences by hand must not be a way around the
    // no-sound-only-alerts rule.
    expect(settingsFromStored({ visualAlertBanners: false }).visualAlertBanners).toBe(true);
  });
});

describe('settingsEqual', () => {
  it('is true for identical settings', () => {
    expect(settingsEqual(defaultSettings, { ...defaultSettings })).toBe(true);
  });

  it('a single differing field breaks equality', () => {
    expect(
      settingsEqual(defaultSettings, withSettings(defaultSettings, { vibrationEnabled: false })),
    ).toBe(false);
    expect(
      settingsEqual(defaultSettings, withSettings(defaultSettings, { captionColor: 'yellow' })),
    ).toBe(false);
  });
});
