import type { PersistedSettings, StoredSettings } from '../../shared/ipc';
import {
  defaultSettings,
  settingsFromStored,
  type AccessibilitySettings,
} from '../models/accessibilitySettings';
import { bridge } from '../platform/bridge';

/**
 * Compile-time proof that the renderer's settings type still fits the shape the
 * IPC contract declares. `PersistedSettings` widens `captionSize` and
 * `captionColor` to `string`, so this assignment fails the build the moment a
 * field is renamed, removed, or has its type changed on one side only.
 */
const _contractHolds: PersistedSettings = defaultSettings;
void _contractHolds;

/** Persistence for the accessibility preferences. */
export interface SettingsRepository {
  load(): Promise<AccessibilitySettings>;
  save(settings: AccessibilitySettings): Promise<void>;
  clear(): Promise<void>;
}

/** The `localStorage` key used when the Electron bridge is not present. */
export const storageKey = 'careconnect.a11y';

/**
 * The real repository: preferences travel over IPC to the main process, which
 * writes them to a JSON file in the user's application-data directory.
 *
 * When `window.careconnect` is missing — running the renderer in a plain
 * browser via `npm run dev:renderer`, or under Jest — it falls back to
 * `localStorage` rather than failing. The screens are then testable without
 * booting Electron, and the fallback is the same store the web client uses.
 *
 * Every read degrades to the defaults rather than throwing. That matters more
 * here than elsewhere: a user who cannot hear the application has no fallback
 * if it refuses to open.
 */
export function createSettingsRepository(): SettingsRepository {
  return {
    async load() {
      try {
        const raw = await readRaw();
        return raw ? settingsFromStored(raw) : defaultSettings;
      } catch {
        return defaultSettings;
      }
    },

    async save(settings) {
      try {
        const api = bridge();
        if (api) {
          await api.settings.save(settings);
          return;
        }
        window.localStorage.setItem(storageKey, JSON.stringify(settings));
      } catch {
        // A preference that fails to persist still applies for this session;
        // it is not worth interrupting the user over.
      }
    },

    async clear() {
      try {
        const api = bridge();
        if (api) {
          await api.settings.clear();
          return;
        }
        window.localStorage.removeItem(storageKey);
      } catch {
        // As above.
      }
    },
  };
}

async function readRaw(): Promise<StoredSettings | null> {
  const api = bridge();
  if (api) {
    const stored = await api.settings.load();
    return stored && Object.keys(stored).length > 0 ? stored : null;
  }

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return null;
  const parsed: unknown = JSON.parse(raw);
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return null;
  return parsed as StoredSettings;
}

/**
 * A repository that keeps settings in memory only.
 *
 * Used by component tests that are not exercising persistence, and by the
 * failure-path tests, which need a store they can make throw on demand.
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
