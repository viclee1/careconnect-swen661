import { app, BrowserWindow, ipcMain, screen, shell } from 'electron';
import { join } from 'node:path';

import { invokeChannels, type AppInfo } from '../shared/ipc';
import { createJsonStore } from './jsonStore';
import { installMenu } from './menu';
import { appUserModelId, showNotification } from './notifications';
import {
  defaultWindowState,
  loadWindowState,
  minimumWindowSize,
  stateToPersist,
  toWindowStateInfo,
  type DisplayBounds,
  type StoredWindowState,
} from './windowState';

/**
 * The main process.
 *
 * It owns the window, the native menu, and the two files the app persists.
 * It renders nothing. The renderer, in turn, owns every pixel and reaches the
 * main process only through the narrow, typed surface in `preload.ts` — the
 * process separation Assignment 8 asks for, and the shape Electron's security
 * checklist requires.
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const devServerUrl = 'http://localhost:5273';

let mainWindow: BrowserWindow | null = null;

/** Where both JSON files live — `~/Library/Application Support/CareConnect` and friends. */
const storeDirectory = () => app.getPath('userData');

const windowStore = () =>
  createJsonStore<StoredWindowState>(storeDirectory(), 'window-state.json', defaultWindowState);

const settingsStore = () =>
  createJsonStore<Record<string, unknown>>(storeDirectory(), 'accessibility-settings.json', {});

const attachedDisplays = (): DisplayBounds[] =>
  screen.getAllDisplays().map((display) => ({ ...display.workArea }));

function createWindow(): BrowserWindow {
  const store = windowStore();
  const saved = loadWindowState(store, attachedDisplays());

  const window = new BrowserWindow({
    width: saved.width,
    height: saved.height,
    x: saved.x,
    y: saved.y,
    minWidth: minimumWindowSize.width,
    minHeight: minimumWindowSize.height,
    // The window is created hidden and shown on `ready-to-show`, so the user
    // never sees an unpainted frame. A blank white rectangle is a poor first
    // impression generally; for a screen-reader user it is a window whose
    // contents are announced before they exist.
    show: false,
    backgroundColor: '#FFFFFF',
    title: 'CareConnect',
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      // The three settings the Electron security checklist is built around.
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      // Zoom is an accessibility affordance here, so Ctrl/Cmd +/- must work.
      zoomFactor: 1,
      spellcheck: true,
    },
  });

  if (saved.isMaximized) window.maximize();

  window.once('ready-to-show', () => window.show());

  // Persisting on every resize event would write the file dozens of times per
  // drag; one write when the drag settles is enough.
  let saveTimer: NodeJS.Timeout | null = null;
  const persist = () => {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      if (window.isDestroyed() || window.isMinimized() || window.isFullScreen()) return;
      store.write(
        stateToPersist({
          bounds: window.getBounds(),
          normalBounds: window.getNormalBounds(),
          isMaximized: window.isMaximized(),
        }),
      );
    }, 400);
  };

  window.on('resize', persist);
  window.on('move', persist);
  window.on('maximize', persist);
  window.on('unmaximize', persist);
  window.on('close', () => {
    if (saveTimer) clearTimeout(saveTimer);
    if (window.isDestroyed()) return;
    store.write(
      stateToPersist({
        bounds: window.getBounds(),
        normalBounds: window.getNormalBounds(),
        isMaximized: window.isMaximized(),
      }),
    );
  });

  // An external link opens in the user's browser; nothing navigates the app
  // window away from the renderer we shipped.
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) void shell.openExternal(url);
    return { action: 'deny' };
  });

  window.webContents.on('will-navigate', (event, url) => {
    const allowed = isDevelopment && url.startsWith(devServerUrl);
    if (!allowed) event.preventDefault();
  });

  if (isDevelopment) {
    void window.loadURL(devServerUrl);
  } else {
    void window.loadFile(join(__dirname, '../renderer/index.html'));
  }

  installMenu(window);
  return window;
}

/**
 * The handlers behind `window.careconnect`.
 *
 * Each one takes no caller-supplied path or command — the renderer can ask for
 * its settings and nothing else, so a compromised renderer has no filesystem to
 * reach through.
 */
function registerIpcHandlers(): void {
  ipcMain.handle(invokeChannels.settingsLoad, () => settingsStore().read());

  ipcMain.handle(invokeChannels.settingsSave, (_event, settings: unknown) => {
    if (typeof settings !== 'object' || settings === null || Array.isArray(settings)) {
      throw new Error('Settings must be an object');
    }
    settingsStore().write(settings as Record<string, unknown>);
  });

  ipcMain.handle(invokeChannels.settingsClear, () => {
    settingsStore().clear();
  });

  ipcMain.handle(invokeChannels.windowGetState, () => {
    const window = mainWindow;
    if (!window || window.isDestroyed()) return toWindowStateInfo(defaultWindowState);
    return toWindowStateInfo(
      stateToPersist({
        bounds: window.getBounds(),
        normalBounds: window.getNormalBounds(),
        isMaximized: window.isMaximized(),
      }),
    );
  });

  ipcMain.handle(
    invokeChannels.appGetInfo,
    (): AppInfo => ({
      name: app.getName(),
      version: app.getVersion(),
      electron: process.versions.electron,
      chrome: process.versions.chrome,
      node: process.versions.node,
      platform: process.platform,
    }),
  );

  // Clicking a toast in the Windows Action Center brings the window back.
  ipcMain.handle(invokeChannels.notificationShow, (_event, notification: unknown) =>
    showNotification(notification, () => {
      if (!mainWindow || mainWindow.isDestroyed()) return;
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }),
  );
}

// Windows shows no toasts for an app without an Application User Model ID, and
// groups the taskbar button by it. It must be set before the first window.
if (process.platform === 'win32') app.setAppUserModelId(appUserModelId);

// One window is the whole application; a second instance focuses the first
// rather than opening a competing copy of the user's care record.
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  });

  void app.whenReady().then(() => {
    registerIpcHandlers();
    mainWindow = createWindow();

    app.on('activate', () => {
      // macOS keeps the application running with no windows; clicking the dock
      // icon is expected to bring one back.
      if (BrowserWindow.getAllWindows().length === 0) mainWindow = createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}
