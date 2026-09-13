import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  defaultSettings,
  settingsFromStored,
  type AccessibilitySettings,
} from '../models/accessibilitySettings';

/** Persistence for the accessibility preferences. */
export interface SettingsRepository {
  load(): Promise<AccessibilitySettings>;
  save(settings: AccessibilitySettings): Promise<void>;
  clear(): Promise<void>;
}

const storageKey = 'careconnect.a11y';

/**
 * `AsyncStorage` implementation.
 *
 * A corrupt or partially written value degrades to the defaults rather than
 * throwing on startup, which matters more here than elsewhere: a user who
 * cannot hear the app has no fallback if it refuses to open.
 */
export function createAsyncStorageSettingsRepository(): SettingsRepository {
  return {
    async load() {
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        if (!raw) return defaultSettings;
        const parsed: unknown = JSON.parse(raw);
        if (typeof parsed !== 'object' || parsed === null) return defaultSettings;
        return settingsFromStored(parsed as Record<string, unknown>);
      } catch {
        return defaultSettings;
      }
    },
    async save(settings) {
      await AsyncStorage.setItem(storageKey, JSON.stringify(settings));
    },
    async clear() {
      await AsyncStorage.removeItem(storageKey);
    },
  };
}

/**
 * A repository that keeps settings in memory only.
 *
 * Used by component tests that are not exercising persistence, so they do not
 * need to install the AsyncStorage mock.
 */
export function createInMemorySettingsRepository(
  initial: AccessibilitySettings = defaultSettings,
): SettingsRepository & { saves: AccessibilitySettings[] } {
  let current = initial;
  const saves: AccessibilitySettings[] = [];
  return {
    saves,
    async load() {
      return current;
    },
    async save(settings) {
      current = settings;
      saves.push(settings);
    },
    async clear() {
      current = defaultSettings;
    },
  };
}
