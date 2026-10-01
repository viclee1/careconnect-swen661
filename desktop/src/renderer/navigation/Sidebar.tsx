import { useRef, type KeyboardEvent } from 'react';

import { Icon } from '../components/Icon';
import { isMacPlatform } from '../platform/bridge';
import { shortcutLabel } from '../../shared/shortcuts';
import { destinations } from './destinations';
import { useNavigation } from './NavigationProvider';
import { useAuth } from '../state/AuthProvider';

/**
 * The persistent left sidebar — the desktop counterpart of the phone's bottom
 * tab bar.
 */
export function Sidebar({ onShowShortcuts }: { onShowShortcuts: () => void }) {
  const { activeDestination, route, navigate } = useNavigation();
  const { user } = useAuth();
  const listRef = useRef<HTMLDivElement>(null);
  const isMac = isMacPlatform();

  const userName = user?.name ? user.name.split(' ')[0] : 'Joyce';

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
        <div className="sidebar__brand-header">
          <Icon name="logo" size={28} />
          <span className="sidebar__brand-title">CareConnect</span>
        </div>

        <div className="sidebar__recipient-badge">
          <span>♡ Care Recipient</span>
        </div>

        <div className="sidebar__greeting">
          <strong>Good morning, {userName}</strong>
          <span className="sidebar__date">Thursday 4 June · 5:38 AM</span>
        </div>
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
          aria-label="Accessibility"
          aria-current={route.name === 'Settings' ? 'page' : undefined}
          onClick={() => navigate({ name: 'Settings' })}
        >
          <Icon name="settings" size={22} />
          <span className="sidebar__label">Settings</span>
          <span className="sidebar__shortcut" aria-hidden="true">
            {shortcutLabel('CmdOrCtrl+,', isMac)}
          </span>
        </button>

        <button
          type="button"
          className="sidebar__item sidebar__item--alerts"
          onClick={() => navigate({ name: 'Settings' })}
        >
          <Icon name="alert" size={22} />
          <span className="sidebar__label">3 alerts</span>
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
