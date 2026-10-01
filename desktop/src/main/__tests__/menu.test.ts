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

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { buildMenu } = require('../menu') as typeof import('../menu');

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

  it('does not expose developer tools in a packaged build', () => {
    const roles = flatten(buildTemplate(false)).map((item) => item.role);
    expect(roles).not.toContain('toggleDevTools');
  });
});
