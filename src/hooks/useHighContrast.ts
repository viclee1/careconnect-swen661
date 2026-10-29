import { useEffect } from 'react';

import { useLocalStorageState } from './useLocalStorageState';

export const HIGH_CONTRAST_KEY = 'careconnect_high_contrast';

const reviveBoolean = (stored: unknown) => stored === true;

/**
 * The header's high-contrast switch. On, `html.high-contrast` darkens the
 * secondary text, strengthens borders and whitens the page (see index.css).
 * Remembered on this device.
 */
export function useHighContrast(): [boolean, (on: boolean) => void] {
  const [on, setOn] = useLocalStorageState<boolean>(HIGH_CONTRAST_KEY, () => false, reviveBoolean);

  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', on);
    return () => document.documentElement.classList.remove('high-contrast');
  }, [on]);

  return [on, setOn];
}
