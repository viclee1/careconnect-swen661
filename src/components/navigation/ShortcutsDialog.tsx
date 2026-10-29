import { useRef } from 'react';
import type { RefObject } from 'react';
import { Keyboard, X } from 'lucide-react';

import { useFocusTrap } from '../../hooks/useFocusTrap';

const shortcuts: [keys: string[], what: string][] = [
  [['Ctrl', 'K'], 'Search medicines, appointments and people (⌘K on a Mac)'],
  [['Tab'], 'Move to the next button or link'],
  [['Space'], 'Tick a medicine or a My Day task'],
  [['/'], 'On Contacts: jump to “Find a contact”'],
  [['Esc'], 'Close a menu or dialog; leave a conversation'],
];

/** The header's keyboard button: every shortcut, written out. */
export default function ShortcutsDialog({
  open,
  onClose,
  buttonRef,
}: {
  open: boolean;
  onClose: () => void;
  buttonRef: RefObject<HTMLButtonElement | null>;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef, open, onClose, buttonRef);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      <div className="absolute inset-0 bg-neutral-900/50" aria-hidden="true" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
        className="relative z-10 w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close keyboard shortcuts"
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
        <h2 id="shortcuts-title" className="flex items-center gap-3 text-xl font-bold text-neutral-800 pr-12 mb-4">
          <Keyboard className="w-6 h-6 text-calm-700" aria-hidden="true" />
          Keyboard shortcuts
        </h2>
        <dl className="m-0 space-y-3">
          {shortcuts.map(([keys, what]) => (
            <div key={what} className="flex items-start gap-4">
              <dt className="flex gap-1 flex-shrink-0 w-24">
                {keys.map((key) => (
                  <kbd
                    key={key}
                    className="rounded-md border border-neutral-300 bg-neutral-50 px-2 py-0.5 text-sm font-mono text-neutral-800"
                  >
                    {key}
                  </kbd>
                ))}
              </dt>
              <dd className="m-0 text-base text-neutral-700">{what}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
