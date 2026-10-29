import { lazy, Suspense, useState } from 'react';
import type { ReactElement } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { getSession } from './auth/mockAuth';
import { AppProvider } from './context/AppContext';
import { MessagesProvider } from './context/MessagesContext';
import { SettingsProvider } from './context/SettingsContext';
import { AppointmentsProvider } from './context/AppointmentsContext';
import { MedicinesProvider } from './context/MedicinesContext';
import { MemoriesProvider } from './context/MemoriesContext';
import { ProtectedRoute, RoleRoute, AuthRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';
import PlaceholderPage, { type PageOwner } from './pages/PlaceholderPage';
import { SHOW_TEAMMATE_PAGES } from './branchScope';
import { useHighContrast } from './hooks/useHighContrast';

// Public pages (do not modify) — shown only when SHOW_TEAMMATE_PAGES is on
import Landing     from './pages/Landing';
import SignIn      from './pages/SignIn';
import SignUp      from './pages/SignUp';
import RoleChooser from './pages/RoleChooser';

// App pages (do not modify) — teammates' screens, see SHOW_TEAMMATE_PAGES
import Home         from './pages/Home';
import Schedule     from './pages/Schedule';
import Caregiver    from './pages/Caregiver';
import CaregiverDashboard    from './pages/CaregiverDashboard';
import ActivityLog           from './pages/ActivityLog';
import ManageMedications     from './pages/ManageMedications';
import ManageAppointments    from './pages/ManageAppointments';

import type { AppView } from './types';

// Contacts, conversations and settings are split into their own chunks and
// fetched on first visit, so the Home screen loads without them.
const Contacts              = lazy(() => import('./pages/Contacts'));
const MessageThread         = lazy(() => import('./pages/MessageThread'));
const AccessibilitySettings = lazy(() => import('./pages/AccessibilitySettings'));
// Appointments, Medicines and Memories, likewise (Memories carries the photos).
const Appointments          = lazy(() => import('./pages/Appointments'));
const Medications           = lazy(() => import('./pages/Medications'));
const Memories              = lazy(() => import('./pages/Memories'));

// ── Teammates' screens ─────────────────────────────────────────────────────────
// A placeholder stands in for each one while SHOW_TEAMMATE_PAGES is off.

function teammate(
  page: ReactElement,
  title: string,
  owner?: PageOwner,
  standalone = false,
): ReactElement {
  return SHOW_TEAMMATE_PAGES ? page : (
    <PlaceholderPage title={title} owner={owner} standalone={standalone} />
  );
}

/**
 * Applies the stored high-contrast choice to a page outside the app shell.
 * Only the shell has the switch, but someone who turned it on should not lose
 * it on the sign-in screens. The shell and these pages never mount together,
 * so the two hook instances cannot disagree.
 */
function StoredContrast({ children }: { children: ReactElement }) {
  useHighContrast();
  return children;
}

function PageLoading() {
  return <p role="status" className="text-neutral-600">Loading…</p>;
}

// ── Inner app shell ────────────────────────────────────────────────────────────

function AppShell() {
  const { setRole, signOut } = useAuth();

  // Initialise the view from the PERSISTED role (read synchronously from
  // storage). The auth context's `role` hydrates asynchronously and is null on
  // the first render, so deriving the view from it would default every fresh
  // load — including direct loads of caregiver screens — to the patient view.
  // Reading the persisted session here makes the caregiver chrome (sidebar +
  // role chip) render consistently on every caregiver screen.
  const [view, setView] = useState<AppView>(() =>
    getSession()?.role === 'caregiver' ? 'caregiver' : 'patient',
  );

  // Switch role: update local view state AND persist the new role so the
  // next sign-in skips the chooser and lands on the correct view.
  function handleSwitchRole() {
    const next: AppView = view === 'patient' ? 'caregiver' : 'patient';
    setView(next);
    setRole(next);           // persists via AuthContext → mockAuth
  }

  return (
    <ProtectedRoute>
      <Layout view={view} onSwitchRole={handleSwitchRole} onSignOut={signOut}>
        <Suspense fallback={<PageLoading />}>
          <Routes>
            {/* Patient sees the calm "Home" screen (Home.tsx); caregiver sees the dashboard */}
            <Route index                        element={view === 'patient'
              ? teammate(<Home view={view} />, 'Home', 'Justin Zhang')
              : teammate(<CaregiverDashboard />, 'Caregiver dashboard')} />
            <Route path="schedule"              element={teammate(<Schedule />, 'My Day', 'Justin Zhang')} />
            <Route path="appointments"          element={teammate(<Appointments />, 'Appointments', 'Upneet Bir')} />
            <Route path="medications"           element={teammate(<Medications />, 'Medicines', 'Upneet Bir')} />
            <Route path="memories"              element={teammate(<Memories />, 'Memories', 'Upneet Bir')} />
            <Route path="contacts"              element={<Contacts />} />
            <Route path="contacts/:contactId"   element={<MessageThread />} />
            <Route path="settings"              element={<AccessibilitySettings />} />
            <Route path="caregiver"             element={teammate(<Caregiver />, 'Caregiver notes')} />
            <Route path="activity"              element={teammate(<ActivityLog />, 'Activity log')} />
            <Route path="manage-medications"    element={teammate(<ManageMedications />, 'Manage medications')} />
            <Route path="manage-appointments"   element={teammate(<ManageAppointments />, 'Manage appointments')} />
            <Route path="*"                     element={<Navigate to="/app" replace />} />
          </Routes>
        </Suspense>
      </Layout>
    </ProtectedRoute>
  );
}

// ── Route tree ─────────────────────────────────────────────────────────────────

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"       element={<StoredContrast>{teammate(<Landing />, 'Welcome', 'Justin Zhang', true)}</StoredContrast>} />
      <Route path="/signin" element={<AuthRoute><StoredContrast>{teammate(<SignIn />, 'Sign In', 'Justin Zhang', true)}</StoredContrast></AuthRoute>} />
      <Route path="/signup" element={<AuthRoute><StoredContrast>{teammate(<SignUp />, 'Sign Up', 'Justin Zhang', true)}</StoredContrast></AuthRoute>} />

      {/* Post-auth role chooser */}
      <Route path="/role"   element={<RoleRoute><StoredContrast><RoleChooser /></StoredContrast></RoleRoute>} />

      {/* Protected app */}
      <Route path="/app/*"  element={<AppShell />} />

      {/* Legacy path shims — Home.tsx still links to these old paths.
          Redirect them into the /app/* namespace so they resolve correctly. */}
      <Route path="/schedule"    element={<Navigate to="/app/schedule"    replace />} />
      <Route path="/medications" element={<Navigate to="/app/medications" replace />} />
      <Route path="/memories"    element={<Navigate to="/app/memories"    replace />} />
      <Route path="/contacts"    element={<Navigate to="/app/contacts"    replace />} />
      <Route path="/caregiver"   element={<Navigate to="/app/caregiver"   replace />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// ── Root ───────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <SettingsProvider>
            <MessagesProvider>
              <AppointmentsProvider>
                <MedicinesProvider>
                  <MemoriesProvider>
                    <AppRoutes />
                  </MemoriesProvider>
                </MedicinesProvider>
              </AppointmentsProvider>
            </MessagesProvider>
          </SettingsProvider>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
