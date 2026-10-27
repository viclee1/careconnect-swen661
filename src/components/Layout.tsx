import { useCallback, useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Contrast, Heart, Keyboard, Menu } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useApp } from '../context/AppContext';
import { useSettings } from '../context/settings';
import type { AppView } from '../types';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useHighContrast } from '../hooks/useHighContrast';
import AccountMenu from './navigation/AccountMenu';
import AppSearch from './navigation/AppSearch';
import NavDrawer from './navigation/NavDrawer';
import type { Orientation } from './navigation/NavPanel';
import ShortcutsDialog from './navigation/ShortcutsDialog';
import SideNav from './navigation/SideNav';
import StatusBar from './navigation/StatusBar';
import { useAlerts } from './navigation/useAlerts';

// ── Screen title lookup ────────────────────────────────────────────────────────

const SCREEN_TITLES: Record<string, string> = {
  '/app':                     'Home',
  '/app/schedule':            'My Day',
  '/app/appointments':        'My Appointments',
  '/app/medications':         'Medicines',
  '/app/memories':            'Memories',
  '/app/contacts':            'Contacts',
  '/app/settings':            'Accessibility Settings',
  '/app/caregiver':           'Caregiver Notes',
  '/app/activity':            'Activity Log',
  '/app/manage-medications':  'Manage Medications',
  '/app/manage-appointments': 'Manage Appointments',
};

function useScreenTitle(isPatient: boolean): string {
  const { pathname } = useLocation();
  // The caregiver's /app is the dashboard, not the patient's Home.
  if (pathname === '/app' && !isPatient) return 'Dashboard';
  if (pathname.startsWith('/app/contacts/')) return 'Conversation';
  return SCREEN_TITLES[pathname] ?? 'CareConnect';
}

// ── Live clock ────────────────────────────────────────────────────────────────

function useLiveClock(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    // Sync to the next whole minute, then tick every 60 s
    let interval: ReturnType<typeof setInterval> | undefined;
    const msToNextMinute = (60 - new Date().getSeconds()) * 1000;
    const timeout = setTimeout(() => {
      setNow(new Date());
      interval = setInterval(() => setNow(new Date()), 60_000);
    }, msToNextMinute);
    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, []);
  return now;
}

function orientationFor(d: Date, firstName: string): Orientation {
  const h = d.getHours();
  const salutation = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  return {
    greeting: firstName ? `${salutation}, ${firstName}` : salutation,
    // "Thursday 4 June" and "5:38 AM", as the design prints them.
    date: d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }),
    time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    isoDateTime: d.toISOString().slice(0, 16),
  };
}

/** Whether `el` is laid out — no ancestor is display:none at this width. */
function isDisplayed(el: HTMLElement): boolean {
  for (let node: HTMLElement | null = el; node; node = node.parentElement) {
    if (getComputedStyle(node).display === 'none') return false;
  }
  return true;
}

// ── Header buttons ────────────────────────────────────────────────────────────

const iconButton =
  'w-[2.9rem] h-[2.9rem] flex items-center justify-center rounded-xl text-neutral-700 hover:bg-neutral-100 transition-colors';

// ── Props ──────────────────────────────────────────────────────────────────────

interface LayoutProps {
  children: React.ReactNode;
  view: AppView;
  /** Switches the current view and persists it as the user's default role */
  onSwitchRole: () => void;
  onSignOut: () => void;
}

// ── Component ──────────────────────────────────────────────────────────────────

/**
 * The app shell from the web design (Figma "WebLayout"):
 *
 *   header   logo · search (Ctrl K) · captions · high contrast · shortcuts · avatar
 *   sidebar  role · greeting, date and time · pages · Settings and alerts
 *   footer   connection · active alerts · "WCAG 2.2 AA · No sound required"
 *
 * From 1024px the sidebar sits beside the page. Below that the header keeps
 * the logo, captions and avatar, and a Menu button opens the same sidebar as
 * a drawer — the design's phone and tablet frames.
 */
