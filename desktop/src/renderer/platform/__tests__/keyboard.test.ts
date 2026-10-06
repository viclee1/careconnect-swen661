import { allShortcuts } from '../../../shared/shortcuts';
import { commandForEvent, matchesAccelerator, type KeyEventLike } from '../keyboard';

const event = (overrides: Partial<KeyEventLike> = {}): KeyEventLike => ({
  key: '',
  ctrlKey: false,
  metaKey: false,
  shiftKey: false,
  altKey: false,
  ...overrides,
});

describe('matchesAccelerator', () => {
  it('resolves CmdOrCtrl to Cmd on a Mac', () => {
    expect(matchesAccelerator(event({ key: 'f', metaKey: true }), 'CmdOrCtrl+F', true)).toBe(
      true,
    );
    expect(matchesAccelerator(event({ key: 'f', ctrlKey: true }), 'CmdOrCtrl+F', true)).toBe(
      false,
    );
  });

  it('resolves CmdOrCtrl to Ctrl everywhere else', () => {
    expect(matchesAccelerator(event({ key: 'f', ctrlKey: true }), 'CmdOrCtrl+F', false)).toBe(
      true,
    );
    expect(matchesAccelerator(event({ key: 'f', metaKey: true }), 'CmdOrCtrl+F', false)).toBe(
      false,
    );
  });

  it('does not fire when the other platform modifier is also held', () => {
    // Ctrl+Cmd+F is a different gesture from Cmd+F, and on a Mac it is one the
    // OS may have bound itself. Claiming it would be taking a key that is not
    // ours, which Assignment 7 rules out explicitly.
    expect(
      matchesAccelerator(event({ key: 'f', metaKey: true, ctrlKey: true }), 'CmdOrCtrl+F', true),
    ).toBe(false);
  });

  it('requires Shift when the accelerator asks for it, and rejects it otherwise', () => {
    const accel = 'CmdOrCtrl+Shift+N';
    expect(
      matchesAccelerator(event({ key: 'n', ctrlKey: true, shiftKey: true }), accel, false),
    ).toBe(true);
    expect(matchesAccelerator(event({ key: 'n', ctrlKey: true }), accel, false)).toBe(false);
    // And a plain Ctrl+N must not be swallowed by the Shift binding.
    expect(
      matchesAccelerator(event({ key: 'n', ctrlKey: true }), 'CmdOrCtrl+Shift+N', false),
    ).toBe(false);
  });

  it('matches a digit through the physical key, not the printed symbol', () => {
    // On a layout where a digit needs Shift, `key` is the symbol; `code` is not.
    expect(
      matchesAccelerator(event({ key: '&', code: 'Digit1', ctrlKey: true }), 'CmdOrCtrl+1', false),
    ).toBe(true);
  });

  it('understands the named keys the shortcut table uses', () => {
    expect(
      matchesAccelerator(event({ key: 'Enter', metaKey: true }), 'CmdOrCtrl+Enter', true),
    ).toBe(true);
    expect(matchesAccelerator(event({ key: 'ArrowLeft', altKey: true }), 'Alt+Left', false)).toBe(
      true,
    );
    expect(matchesAccelerator(event({ key: ',', ctrlKey: true }), 'CmdOrCtrl+,', false)).toBe(
      true,
    );
  });

  it('ignores a bare key press with no modifier', () => {
    expect(matchesAccelerator(event({ key: 'f' }), 'CmdOrCtrl+F', false)).toBe(false);
  });

  it.each(['CommandOrControl', 'Cmd', 'Command', 'Ctrl', 'Control'])(
    'treats %s as the platform modifier',
    (modifier) => {
      expect(matchesAccelerator(event({ key: 'f', ctrlKey: true }), `${modifier}+F`, false)).toBe(
        true,
      );
      expect(matchesAccelerator(event({ key: 'f', metaKey: true }), `${modifier}+F`, true)).toBe(
        true,
      );
    },
  );

  it('accepts Option as a spelling of Alt', () => {
    expect(matchesAccelerator(event({ key: 'ArrowLeft', altKey: true }), 'Option+Left', true)).toBe(
      true,
    );
  });

  it('maps Right, Esc and Escape to the keys the browser reports', () => {
    expect(matchesAccelerator(event({ key: 'ArrowRight', altKey: true }), 'Alt+Right', false)).toBe(
      true,
    );
    for (const name of ['Esc', 'Escape']) {
      expect(matchesAccelerator(event({ key: 'Escape', ctrlKey: true }), `Ctrl+${name}`, false)).toBe(
        true,
      );
    }
  });

  it('matches nothing when the accelerator has no key', () => {
    expect(matchesAccelerator(event({ key: 'Control', ctrlKey: true }), 'Ctrl', false)).toBe(false);
  });
});

describe('commandForEvent', () => {
  it('maps a key press to the command the shortcut table names', () => {
    expect(commandForEvent(event({ key: '6', code: 'Digit6', ctrlKey: true }), false)).toBe(
      'navigate:contacts',
    );
    expect(commandForEvent(event({ key: ',', metaKey: true }), true)).toBe('navigate:settings');
    expect(
      commandForEvent(event({ key: 'n', ctrlKey: true, shiftKey: true }), false),
    ).toBe('message:notify');
  });

  it('returns null for a key press nothing is bound to', () => {
    expect(commandForEvent(event({ key: 'q', ctrlKey: true }), false)).toBeNull();
    expect(commandForEvent(event({ key: 'a' }), false)).toBeNull();
  });

  it('never claims a platform editing shortcut', () => {
    // Copy, cut, paste, undo and select-all are listed on the reference card so
    // users can find them, but with `command: null` — they belong to the OS and
    // the renderer must not intercept them.
    for (const key of ['c', 'x', 'v', 'z', 'a']) {
      expect(commandForEvent(event({ key, ctrlKey: true }), false)).toBeNull();
    }
  });

  it('leaves every table entry either bound or deliberately unbound', () => {
    for (const spec of allShortcuts) {
      expect(spec.command === null || typeof spec.command === 'string').toBe(true);
    }
  });
});
