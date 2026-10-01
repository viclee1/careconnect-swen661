import { contextBridge, ipcRenderer } from 'electron';

import { eventChannels, invokeChannels, type MenuCommand } from '../shared/ipc';
import type {
  AppInfo,
  CareConnectBridge,
  PersistedSettings,
  StoredSettings,
  WindowStateInfo,
} from '../shared/ipc';

/**
 * The bridge between the two processes.
 *
 * `ipcRenderer` itself is never exposed. The renderer gets these four objects
 * and nothing else, so there is no channel name it can invent and no way for
 * page content to reach the filesystem — which is the point of running with
 * `contextIsolation: true` and `nodeIntegration: false` in the first place.
 */
const bridge: CareConnectBridge = {
  settings: {
    load: (): Promise<StoredSettings> => ipcRenderer.invoke(invokeChannels.settingsLoad),
    save: (settings: PersistedSettings): Promise<void> =>
      ipcRenderer.invoke(invokeChannels.settingsSave, settings),
    clear: (): Promise<void> => ipcRenderer.invoke(invokeChannels.settingsClear),
  },

  window: {
    getState: (): Promise<WindowStateInfo> => ipcRenderer.invoke(invokeChannels.windowGetState),
  },

  app: {
    getInfo: (): Promise<AppInfo> => ipcRenderer.invoke(invokeChannels.appGetInfo),
  },

  onMenuCommand: (handler: (command: MenuCommand) => void): (() => void) => {
    // The Electron event object is deliberately not forwarded: it carries a
    // `sender` the renderer has no business holding.
    const listener = (_event: unknown, command: MenuCommand) => handler(command);
    ipcRenderer.on(eventChannels.menuCommand, listener);
    return () => {
      ipcRenderer.removeListener(eventChannels.menuCommand, listener);
    };
  },
};

contextBridge.exposeInMainWorld('careconnect', bridge);
