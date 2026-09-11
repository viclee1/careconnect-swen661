import { useCallback, useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { AlertBanner } from '../components/AlertBanner';
import { AppButton } from '../components/AppButton';
import { AppHeader } from '../components/AppHeader';
import { EmptyState } from '../components/EmptyState';
import { ReadableWidth } from '../components/ReadableWidth';
import { useResponsive } from '../hooks/useResponsive';
import type { Contact } from '../models/contact';
import { useContacts } from '../state/ContactsProvider';
import { useMessages } from '../state/MessagesProvider';
import { colors } from '../theme/colors';
import { layout } from '../theme/layout';
import { ContactCard } from './contacts/ContactCard';

/**
 * The Contacts screen, laid out as the Week 3 prototype draws it: one list,
 * primary contact first, each row opening a written conversation.
 *
 * There is no call button anywhere on this screen. A voice call is the one
 * channel a deaf or hard-of-hearing user cannot rely on, so every row leads to
 * text, and the banner at the top points at the Notify action that replaces
 * "give me a ring" with a silent flash on the other person's phone.
 */
export function ContactsScreen({
  onOpenThread,
  onOpenSettings,
}: {
  onOpenThread: (contact: Contact) => void;
  onOpenSettings: () => void;
}) {
  const contacts = useContacts();
  const messages = useMessages();
  const { isTablet } = useResponsive();

  const { load } = contacts;
  const { loadThreads } = messages;

  const bootstrap = useCallback(async () => {
    await load();
  }, [load]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  // Previews and waiting counts come from the conversations, so they are
  // fetched once the roster is known.
  useEffect(() => {
    if (contacts.contacts.length === 0) return;
    void loadThreads(contacts.contacts.map((contact) => contact.id));
  }, [contacts.contacts, loadThreads]);

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Contacts"
        subtitle="People who care for you"
        onOpenSettings={onOpenSettings}
      />
      <ReadableWidth maxWidth={900}>
        <ScrollView contentContainerStyle={styles.content}>
          <AlertBanner
            tone="info"
            icon="vibration"
            title="Getting someone's attention"
            message="Open a chat and tap Notify to send a silent visual flash and vibration. No sound needed."
          />

          {contacts.isLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator accessibilityLabel="Loading contacts" />
            </View>
          ) : contacts.error ? (
            <AlertBanner
              tone="error"
              title="Contacts could not be loaded"
              message="Your contacts are saved on this phone, so nothing has been lost. Try again in a moment."
              action={<AppButton label="Try again" icon="refresh" onPress={bootstrap} />}
            />
          ) : contacts.contacts.length === 0 ? (
            <EmptyState
              icon="people-outline"
              title="No contacts yet"
              message="Your care team will appear here once someone is added to your circle."
            />
          ) : (
            <View style={styles.list}>
              {contacts.contacts.map((contact) => (
                <View
                  key={contact.id}
                  style={isTablet ? styles.halfWidth : styles.fullWidth}
                >
                  <ContactCard
                    contact={contact}
                    preview={messages.previewFor(contact.id)}
                    waiting={messages.waitingFor(contact.id)}
                    onOpen={() => onOpenThread(contact)}
                  />
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </ReadableWidth>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.primaryLight },
  content: { padding: layout.gutter, gap: 16, paddingBottom: 32 },
  loading: { paddingVertical: 48 },
  // On a phone the rows stack; from the tablet breakpoint up they sit two
  // across, which keeps a card from stretching the full width of a wide screen.
  list: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  fullWidth: { width: '100%' },
  halfWidth: { width: '48.5%' },
});
