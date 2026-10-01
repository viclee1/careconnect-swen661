import { useRef, type KeyboardEvent } from 'react';

import { Icon } from '../components/Icon';
import { isMacPlatform } from '../platform/bridge';
import { shortcutLabel } from '../../shared/shortcuts';
import { destinations } from './destinations';
import { useNavigation } from './NavigationProvider';

/**
 * The persistent left sidebar — the desktop counterpart of the phone's bottom
 * tab bar, and the pattern Assignment 7 settled on: primary navigation stays
 * visible on the side, and the underlying workflow matches the mobile client so
 * a user moving between devices does not have to relearn the application.
 *
 * Three things mark the current page: a filled background, a border, and bold
 * text — plus `aria-current="page"`, which is what a screen reader announces.
 * None of them is colour on its own.
 */
export function Sidebar({ onShowShortcuts }: { onShowShortcuts: () => void }) {
  const { activeDestination, route, navigate } = useNavigation();
  const listRef = useRef<HTMLDivElement>(null);
  const isMac = isMacPlatform();

  /**
   * Arrow-key movement inside the navigation list, per the Assignment 7
   * keyboard table. Every item stays in the tab order as well — a landmark's
   * links are expected to be tabbable, and taking that away to implement a
   * roving tabindex would trade one convention for another rather than adding
   * anything.
   */
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;

    const items = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>('button') ?? [],
    );
    const index = items.indexOf(document.activeElement as HTMLButtonElement);
    if (index === -1) return;

    event.preventDefault();
    const step = event.key === 'ArrowDown' ? 1 : -1;
    const next = (index + step + items.length) % items.length;
    items[next]?.focus();
  };

  return (
    <nav className="sidebar on-dark" aria-label="Main">
      <div className="sidebar__brand">
        <Icon name="logo" size={28} />
        <span className="sidebar__brand-text">
          <strong>CareConnect</strong>
          <span>Margaret Whitfield</span>
        </span>
      </div>

      <div className="sidebar__nav" ref={listRef} onKeyDown={onKeyDown}>
        {destinations.map((entry) => {
          const current = entry.destination === activeDestination;
          return (
            <button
              key={entry.destination}
              type="button"
              className="sidebar__item"
              aria-current={current ? 'page' : undefined}
              onClick={() => navigate({ name: entry.destination })}
            >
              <Icon name={entry.icon} size={22} />
              <span className="sidebar__label">{entry.label}</span>
              <span className="sidebar__shortcut" aria-hidden="true">
                {shortcutLabel(`CmdOrCtrl+${entry.digit}`, isMac)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="sidebar__spacer" />

      <div className="sidebar__footer">
        <button
          type="button"
          className="sidebar__item"
          aria-current={route.name === 'Settings' ? 'page' : undefined}
          onClick={() => navigate({ name: 'Settings' })}
        >
          <Icon name="settings" size={22} />
          <span className="sidebar__label">Accessibility</span>
          <span className="sidebar__shortcut" aria-hidden="true">
            {shortcutLabel('CmdOrCtrl+,', isMac)}
          </span>
        </button>

        <button type="button" className="sidebar__item" onClick={onShowShortcuts}>
          <Icon name="keyboard" size={22} />
          <span className="sidebar__label">Keyboard shortcuts</span>
          <span className="sidebar__shortcut" aria-hidden="true">
            {shortcutLabel('CmdOrCtrl+/', isMac)}
          </span>
        </button>
      </div>
    </nav>
  );
}
