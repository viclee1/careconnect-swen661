import { useEffect, useRef, type KeyboardEvent } from 'react';

import {
  acceleratorFor,
  keysFor,
  shortcutGroupTitles,
  shortcuts,
  type ShortcutGroup,
} from '../../shared/shortcuts';
import { isMacPlatform } from '../platform/bridge';
import { Button } from './Button';
import { Icon } from './Icon';

/**
 * The printable keyboard reference card Assignment 7 asks for.
 *
 * It is built from `shared/shortcuts.ts` — the same table the native menu hangs
 * its accelerators off — so the card cannot advertise a shortcut the
 * application does not have. Navigation comes first and editing last, which is
 * the order the assignment specifies: the essential commands before the ones a
 * user already knows from every other application.
 *
 * Key names are spelled out (`Ctrl`, `Cmd`, `Shift`, `Enter`) rather than drawn
 * as symbols, and only this platform's bindings are printed, because a card
 * listing both is a card the reader has to filter before they can use it.
 */
export function ShortcutsDialog({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const isMac = isMacPlatform();

  // Focus moves into the dialog on open and returns to whatever opened it on
  // close, which is the whole of what makes a modal usable from the keyboard.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => opener?.focus?.();
  }, []);

  /**
   * The focus trap.
   *
   * Written out rather than pulled from a library because it is eight lines and
   * because a modal whose focus escapes to the page behind it is, for a
   * keyboard-only user, a modal they cannot close.
   */
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== 'Tab') return;

    const focusable = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    ).filter((element) => !element.hasAttribute('disabled'));

    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      className="dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
        onKeyDown={onKeyDown}
      >
        <div className="dialog__header">
          <Icon name="keyboard" size={24} />
          <h1 className="dialog__title" id="shortcuts-title">
            Keyboard shortcuts
          </h1>
          <Button
            label="Print"
            icon="print"
            variant="outlined"
            onClick={() => window.print()}
          />
          <Button
            ref={closeRef}
            label="Close"
            icon="close"
            variant="quiet"
            onClick={onClose}
          />
        </div>

        <div className="dialog__body">
          <p>
            These work anywhere in CareConnect. The same commands are in the
            menu bar, so nothing here is the only way to do something.
          </p>

          {(Object.keys(shortcuts) as ShortcutGroup[]).map((group) => (
            <table className="shortcut-table" key={group}>
              <caption>{shortcutGroupTitles[group]}</caption>
              <thead>
                <tr>
                  <th scope="col">Keys</th>
                  <th scope="col">Action</th>
                  <th scope="col">What it does</th>
                </tr>
              </thead>
              <tbody>
                {shortcuts[group].map((spec) => (
                  <tr key={spec.label}>
                    <td>
                      {keysFor(acceleratorFor(spec, isMac), isMac).map((key, index) => (
                        <span key={key}>
                          {index > 0 ? ' + ' : ''}
                          <kbd>{key}</kbd>
                        </span>
                      ))}
                    </td>
                    <td>{spec.label}</td>
                    <td>{spec.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ))}

          <table className="shortcut-table">
            <caption>Moving around with the keyboard</caption>
            <thead>
              <tr>
                <th scope="col">Keys</th>
                <th scope="col">What it does</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <kbd>Tab</kbd>
                </td>
                <td>Move to the next button, link or field.</td>
              </tr>
              <tr>
                <td>
                  <kbd>Shift</kbd> + <kbd>Tab</kbd>
                </td>
                <td>Move to the previous one.</td>
              </tr>
              <tr>
                <td>
                  <kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd>
                </td>
                <td>
                  Move within a group — the sidebar, a set of choices, or a
                  slider.
                </td>
              </tr>
              <tr>
                <td>
                  <kbd>Enter</kbd>
                </td>
                <td>Activate whatever is focused.</td>
              </tr>
              <tr>
                <td>
                  <kbd>Space</kbd>
                </td>
                <td>Activate a button, or switch a setting on and off.</td>
              </tr>
              <tr>
                <td>
                  <kbd>Esc</kbd>
                </td>
                <td>Close this card, leave a conversation, or clear a search box.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
