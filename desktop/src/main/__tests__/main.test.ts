/**
 * @jest-environment node
 */
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type { CareConnectBridge, PersistedSettings } from '../../shared/ipc';

/**
 * Integration tests for the main process.
 *
 * `main.ts` and `preload.ts` are both loaded for real against one fake
 * Electron, and `ipcRenderer.invoke` is routed to whatever `ipcMain.handle`
 * registered. A call on `window.careconnect` therefore crosses the same path it
 * does in the app — preload → channel → main-process handler → JSON file on
 * disk → back — so the two halves of the IPC contract are tested together
 * rather than each against a mock of the other.
 *
 * `BrowserWindow` is a recorder, which is what lets window management be
 * asserted: the options it was created with, the state it saves on close, and
 * what it does with navigation and new-window requests.
 */

type Listener = (...args: unknown[]) => void;

interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

class FakeWebContents {
  readonly listeners: Record<string, Listener> = {};
  windowOpenHandler: ((details: { url: string }) => { action: string }) | null = null;
  readonly sent: Array<{ channel: string; args: unknown[] }> = [];

  on(event: string, listener: Listener) {
    this.listeners[event] = listener;
  }

  setWindowOpenHandler(handler: (details: { url: string }) => { action: string }) {
    this.windowOpenHandler = handler;
  }

  send(channel: string, ...args: unknown[]) {
    this.sent.push({ channel, args });
  }
}

class FakeBrowserWindow {
  static instances: FakeBrowserWindow[] = [];

  readonly listeners: Record<string, Listener> = {};
  readonly onceListeners: Record<string, Listener> = {};
  readonly webContents = new FakeWebContents();
  bounds: Bounds;
  maximized = false;
  minimized = false;
  destroyed = false;
  shown = false;
  focused = false;
  loadedFile: string | null = null;
  loadedUrl: string | null = null;

  constructor(readonly options: Record<string, unknown>) {
    this.bounds = {
      x: (options.x as number | undefined) ?? 0,
      y: (options.y as number | undefined) ?? 0,
      width: options.width as number,
      height: options.height as number,
    };
    FakeBrowserWindow.instances.push(this);
  }

  static getAllWindows() {
    return FakeBrowserWindow.instances.filter((window) => !window.destroyed);
  }

  on(event: string, listener: Listener) {
    this.listeners[event] = listener;
  }
  once(event: string, listener: Listener) {
    this.onceListeners[event] = listener;
  }
  getBounds() {
    return { ...this.bounds };
  }
  getNormalBounds() {
    return { ...this.bounds };
  }
  isMaximized() {
    return this.maximized;
  }
  isMinimized() {
    return this.minimized;
  }
  isFullScreen() {
    return false;
  }
  isDestroyed() {
    return this.destroyed;
  }
  maximize() {
    this.maximized = true;
  }
  restore() {
    this.minimized = false;
  }
  show() {
    this.shown = true;
  }
  focus() {
    this.focused = true;
  }
  loadFile(path: string) {
    this.loadedFile = path;
    return Promise.resolve();
  }
  loadURL(url: string) {
    this.loadedUrl = url;
    return Promise.resolve();
  }
}

const handlers = new Map<string, (event: unknown, ...args: unknown[]) => unknown>();
const appListeners: Record<string, Listener> = {};
const exposed: Record<string, unknown> = {};
const notifications: Array<{ options: Record<string, unknown>; click?: () => void }> = [];
const openExternal = jest.fn().mockResolvedValue(undefined);
const installMenu = jest.fn();
const quit = jest.fn();

let userData: string;

jest.mock(
  'electron',
  () => ({
    app: {
      getPath: () => userData,
      getName: () => 'CareConnect',
      getVersion: () => '1.0.0',
      setAppUserModelId: jest.fn(),
      requestSingleInstanceLock: () => true,
      whenReady: () => Promise.resolve(),
      on: (event: string, listener: Listener) => {
        appListeners[event] = listener;
      },
      quit: () => quit(),
    },
    BrowserWindow: FakeBrowserWindow,
    ipcMain: {
      handle: (channel: string, handler: (event: unknown, ...args: unknown[]) => unknown) => {
        handlers.set(channel, handler);
      },
    },
    ipcRenderer: {
      // The renderer half of the round trip: whatever main registered answers.
      invoke: async (channel: string, ...args: unknown[]) => {
        const handler = handlers.get(channel);
        if (!handler) throw new Error(`No handler registered for ${channel}`);
        return handler({ sender: 'renderer' }, ...args);
      },
      on: jest.fn(),
      removeListener: jest.fn(),
    },
    contextBridge: {
      exposeInMainWorld: (key: string, value: unknown) => {
        exposed[key] = value;
      },
    },
    screen: {
      getAllDisplays: () => [{ workArea: { x: 0, y: 0, width: 1920, height: 1080 } }],
    },
    shell: { openExternal },
    Notification: Object.assign(
      jest.fn().mockImplementation((options: Record<string, unknown>) => {
        const record: { options: Record<string, unknown>; click?: () => void } = { options };
        return {
          on: (event: string, listener: () => void) => {
            if (event === 'click') record.click = listener;
          },
          show: () => notifications.push(record),
        };
      }),
      { isSupported: () => true },
    ),
  }),
  { virtual: true },
);

