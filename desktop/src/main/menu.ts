import {
  Menu,
  shell,
  type BrowserWindow,
  type MenuItemConstructorOptions,
} from 'electron';

import { eventChannels, type MenuCommand } from '../shared/ipc';
import { acceleratorFor, shortcuts, type ShortcutSpec } from '../shared/shortcuts';

/**
 * The native application menu — File, Edit, View, Go, Help.
 *
 * Every navigation and action item is built from `shared/shortcuts.ts`, the
 * same table the renderer's Keyboard Shortcuts card prints, so the menu and the
 * documentation cannot disagree about what a key does.
 *
 * Edit and View are Electron's own roles rather than hand-rolled items. That is
 * the Assignment 7 rule about not fighting the OS: `Cmd+C` should be the
 * platform's copy, and `View → Zoom In` should be the platform's zoom, because
 * zoom is an accessibility affordance here and users expect it where it lives
 * on every other application.
 */
export function buildMenu(
  window: BrowserWindow,
  options: { isMac?: boolean; onCommand?: (command: MenuCommand) => void } = {},
): Menu {
  const isMac = options.isMac ?? process.platform === 'darwin';

  const send = (command: MenuCommand) => {
    if (options.onCommand) {
      options.onCommand(command);
      return;
    }
    if (!window.isDestroyed()) {
      window.webContents.send(eventChannels.menuCommand, command);
    }
  };

  /** Turns one row of the shortcut table into a menu item. */
  const item = (spec: ShortcutSpec): MenuItemConstructorOptions => ({
    label: spec.label,
    accelerator: acceleratorFor(spec, isMac),
    click: () => {
      if (spec.command) send(spec.command);
    },
  });

  const navigation = shortcuts.navigation;
  const actions = shortcuts.actions;
  const byLabel = (list: ShortcutSpec[], label: string): ShortcutSpec => {
    const found = list.find((spec) => spec.label === label);
    if (!found) throw new Error(`No shortcut named "${label}" in the shortcut table`);
    return found;
  };

  const template: MenuItemConstructorOptions[] = [
    ...(isMac
      ? ([
          {
            label: 'CareConnect',
            submenu: [
              { role: 'about' },
              { type: 'separator' },
              item(byLabel(navigation, 'Accessibility Settings')),
              { type: 'separator' },
              { role: 'services' },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideOthers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit' },
            ],
          },
        ] satisfies MenuItemConstructorOptions[])
      : []),

    {
      label: '&File',
      submenu: [
        item(byLabel(actions, 'Send message')),
        item(byLabel(actions, 'Alert this contact')),
        { type: 'separator' },
        ...(isMac
          ? []
          : ([
              item(byLabel(navigation, 'Accessibility Settings')),
              { type: 'separator' },
            ] satisfies MenuItemConstructorOptions[])),
        isMac ? { role: 'close' } : { role: 'quit' },
      ],
    },

    {
      label: '&Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
        { type: 'separator' },
        item(byLabel(actions, 'Find a contact')),
      ],
    },

    {
      label: '&View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { type: 'separator' },
        // Zoom is listed under View because that is where every desktop user
        // already looks for it, and because Assignment 7 counts zoom support as
        // an accessibility feature rather than a convenience.
        { role: 'resetZoom', label: 'Actual Size' },
        { role: 'zoomIn', label: 'Zoom In' },
        { role: 'zoomOut', label: 'Zoom Out' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        ...(process.env.NODE_ENV === 'development'
          ? ([{ type: 'separator' }, { role: 'toggleDevTools' }] satisfies MenuItemConstructorOptions[])
          : []),
      ],
    },

    {
      label: '&Go',
      submenu: [
        item(byLabel(navigation, 'Back')),
        { type: 'separator' },
        ...navigation
          .filter(
            (spec) => spec.label !== 'Back' && spec.label !== 'Accessibility Settings',
          )
          .map(item),
        { type: 'separator' },
        item(byLabel(navigation, 'Accessibility Settings')),
      ],
    },

    {
      role: 'window',
      label: '&Window',
      submenu: isMac
        ? [{ role: 'minimize' }, { role: 'zoom' }, { type: 'separator' }, { role: 'front' }]
        : [{ role: 'minimize' }, { role: 'zoom' }, { role: 'close' }],
    },

    {
      role: 'help',
      label: '&Help',
      submenu: [
        item(byLabel(actions, 'Keyboard shortcuts')),
        { type: 'separator' },
        {
          label: 'Accessibility Statement',
          click: () => {
            void shell.openExternal(
              'https://github.com/viclee1/careconnect-swen661/blob/main/ACCESSIBILITY.md',
            );
          },
        },
        {
          label: 'Project Repository',
          click: () => {
            void shell.openExternal('https://github.com/viclee1/careconnect-swen661');
          },
        },
      ],
    },
  ];

  return Menu.buildFromTemplate(template);
}

/** Builds the menu and installs it as the application menu. */
export function installMenu(window: BrowserWindow): Menu {
  const menu = buildMenu(window);
  Menu.setApplicationMenu(menu);
  return menu;
}
