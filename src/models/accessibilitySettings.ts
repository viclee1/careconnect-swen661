/** Size of the caption track drawn over video and audio content. */
export type CaptionSize = 'small' | 'medium' | 'large';

export const captionSizes: Record<CaptionSize, { label: string; scale: number }> = {
  small: { label: 'Small', scale: 1.0 },
  medium: { label: 'Medium', scale: 1.25 },
  large: { label: 'Large', scale: 1.6 },
};

export function captionSizeFrom(value: unknown): CaptionSize {
  return value === 'small' || value === 'medium' || value === 'large' ? value : 'medium';
}

/**
 * Colour of caption text, as offered by the Week 3 prototype.
 *
 * Both options are measured against the caption panel's dark blue backing
 * (`colors.primaryDark`, #0F5272): white reaches 8.5:1 and broadcast yellow
 * 8.1:1, so either choice clears WCAG 2.2 AA for body text with room to spare.
 */
export type CaptionColor = 'white' | 'yellow';

export const captionColors: Record<CaptionColor, { label: string; hex: string }> = {
  white: { label: 'White', hex: '#FFFFFF' },
  yellow: { label: 'Yellow', hex: '#FFFF00' },
};

export function captionColorFrom(value: unknown): CaptionColor {
  return value === 'white' || value === 'yellow' ? value : 'white';
}

/**
 * The user's accessibility preferences.
 *
 * `defaultSettings` is the state a fresh install starts in, chosen so the
 * application is already usable by a deaf or hard-of-hearing person before
 * anything is changed.
 */
export interface AccessibilitySettings {
  /**
   * Flashing banners for every notification.
   *
   * This is the setting that cannot be switched off. Removing the banner would
   * leave an alert that reaches the user by sound alone, which is precisely
   * what the assigned constraint forbids — so the Settings screen shows the
   * control, explains that it is fixed, and refuses to change it.
   */
  visualAlertBanners: boolean;
  /** Missed alerts are escalated automatically. */
  smartEscalation: boolean;
  captionsEnabled: boolean;
  captionSize: CaptionSize;
  captionColor: CaptionColor;
  /**
   * Volume of the optional sound layered on top of a banner, 0–1. Sound is
   * never the only carrier, so zero is a perfectly valid setting: the banner
   * and the vibration still arrive.
   */
  alertVolume: number;
  /** Left/right balance, useful when only one ear is aided. -1 to 1. */
  audioBalance: number;
  /** Vibrate for every notification. */
  vibrationEnabled: boolean;
}

export const volumeRange = { min: 0, max: 1 } as const;
export const balanceRange = { min: -1, max: 1 } as const;

/** The out-of-the-box configuration, matching the prototype's screenshots. */
export const defaultSettings: AccessibilitySettings = {
  visualAlertBanners: true,
  smartEscalation: true,
  captionsEnabled: true,
  captionSize: 'medium',
  captionColor: 'white',
  alertVolume: 0.7,
  audioBalance: 0,
  vibrationEnabled: true,
};

export function clampVolume(value: number): number {
  if (Number.isNaN(value)) return volumeRange.min;
  return Math.min(Math.max(value, volumeRange.min), volumeRange.max);
}

export function clampBalance(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(Math.max(value, balanceRange.min), balanceRange.max);
}

/** The caption text size in logical pixels. */
export function captionFontSize(settings: AccessibilitySettings): number {
  return 18 * captionSizes[settings.captionSize].scale;
}

/** Alert volume as a whole percentage, for display. */
export function volumePercent(settings: AccessibilitySettings): number {
  return Math.round(settings.alertVolume * 100);
}

/** The audio balance written out — "Centre", "60% left", "25% right". */
export function balanceLabel(settings: AccessibilitySettings): string {
  const magnitude = Math.round(Math.abs(settings.audioBalance) * 100);
  if (magnitude === 0) return 'Centre';
  return settings.audioBalance < 0 ? `${magnitude}% left` : `${magnitude}% right`;
}

/**
 * True when the current configuration still satisfies every assigned
 * hearing-impairment constraint.
 *
 * The banner is fixed on, so the only way to fall out of conformance is to
 * switch captions off and leave spoken content with nothing to read.
 */
export function meetsHearingConstraints(settings: AccessibilitySettings): boolean {
  return settings.visualAlertBanners && settings.captionsEnabled;
}

/** The sentence printed under the conformance badge. */
export function conformanceMessage(settings: AccessibilitySettings): string {
  return meetsHearingConstraints(settings)
    ? 'Hearing-accessibility requirements met'
    : 'Captions are off, so some spoken content will have no text';
}

/** Applies a partial change, clamping anything numeric on the way through. */
export function withSettings(
  settings: AccessibilitySettings,
  change: Partial<AccessibilitySettings>,
): AccessibilitySettings {
  const next = { ...settings, ...change };
  return {
    ...next,
    // Never honoured as false: the banner is not the user's to disable.
    visualAlertBanners: true,
    alertVolume: clampVolume(next.alertVolume),
    audioBalance: clampBalance(next.audioBalance),
  };
}

/**
 * Rebuilds settings from stored values, falling back to the defaults for any
 * key that is missing or the wrong type, so a partially written or corrupt
 * store degrades to a safe configuration instead of throwing on startup.
 */
export function settingsFromStored(raw: Record<string, unknown>): AccessibilitySettings {
  const bool = (key: keyof AccessibilitySettings, fallback: boolean): boolean =>
    typeof raw[key] === 'boolean' ? (raw[key] as boolean) : fallback;
  const num = (key: keyof AccessibilitySettings, fallback: number): number =>
    typeof raw[key] === 'number' && !Number.isNaN(raw[key]) ? (raw[key] as number) : fallback;

  return {
    visualAlertBanners: true,
    smartEscalation: bool('smartEscalation', defaultSettings.smartEscalation),
    captionsEnabled: bool('captionsEnabled', defaultSettings.captionsEnabled),
    captionSize: captionSizeFrom(raw.captionSize),
    captionColor: captionColorFrom(raw.captionColor),
    alertVolume: clampVolume(num('alertVolume', defaultSettings.alertVolume)),
    audioBalance: clampBalance(num('audioBalance', defaultSettings.audioBalance)),
    vibrationEnabled: bool('vibrationEnabled', defaultSettings.vibrationEnabled),
  };
}

/** True when two settings objects are field-for-field identical. */
export function settingsEqual(a: AccessibilitySettings, b: AccessibilitySettings): boolean {
  return (
    a.visualAlertBanners === b.visualAlertBanners &&
    a.smartEscalation === b.smartEscalation &&
    a.captionsEnabled === b.captionsEnabled &&
    a.captionSize === b.captionSize &&
    a.captionColor === b.captionColor &&
    a.alertVolume === b.alertVolume &&
    a.audioBalance === b.audioBalance &&
    a.vibrationEnabled === b.vibrationEnabled
  );
}
