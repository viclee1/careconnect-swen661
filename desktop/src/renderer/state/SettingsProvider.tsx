import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import type { SettingsRepository } from '../data/settingsRepository';
import {
  defaultSettings,
  settingsEqual,
  withSettings,
  type AccessibilitySettings,
} from '../models/accessibilitySettings';

export interface SettingsValue {
  settings: AccessibilitySettings;
  isLoading: boolean;
  load: () => Promise<void>;
  /**
   * Applies a partial change and persists it.
   *
   * A change that alters nothing short-circuits, so dragging a slider across a
   * pixel that maps to the same value does not spam the preference store.
   */
  update: (change: Partial<AccessibilitySettings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsValue | null>(null);

export function SettingsProvider({
  repository,
  children,
}: {
  repository: SettingsRepository;
  children: ReactNode;
}) {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);

  // The current value is mirrored in a ref because `update` has to read it,
  // compare it and persist it in one go. Reading it out of a state updater
  // would not work: React runs updaters during the render pass, well after the
  // `await` that would need the result.
  const current = useRef<AccessibilitySettings>(defaultSettings);

  const apply = useCallback((next: AccessibilitySettings) => {
    current.current = next;
    setSettings(next);
  }, []);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      apply(await repository.load());
    } catch {
      apply(defaultSettings);
    } finally {
      setIsLoading(false);
    }
  }, [repository, apply]);

  const update = useCallback(
    async (change: Partial<AccessibilitySettings>) => {
      const candidate = withSettings(current.current, change);
      if (settingsEqual(candidate, current.current)) return;
      apply(candidate);
      await repository.save(candidate);
    },
    [repository, apply],
  );

  const value = useMemo<SettingsValue>(
    () => ({ settings, isLoading, load, update }),
    [settings, isLoading, load, update],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsValue {
  const value = useContext(SettingsContext);
  if (!value) throw new Error('useSettings must be used inside a SettingsProvider');
  return value;
}
