import { NavLink } from 'react-router-dom';

import { navItems } from './navItems';

/**
 * The care recipient's bottom tab bar — mobile only (below 768px).
 *
 * The assignment's mobile pattern is a hamburger menu. For the care recipient
 * the team keeps an always-visible tab bar instead: a menu hidden behind a
 * button has to be remembered, and these users live with short-term memory
 * loss. Every destination stays on screen, with a word under each icon.
 * Caregivers get the hamburger (MobileMenu).
 */
export default function BottomNav() {
  return (
    <nav
      aria-label="Main navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-neutral-200 z-40 pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="flex items-stretch justify-around list-none p-0 m-0" role="list">
        {navItems.patient.map(({ to, label, Icon }) => (
          // min-w-0 lets each tab shrink below its label width, so long labels
          // truncate instead of forcing horizontal page scroll.
          <li key={to} className="flex-1 min-w-0">
            <NavLink
              to={to}
              end={to === '/app'}
              className={({ isActive }) =>
                [
                  'flex flex-col items-center justify-center gap-1',
                  'w-full min-w-0 py-2.5 px-1 min-h-[3.5rem]',
                  'text-xs font-medium no-underline transition-colors duration-150',
                  isActive ? 'text-calm-700 bg-calm-50' : 'text-neutral-600 hover:text-calm-700',
                ].join(' ')
              }
            >
              <Icon className="w-6 h-6 flex-shrink-0" aria-hidden="true" />
              <span className="leading-none w-full max-w-full text-center truncate">{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
