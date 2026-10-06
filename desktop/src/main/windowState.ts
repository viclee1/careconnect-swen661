import type { WindowStateInfo } from '../shared/ipc';
import type { JsonStore } from './jsonStore';

/**
 * Window state management — Assignment 8's "remember size, position".
 *
 * The rules live here as pure functions so they can be tested without opening
 * a real `BrowserWindow`, and so the one case that actually bites users is
 * covered: a window restored onto a monitor that is no longer attached would
 * open off-screen, which for a keyboard-only or screen-reader user is
 * indistinguishable from the application failing to start.
 */

export interface StoredWindowState {
  width: number;
  height: number;
  x?: number;
  y?: number;
  isMaximized: boolean;
}

/**
 * The window a first launch gets.
 *
 * 1280×840 is wide enough for the sidebar plus a conversation at a readable
 * width without the user having to resize anything.
 */
export const defaultWindowState: StoredWindowState = {
  width: 1280,
  height: 840,
  isMaximized: false,
};

/**
 * Smallest the window may be dragged to.
 *
 * Below roughly this width the sidebar and a readable column stop fitting side
 * by side; the layout collapses the sidebar to icons rather than clipping, and
 * this floor keeps even that legible at 200% zoom.
 */
export const minimumWindowSize = { width: 900, height: 600 } as const;

/** A rectangle a window could be placed on — one display's work area. */
export interface DisplayBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * True when the stored position still lands meaningfully on one of the
 * displays currently attached.
 *
 * "Meaningfully" means the title bar is reachable: at least 100px of width and
 * the top 40px of the window have to be inside a work area, or the user cannot
 * grab it with a mouse.
 */
export function isVisibleOn(state: StoredWindowState, displays: DisplayBounds[]): boolean {
  if (state.x === undefined || state.y === undefined) return false;

  const left = state.x;
  const top = state.y;
  const right = left + state.width;

  return displays.some((display) => {
    const overlapsHorizontally =
      Math.min(right, display.x + display.width) - Math.max(left, display.x) >= 100;
    const titleBarOnScreen =
      top >= display.y - 8 && top + 40 <= display.y + display.height;
    return overlapsHorizontally && titleBarOnScreen;
  });
}

/**
 * Clamps a stored state into something safe to open.
 *
 * Sizes below the minimum are raised, sizes larger than the display are capped,
 * and a position that is no longer on any attached display is dropped so
 * Electron centres the window instead.
 */
export function sanitizeWindowState(
  state: StoredWindowState,
  displays: DisplayBounds[],
): StoredWindowState {
  const largest = displays.reduce(
    (widest, display) => (display.width > widest.width ? display : widest),
    displays[0] ?? { x: 0, y: 0, width: Number.MAX_SAFE_INTEGER, height: Number.MAX_SAFE_INTEGER },
  );

  const width = clamp(state.width, minimumWindowSize.width, largest.width);
  const height = clamp(state.height, minimumWindowSize.height, largest.height);
  const resized: StoredWindowState = {
    width,
    height,
    x: state.x,
    y: state.y,
    isMaximized: state.isMaximized === true,
  };

  if (!isVisibleOn(resized, displays)) {
    delete resized.x;
    delete resized.y;
  }

  return resized;
}

function clamp(value: number, low: number, high: number): number {
  if (!Number.isFinite(value)) return low;
  return Math.min(Math.max(Math.round(value), low), Math.max(low, Math.round(high)));
}

/**
 * Reads a stored state back, coercing anything missing or the wrong type to the
 * default. A hand-edited or truncated file therefore opens a normal window
 * rather than throwing before the first frame.
 */
export function windowStateFromStored(raw: Partial<StoredWindowState>): StoredWindowState {
  const number = (value: unknown): number | undefined =>
    typeof value === 'number' && Number.isFinite(value) ? value : undefined;

  return {
    width: number(raw.width) ?? defaultWindowState.width,
    height: number(raw.height) ?? defaultWindowState.height,
    x: number(raw.x),
    y: number(raw.y),
    isMaximized: raw.isMaximized === true,
  };
}

/**
 * The state to persist for a window.
 *
 * A maximized window reports its maximized bounds, which are useless as a
 * restore size — un-maximizing would leave the window exactly as large as the
 * screen. The bounds it had *before* being maximized are kept instead, and the
 * maximized flag is what re-maximizes it on the next launch.
 */
export function stateToPersist(
  current: { bounds: DisplayBounds; normalBounds: DisplayBounds; isMaximized: boolean },
): StoredWindowState {
  const bounds = current.isMaximized ? current.normalBounds : current.bounds;
  return {
    width: Math.round(bounds.width),
    height: Math.round(bounds.height),
    x: Math.round(bounds.x),
    y: Math.round(bounds.y),
    isMaximized: current.isMaximized,
  };
}

/** The shape the renderer receives over `window.careconnect.window.getState()`. */
export function toWindowStateInfo(state: StoredWindowState): WindowStateInfo {
  return {
    width: state.width,
    height: state.height,
    x: state.x,
    y: state.y,
    isMaximized: state.isMaximized,
  };
}

/**
 * Loads the saved state and makes it safe to open with.
 *
 * The store is injected rather than constructed here so the tests can exercise
 * this against a temporary directory.
 */
export function loadWindowState(
  store: JsonStore<StoredWindowState>,
  displays: DisplayBounds[],
): StoredWindowState {
  return sanitizeWindowState(windowStateFromStored(store.read()), displays);
}
