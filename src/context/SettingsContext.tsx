import { useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';

import {
  defaultSettings,
  settingsFromStored,
  withSettings,
  type AccessibilitySettings,
} from '../models/accessibilitySettings';
import { useLocalStorageState } from '../hooks/useLocalStorageState';
import { SettingsContext } from './settings';

// ── Storage ────────────────────────────────────────────────────────────────────

export const SETTINGS_KEY = 'careconnect_accessibility_settings';

function revive(stored: unknown): AccessibilitySettings {
  return stored && typeof stored === 'object'
    ? settingsFromStored(stored as Record<string, unknown>)
    : defaultSettings;
}

// ── Provider ────────────────────────────────────────────────────────────────────

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useLocalStorageState<AccessibilitySettings>(
    SETTINGS_KEY,
    () => defaultSettings,
    revive,
  );

  const update = useCallback(
    (change: Partial<AccessibilitySettings>) =>
      setSettings((current) => withSettings(current, change)),
    [setSettings],
  );

  const reset = useCallback(() => setSettings(defaultSettings), [setSettings]);

  const value = useMemo(() => ({ settings, update, reset }), [settings, update, reset]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
