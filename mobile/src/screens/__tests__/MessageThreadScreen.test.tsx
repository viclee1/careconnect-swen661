import { act, fireEvent, screen } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';

import { createMockMessageRepository } from '../../data/messageRepository';
import { kTestNow, renderApp, useTabletSize } from '../../test-support/harness';

const impactAsync = Haptics.impactAsync as jest.Mock;

/** Opens a conversation from the contact list. */
async function openThread(contactId: string) {
  await fireEvent.press(await screen.findByTestId(`contact-${contactId}`));
  await screen.findByTestId('notify-button');
}

beforeEach(() => {
  impactAsync.mockClear();
});

describe('rendering a conversation', () => {
  it('opens on the contact that was tapped', async () => {
    await renderApp();
    await openThread('c1');

    expect(screen.getAllByText('Joyce').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Caregiver · Daughter').length).toBeGreaterThan(0);
  });

  it('renders the conversation in order', async () => {
    await renderApp();
    await openThread('c1');

    expect(screen.getByText('Goodnight Joyce. See you in the morning.')).toBeTruthy();
    expect(screen.getByText('Good morning Margaret! How are you feeling today?')).toBeTruthy();
  });

  it('writes the delivery state out next to the tick', async () => {
    await renderApp();
    await openThread('c1');
    expect(screen.getByText('Read')).toBeTruthy();
  });

  it('stamps messages the way the prototype does', async () => {
    await renderApp();
    await openThread('c1');
    expect(screen.getByText('8:02 am')).toBeTruthy();
  });

  it('groups messages under a day heading', async () => {
    await renderApp();
    await openThread('c1');
    expect(screen.getByText('Yesterday')).toBeTruthy();
    expect(screen.getByText('Today')).toBeTruthy();
  });

  it('a voicemail arrives as a readable transcript', async () => {
    await renderApp();
    await openThread('c2');

    expect(screen.getByText('Transcript · Voicemail · 0:34')).toBeTruthy();
    expect(screen.getByText(/blood test results are back/)).toBeTruthy();
  });

  it('a video message states that captions are available', async () => {
    await renderApp();
    await openThread('c3');
    expect(screen.getByText('Captions available · Video message · 1:12')).toBeTruthy();
  });

  it('a medication alert appears as a written banner', async () => {
    await renderApp();
    await openThread('c4');

    expect(screen.getByText(/CareConnect alert/)).toBeTruthy();
    expect(screen.getByText(/Amlodipine 5 mg was due at 8:30 am/)).toBeTruthy();
  });

  it('an empty conversation explains what to do next', async () => {
    await renderApp();
    await openThread('c5');

    expect(screen.getByText('No messages yet')).toBeTruthy();
    expect(screen.getByText(/not as a call/)).toBeTruthy();
  });
});

describe('Notify', () => {
  it('offers the alert with its consequences written out', async () => {
    await renderApp();
    await openThread('c1');

    expect(screen.getByText('Alert Joyce you want to talk')).toBeTruthy();
    expect(screen.getByText('Sends a visual flash and vibration — no sound')).toBeTruthy();
  });

  it('says so when vibration has been switched off', async () => {
    await renderApp({ settings: { vibrationEnabled: false } });
    await openThread('c1');

    expect(
      screen.getByText('Sends a visual flash — vibration is off in Settings'),
    ).toBeTruthy();
  });

  it('buzzes, flashes and writes the alert into the conversation', async () => {
    await renderApp();
    await openThread('c1');

    await act(async () => {
      await fireEvent.press(screen.getByTestId('notify-button'));
    });

    expect(impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Heavy);
    // The flash carries words, not just light.
    expect(screen.getByText(/Alert sent to Joyce/)).toBeTruthy();
    // And the written record remains after it fades.
    expect(screen.getByText(/You alerted Joyce that you want to talk/)).toBeTruthy();
    expect(screen.getByText(/No sound was played/)).toBeTruthy();
  });

  it('sends no buzz when vibration is off, but still flashes', async () => {
    await renderApp({ settings: { vibrationEnabled: false } });
    await openThread('c1');

    await act(async () => {
      await fireEvent.press(screen.getByTestId('notify-button'));
    });

    expect(impactAsync).not.toHaveBeenCalled();
    expect(screen.getByText(/Alert sent to Joyce/)).toBeTruthy();
  });
});

describe('the composer', () => {
  it('refuses an empty message and says why', async () => {
    await renderApp();
    await openThread('c1');

    await fireEvent.press(screen.getByTestId('composer-send'));

    expect(await screen.findByText('Type a message before sending.')).toBeTruthy();
  });

  it('refuses a whitespace-only message', async () => {
    await renderApp();
    await openThread('c1');

    await fireEvent.changeText(screen.getByTestId('composer-input'), '     ');
    await fireEvent.press(screen.getByTestId('composer-send'));

    expect(await screen.findByText('Type a message before sending.')).toBeTruthy();
  });

  it('sends a typed message and shows it in the conversation', async () => {
    await renderApp();
    await openThread('c1');

    await fireEvent.changeText(screen.getByTestId('composer-input'), 'See you on Sunday');
    await act(async () => {
      await fireEvent.press(screen.getByTestId('composer-send'));
    });

    expect(await screen.findByText('See you on Sunday')).toBeTruthy();
    expect(screen.getByText('Sent')).toBeTruthy();
  });

  it('counts the characters left', async () => {
    await renderApp();
    await openThread('c1');

    expect(screen.getByText('500 characters left')).toBeTruthy();

    await fireEvent.changeText(screen.getByTestId('composer-input'), 'hello');
    expect(await screen.findByText('495 characters left')).toBeTruthy();
  });
});

describe('cross-screen accessibility state', () => {
  it('warns when captions are off and the conversation has video', async () => {
    await renderApp({ settings: { captionsEnabled: false } });
    await openThread('c3');

    expect(screen.getByText('Captions are turned off')).toBeTruthy();
    expect(screen.getByText('Open settings')).toBeTruthy();
  });

  it('shows no caption warning when captions are on', async () => {
    await renderApp();
    await openThread('c3');
    expect(screen.queryByText('Captions are turned off')).toBeNull();
  });

  it('shows no caption warning on a conversation without video', async () => {
    await renderApp({ settings: { captionsEnabled: false } });
    await openThread('c1');
    expect(screen.queryByText('Captions are turned off')).toBeNull();
  });
});

describe('when a conversation cannot be loaded', () => {
  it('says so rather than claiming the conversation is empty', async () => {
    await renderApp({
      messageRepository: createMockMessageRepository({ now: kTestNow, failures: 99 }),
    });
    await openThread('c1');

    expect(screen.getByText('This conversation could not be loaded')).toBeTruthy();
    // "No messages yet" would tell a deaf user that Joyce never wrote, which is
    // a different and much worse thing than a failed load.
    expect(screen.queryByText('No messages yet')).toBeNull();
  });

  it('still lets the user send a silent alert', async () => {
    await renderApp({
      messageRepository: createMockMessageRepository({ now: kTestNow, failures: 99 }),
    });
    await openThread('c1');

    // Reaching someone does not depend on the history having loaded.
    expect(screen.getByTestId('notify-button')).toBeTruthy();
  });

  it('recovers when the retry succeeds', async () => {
    // Five failures covers the batch the contact list fetches on start-up, so
    // the sixth attempt — the retry — is the one that works.
    await renderApp({
      messageRepository: createMockMessageRepository({ now: kTestNow, failures: 5 }),
    });
    await openThread('c1');

    expect(screen.getByText('This conversation could not be loaded')).toBeTruthy();

    await act(async () => {
      await fireEvent.press(screen.getByText('Try again'));
    });

    expect(
      await screen.findByText('Good morning Margaret! How are you feeling today?'),
    ).toBeTruthy();
  });
});

describe('tablet layout', () => {
  it('offers a captioned call, named as the design names it', async () => {
    useTabletSize();
    await renderApp();
    await openThread('c1');

    await fireEvent.press(screen.getByText('Call Joyce now'));

    expect(await screen.findByText('Captioned video call requested')).toBeTruthy();
    expect(screen.getByText(/Nothing will ring/)).toBeTruthy();
  });

  it('offers no call to a contact without captioned video', async () => {
    useTabletSize();
    await renderApp();
    await openThread('c4');

    expect(screen.queryByText(/^Call /)).toBeNull();
  });
});
