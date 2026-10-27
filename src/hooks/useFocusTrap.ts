import { useEffect } from 'react';
import type { RefObject } from 'react';

const TABBABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),' +
  'textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Keeps keyboard focus inside a modal panel while it is open: focus moves in
 * on open, Tab and Shift+Tab wrap at the ends, Escape closes, and focus goes
 * back to `returnTo` when the panel closes — the same contract as
 * ConfirmDialog, shared by the navigation drawer and the shortcuts dialog.
 */
export function useFocusTrap(
  panelRef: RefObject<HTMLElement | null>,
  open: boolean,
  onClose: () => void,
  returnTo: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    const opener = returnTo.current;

    const initial =
      panel.querySelector<HTMLElement>('[data-autofocus]') ??
      panel.querySelector<HTMLElement>(TABBABLE);
    initial?.focus();

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = Array.from(panel!.querySelectorAll<HTMLElement>(TABBABLE));
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
    }

    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      // Back to the button that opened it, unless the close moved focus on
      // purpose (a link was followed and focus went to <main>).
      if (!document.activeElement || document.activeElement === document.body || panel.contains(document.activeElement)) {
        opener?.focus();
      }
    };
  }, [open, onClose, panelRef, returnTo]);
}
