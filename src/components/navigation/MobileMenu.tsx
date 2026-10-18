import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowLeftRight } from 'lucide-react';

import { navItems } from './navItems';

/**
 * The caregiver's mobile navigation (below 768px): the panel the header's
 * "Menu" button opens — the hamburger pattern from the web design system.
 *
 * A disclosure, not a modal: it opens in the page flow under the header and
 * pushes the content down rather than covering it, so there is nothing behind
 * it to trap focus away from. The Menu button carries aria-expanded and
 * aria-controls; the panel comes straight after the header in the source, so
 * the next Tab after the button is the first link. Escape closes it and
 * returns focus to the button; following a link closes it (Layout closes it on
 * every route change).
 */
export default function MobileMenu({
  open,
  onClose,
  buttonRef,
  onSwitchRole,
}: {
  open: boolean;
  onClose: () => void;
  buttonRef: RefObject<HTMLButtonElement | null>;
  onSwitchRole: () => void;
}) {
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      const inside =
        panelRef.current?.contains(document.activeElement) ||
        document.activeElement === buttonRef.current;
      if (!inside) return;
      event.preventDefault();
      onClose();
      buttonRef.current?.focus();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose, buttonRef]);

  if (!open) return null;

  return (
    <nav
      ref={panelRef}
      id="mobile-menu"
      aria-label="Main navigation"
      className="md:hidden bg-white border-b-2 border-neutral-200 shadow-sm px-3 py-2"
    >
      <ul role="list" className="flex flex-col gap-1 list-none p-0 m-0">
        {navItems.caregiver.map(({ to, label, Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === '/app'}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-3 py-3 rounded-lg min-h-[3rem]',
                  'text-base font-medium no-underline transition-colors',
                  isActive
                    ? 'bg-calm-100 text-calm-700 font-semibold'
                    : 'text-neutral-700 hover:bg-calm-50 hover:text-calm-700',
                ].join(' ')
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              {label}
            </NavLink>
          </li>
        ))}
        <li className="border-t border-neutral-200 mt-1 pt-1">
          <button
            type="button"
            onClick={() => {
              onClose();
              onSwitchRole();
            }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg min-h-[3rem] text-base font-medium text-neutral-700 hover:bg-calm-50"
          >
            <ArrowLeftRight className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            Switch to care recipient
          </button>
        </li>
      </ul>
    </nav>
  );
}