jest.mock('../menu', () => ({ installMenu: (...args: unknown[]) => installMenu(...args) }));

const settings: PersistedSettings = {
  visualAlertBanners: true,
  smartEscalation: false,
  captionsEnabled: true,
  captionSize: 'large',
  captionColor: 'yellow',
  alertVolume: 70,
  audioBalance: -10,
  vibrationEnabled: true,
};

/** Waits out `app.whenReady().then(...)`. */
const flush = () => new Promise((resolve) => setImmediate(resolve));

let bridge: CareConnectBridge;
let window: FakeBrowserWindow;

/**
 * Loads both processes fresh. A test that seeds a file on disk does so before
 * calling this, exactly as a previous session would have left it.
 */
async function launch() {
  jest.isolateModules(() => {
    /* eslint-disable @typescript-eslint/no-require-imports */
    require('../main');
    require('../preload');
    /* eslint-enable @typescript-eslint/no-require-imports */
  });
  await flush();
  bridge = exposed.careconnect as CareConnectBridge;
  window = FakeBrowserWindow.instances[FakeBrowserWindow.instances.length - 1];
}

beforeEach(() => {
  userData = mkdtempSync(join(tmpdir(), 'careconnect-main-'));
  handlers.clear();
  FakeBrowserWindow.instances = [];
  notifications.length = 0;
  for (const key of Object.keys(appListeners)) delete appListeners[key];
  openExternal.mockClear();
  installMenu.mockClear();
  quit.mockClear();
});

afterEach(() => {
  rmSync(userData, { recursive: true, force: true });
});

describe('IPC between the renderer and the main process', () => {
  it('registers a handler for every channel the preload exposes', async () => {
    await launch();
    expect([...handlers.keys()].sort()).toEqual([
      'app:get-info',
      'notification:show',
      'settings:clear',
      'settings:load',
      'settings:save',
      'window:get-state',
    ]);
  });

  it('round-trips settings through the main process to disk and back', async () => {
    await launch();

    expect(await bridge.settings.load()).toEqual({});
    await bridge.settings.save(settings);

    const onDisk = JSON.parse(
      readFileSync(join(userData, 'accessibility-settings.json'), 'utf8'),
    ) as unknown;
    expect(onDisk).toEqual(settings);
    expect(await bridge.settings.load()).toEqual(settings);
  });

  it('reads back settings a previous session saved', async () => {
    writeFileSync(join(userData, 'accessibility-settings.json'), JSON.stringify(settings));
    await launch();
    expect(await bridge.settings.load()).toEqual(settings);
  });

  it('clears saved settings', async () => {
    await launch();
    await bridge.settings.save(settings);
    await bridge.settings.clear();
    expect(await bridge.settings.load()).toEqual({});
  });

  it.each([
    ['null', null],
    ['an array', [1, 2, 3]],
    ['a string', 'captions on'],
  ])('rejects %s sent as settings instead of writing it', async (_label, payload) => {
    await launch();
    await expect(
      bridge.settings.save(payload as unknown as PersistedSettings),
    ).rejects.toThrow('Settings must be an object');
    expect(await bridge.settings.load()).toEqual({});
  });

  it('reports the app and runtime versions', async () => {
    await launch();
    expect(await bridge.app.getInfo()).toEqual({
      name: 'CareConnect',
      version: '1.0.0',
      electron: process.versions.electron,
      chrome: process.versions.chrome,
      node: process.versions.node,
      platform: process.platform,
    });
  });

  it('reports the live window state', async () => {
    await launch();
    window.bounds = { x: 40, y: 60, width: 1100, height: 760 };

    expect(await bridge.window.getState()).toMatchObject({
      width: 1100,
      height: 760,
      x: 40,
      y: 60,
      isMaximized: false,
    });
  });

  it('shows a silent OS notification, and clicking it brings the window back', async () => {
    await launch();
    window.minimized = true;

    expect(await bridge.notifications.show({ title: 'Alert sent', body: 'No sound.' })).toBe(true);
    expect(notifications).toHaveLength(1);
    expect(notifications[0].options).toMatchObject({
      title: 'Alert sent',
      body: 'No sound.',
      silent: true,
    });

    notifications[0].click?.();
    expect(window.minimized).toBe(false);
    expect(window.shown).toBe(true);
    expect(window.focused).toBe(true);
  });
});

