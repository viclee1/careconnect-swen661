/**
 * @jest-environment node
 */
import type { BrowserWindow, MenuItemConstructorOptions } from 'electron';

import type { MenuCommand } from '../../shared/ipc';
import { acceleratorFor, allShortcuts } from '../../shared/shortcuts';

/**
 * Electron cannot be loaded outside an Electron process, so the two pieces of
 * it the menu uses are replaced. `Menu.buildFromTemplate` is the identity
 * function here, which is exactly what the test wants: the thing worth checking
 * is the template, not Electron's rendering of it.
 */
jest.mock(
  'electron',
  () => ({
    Menu: {
      buildFromTemplate: (template: unknown) => template,
      setApplicationMenu: jest.fn(),
    },
    shell: { openExternal: jest.fn() },
  }),
  { virtual: true },
);

/* eslint-disable @typescript-eslint/no-require-imports */
const { buildMenu, installMenu } = require('../menu') as typeof import('../menu');
const electron = require('electron') as {
  Menu: { setApplicationMenu: jest.Mock };
  shell: { openExternal: jest.Mock };
};
/* eslint-enable @typescript-eslint/no-require-imports */

type Template = MenuItemConstructorOptions[];

const fakeWindow = {
  isDestroyed: () => false,
  webContents: { send: jest.fn() },
} as unknown as BrowserWindow;

function buildTemplate(isMac: boolean, onCommand?: (command: MenuCommand) => void): Template {
  return buildMenu(fakeWindow, { isMac, onCommand }) as unknown as Template;
}

/** Every item in the template, flattened through its submenus. */
function flatten(template: Template): MenuItemConstructorOptions[] {
  return template.flatMap((item) => {
    const submenu = Array.isArray(item.submenu) ? (item.submenu as Template) : [];
    return [item, ...flatten(submenu)];
  });
}

const topLevelLabels = (template: Template): string[] =>
  template.map((item) => (item.label ?? item.role ?? '').replace('&', ''));

describe('buildMenu', () => {
  it('builds the menus Assignment 8 asks for: File, Edit, View and Help', () => {
    const labels = topLevelLabels(buildTemplate(false));
    expect(labels).toEqual(
      expect.arrayContaining(['File', 'Edit', 'View', 'Go', 'Window', 'Help']),
    );
  });

  it('puts the application menu first on macOS and nowhere else', () => {
    expect(topLevelLabels(buildTemplate(true))[0]).toBe('CareConnect');
    expect(topLevelLabels(buildTemplate(false))[0]).toBe('File');
  });

  it('carries every bound shortcut from the shared table as an accelerator', () => {
    // The menu and the reference card are built from one table, so this is what
    // stops the card advertising a shortcut the menu does not actually bind.
    const items = flatten(buildTemplate(false));
    const accelerators = items.map((item) => item.accelerator).filter(Boolean);

    for (const spec of allShortcuts.filter((entry) => entry.command !== null)) {
      expect(accelerators).toContain(acceleratorFor(spec, false));
    }
  });

  it('uses the platform-native binding where the conventions differ', () => {
    const backOn = (isMac: boolean) =>
      flatten(buildTemplate(isMac)).find((item) => item.label === 'Back')?.accelerator;

    expect(backOn(false)).toBe('Alt+Left');
    expect(backOn(true)).toBe('Cmd+[');
  });

  it('sends the right command when a navigation item is chosen', () => {
    const onCommand = jest.fn();
    const items = flatten(buildTemplate(false, onCommand));

    const contacts = items.find((item) => item.label === 'Contacts');
    contacts?.click?.(
      undefined as never,
      undefined as never,
      undefined as never,
    );

    expect(onCommand).toHaveBeenCalledWith('navigate:contacts');
  });

  it('pushes the command to the renderer when no handler is supplied', () => {
    const items = flatten(buildMenu(fakeWindow, { isMac: false }) as unknown as Template);
    const settings = items.find((item) => item.label === 'Accessibility Settings');

    settings?.click?.(undefined as never, undefined as never, undefined as never);

    expect(fakeWindow.webContents.send).toHaveBeenCalledWith(
      'menu:command',
      'navigate:settings',
    );
  });

  it('leaves the platform its own editing commands rather than reimplementing them', () => {
    // Assignment 7's rule: standard OS shortcuts keep their normal behaviour.
    const roles = flatten(buildTemplate(false)).map((item) => item.role);
    expect(roles).toEqual(
      expect.arrayContaining(['undo', 'redo', 'cut', 'copy', 'paste', 'selectAll']),
    );
  });

  it('offers zoom under View, because zoom is an accessibility control here', () => {
    const roles = flatten(buildTemplate(false)).map((item) => item.role);
    expect(roles).toEqual(expect.arrayContaining(['zoomIn', 'zoomOut', 'resetZoom']));
  });

  it('reaches the accessibility statement from Help', () => {
    const help = buildTemplate(false).find((item) => item.role === 'help');
    const labels = (help?.submenu as Template).map((item) => item.label);
    expect(labels).toContain('Keyboard shortcuts');
    expect(labels).toContain('Accessibility Statement');
  });

  it('follows Windows conventions: About under Help, no macOS-only zoom role', () => {
    const windows = buildTemplate(false);
    const help = windows.find((item) => item.role === 'help')?.submenu as Template;
    const windowMenu = windows.find((item) => item.role === 'window')?.submenu as Template;

    expect(help.at(-1)?.role).toBe('about');
    expect(windowMenu.map((item) => item.role)).toEqual(['minimize', 'close']);

    // On macOS About lives in the application menu instead.
    const macHelp = buildTemplate(true).find((item) => item.role === 'help')?.submenu as Template;
    expect(macHelp.map((item) => item.role)).not.toContain('about');
  });

  it('gives every Windows top-level menu an Alt-key mnemonic', () => {
    const labels = buildTemplate(false).map((item) => item.label ?? '');
    for (const label of labels) expect(label).toMatch(/^&/);
  });

  it('does not expose developer tools in a packaged build', () => {
    const roles = flatten(buildTemplate(false)).map((item) => item.role);
    expect(roles).not.toContain('toggleDevTools');
  });

  it('opens the accessibility statement and the repository in the browser', () => {
    const help = buildTemplate(false).find((item) => item.role === 'help')?.submenu as Template;
    const click = (label: string) =>
      (help.find((item) => item.label === label)?.click as () => void)();

    click('Accessibility Statement');
    expect(electron.shell.openExternal).toHaveBeenLastCalledWith(
      'https://github.com/viclee1/careconnect-swen661/blob/main/ACCESSIBILITY.md',
    );

    click('Project Repository');
    expect(electron.shell.openExternal).toHaveBeenLastCalledWith(
      'https://github.com/viclee1/careconnect-swen661',
    );
  });

  it('sends nothing to a window that has already closed', () => {
    const send = jest.fn();
    const closed = { isDestroyed: () => true, webContents: { send } } as unknown as BrowserWindow;
    const template = buildMenu(closed, { isMac: false }) as unknown as Template;
    const home = flatten(template).find((item) => item.label === 'Home');

    (home?.click as () => void)();
    expect(send).not.toHaveBeenCalled();
  });
});

describe('installMenu', () => {
  it('installs the built menu as the application menu', () => {
    const menu = installMenu(fakeWindow);
    expect(electron.Menu.setApplicationMenu).toHaveBeenCalledWith(menu);
    expect(topLevelLabels(menu as unknown as Template)).toContain('Help');
  });
});