export default function Layout({
  children,
  view,
  onSwitchRole,
  onSignOut,
}: LayoutProps) {
  const { user } = useAuth();
  const { patient } = useApp();
  const { settings, update } = useSettings();
  const [highContrast, setHighContrast] = useHighContrast();
  const alerts = useAlerts();
  const now = useLiveClock();
  const location = useLocation();

  const isPatient = view === 'patient';
  const screenTitle = useScreenTitle(isPatient);
  useDocumentTitle(screenTitle);

  const orientation = orientationFor(now, user?.name?.split(' ')[0] ?? '');
  const caption = isPatient ? undefined : `Viewing ${patient.name}'s care plan`;

  // After an in-app navigation, move focus to <main> so a screen reader
  // announces the new page and Tab continues from its content, not from the
  // nav link that was pressed. Not on first load: focus starts at the top of
  // the document there, so the skip link stays the first Tab stop.
  // Compared with the previous path rather than a "first render" flag, which
  // React's StrictMode defeats by running mount effects twice.
  const previousPath = useRef(location.pathname);
  useEffect(() => {
    if (previousPath.current === location.pathname) return;
    previousPath.current = location.pathname;
    document.getElementById('main-content')?.focus();
  }, [location.pathname]);

  // The header is sticky. Whatever is scrolled into view — a field focused
  // after a failed Save, a card Tab reaches — must land below it, not under
  // it (WCAG 2.4.11), so its height is handed to CSS (scroll-padding-top).
  const headerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const header = headerRef.current;
    if (!header || typeof ResizeObserver === 'undefined') return;
    const root = document.documentElement;
    const observer = new ResizeObserver(() => {
      root.style.setProperty('--header-height', `${header.offsetHeight}px`);
    });
    observer.observe(header);
    return () => {
      observer.disconnect();
      root.style.removeProperty('--header-height');
    };
  }, []);

  // Phone/tablet drawer. Closed on every route change.
  const [menuOpen, setMenuOpen] = useState(false);
  // Opened by Ctrl+K rather than the Menu button: focus its search field.
  const [menuForSearch, setMenuForSearch] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, view]);

  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const shortcutsButtonRef = useRef<HTMLButtonElement>(null);
  const closeShortcuts = useCallback(() => setShortcutsOpen(false), []);

  // Ctrl+K / ⌘K: the search field — in the header on desktop, otherwise in
  // the drawer, which opens for it. There is deliberately no single-character
  // shortcut (such as "?") here: WCAG 2.1.4 forbids one that cannot be turned
  // off, and speech users dictating text would trigger it. The keyboard
  // button lists every shortcut instead.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        const visible = Array.from(document.querySelectorAll<HTMLInputElement>('[data-app-search]')).find(isDisplayed);
        if (visible) {
          visible.focus();
        } else {
          setMenuForSearch(true);
          setMenuOpen(true);
        }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      {/* Skip link — very first focusable element */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div className="min-h-screen flex flex-col bg-neutral-50">
        <header
          ref={headerRef}
          role="banner"
          className="sticky top-0 z-40 bg-white border-b border-neutral-200"
        >
          <div className="h-[4.25rem] px-3 md:px-5 lg:px-6 flex items-center gap-2 md:gap-3">
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => {
                setMenuForSearch(false);
                setMenuOpen(true);
              }}
              aria-expanded={menuOpen}
              aria-controls="nav-drawer"
              aria-label="Menu"
              className={`lg:hidden ${iconButton}`}
            >
              <Menu className="w-6 h-6" aria-hidden="true" />
            </button>

            {/* Logo — a router link, so going home does not reload the app */}
            <Link
              to="/app"
              className="flex items-center gap-2.5 no-underline flex-shrink-0"
              aria-label="CareConnect — go to home"
            >
              <span
                className="w-9 h-9 rounded-lg bg-calm-700 flex items-center justify-center"
                aria-hidden="true"
              >
                <Heart className="w-5 h-5 text-white" fill="currentColor" />
              </span>
              <span className="hidden lg:inline text-xl text-calm-800 leading-none">CareConnect</span>
            </Link>

            <div className="hidden lg:block flex-1 max-w-[34rem] mx-auto">
              <AppSearch view={view} showShortcut />
            </div>

            <div className="flex items-center gap-1 md:gap-2 ml-auto">
              <button
                type="button"
                onClick={() => update({ captionsEnabled: !settings.captionsEnabled })}
                aria-pressed={settings.captionsEnabled}
                title={settings.captionsEnabled ? 'Captions are on' : 'Captions are off'}
                className={`${iconButton} ${
                  settings.captionsEnabled ? 'bg-calm-50 text-calm-700' : ''
                } text-sm font-semibold`}
              >
                CC<span className="sr-only"> captions</span>
              </button>
              <button
                type="button"
                onClick={() => setHighContrast(!highContrast)}
                aria-pressed={highContrast}
                aria-label="High contrast"
                className={`hidden lg:flex ${iconButton} ${highContrast ? 'bg-neutral-800 text-white hover:bg-neutral-700' : ''}`}
              >
                <Contrast className="w-5 h-5" aria-hidden="true" />
              </button>
              <button
                ref={shortcutsButtonRef}
                type="button"
                onClick={() => setShortcutsOpen(true)}
                aria-label="Keyboard shortcuts"
                className={`hidden lg:flex ${iconButton}`}
              >
                <Keyboard className="w-5 h-5" aria-hidden="true" />
              </button>
              <AccountMenu
                name={user?.name ?? ''}
                view={view}
                alertCount={alerts.length}
                onSwitchRole={onSwitchRole}
                onSignOut={onSignOut}
              />
            </div>
          </div>
        </header>

        <NavDrawer
          open={menuOpen}
          onClose={closeMenu}
          buttonRef={menuButtonRef}
          view={view}
          orientation={orientation}
          alerts={alerts}
          caption={caption}
          highContrast={highContrast}
          onHighContrastChange={setHighContrast}
          focusSearch={menuForSearch}
        />
        <ShortcutsDialog open={shortcutsOpen} onClose={closeShortcuts} buttonRef={shortcutsButtonRef} />

        {/* <main> first in the source, then the sidebar, so focus reaches the
            content before the menu; CSS `order` puts the sidebar on the left. */}
        <div className="flex-1 flex">
          <main
            id="main-content"
            tabIndex={-1}
            aria-label="Main content"
            className="flex-1 min-w-0 order-2 px-4 md:px-6 lg:px-8 py-5 md:py-6 page-enter"
          >
            {children}
          </main>

          <SideNav view={view} orientation={orientation} alerts={alerts} caption={caption} />
        </div>

        <StatusBar alertCount={alerts.length} />
      </div>
    </>
  );
}
