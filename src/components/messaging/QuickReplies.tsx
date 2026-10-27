import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { MessageSquareText } from 'lucide-react';

import { quickReplies } from '../../models/quickReplies';

/**
 * A menu of ready-made replies beside the message field.
 *
 * Built as a menu button: Enter, Space or Down opens it with focus on the first
 * reply, the arrow keys, Home and End move through it, Escape or Tab closes it,
 * and Escape puts focus back on the button. Choosing a reply puts it in the
 * message field rather than sending it, so the user can still read it over
 * and change it first.
 */
export default function QuickReplies({ onChoose }: { onChoose: (reply: string) => void }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (open) itemRefs.current[0]?.focus();
  }, [open]);

  // A click anywhere else closes the menu.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  function close(returnFocus: boolean) {
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  }

  function onMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const items = itemRefs.current.filter(Boolean) as HTMLButtonElement[];
    const index = items.indexOf(document.activeElement as HTMLButtonElement);
    const focusAt = (i: number) => items[(i + items.length) % items.length]?.focus();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        focusAt(index + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        focusAt(index - 1);
        break;
      case 'Home':
        event.preventDefault();
        focusAt(0);
        break;
      case 'End':
        event.preventDefault();
        focusAt(items.length - 1);
        break;
      case 'Escape':
        // Handled here, so the conversation's own Escape (back to Contacts)
        // does not also fire.
        event.preventDefault();
        event.stopPropagation();
        close(true);
        break;
      case 'Tab':
        close(false);
        break;
    }
  }

  return (
    <div ref={wrapperRef} className="relative flex-shrink-0">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        data-testid="quick-replies"
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' && !open) {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className="inline-flex items-center justify-center gap-2 min-h-touch min-w-touch rounded-xl border-2 border-neutral-300 bg-white px-0 md:px-3 text-calm-700 hover:bg-calm-50"
      >
        <MessageSquareText className="w-5 h-5" aria-hidden="true" />
        <span className="sr-only md:not-sr-only text-sm font-semibold">Quick replies</span>
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label="Quick replies"
          onKeyDown={onMenuKeyDown}
          className="absolute bottom-full left-0 mb-2 z-30 w-[min(20rem,calc(100vw-2rem))] rounded-xl border-2 border-neutral-200 bg-white p-1 shadow-card-hover"
        >
          {quickReplies.map((reply, index) => (
            <button
              key={reply}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              type="button"
              role="menuitem"
              tabIndex={-1}
              onClick={() => {
                onChoose(reply);
                setOpen(false);
              }}
              className="block w-full text-left rounded-lg px-3 py-2.5 text-neutral-800 hover:bg-calm-50 focus:bg-calm-50"
            >
              {reply}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
