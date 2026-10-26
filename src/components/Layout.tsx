import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import {
  Heart,
  LogOut,
  ArrowLeftRight,
  MessageCircle,
  ShieldCheck,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useApp } from '../context/AppContext';
import type { AppView } from '../types';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import BottomNav from './navigation/BottomNav';
import MobileMenu from './navigation/MobileMenu';
import SideNav from './navigation/SideNav';

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
    const msToNextMinute = (60 - new Date().getSeconds()) * 1000;
    const timeout = setTimeout(() => {
      setNow(new Date());
      const interval = setInterval(() => setNow(new Date()), 60_000);
      return () => clearInterval(interval);
    }, msToNextMinute);
    return () => clearTimeout(timeout);
  }, []);
  return now;
}

function formatOrientationDate(d: Date): string {
  return d.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function formatOrientationTime(d: Date): string {
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function getGreeting(d: Date, firstName: string): string {
  const h = d.getHours();
  const salutation =
    h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  return firstName ? `${salutation}, ${firstName}` : salutation;
}

// ── Props ──────────────────────────────────────────────────────────────────────

interface LayoutProps {
  children: React.ReactNode;
  view: AppView;
  /** Switches the current view and persists it as the user's default role */
  onSwitchRole: () => void;
  onSignOut: () => void;
}

// ── Primary caregiver, reached from the header ─────────────────────────────────
// Joyce is the primary contact in the shared contact list (c1). The header
// opens a written conversation with her rather than dialling: a voice call is
// the one channel CareConnect's users cannot rely on, and the desktop and
// mobile apps have no voice-call button anywhere.
const CAREGIVER_THREAD = '/app/contacts/c1';
const CAREGIVER_NAME = 'Joyce';

// ── Component ──────────────────────────────────────────────────────────────────

export default function Layout({
  children,
  view,
  onSwitchRole,
  onSignOut,
}: LayoutProps) {
  const { user } = useAuth();
  const { patient } = useApp();
  const now = useLiveClock();
  const location = useLocation();

  const isPatient = view === 'patient';
  const screenTitle = useScreenTitle(isPatient);
  useDocumentTitle(screenTitle);

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

  // From 768px the header is sticky. Whatever is scrolled into view — a field
  // focused after a failed Save, a card Tab reaches — must land below it, not
  // under it (WCAG 2.4.11). The header's height changes with the width and
  // the greeting, so it is measured and handed to CSS (scroll-padding-top).
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

  // Caregiver's mobile menu (hamburger). Closed on every route change.
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, view]);

  const dateStr = formatOrientationDate(now);
  const timeStr = formatOrientationTime(now);
  const firstName = user?.name?.split(' ')[0] ?? '';
  const greeting = getGreeting(now, firstName);

  // ISO datetime for <time> element
  const isoDateTime = now.toISOString().slice(0, 16);

  return (
    <>
      {/* ── Skip link — very first focusable element ──────────────────────
          Tab order: 1. skip link → 2. orientation bar → 3. main → 4. nav     */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div className="min-h-screen flex flex-col bg-neutral-50">

        {/* ══════════════════════════════════════════════════════════════════
            HEADER  =  Orientation bar
            Tab order stop #2 — contains logo, switch-role, sign-out,
            date/time, greeting, screen title, and call button.
        ══════════════════════════════════════════════════════════════════ */}
        {/* Sticky from 768px only. At phone width the orientation bar is
            over half the screen tall, and pinned it would cover the control
            that has focus (WCAG 2.4.11) — e.g. a conversation's Send button. */}
        <header
          ref={headerRef}
          role="banner"
          className="bg-white border-b-2 border-neutral-200 shadow-sm md:sticky md:top-0 z-40"
        >
          {/* ── Utility strip (app controls, secondary) ───────────────── */}
          <div className="border-b border-neutral-100 px-4 md:px-6 lg:px-8 py-2 flex items-center justify-between gap-3">
            {/* Logo — a router link, so going home does not reload the app */}
            <Link
              to="/app"
              className="flex items-center gap-2 no-underline flex-shrink-0"
              aria-label="CareConnect — go to home"
            >
              <span
                className="w-8 h-8 rounded-lg bg-calm-600 flex items-center justify-center"
                aria-hidden="true"
              >
                <Heart className="w-4 h-4 text-white" strokeWidth={2.5} />
              </span>
              <span className="text-base font-bold text-neutral-800 hidden md:inline leading-none">
                Care<span className="text-calm-600">Connect</span>
              </span>
            </Link>

            {/* Role indicator pill */}
            <span
              className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-pill text-sm font-semibold ${
                isPatient
                  ? 'bg-calm-100 text-calm-700'
                  : 'bg-success-100 text-success-700'
              }`}
            >
              {isPatient ? (
                <Heart className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              {isPatient ? 'Care recipient' : 'Caregiver'}
            </span>

            {/* Controls */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={onSwitchRole}
                className="inline-flex items-center justify-center gap-2 font-semibold rounded-lg px-3 py-2 min-h-[2.75rem] min-w-[2.75rem] text-sm bg-white text-calm-700 border-2 border-calm-600 hover:bg-calm-50 transition-colors"
                // The visible text is "Switch role"; the name starts with it.
                aria-label={
                  isPatient
                    ? 'Switch role to caregiver'
                    : 'Switch role to care recipient'
                }
              >
                <ArrowLeftRight className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                <span className="hidden md:inline">Switch role</span>
              </button>

              {/* Settings — patient only. On mobile the bottom bar has no room
                  for a seventh tab, so this is where the page is reached. */}
              {isPatient && (
                <Link
                  to="/app/settings"
                  className="md:hidden inline-flex items-center justify-center gap-2 font-semibold rounded-lg px-3 py-2 min-h-[2.75rem] min-w-[2.75rem] text-sm text-neutral-700 border-2 border-neutral-300 hover:bg-neutral-100 no-underline"
                >
                  <Settings className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  Settings
                </Link>
              )}

              <button
                onClick={onSignOut}
                className="inline-flex items-center justify-center gap-2 font-semibold rounded-lg px-3 py-2 min-h-[2.75rem] min-w-[2.75rem] text-sm bg-transparent text-neutral-500 border-2 border-transparent hover:bg-neutral-100 hover:text-neutral-800 transition-colors"
                aria-label="Sign out of CareConnect"
              >
                <LogOut className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                <span className="hidden md:inline">Sign out</span>
              </button>
              {/* Caregiver hamburger — mobile only (the patient keeps the
                  always-visible bottom bar; see BottomNav). Last in the
                  header, so the next Tab after it is the menu's first link:
                  the panel follows the header in the source. */}
              {!isPatient && (
                <button
                  ref={menuButtonRef}
                  type="button"
                  onClick={() => setMenuOpen((o) => !o)}
                  aria-expanded={menuOpen}
                  aria-controls="mobile-menu"
                  className="md:hidden inline-flex items-center gap-2 font-semibold rounded-lg px-3 py-2 min-h-[2.75rem] text-sm text-neutral-700 border-2 border-neutral-300 hover:bg-neutral-100"
                >
                  {menuOpen ? (
                    <X className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <Menu className="w-5 h-5" aria-hidden="true" />
                  )}
                  Menu
                </button>
              )}
            </div>
          </div>

          {/* ── Orientation bar (primary — large text) ────────────────── */}
          <div className="px-4 md:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            {/* Date / time / greeting / screen title block */}
            <div className="space-y-1">

              {/* Date + time — large, always visible */}
              <div className="flex items-baseline gap-3 flex-wrap">
                <time
                  dateTime={isoDateTime}
                  className="text-2xl md:text-3xl font-bold text-neutral-800 leading-tight"
                >
                  {dateStr}
                </time>
                <span className="text-2xl md:text-3xl font-bold text-calm-600 tabular-nums leading-tight">
                  <span className="sr-only">Current time: </span>
                  {timeStr}
                </span>
              </div>

              {/* Greeting + screen title */}
              <p className="text-lg text-neutral-600 leading-snug flex items-center gap-2 flex-wrap">
                <span>{greeting}</span>
                <span aria-hidden="true" className="text-neutral-300">·</span>
                <span className="font-semibold text-neutral-800">
                  <span className="sr-only">Current screen: </span>
                  {screenTitle}
                </span>
              </p>

              {/* Caregiver: whose plan */}
              {!isPatient && (
                <p
                  className="text-sm font-semibold text-success-700"
                  aria-live="polite"
                >
                  Viewing {patient.name}'s care plan
                </p>
              )}
            </div>

            {/* Message my caregiver — patient screens only */}
            {isPatient && (
              <Link
                to={CAREGIVER_THREAD}
                className="inline-flex items-center justify-center gap-3 font-bold rounded-xl px-6 py-3 min-h-[3rem] text-base bg-success-600 text-white border-2 border-success-600 hover:bg-success-700 hover:border-success-700 transition-colors no-underline flex-shrink-0 self-start md:self-center"
                // Starts with the visible words (WCAG 2.5.3), then says who.
                aria-label={`Message my caregiver, ${CAREGIVER_NAME}`}
              >
                <MessageCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                Message my caregiver
              </Link>
            )}
          </div>
        </header>

        {/* Caregiver mobile menu — straight after the header, so the next Tab
            after the Menu button is the first link. */}
        {!isPatient && (
          <MobileMenu
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            buttonRef={menuButtonRef}
            onSwitchRole={onSwitchRole}
          />
        )}

        {/* ══════════════════════════════════════════════════════════════════
            BODY — the same at every breakpoint in the source:
              <main> first, then the sidebar <nav>, so focus reaches the
              content before the menu. CSS `order` puts the sidebar on the
              left from 768px. Below 768px the sidebar is display:none and
              the bottom bar (patient) or Menu panel (caregiver) takes over.
        ══════════════════════════════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col md:flex-row">
          <main
            id="main-content"
            tabIndex={-1}
            aria-label="Main content"
            className={[
              'flex-1 min-w-0 order-2',
              'px-4 md:px-6 lg:px-8 py-6',
              'page-enter',
              // Patient on mobile: clear the fixed bottom bar.
              isPatient ? 'pb-28 md:pb-6' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {children}
          </main>

          <SideNav view={view} onSwitchRole={onSwitchRole} />
        </div>

        {isPatient && <BottomNav />}

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <footer
          className="hidden lg:block border-t border-neutral-200 bg-white"
          role="contentinfo"
        >
          <div className="max-w-none px-8 py-4 flex items-center justify-between text-sm text-neutral-500">
            <p>CareConnect &copy; {new Date().getFullYear()} — Compassionate care, every day.</p>
            <p>
              Need help?{' '}
              <Link to="/app/contacts" className="text-calm-600 font-medium">
                View contacts
              </Link>
            </p>
          </div>
        </footer>

      </div>
    </>
  );
}
