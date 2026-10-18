import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowLeftRight, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

import type { AppView } from '../../types';
import { navItems } from './navItems';

const STORAGE_KEY = 'careconnect_sidebar_collapsed';

function readCollapsed(): boolean {
  try {
    // Collapsed is the tablet default: the content column needs the room.
    return localStorage.getItem(STORAGE_KEY) !== 'false';
  } catch {
    return true;
  }
}

/**
 * The sidebar: tablet (768px+) and desktop (1024px+).
 *
 * Tablet — collapsible. Collapsed, it is a narrow rail that still prints every
 * label under its icon: CareConnect's users recognise words more reliably than
 * icons, so the rail never goes icon-only. "Expand menu" widens it to a full
 * list. The choice is remembered.
 * Desktop — always the full list; the toggle is not shown.
 *
 * Below 768px this whole element is display:none, so it is out of the
 * accessibility tree; the bottom bar or the Menu button takes over.
 */
export default function SideNav({
  view,
  onSwitchRole,
}: {
  view: AppView;
  onSwitchRole: () => void;
}) {
  const [collapsed, setCollapsed] = useState(readCollapsed);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed));
    } catch {
      // Storage unavailable — the toggle still works for this session.
    }
  }, [collapsed]);

  const items = navItems[view];
  const otherRole = view === 'patient' ? 'caregiver' : 'care recipient';

  return (
    <nav
      aria-label="Main navigation"
      data-collapsed={collapsed}
      className={[
        'hidden md:flex flex-col flex-shrink-0 order-1',
        'bg-white border-r-2 border-neutral-200',
        'md:px-2 lg:px-3 py-3 gap-1',
        collapsed ? 'md:w-24 lg:w-60' : 'md:w-60',
      ].join(' ')}
    >
      {/* Tablet-only toggle. aria-expanded says whether the labels are full. */}
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        aria-expanded={!collapsed}
        aria-controls="sidebar-links"
        className={[
          'lg:hidden flex items-center gap-2 rounded-lg px-3 py-2 min-h-[2.75rem]',
          'text-sm font-semibold text-neutral-600 hover:bg-neutral-100',
          collapsed ? 'flex-col justify-center gap-1 text-xs' : '',
        ].join(' ')}
      >
        {collapsed ? (
          <PanelLeftOpen className="w-5 h-5" aria-hidden="true" />
        ) : (
          <PanelLeftClose className="w-5 h-5" aria-hidden="true" />
        )}
        {collapsed ? 'Expand menu' : 'Collapse menu'}
      </button>

      <ul id="sidebar-links" role="list" className="flex flex-col gap-1 list-none p-0 m-0">
        {items.map(({ to, label, Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === '/app'}
              className={({ isActive }) =>
                [
                  'flex items-center rounded-lg no-underline font-medium',
                  'min-h-[2.75rem] transition-colors duration-150',
                  // Collapsed rail on tablet: icon above a short label.
                  collapsed
                    ? 'flex-col justify-center gap-1 px-1 py-2 text-xs text-center lg:flex-row lg:justify-start lg:gap-3 lg:px-3 lg:py-2.5 lg:text-base lg:text-left'
                    : 'gap-3 px-3 py-2.5 text-base',
                  isActive
                    ? 'bg-calm-100 text-calm-700 font-semibold'
                    : 'text-neutral-600 hover:text-calm-700 hover:bg-calm-50',
                ].join(' ')
              }
            >
              <Icon className="w-6 h-6 flex-shrink-0" aria-hidden="true" />
              <span className="leading-tight">{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-3 border-t border-neutral-200">
        <button
          type="button"
          onClick={onSwitchRole}
          className={[
            'w-full flex items-center rounded-lg font-medium text-neutral-600',
            'hover:text-calm-700 hover:bg-calm-50 min-h-[2.75rem] transition-colors',
            collapsed
              ? 'flex-col justify-center gap-1 px-1 py-2 text-xs text-center lg:flex-row lg:justify-start lg:gap-3 lg:px-3 lg:text-sm lg:text-left'
              : 'gap-3 px-3 py-2.5 text-sm',
          ].join(' ')}
        >
          <ArrowLeftRight className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
          Switch to {otherRole}
        </button>
      </div>
    </nav>
  );
}
