/**
 * @jest-environment node
 */
import type { JsonStore } from '../jsonStore';
import {
  defaultWindowState,
  isVisibleOn,
  loadWindowState,
  minimumWindowSize,
  sanitizeWindowState,
  stateToPersist,
  toWindowStateInfo,
  windowStateFromStored,
  type DisplayBounds,
  type StoredWindowState,
} from '../windowState';

const laptop: DisplayBounds = { x: 0, y: 0, width: 1512, height: 900 };
const secondScreen: DisplayBounds = { x: 1512, y: 0, width: 1920, height: 1080 };

const fakeStore = (value: Partial<StoredWindowState>): JsonStore<StoredWindowState> => ({
  path: '/tmp/window-state.json',
  read: () => value as StoredWindowState,
  write: () => undefined,
  clear: () => undefined,
});

describe('windowStateFromStored', () => {
  it('fills in the default for anything missing', () => {
    expect(windowStateFromStored({})).toEqual(defaultWindowState);
  });

  it('rejects values of the wrong type rather than passing them to Electron', () => {
    const state = windowStateFromStored({
      width: 'wide' as unknown as number,
      height: Number.NaN,
      isMaximized: 'yes' as unknown as boolean,
    });
    expect(state.width).toBe(defaultWindowState.width);
    expect(state.height).toBe(defaultWindowState.height);
    expect(state.isMaximized).toBe(false);
  });

  it('keeps a position that was stored', () => {
    expect(windowStateFromStored({ x: 120, y: 80 })).toMatchObject({ x: 120, y: 80 });
  });
});

describe('isVisibleOn', () => {
  it('accepts a window sitting on the main display', () => {
    expect(isVisibleOn({ width: 1000, height: 700, x: 100, y: 60, isMaximized: false }, [laptop]))
      .toBe(true);
  });

  it('accepts a window on a second display', () => {
    expect(
      isVisibleOn({ width: 1000, height: 700, x: 1700, y: 100, isMaximized: false }, [
        laptop,
        secondScreen,
      ]),
    ).toBe(true);
  });

  it('rejects a window left on a monitor that has been unplugged', () => {
    // This is the case that actually bites people: a window restored off-screen
    // is, to a keyboard-only or screen-reader user, indistinguishable from the
    // application failing to start.
    expect(
      isVisibleOn({ width: 1000, height: 700, x: 1700, y: 100, isMaximized: false }, [laptop]),
    ).toBe(false);
  });

  it('rejects a window whose title bar is above the top of the screen', () => {
    expect(
      isVisibleOn({ width: 1000, height: 700, x: 100, y: -300, isMaximized: false }, [laptop]),
    ).toBe(false);
  });

  it('rejects a window with only a sliver on screen', () => {
    expect(
      isVisibleOn({ width: 1000, height: 700, x: 1480, y: 100, isMaximized: false }, [laptop]),
    ).toBe(false);
  });

  it('rejects a state with no position at all', () => {
    expect(isVisibleOn({ width: 1000, height: 700, isMaximized: false }, [laptop])).toBe(false);
  });
});

describe('sanitizeWindowState', () => {
  it('raises a window smaller than the minimum', () => {
    const state = sanitizeWindowState(
      { width: 320, height: 200, x: 10, y: 10, isMaximized: false },
      [laptop],
    );
    expect(state.width).toBe(minimumWindowSize.width);
    expect(state.height).toBe(minimumWindowSize.height);
  });

  it('caps a window larger than the widest display', () => {
    const state = sanitizeWindowState(
      { width: 9000, height: 9000, x: 0, y: 0, isMaximized: false },
      [laptop],
    );
    expect(state.width).toBe(laptop.width);
    expect(state.height).toBe(laptop.height);
  });

  it('drops an off-screen position so Electron centres the window instead', () => {
    const state = sanitizeWindowState(
      { width: 1000, height: 700, x: 4000, y: 100, isMaximized: false },
      [laptop],
    );
    expect(state.x).toBeUndefined();
    expect(state.y).toBeUndefined();
    expect(state.width).toBe(1000);
  });

  it('leaves a good state alone', () => {
    const good: StoredWindowState = {
      width: 1280,
      height: 840,
      x: 100,
      y: 40,
      isMaximized: false,
    };
    expect(sanitizeWindowState(good, [laptop])).toEqual(good);
  });

  it('survives being asked before any display is known', () => {
    const state = sanitizeWindowState(defaultWindowState, []);
    expect(state.width).toBe(defaultWindowState.width);
  });
});

describe('stateToPersist', () => {
  it('stores the bounds of a normal window', () => {
    expect(
      stateToPersist({
        bounds: { x: 12, y: 34, width: 1000, height: 700 },
        normalBounds: { x: 12, y: 34, width: 1000, height: 700 },
        isMaximized: false,
      }),
    ).toEqual({ x: 12, y: 34, width: 1000, height: 700, isMaximized: false });
  });

  it('stores the pre-maximize bounds of a maximized window', () => {
    // Storing the maximized bounds would mean un-maximizing left the window
    // exactly as large as the screen, which is not a restore at all.
    expect(
      stateToPersist({
        bounds: { x: 0, y: 0, width: 1512, height: 900 },
        normalBounds: { x: 120, y: 80, width: 1000, height: 700 },
        isMaximized: true,
      }),
    ).toEqual({ x: 120, y: 80, width: 1000, height: 700, isMaximized: true });
  });

  it('rounds fractional bounds from a scaled display', () => {
    expect(
      stateToPersist({
        bounds: { x: 12.4, y: 34.6, width: 1000.5, height: 700.4 },
        normalBounds: { x: 12.4, y: 34.6, width: 1000.5, height: 700.4 },
        isMaximized: false,
      }),
    ).toEqual({ x: 12, y: 35, width: 1001, height: 700, isMaximized: false });
  });
});

describe('loadWindowState', () => {
  it('reads, coerces and sanitizes in one step', () => {
    const state = loadWindowState(
      fakeStore({ width: 40, height: 40, x: 9000, y: 9000, isMaximized: true }),
      [laptop],
    );
    expect(state).toEqual({
      width: minimumWindowSize.width,
      height: minimumWindowSize.height,
      isMaximized: true,
    });
  });

  it('opens a default window when the store is empty', () => {
    expect(loadWindowState(fakeStore({}), [laptop])).toMatchObject({
      width: defaultWindowState.width,
      height: defaultWindowState.height,
    });
  });
});

describe('toWindowStateInfo', () => {
  it('passes the stored shape through to the renderer', () => {
    expect(toWindowStateInfo({ width: 1280, height: 840, x: 1, y: 2, isMaximized: true })).toEqual(
      { width: 1280, height: 840, x: 1, y: 2, isMaximized: true },
    );
  });
});
