import { createContext, useContext } from 'react';

import type { AccessibilitySettings } from '../models/accessibilitySettings';

export interface SettingsContextValue {
  settings: AccessibilitySettings;
  /** Applies a partial change. The visual banner can never be switched off. */
  update: (change: Partial<AccessibilitySettings>) => void;
}

export const SettingsContext = createContext<SettingsContextValue | null>(null);

/** The user's accessibility preferences. Provided by SettingsProvider. */
export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}
