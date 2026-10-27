import { useRef } from 'react';
import type { RefObject } from 'react';
import { Contrast, Heart, X } from 'lucide-react';

import { useFocusTrap } from '../../hooks/useFocusTrap';
import type { AppView } from '../../types';
import AppSearch from './AppSearch';
import NavPanel, { type Orientation } from './NavPanel';
import type { AppAlert } from './useAlerts';

/**
 * Phones and tablets (below 1024px): the header's Menu button slides this
 * panel in from the left, over a dimmed page — the design's mobile pattern.
 * It is a modal dialog: focus moves in and stays in, Escape or the close
 * button shuts it and returns focus to Menu, and following a link closes it.
 * The search field and the high-contrast switch, which the header only has
 * room for on desktop, are here too.
 */
export default function NavDrawer({
  open,
  onClose,
  buttonRef,
  view,
  orientation,
  alerts,
  caption,
  highContrast,
  onHighContrastChange,
  focusSearch = false,
}: {
  open: boolean;
  onClose: () => void;
  buttonRef: RefObject<HTMLButtonElement | null>;
  view: AppView;
  orientation: Orientation;
  alerts: AppAlert[];
  caption?: string;
  highContrast: boolean;
  onHighContrastChange: (on: boolean) => void;
  /** Start in the search field (opened by Ctrl+K) instead of on Close. */
  focusSearch?: boolean;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef, open, onClose, buttonRef);

  if (!open) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-50" role="presentation">
      <div className="absolute inset-0 bg-neutral-900/60" aria-hidden="true" onClick={onClose} />
      <div
        ref={panelRef}
        id="nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className="drawer-enter absolute inset-y-0 left-0 w-[85vw] max-w-[20rem] bg-white shadow-2xl flex flex-col overflow-y-auto"
      >
        <div className="flex items-center justify-between px-4 h-[4.25rem] border-b border-neutral-200 flex-shrink-0">
          <span className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-lg bg-calm-700 flex items-center justify-center" aria-hidden="true">
              <Heart className="w-5 h-5 text-white" fill="currentColor" />
            </span>
            <span className="text-lg text-calm-800">CareConnect</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="w-11 h-11 flex items-center justify-center rounded-lg text-neutral-700 hover:bg-neutral-100"
          >
            <X className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>
        <div className="px-4 pt-4">
          <AppSearch view={view} onNavigate={onClose} autoFocus={focusSearch} />
        </div>
        <nav aria-label="Main navigation" className="flex-1 flex flex-col">
          <NavPanel
            view={view}
            orientation={orientation}
            alerts={alerts}
            caption={caption}
            onNavigate={onClose}
          />
        </nav>
        <div className="border-t border-neutral-200 px-3 py-3">
          <button
            type="button"
            onClick={() => onHighContrastChange(!highContrast)}
            aria-pressed={highContrast}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-3 min-h-[3rem] text-base text-neutral-700 hover:bg-neutral-100"
          >
            <Contrast className="w-6 h-6 flex-shrink-0" aria-hidden="true" />
            <span className="flex-1 text-left">High contrast</span>
            <span className="text-sm text-neutral-600">{highContrast ? 'On' : 'Off'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
