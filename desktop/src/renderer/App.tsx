import { useEffect, useMemo, useState } from 'react';

import { ShortcutsDialog } from './components/ShortcutsDialog';
import { StatusBar } from './components/StatusBar';
import {
  createMockAppointmentRepository,
  type AppointmentRepository,
} from './data/appointmentRepository';
import { createMockContactRepository, type ContactRepository } from './data/contactRepository';
import {
  createMockMedicineRepository,
  type MedicineRepository,
} from './data/medicineRepository';
import { createMockMemoryRepository, type MemoryRepository } from './data/memoryRepository';
import {
  createMockMessageRepository,
  type MessageRepository,
} from './data/messageRepository';
import { createSettingsRepository, type SettingsRepository } from './data/settingsRepository';
import {
  NavigationProvider,
  useNavigation,
  isPublicRoute,
  type Route,
} from './navigation/NavigationProvider';
import { Sidebar } from './navigation/Sidebar';
import { CommandProvider, useCommand } from './platform/CommandProvider';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { ContactsPage } from './pages/ContactsPage';
import { HomePage } from './pages/HomePage';
import { MedicinesPage } from './pages/MedicinesPage';
import { MemoriesPage } from './pages/MemoriesPage';
import { MessageThreadPage } from './pages/MessageThreadPage';
import { MyDayPage } from './pages/MyDayPage';
import { SettingsPage } from './pages/SettingsPage';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';
import { SplashPage } from './pages/SplashPage';
import { AppointmentsProvider } from './state/AppointmentsProvider';
import { AuthProvider } from './state/AuthProvider';
import { ContactsProvider } from './state/ContactsProvider';
import { MedicinesProvider } from './state/MedicinesProvider';
import { MemoriesProvider } from './state/MemoriesProvider';
import { MessagesProvider } from './state/MessagesProvider';
import { SettingsProvider, useSettings } from './state/SettingsProvider';

export interface Repositories {
  contacts?: ContactRepository;
  messages?: MessageRepository;
  settings?: SettingsRepository;
  appointments?: AppointmentRepository;
  medicines?: MedicineRepository;
  memories?: MemoryRepository;
}

/**
 * The renderer's root.
 */
export function App({
  repositories = {},
  initialRoute,
}: {
  repositories?: Repositories;
  initialRoute?: Route;
}) {
  const contacts = useMemo(
    () => repositories.contacts ?? createMockContactRepository(),
    [repositories.contacts],
  );
  const messages = useMemo(
    () => repositories.messages ?? createMockMessageRepository(),
    [repositories.messages],
  );
  const settings = useMemo(
    () => repositories.settings ?? createSettingsRepository(),
    [repositories.settings],
  );
  const appointments = useMemo(
    () => repositories.appointments ?? createMockAppointmentRepository(),
    [repositories.appointments],
  );
  const medicines = useMemo(
    () => repositories.medicines ?? createMockMedicineRepository(),
    [repositories.medicines],
  );
  const memories = useMemo(
    () => repositories.memories ?? createMockMemoryRepository(),
    [repositories.memories],
  );

  return (
    <AuthProvider>
      <ContactsProvider repository={contacts}>
        <MessagesProvider repository={messages}>
          <SettingsProvider repository={settings}>
            <AppointmentsProvider repository={appointments}>
              <MedicinesProvider repository={medicines}>
                <MemoriesProvider repository={memories}>
                  <NavigationProvider initialRoute={initialRoute ?? { name: 'Splash' }}>
                    <CommandProvider>
                      <Shell />
                    </CommandProvider>
                  </NavigationProvider>
                </MemoriesProvider>
              </MedicinesProvider>
            </AppointmentsProvider>
          </SettingsProvider>
        </MessagesProvider>
      </ContactsProvider>
    </AuthProvider>
  );
}

/**
 * The window shell layout.
 */
function Shell() {
  const { route, navigate, back, canGoBack } = useNavigation();
  const { load: loadSettings } = useSettings();
  const [showShortcuts, setShowShortcuts] = useState(false);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  useCommand('navigate:home', () => navigate({ name: 'Home' }));
  useCommand('navigate:myDay', () => navigate({ name: 'MyDay' }));
  useCommand('navigate:appointments', () => navigate({ name: 'Appointments' }));
  useCommand('navigate:medicines', () => navigate({ name: 'Medicines' }));
  useCommand('navigate:memories', () => navigate({ name: 'Memories' }));
  useCommand('navigate:contacts', () => navigate({ name: 'Contacts' }));
  useCommand('navigate:settings', () => navigate({ name: 'Settings' }));
  useCommand('navigate:back', () => {
    if (canGoBack) back();
  });
  useCommand('help:shortcuts', () => setShowShortcuts(true));

  const isPublic = isPublicRoute(route);

  if (isPublic) {
    return (
      <div className="shell-public">
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <Page route={route} onShowShortcuts={() => setShowShortcuts(true)} />
        {showShortcuts ? (
          <ShortcutsDialog onClose={() => setShowShortcuts(false)} />
        ) : null}
      </div>
    );
  }

  return (
    <div className="shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <Sidebar onShowShortcuts={() => setShowShortcuts(true)} />

      {/* The status bar sits beside <main>, not inside it, so it is announced
          as the window's one contentinfo landmark on every signed-in page. */}
      <div className="shell__column">
        <main className="main" id="main-content" tabIndex={-1}>
          <Page route={route} onShowShortcuts={() => setShowShortcuts(true)} />
        </main>
        <StatusBar onShowShortcuts={() => setShowShortcuts(true)} />
      </div>

      {showShortcuts ? (
        <ShortcutsDialog onClose={() => setShowShortcuts(false)} />
      ) : null}
    </div>
  );
}

function Page({
  route,
  onShowShortcuts,
}: {
  route: Route;
  onShowShortcuts?: () => void;
}) {
  if (route.name === 'Splash') {
    return <SplashPage onShowShortcuts={onShowShortcuts} />;
  }
  if (route.name === 'SignIn') {
    return <SignInPage onShowShortcuts={onShowShortcuts} />;
  }
  if (route.name === 'SignUp') {
    return <SignUpPage onShowShortcuts={onShowShortcuts} />;
  }
  if (route.name === 'Home') {
    return <HomePage onShowShortcuts={onShowShortcuts} />;
  }
  if (route.name === 'MyDay') {
    return <MyDayPage onShowShortcuts={onShowShortcuts} />;
  }
  if (route.name === 'MessageThread') {
    return <MessageThreadPage key={route.contactId} contactId={route.contactId} />;
  }
  if (route.name === 'Settings') {
    return <SettingsPage />;
  }
  if (route.name === 'Contacts') {
    return <ContactsPage />;
  }
  if (route.name === 'Appointments') {
    return <AppointmentsPage />;
  }
  if (route.name === 'Medicines') {
    return <MedicinesPage />;
  }
  return <MemoriesPage />;
}
