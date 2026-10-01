/**
 * The contract between the main process and the renderer.
 *
 * Both sides import this file, so a channel cannot be renamed on one side and
 * left stale on the other — `tsc` catches it. Nothing here imports Electron, so
 * the renderer bundle stays free of Node built-ins.
 */

/**
 * The persisted shape of the accessibility preferences.
 *
 * Declared here rather than imported from the renderer so that neither process
 * has to compile the other's source tree. The renderer's
 * `AccessibilitySettings` narrows `captionSize` and `captionColor` to unions
 * and is therefore assignable to this; `settingsRepository.ts` asserts that at
 * compile time, so the two cannot drift apart unnoticed.
 */
export interface PersistedSettings {
  visualAlertBanners: boolean;
  smartEscalation: boolean;
  captionsEnabled: boolean;
  captionSize: string;
  captionColor: string;
  alertVolume: number;
  audioBalance: number;
  vibrationEnabled: boolean;
}

/** What comes back off disk: untrusted JSON the renderer has to coerce. */
export type StoredSettings = Record<string, unknown>;

/** Channels the renderer invokes on the main process and awaits a reply from. */
export const invokeChannels = {
  settingsLoad: 'settings:load',
  settingsSave: 'settings:save',
  settingsClear: 'settings:clear',
  windowGetState: 'window:get-state',
  appGetInfo: 'app:get-info',
} as const;

/** Channels the main process pushes to the renderer, unprompted. */
export const eventChannels = {
  /**
   * A menu item or accelerator fired. The renderer turns it into navigation or
   * an in-page action, so the native menu and the in-window UI can never drift
   * apart — there is exactly one list of commands, below.
   */
  menuCommand: 'menu:command',
} as const;

/**
 * Every command the native menu can send.
 *
 * Keyboard shortcuts are attached to these in `src/main/menu.ts` and printed
 * for the user by the Keyboard Shortcuts card in the renderer, both from the
 * same table, so the card cannot describe a shortcut the app does not have.
 */
export type MenuCommand =
  | 'navigate:home'
  | 'navigate:myDay'
  | 'navigate:appointments'
  | 'navigate:medicines'
  | 'navigate:memories'
  | 'navigate:contacts'
  | 'navigate:settings'
  | 'navigate:back'
  | 'contacts:find'
  | 'message:send'
  | 'message:notify'
  | 'help:shortcuts';

export interface AppInfo {
  name: string;
  version: string;
  electron: string;
  chrome: string;
  node: string;
  platform: NodeJS.Platform;
}

export interface WindowStateInfo {
  width: number;
  height: number;
  x?: number;
  y?: number;
  isMaximized: boolean;
}

/**
 * The surface `preload.ts` exposes on `window.careconnect`.
 *
 * This is the *whole* of what the renderer may reach — no `ipcRenderer`, no
 * `require`, no Node globals. Context isolation stays on and node integration
 * stays off, per the Electron security checklist.
 */
export interface CareConnectBridge {
  settings: {
    load(): Promise<StoredSettings>;
    save(settings: PersistedSettings): Promise<void>;
    clear(): Promise<void>;
  };
  window: {
    getState(): Promise<WindowStateInfo>;
  };
  app: {
    getInfo(): Promise<AppInfo>;
  };
  /** Subscribes to menu commands. Returns the unsubscribe function. */
  onMenuCommand(handler: (command: MenuCommand) => void): () => void;
}
