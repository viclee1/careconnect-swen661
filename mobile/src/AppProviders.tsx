import { useEffect, type ReactNode } from 'react';

import type { ContactRepository } from './data/contactRepository';
import type { MessageRepository } from './data/messageRepository';
import type { SettingsRepository } from './data/settingsRepository';
import { ContactsProvider } from './state/ContactsProvider';
import { MessagesProvider } from './state/MessagesProvider';
import { SettingsProvider, useSettings } from './state/SettingsProvider';

function LoadSettings({ children }: { children: ReactNode }) {
  const { load } = useSettings();
  useEffect(() => {
    void load();
  }, [load]);
  return <>{children}</>;
}

/**
 * Wires the three contexts around the app.
 *
 * Every repository is injected rather than constructed inside a provider, which
 * is what lets the component tests swap in fakes and render the real screens
 * without touching storage.
 */
export function AppProviders({
  contactRepository,
  messageRepository,
  settingsRepository,
  children,
}: {
  contactRepository: ContactRepository;
  messageRepository: MessageRepository;
  settingsRepository: SettingsRepository;
  children: ReactNode;
}) {
  return (
    <SettingsProvider repository={settingsRepository}>
      <LoadSettings>
        <ContactsProvider repository={contactRepository}>
          <MessagesProvider repository={messageRepository}>{children}</MessagesProvider>
        </ContactsProvider>
      </LoadSettings>
    </SettingsProvider>
  );
}
