import { useId, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Bell, ChevronDown, Heart, ShieldCheck } from 'lucide-react';

import type { AppView } from '../../types';
import { navItems, settingsItem } from './navItems';
import { alertsLabel, type AppAlert } from './useAlerts';

export interface Orientation {
  greeting: string;
  date: string;
  time: string;
  isoDateTime: string;
}

function linkClass({ isActive }: { isActive: boolean }) {
  return [
    'flex items-center gap-3 rounded-xl px-3 py-3 min-h-[3rem] no-underline',
    'text-base transition-colors duration-150',
    isActive
      ? 'bg-calm-50 text-calm-700 font-semibold'
      : 'text-neutral-700 hover:bg-neutral-100 hover:text-calm-700',
  ].join(' ');
}

/**
 * What the sidebar holds, from the design: who you are using the app as, a
 * greeting with the date and time, the destinations, and — pinned to the
 * foot — Settings and the alerts waiting for you. The desktop sidebar and the
 * phone/tablet drawer both render this, so the two never drift apart.
 */
export default function NavPanel({
  view,
  orientation,
  alerts,
  caption,
  onNavigate,
}: {
  view: AppView;
  orientation: Orientation;
  alerts: AppAlert[];
  /** Under the greeting: whose care plan a caregiver is looking at. */
  caption?: string;
  onNavigate?: () => void;
}) {
  const [alertsOpen, setAlertsOpen] = useState(false);
  const alertsId = useId();
  const isPatient = view === 'patient';

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-5 pb-4 space-y-3">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-pill text-sm font-medium ${
            isPatient ? 'bg-calm-50 text-calm-700' : 'bg-success-50 text-success-700'
          }`}
        >
          {isPatient ? (
            <Heart className="w-3.5 h-3.5" aria-hidden="true" />
          ) : (
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
          )}
          {isPatient ? 'Care Recipient' : 'Caregiver'}
        </span>
        <div>
          <p className="text-base font-medium text-neutral-800 m-0">{orientation.greeting}</p>
          <p className="text-sm text-neutral-600 m-0">
            <time dateTime={orientation.isoDateTime}>
              {orientation.date} · <span className="text-calm-700 tabular-nums">{orientation.time}</span>
            </time>
          </p>
          {caption && <p className="text-sm font-semibold text-success-700 mt-1 mb-0">{caption}</p>}
        </div>
      </div>

      <ul role="list" className="flex flex-col gap-1 list-none px-3 m-0">
        {navItems[view].map(({ to, label, Icon }) => (
          <li key={to}>
            <NavLink to={to} end={to === '/app'} className={linkClass} onClick={onNavigate}>
              <Icon className="w-6 h-6 flex-shrink-0" aria-hidden="true" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="mt-auto border-t border-neutral-200 px-3 py-3 space-y-1">
        <NavLink to={settingsItem.to} className={linkClass} onClick={onNavigate}>
          <settingsItem.Icon className="w-6 h-6 flex-shrink-0" aria-hidden="true" />
          {settingsItem.label}
        </NavLink>

        <button
          type="button"
          aria-expanded={alertsOpen}
          aria-controls={alertsId}
          onClick={() => setAlertsOpen((open) => !open)}
          className="w-full flex items-center gap-3 rounded-xl px-3 py-3 min-h-[3rem] text-base text-neutral-700 hover:bg-neutral-100"
        >
          <span className="relative flex-shrink-0" aria-hidden="true">
            <Bell className="w-6 h-6" />
            {alerts.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-alert-600 text-white text-[0.7rem] font-bold leading-[1.1rem] text-center">
                {alerts.length}
              </span>
            )}
          </span>
          <span className="flex-1 text-left">{alertsLabel(alerts.length)}</span>
          <ChevronDown
            className={`w-5 h-5 text-neutral-500 transition-transform ${alertsOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>

        <div id={alertsId} hidden={!alertsOpen}>
          {alerts.length === 0 ? (
            <p className="px-3 py-2 text-sm text-neutral-600 m-0">Nothing is waiting for you.</p>
          ) : (
            <ul role="list" className="list-none p-0 m-0 space-y-1">
              {alerts.map((alert) => (
                <li key={alert.id}>
                  <Link
                    to={alert.to}
                    onClick={onNavigate}
                    className="block rounded-lg px-3 py-2 text-sm text-neutral-700 no-underline border-l-4 border-alert-600 bg-alert-50 hover:bg-alert-100"
                  >
                    {alert.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
