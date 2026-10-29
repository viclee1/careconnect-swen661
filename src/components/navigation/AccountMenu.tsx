import { useEffect, useId, useRef, useState } from 'react';
import { ArrowLeftRight, LogOut } from 'lucide-react';

import type { AppView } from '../../types';

/**
 * The avatar at the right of the header: the user's initial and first name,
 * with the alerts count on a red badge as in the design. It opens a small
 * account menu — switching role and signing out live here now that the header
 * no longer spells them out. A disclosure: Escape or a click elsewhere closes
 * it and focus goes back to the avatar.
 */
export default function AccountMenu({
  name,
  view,
  alertCount,
  onSwitchRole,
  onSignOut,
}: {
  name: string;
  view: AppView;
  alertCount: number;
  onSwitchRole: () => void;
  onSignOut: () => void;
}) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const firstName = name.split(' ')[0] || 'Account';
  const otherRole = view === 'patient' ? 'caregiver' : 'care recipient';

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      setOpen(false);
      buttonRef.current?.focus();
    }
    function onPointer(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((o) => !o)}
        className="relative flex items-center gap-2 rounded-pill border border-neutral-200 bg-white p-1 lg:pr-4 min-h-[2.9rem] hover:bg-neutral-50"
      >
        <span
          className="w-9 h-9 rounded-full bg-calm-800 text-white flex items-center justify-center text-base font-semibold"
          aria-hidden="true"
        >
          {firstName[0]?.toUpperCase()}
        </span>
        {/* The name is printed from 1024px and read out at every width, so
            the button is named by its visible words (WCAG 2.5.3). */}
        <span className="sr-only lg:not-sr-only text-base text-neutral-800">{firstName}</span>
        <span className="sr-only">, account menu</span>
        {alertCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[1.3rem] h-[1.3rem] px-1 rounded-full bg-alert-600 text-white text-xs font-bold leading-[1.3rem] text-center">
            <span className="sr-only">, </span>
            {alertCount}
            <span className="sr-only"> {alertCount === 1 ? 'alert' : 'alerts'}</span>
          </span>
        )}
      </button>

      <div
        id={menuId}
        hidden={!open}
        className="absolute right-0 mt-2 w-64 rounded-xl border border-neutral-200 bg-white shadow-lg p-2 z-50"
      >
        <p className="px-3 pt-2 pb-1 m-0 text-base font-semibold text-neutral-800">{name}</p>
        <p className="px-3 pb-2 m-0 text-sm text-neutral-600">
          Using CareConnect as {view === 'patient' ? 'the care recipient' : 'a caregiver'}
        </p>
        <hr className="border-neutral-200 my-1" />
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            onSwitchRole();
          }}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 min-h-[2.75rem] text-base text-neutral-700 hover:bg-neutral-100"
        >
          <ArrowLeftRight className="w-5 h-5" aria-hidden="true" />
          Switch to {otherRole}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            onSignOut();
          }}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 min-h-[2.75rem] text-base text-neutral-700 hover:bg-neutral-100"
        >
          <LogOut className="w-5 h-5" aria-hidden="true" />
          Sign out
        </button>
      </div>
    </div>
  );
}
