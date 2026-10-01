import { acceleratorFor, allShortcuts, type ShortcutSpec } from '../../shared/shortcuts';
import type { MenuCommand } from '../../shared/ipc';

/**
 * Matching an Electron accelerator against a browser `KeyboardEvent`.
 *
 * The renderer binds the shortcut table itself, as well as the native menu
 * doing so. That is not redundancy for its own sake: the menu is unavailable
 * when the renderer is served in a browser (`npm run dev:renderer`) and under
 * test, and a shortcut the test suite cannot press is a shortcut nobody has
 * checked. Binding both from the same table is what keeps them identical.
 */

export interface KeyEventLike {
  key: string;
  code?: string;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}

/** True when the event is the key combination this accelerator describes. */
export function matchesAccelerator(
  event: KeyEventLike,
  accelerator: string,
  isMac: boolean,
): boolean {
  const parts = accelerator.split('+');
  const wants = {
    primary: false,
    shift: false,
    alt: false,
    key: '',
  };

  for (const part of parts) {
    switch (part) {
      case 'CmdOrCtrl':
      case 'CommandOrControl':
        wants.primary = true;
        break;
      case 'Cmd':
      case 'Command':
        wants.primary = true;
        break;
      case 'Ctrl':
      case 'Control':
        wants.primary = true;
        break;
      case 'Shift':
        wants.shift = true;
        break;
      case 'Alt':
      case 'Option':
        wants.alt = true;
        break;
      default:
        wants.key = part;
    }
  }

  // `Cmd` on a Mac, `Ctrl` everywhere else. Requiring the *right* one matters:
  // Ctrl+F on a Mac is "move forward one character" in every Cocoa text field,
  // and stealing it would break the platform's own keyboard navigation.
  const primaryHeld = isMac ? event.metaKey : event.ctrlKey;
  const otherPrimaryHeld = isMac ? event.ctrlKey : event.metaKey;

  if (wants.primary !== primaryHeld) return false;
  if (otherPrimaryHeld) return false;
  if (wants.shift !== event.shiftKey) return false;
  if (wants.alt !== event.altKey) return false;

  return sameKey(event, wants.key);
}

function sameKey(event: KeyEventLike, wanted: string): boolean {
  if (!wanted) return false;

  switch (wanted) {
    case 'Enter':
      return event.key === 'Enter';
    case 'Left':
      return event.key === 'ArrowLeft';
    case 'Right':
      return event.key === 'ArrowRight';
    case 'Escape':
    case 'Esc':
      return event.key === 'Escape';
    default:
      break;
  }

  // Digits are compared through `code` where it is available, because on a
  // layout where Shift is needed for a digit the reported `key` is the symbol.
  if (/^[0-9]$/.test(wanted) && event.code) {
    return event.code === `Digit${wanted}` || event.key === wanted;
  }

  return event.key.toLowerCase() === wanted.toLowerCase();
}

/** The command this key event triggers, or null when it triggers nothing. */
export function commandForEvent(event: KeyEventLike, isMac: boolean): MenuCommand | null {
  const hit = allShortcuts.find(
    (spec: ShortcutSpec) =>
      spec.command !== null && matchesAccelerator(event, acceleratorFor(spec, isMac), isMac),
  );
  return hit?.command ?? null;
}
