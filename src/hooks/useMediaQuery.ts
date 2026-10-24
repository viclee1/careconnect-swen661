import { useCallback, useSyncExternalStore } from 'react';

/** Desktop: wide enough for the contact list and a conversation side by side. */
export const WIDE_LAYOUT = '(min-width: 1024px)';

function hasMatchMedia(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function';
}

/**
 * Whether a CSS media query currently matches, kept in step as the window is
 * resized or a tablet is rotated.
 *
 * Used where the two layouts differ in what is *mounted*, not just in how it
 * looks — the desktop Contacts screen opens a conversation beside the list,
 * which marks it read, and that must not happen behind a phone's list.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!hasMatchMedia()) return () => undefined;
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => hasMatchMedia() && window.matchMedia(query).matches,
    () => false,
  );
}
