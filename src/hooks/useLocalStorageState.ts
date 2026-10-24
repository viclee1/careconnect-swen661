import { useEffect, useState } from 'react';

/**
 * `useState` that survives a reload by mirroring itself into localStorage.
 *
 * This is what makes the messaging and settings screens work offline: nothing
 * is fetched, so a page served by the service worker with no connection still
 * shows everything the user had.
 *
 * `revive` turns whatever was stored back into a valid value. It runs on every
 * read, so a corrupt or out-of-date entry degrades to something safe instead of
 * crashing the screen on startup. Storage that is full or blocked (a private
 * window) is tolerated: the state still works for the session.
 */
export function useLocalStorageState<T>(
  key: string,
  initial: () => T,
  revive: (stored: unknown) => T = (stored) => stored as T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? initial() : revive(JSON.parse(raw));
    } catch {
      return initial();
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage unavailable — keep working for this session.
    }
  }, [key, value]);

  return [value, setValue];
}
