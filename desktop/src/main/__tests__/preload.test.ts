/**
 * @jest-environment node
 */
import type { CareConnectBridge } from '../../shared/ipc';

/**
 * The preload script's whole job is to put one object on `window` and to keep
 * `ipcRenderer` off it. Both halves of that are worth asserting, so Electron's
 * two relevant pieces are replaced and the module is loaded for real.
 */
const exposed: Record<string, unknown> = {};
const invoke = jest.fn().mockResolvedValue(undefined);
const on = jest.fn();
const removeListener = jest.fn();

jest.mock(
  'electron',
  () => ({
    contextBridge: {
      exposeInMainWorld: (key: string, value: unknown) => {
        exposed[key] = value;
      },
    },
    ipcRenderer: { invoke, on, removeListener },
  }),
  { virtual: true },
);

// eslint-disable-next-line @typescript-eslint/no-require-imports
require('../preload');

const bridge = exposed.careconnect as CareConnectBridge;

describe('preload', () => {
  beforeEach(() => {
    invoke.mockClear();
    on.mockClear();
    removeListener.mockClear();
  });

  it('exposes exactly one namespace on the window', () => {
    expect(Object.keys(exposed)).toEqual(['careconnect']);
  });

  it('exposes the four surfaces the renderer is allowed, and nothing else', () => {
    // No `ipcRenderer`, no `require`, no Node globals. A channel the renderer
    // can invent is a channel an injected script can invoke.
    expect(Object.keys(bridge).sort()).toEqual([
      'app',
      'onMenuCommand',
      'settings',
      'window',
    ]);
  });

  it.each([
    ['settings.load', () => bridge.settings.load(), 'settings:load', []],
    ['settings.clear', () => bridge.settings.clear(), 'settings:clear', []],
    ['window.getState', () => bridge.window.getState(), 'window:get-state', []],
    ['app.getInfo', () => bridge.app.getInfo(), 'app:get-info', []],
  ])('routes %s to its channel', async (_name, call, channel, args) => {
    await call();
    expect(invoke).toHaveBeenCalledWith(channel, ...args);
  });

  it('sends the settings object with a save', async () => {
    const settings = {
      visualAlertBanners: true,
      smartEscalation: true,
      captionsEnabled: true,
      captionSize: 'medium',
      captionColor: 'white',
      alertVolume: 0.7,
      audioBalance: 0,
      vibrationEnabled: true,
    };

    await bridge.settings.save(settings);

    expect(invoke).toHaveBeenCalledWith('settings:save', settings);
  });

  describe('onMenuCommand', () => {
    it('subscribes to the menu channel', () => {
      bridge.onMenuCommand(jest.fn());
      expect(on).toHaveBeenCalledWith('menu:command', expect.any(Function));
    });

    it('passes the command through without the Electron event object', () => {
      // The event carries a `sender` the renderer has no business holding.
      const handler = jest.fn();
      bridge.onMenuCommand(handler);

      const listener = on.mock.calls[0][1] as (event: unknown, command: string) => void;
      listener({ sender: 'the whole webContents' }, 'navigate:contacts');

      expect(handler).toHaveBeenCalledWith('navigate:contacts');
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0]).toHaveLength(1);
    });

    it('returns a working unsubscribe', () => {
      const unsubscribe = bridge.onMenuCommand(jest.fn());
      const listener = on.mock.calls[0][1];

      unsubscribe();

      expect(removeListener).toHaveBeenCalledWith('menu:command', listener);
    });
  });
});