describe('window management', () => {
  it('opens a sandboxed, isolated window with no Node in the renderer', async () => {
    await launch();
    expect(window.options.webPreferences).toMatchObject({
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    });
    expect(window.options.minWidth).toBeGreaterThan(0);
    expect(window.options.minHeight).toBeGreaterThan(0);
  });

  it('stays hidden until the first frame is painted', async () => {
    await launch();
    expect(window.options.show).toBe(false);
    expect(window.shown).toBe(false);
    window.onceListeners['ready-to-show']();
    expect(window.shown).toBe(true);
  });

  it('loads the bundled renderer and installs the native menu', async () => {
    await launch();
    expect(window.loadedFile).toMatch(/renderer[\\/]index\.html$/);
    expect(window.loadedUrl).toBeNull();
    expect(installMenu).toHaveBeenCalledWith(window);
  });

  it('opens with a default size on first launch', async () => {
    await launch();
    expect(window.options).toMatchObject({ width: 1280, height: 840 });
  });

  it('restores the size, position and maximised state from the last session', async () => {
    writeFileSync(
      join(userData, 'window-state.json'),
      JSON.stringify({ width: 1000, height: 700, x: 200, y: 120, isMaximized: true }),
    );
    await launch();

    expect(window.options).toMatchObject({ width: 1000, height: 700, x: 200, y: 120 });
    expect(window.maximized).toBe(true);
  });

  it('saves the size and position when the window closes', async () => {
    await launch();
    window.bounds = { x: 300, y: 150, width: 1024, height: 720 };
    window.listeners.close();

    const saved = JSON.parse(readFileSync(join(userData, 'window-state.json'), 'utf8')) as unknown;
    expect(saved).toMatchObject({ width: 1024, height: 720, x: 300, y: 150, isMaximized: false });
  });

  it('saves once a resize settles rather than on every event', async () => {
    await launch();
    jest.useFakeTimers();
    try {
      const file = join(userData, 'window-state.json');

      window.bounds = { x: 10, y: 10, width: 950, height: 650 };
      window.listeners.resize();
      window.listeners.move();
      jest.advanceTimersByTime(100);
      expect(() => readFileSync(file, 'utf8')).toThrow();

      jest.advanceTimersByTime(400);
      expect(JSON.parse(readFileSync(file, 'utf8'))).toMatchObject({ width: 950, height: 650 });
    } finally {
      jest.useRealTimers();
    }
  });

  it('opens https links in the browser and never in a new app window', async () => {
    await launch();
    const open = window.webContents.windowOpenHandler!;

    expect(open({ url: 'https://github.com/viclee1/careconnect-swen661' })).toEqual({
      action: 'deny',
    });
    expect(openExternal).toHaveBeenCalledWith('https://github.com/viclee1/careconnect-swen661');

    openExternal.mockClear();
    expect(open({ url: 'file:///etc/passwd' })).toEqual({ action: 'deny' });
    expect(openExternal).not.toHaveBeenCalled();
  });

  it('blocks navigation away from the shipped renderer', async () => {
    await launch();
    const event = { preventDefault: jest.fn() };
    window.webContents.listeners['will-navigate'](event, 'https://example.com');
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('focuses the existing window when a second copy is launched', async () => {
    await launch();
    window.minimized = true;
    appListeners['second-instance']();
    expect(window.minimized).toBe(false);
    expect(window.focused).toBe(true);
  });

  it('reopens a window from the dock when none are left', async () => {
    await launch();
    window.destroyed = true;
    appListeners.activate();
    expect(FakeBrowserWindow.getAllWindows()).toHaveLength(1);
  });

  it('quits when the last window closes, except on macOS', async () => {
    await launch();
    appListeners['window-all-closed']();
    if (process.platform === 'darwin') {
      expect(quit).not.toHaveBeenCalled();
    } else {
      expect(quit).toHaveBeenCalled();
    }
  });
});
