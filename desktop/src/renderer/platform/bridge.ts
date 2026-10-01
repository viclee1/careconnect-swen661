import type { CareConnectBridge } from '../../shared/ipc';

declare global {
  interface Window {
    /**
     * Installed by `src/main/preload.ts`. Absent when the renderer is served
     * outside Electron — `npm run dev:renderer` in a browser, or Jest.
     */
    careconnect?: CareConnectBridge;
  }
}

/**
 * The Electron bridge, or `null` when there isn't one.
 *
 * Every caller has to handle the `null`. That is deliberate: it is what keeps
 * the renderer testable in jsdom and runnable in a plain browser, and it forces
 * each feature to state what it does without the desktop shell rather than
 * silently breaking. The keyboard shortcuts, for instance, are bound in the
 * renderer as well as in the native menu, so they work either way.
 */
export function bridge(): CareConnectBridge | null {
  return typeof window === 'undefined' ? null : (window.careconnect ?? null);
}

/** True when running inside the packaged desktop shell. */
export function isDesktopShell(): boolean {
  return bridge() !== null;
}

/**
 * Whether to print Mac or Windows/Linux key names.
 *
 * Asked of the platform where one is available, and inferred from the user
 * agent otherwise so the browser-served renderer still prints the right keys.
 */
export function isMacPlatform(): boolean {
  if (typeof navigator === 'undefined') return false;
  const platform =
    (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData
      ?.platform ?? navigator.platform;
  return /mac/i.test(platform ?? '');
}
