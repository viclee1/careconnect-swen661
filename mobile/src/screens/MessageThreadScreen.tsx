import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AlertBanner } from '../components/AlertBanner';
import { AppButton } from '../components/AppButton';
import { AppHeader } from '../components/AppHeader';
import { EmptyState } from '../components/EmptyState';
import { Icon, type IconName } from '../components/Icon';
import { ReadableWidth } from '../components/ReadableWidth';
import { useResponsive } from '../hooks/useResponsive';
import {
  conversationNameOf,
  initialsFor,
  supportsVideoRelay,
  type ContactRole,
} from '../models/contact';
import { kindOf, startsNewDay } from '../models/message';
import { useContacts } from '../state/ContactsProvider';
import { useMessages } from '../state/MessagesProvider';
import { useSettings } from '../state/SettingsProvider';
import { colors } from '../theme/colors';
import { layout } from '../theme/layout';
import { type } from '../theme/typography';
import { notifyBuzz } from '../utils/haptics';
import { MessageBubble } from './messaging/MessageBubble';
import { MessageComposer } from './messaging/MessageComposer';
import { NotifyButton } from './messaging/NotifyButton';
import { VisualFlash } from './messaging/VisualFlash';

const roleIcons: Record<ContactRole, IconName> = {
  careTeam: 'health-and-safety',
  family: 'family-restroom',
  doctor: 'medical-services',
  helpline: 'support-agent',
};

/**
 * The conversation with one contact, opened from the Contacts screen.
 *
 * The contact is identified by the route's `contactId`, so the screen works
 * from a tap on a card and from a cold deep link alike, and an id that no
 * longer exists lands on a recoverable state rather than a crash.
 */
