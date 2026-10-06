import type { MenuCommand } from './ipc';

/**
 * The one table of keyboard shortcuts.
 *
 * `src/main/menu.ts` hangs the native menu's accelerators off it and the
 * renderer's Keyboard Shortcuts card prints it, so the card cannot advertise a
 * shortcut the application does not actually have. Assignment 7 asks for a
 * printable reference available from Help — this is its source.
 */
export interface ShortcutSpec {
  /** Electron accelerator syntax. `CmdOrCtrl` resolves per platform. */
  accelerator: string;
  /**
   * The macOS accelerator, where the platform's own convention differs.
   *
   * Assignment 7's rule is that a shortcut with a platform-specific convention
   * uses the native one rather than forcing a single binding everywhere — Back
   * is `Alt+←` on Windows and Linux but `Cmd+[` on a Mac.
   */
  macAccelerator?: string;
  /** The menu item and reference-card wording. */
  label: string;
  /** What it does, in a sentence, for the reference card. */
  description: string;
  /** Null for shortcuts the platform handles natively (copy, paste, undo). */
  command: MenuCommand | null;
}

/** The accelerator this platform should bind and print. */
export function acceleratorFor(spec: ShortcutSpec, isMac: boolean): string {
  return isMac && spec.macAccelerator ? spec.macAccelerator : spec.accelerator;
}

export type ShortcutGroup = 'navigation' | 'actions' | 'editing';

export const shortcutGroupTitles: Record<ShortcutGroup, string> = {
  navigation: 'Getting around',
  actions: 'Doing things',
  editing: 'Editing text',
};

export const shortcuts: Record<ShortcutGroup, ShortcutSpec[]> = {
  navigation: [
    {
      accelerator: 'CmdOrCtrl+1',
      label: 'Home',
      description: 'Open Home.',
      command: 'navigate:home',
    },
    {
      accelerator: 'CmdOrCtrl+2',
      label: 'My Day',
      description: 'Open My Day.',
      command: 'navigate:myDay',
    },
    {
      accelerator: 'CmdOrCtrl+3',
      label: 'Appointments',
      description: 'Open Appointments.',
      command: 'navigate:appointments',
    },
    {
      accelerator: 'CmdOrCtrl+4',
      label: 'Medicines',
      description: 'Open Medicines.',
      command: 'navigate:medicines',
    },
    {
      accelerator: 'CmdOrCtrl+5',
      label: 'Memories',
      description: 'Open Memories.',
      command: 'navigate:memories',
    },
    {
      accelerator: 'CmdOrCtrl+6',
      label: 'Contacts',
      description: 'Open Contacts.',
      command: 'navigate:contacts',
    },
    {
      accelerator: 'CmdOrCtrl+,',
      label: 'Accessibility Settings',
      description: 'Open Accessibility Settings.',
      command: 'navigate:settings',
    },
    {
      accelerator: 'Alt+Left',
      macAccelerator: 'Cmd+[',
      label: 'Back',
      description: 'Go back to the page you came from. Esc does the same thing.',
      command: 'navigate:back',
    },
  ],
  actions: [
    {
      accelerator: 'CmdOrCtrl+F',
      label: 'Find a contact',
      description: 'Jump to the Contacts search box and filter the list as you type.',
      command: 'contacts:find',
    },
    {
      accelerator: 'CmdOrCtrl+Enter',
      label: 'Send message',
      description: 'Send what you have typed, from anywhere in a conversation.',
      command: 'message:send',
    },
    {
      accelerator: 'CmdOrCtrl+Shift+N',
      label: 'Alert this contact',
      description:
        'Send a silent visual flash and vibration to the person you are messaging. Nothing rings.',
      command: 'message:notify',
    },
    {
      accelerator: 'CmdOrCtrl+/',
      label: 'Keyboard shortcuts',
      description: 'Show this reference card.',
      command: 'help:shortcuts',
    },
  ],
  editing: [
    { accelerator: 'CmdOrCtrl+C', label: 'Copy', description: 'Copy the selection.', command: null },
    { accelerator: 'CmdOrCtrl+X', label: 'Cut', description: 'Cut the selection.', command: null },
    {
      accelerator: 'CmdOrCtrl+V',
      label: 'Paste',
      description: 'Paste the clipboard.',
      command: null,
    },
    {
      accelerator: 'CmdOrCtrl+Z',
      label: 'Undo',
      description: 'Undo the last edit.',
      command: null,
    },
    {
      accelerator: 'CmdOrCtrl+A',
      label: 'Select all',
      description: 'Select everything in the current field.',
      command: null,
    },
  ],
};

/** Every shortcut, flattened, for lookups. */
export const allShortcuts: ShortcutSpec[] = Object.values(shortcuts).flat();

/**
 * Turns an accelerator into the keys a reader should press on their platform.
 *
 * Assignment 7 requires that Windows/Linux and macOS be shown separately where
 * they differ and that key labels be spelled out, so `CmdOrCtrl+Shift+N` reads
 * as `Cmd + Shift + N` on a Mac and `Ctrl + Shift + N` everywhere else.
 */
export function keysFor(accelerator: string, isMac: boolean): string[] {
  return accelerator.split('+').map((key) => {
    switch (key) {
      case 'CmdOrCtrl':
      case 'CommandOrControl':
        return isMac ? 'Cmd' : 'Ctrl';
      case 'Cmd':
      case 'Command':
        return 'Cmd';
      case 'Alt':
        return isMac ? 'Option' : 'Alt';
      case 'Left':
        return '←';
      case ',':
        return 'Comma';
      case '/':
        return 'Slash';
      default:
        return key;
    }
  });
}

/** The printed form of a shortcut — "Ctrl + Shift + N". */
export function shortcutLabel(accelerator: string, isMac: boolean): string {
  return keysFor(accelerator, isMac).join(' + ');
}
