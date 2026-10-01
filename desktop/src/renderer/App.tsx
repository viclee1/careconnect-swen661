import { useEffect, useMemo, useState } from 'react';

import { ShortcutsDialog } from './components/ShortcutsDialog';
import { createMockContactRepository, type ContactRepository } from './data/contactRepository';
import {
  createMockMessageRepository,
  type MessageRepository,
} from './data/messageRepository';
import { createSettingsRepository, type SettingsRepository } from './data/settingsRepository';
import {
  NavigationProvider,
  useNavigation,
  type Route,
} from './navigation/NavigationProvider';
import { Sidebar } from './navigation/Sidebar';
import { CommandProvider, useCommand } from './platform/CommandProvider';
import { ContactsPage } from './pages/ContactsPage';
import { MessageThreadPage } from './pages/MessageThreadPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { SettingsPage } from './pages/SettingsPage';
import { ContactsProvider } from './state/ContactsProvider';
import { MessagesProvider } from './state/MessagesProvider';
import { SettingsProvider, useSettings } from './state/SettingsProvider';

export interface Repositories {
  contacts?: ContactRepository;
  messages?: MessageRepository;
  settings?: SettingsRepository;
}

/**
 * The renderer's root.
 *
 * Repositories are injected rather than constructed inside the providers, which
 * is what lets the test suite drive the real pages through a failing store
 * without touching the components — the same arrangement as the React Native
 * client's test harness.
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

  return (
    <ContactsProvider repository={contacts}>
      <MessagesProvider repository={messages}>
        <SettingsProvider repository={settings}>
          <NavigationProvider initialRoute={initialRoute}>
            <CommandProvider>
              <Shell />
            </CommandProvider>
          </NavigationProvider>
        </SettingsProvider>
      </MessagesProvider>
    </ContactsProvider>
  );
}

/**
 * The window: a persistent sidebar and one content column.
 *
 * This is the desktop pattern Assignment 7 settled on — navigation always
 * visible on the side rather than at the bottom, with the same workflow
 * underneath as the phone so a user moving between devices does not have to
 * relearn anything.
 */
function Shell() {
  const { route, navigate, back, canGoBack } = useNavigation();
  const { load: loadSettings } = useSettings();
  const [showShortcuts, setShowShortcuts] = useState(false);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  // Navigation commands are registered at the shell, so they work from every
  // page. A page can still register a more specific handler for the same
  // command — the conversation does exactly that for Back.
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

  return (
    <div className="shell">
      {/*
        The first thing Tab reaches. Without it a keyboard user pays for the
        persistent sidebar on every page, tabbing past eight navigation items
        before arriving at the content they came for.
      */}
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <Sidebar onShowShortcuts={() => setShowShortcuts(true)} />

      <main className="main" id="main-content" tabIndex={-1}>
        <Page route={route} />
      </main>

      {showShortcuts ? <ShortcutsDialog onClose={() => setShowShortcuts(false)} /> : null}
    </div>
  );
}

function Page({ route }: { route: Route }) {
  if (route.name === 'MessageThread') {
    // Keyed by contact so switching conversations remounts rather than
    // carrying the previous one's draft and scroll position across.
    return <MessageThreadPage key={route.contactId} contactId={route.contactId} />;
  }
  if (route.name === 'Settings') return <SettingsPage />;
  if (route.name === 'Contacts') return <ContactsPage />;
  return <PlaceholderPage destination={route.name} />;
}