export function MessageThreadScreen({
  contactId,
  onBack,
  onOpenSettings,
  now,
}: {
  contactId: string;
  onBack: () => void;
  onOpenSettings: () => void;
  /** Injectable clock for deterministic day grouping in tests. */
  now?: number;
}) {
  const contacts = useContacts();
  const messages = useMessages();
  const { settings } = useSettings();
  const { isTablet } = useResponsive();

  const scrollRef = useRef<ScrollView>(null);
  // Local, transient state — exactly what useState is for.
  const [flashTrigger, setFlashTrigger] = useState(0);
  const [callRequested, setCallRequested] = useState(false);

  const { load: loadContacts, byId } = contacts;
  const { loadThread, markRead } = messages;
  const contactsLoaded = contacts.contacts.length > 0;

  useEffect(() => {
    // Contacts may not be loaded yet if this screen was opened from a deep link
    // rather than by tapping a card.
    if (!contactsLoaded) void loadContacts();
  }, [contactsLoaded, loadContacts]);

  useEffect(() => {
    void loadThread(contactId).then(() => {
      // Opening the conversation is what clears its badge on the Contacts
      // screen — the two share one provider, so nothing is passed back.
      markRead(contactId);
    });
  }, [contactId, loadThread, markRead]);

  const contact = byId(contactId);
  const thread = messages.messagesFor(contactId);

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: false }));
  }, []);

  const handleSend = useCallback(
    async (body: string) => {
      await messages.send(contactId, body);
      scrollToEnd();
    },
    [messages, contactId, scrollToEnd],
  );

  const handleNotify = useCallback(async () => {
    if (!contact) return;
    setFlashTrigger((current) => current + 1);
    await notifyBuzz(settings.vibrationEnabled);
    await messages.sendNotify(contactId, conversationNameOf(contact));
    scrollToEnd();
  }, [contact, contactId, messages, settings.vibrationEnabled, scrollToEnd]);

  if (!contact) {
    return (
      <View style={styles.screen}>
        <AppHeader title="Conversation" onBack={onBack} backLabel="Back to contacts" />
        <View style={styles.centred}>
          {contacts.isLoading ? (
            <ActivityIndicator accessibilityLabel="Loading conversation" />
          ) : (
            <EmptyState
              icon="person-off"
              title="That contact is not in your list"
              message="They may have been removed. Go back to Contacts to see everyone you can message."
              action={<AppButton label="Back to contacts" icon="arrow-back" onPress={onBack} />}
            />
          )}
        </View>
      </View>
    );
  }

  const name = conversationNameOf(contact);
  const threadHasVideo = thread.some((message) => kindOf(message) === 'videoMessage');

  return (
    <View style={styles.screen}>
      <AppHeader
        title={contact.name}
        subtitle={contact.relationship}
        onBack={onBack}
        backLabel="Back to contacts"
        trailing={
          isTablet && supportsVideoRelay(contact) ? (
            <AppButton
              label={`Call ${name} now`}
              icon="videocam"
              variant="outlined"
              tone={colors.primaryLight}
              onPress={() => setCallRequested(true)}
              accessibilityLabel={`Call ${name} now with live captions`}
            />
          ) : undefined
        }
      />

      <View style={styles.avatarRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initialsFor(contact)}</Text>
        </View>
        <Icon name={roleIcons[contact.role]} size={16} color={colors.secondaryDark} />
        <Text style={styles.avatarCaption}>{contact.relationship}</Text>
      </View>

      <View style={styles.body}>
        {callRequested ? (
          <View style={styles.bannerHolder}>
            <AlertBanner
              tone="info"
              icon="videocam"
              title="Captioned video call requested"
              message={`We have asked ${contact.name} to join a video call with live captions turned on. You will get a banner here as soon as they answer. Nothing will ring — you can put the phone down.`}
              action={<AppButton label="OK" onPress={() => setCallRequested(false)} />}
            />
          </View>
        ) : null}

        {threadHasVideo && !settings.captionsEnabled ? (
          <View style={styles.bannerHolder}>
            <AlertBanner
              tone="warning"
              title="Captions are turned off"
              message="This conversation contains a video message. Turn captions back on so its words appear on screen."
              action={
                <AppButton label="Open settings" icon="settings" onPress={onOpenSettings} />
              }
            />
          </View>
        ) : null}

        {messages.isLoading(contactId) ? (
          <View style={styles.centred}>
            <ActivityIndicator accessibilityLabel="Loading conversation" />
          </View>
        ) : messages.error && thread.length === 0 ? (
          <View style={styles.centred}>
            <View style={styles.bannerHolder}>
              <AlertBanner
                tone="error"
                title="This conversation could not be loaded"
                message={`Nothing has been lost. Your messages with ${name} are still there — try again in a moment.`}
                action={
                  <AppButton
                    label="Try again"
                    icon="refresh"
                    onPress={() => void messages.loadThread(contactId, true)}
                  />
                }
              />
            </View>
          </View>
        ) : thread.length === 0 ? (
          <View style={styles.centred}>
            <EmptyState
              icon="chat-bubble-outline"
              title="No messages yet"
              message={`Send ${name} the first message. They will see it as text, not as a call.`}
            />
          </View>
        ) : (
          <ReadableWidth>
            <ScrollView ref={scrollRef} contentContainerStyle={styles.thread}>
              {thread.map((message, index) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  contactName={contact.name}
                  showDayLabel={startsNewDay(thread, index)}
                  now={now}
                />
              ))}
            </ScrollView>
          </ReadableWidth>
        )}
      </View>

      <View style={styles.notifyHolder}>
        <NotifyButton
          contactName={name}
          vibrationEnabled={settings.vibrationEnabled}
          onPress={() => void handleNotify()}
        />
      </View>

      <MessageComposer contactName={name} onSend={(body) => void handleSend(body)} />

      <VisualFlash
        trigger={flashTrigger}
        message={`Alert sent to ${name}.\nTheir screen flashed and their phone buzzed.`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.primaryLight },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: layout.gutter,
    paddingVertical: 8,
    backgroundColor: colors.secondaryLight,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryDark,
  },
  avatarText: { color: colors.primaryLight, fontSize: 13, fontWeight: '700' },
  avatarCaption: { ...type.caption, color: colors.secondaryDark, flexShrink: 1 },
  body: { flex: 1 },
  centred: { flex: 1, justifyContent: 'center' },
  bannerHolder: { padding: layout.gutter },
  thread: { paddingHorizontal: layout.gutter, paddingVertical: 12 },
  notifyHolder: { paddingHorizontal: 12, paddingBottom: 10 },
});
