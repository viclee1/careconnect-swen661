import AsyncStorage from '@react-native-async-storage/async-storage';

import { defaultSettings, withSettings } from '../../models/accessibilitySettings';
import { waitingCount } from '../../models/message';
import { createFlakyContactRepository, createMockContactRepository } from '../contactRepository';
import { createMockMessageRepository } from '../messageRepository';
import {
  createAsyncStorageSettingsRepository,
  createInMemorySettingsRepository,
} from '../settingsRepository';
import { buildMockMessages } from '../mockMessages';

const kNow = new Date(2026, 8, 4, 10, 30).getTime();

describe('contact repository', () => {
  it('returns the prototype roster in order', async () => {
    const contacts = await createMockContactRepository().fetchContacts();
    expect(contacts.map((c) => c.name)).toEqual([
      'Joyce',
      'Dr. Sharma',
      'Maria',
      'James',
      'NHS 111',
    ]);
  });

  it('the flaky variant fails, then recovers', async () => {
    const repository = createFlakyContactRepository(1);
    await expect(repository.fetchContacts()).rejects.toThrow('offline');
    await expect(repository.fetchContacts()).resolves.toHaveLength(5);
  });
});

describe('message repository', () => {
  it('returns a conversation oldest first', async () => {
    const repository = createMockMessageRepository({ now: kNow });
    const thread = await repository.fetchThread('c1');
    expect(thread.map((m) => m.id)).toEqual(['m1', 'm2']);
  });

  it('appends a sent message to the end of the conversation', async () => {
    const repository = createMockMessageRepository({ now: kNow });
    const sent = await repository.send('c1', '  See you Sunday  ');
    expect(sent.author).toBe('me');
    expect(sent.body).toBe('See you Sunday');

    const thread = await repository.fetchThread('c1');
    expect(thread[thread.length - 1].id).toBe(sent.id);
  });

  it('records an alert as a system message, not as the user speaking', async () => {
    const repository = createMockMessageRepository({ now: kNow });
    const alert = await repository.recordAlert('c1', 'You alerted Joyce.');
    expect(alert.author).toBe('system');
    expect(alert.kind).toBe('alert');
  });

  it('the flaky variant fails the first load, then recovers', async () => {
    const repository = createMockMessageRepository({ now: kNow, failures: 1 });
    await expect(repository.fetchThread('c1')).rejects.toThrow('offline');
    await expect(repository.fetchThread('c1')).resolves.toHaveLength(2);
  });
});

describe('the seeded conversations', () => {
  const messages = buildMockMessages(kNow);
  const threadFor = (id: string) => messages.filter((m) => m.contactId === id);

  it('produce the badges the prototype shows', () => {
    // One waiting from Joyce, one from Maria, nothing elsewhere.
    expect(waitingCount(threadFor('c1'))).toBe(1);
    expect(waitingCount(threadFor('c3'))).toBe(1);
    expect(waitingCount(threadFor('c2'))).toBe(0);
    expect(waitingCount(threadFor('c4'))).toBe(0);
    expect(waitingCount(threadFor('c5'))).toBe(0);
  });

  it('carry a transcript and a captioned video, so both constraints are shown', () => {
    expect(messages.some((m) => m.kind === 'voicemail')).toBe(true);
    expect(messages.some((m) => m.kind === 'videoMessage' && m.hasCaptions)).toBe(true);
  });
});

describe('settings repository', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('an empty store loads the defaults', async () => {
    expect(await createAsyncStorageSettingsRepository().load()).toEqual(defaultSettings);
  });

  it('saved settings survive a reload', async () => {
    const repository = createAsyncStorageSettingsRepository();
    const settings = withSettings(defaultSettings, {
      captionsEnabled: false,
      captionColor: 'yellow',
      alertVolume: 0.25,
      vibrationEnabled: false,
    });

    await repository.save(settings);
    expect(await repository.load()).toEqual(settings);
  });

  it('clear returns the store to the defaults', async () => {
    const repository = createAsyncStorageSettingsRepository();
    await repository.save(withSettings(defaultSettings, { vibrationEnabled: false }));
    await repository.clear();
    expect(await repository.load()).toEqual(defaultSettings);
  });

  it('a corrupt stored value degrades to the defaults rather than throwing', async () => {
    await AsyncStorage.setItem('careconnect.a11y', 'not json at all');
    expect(await createAsyncStorageSettingsRepository().load()).toEqual(defaultSettings);
  });

  it('a stored value that is not an object degrades too', async () => {
    await AsyncStorage.setItem('careconnect.a11y', '"a string"');
    expect(await createAsyncStorageSettingsRepository().load()).toEqual(defaultSettings);
  });

  it('the in-memory variant round-trips a save', async () => {
    const repository = createInMemorySettingsRepository();
    const settings = withSettings(defaultSettings, { alertVolume: 0.1 });

    await repository.save(settings);
    expect(await repository.load()).toEqual(settings);
    expect(repository.saves).toHaveLength(1);

    await repository.clear();
    expect(await repository.load()).toEqual(defaultSettings);
  });
});
