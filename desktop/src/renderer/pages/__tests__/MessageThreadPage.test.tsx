import { screen, waitFor, within } from '@testing-library/react';

import { createMockContactRepository } from '../../data/contactRepository';
import { createMockMessageRepository } from '../../data/messageRepository';
import { createInMemorySettingsRepository } from '../../data/settingsRepository';
import { defaultSettings } from '../../models/accessibilitySettings';
import { renderApp, tabbableElements } from '../../test-support/harness';

/** The clock the seeded conversations are built around. */
const now = new Date('2026-09-30T12:00:00').getTime();

const repositories = (
  overrides: {
    failures?: number;
    captionsEnabled?: boolean;
    vibrationEnabled?: boolean;
  } = {},
) => ({
  contacts: createMockContactRepository(),
  messages: createMockMessageRepository({ now, failures: overrides.failures }),
  settings: createInMemorySettingsRepository({
    ...defaultSettings,
    captionsEnabled: overrides.captionsEnabled ?? defaultSettings.captionsEnabled,
    vibrationEnabled: overrides.vibrationEnabled ?? defaultSettings.vibrationEnabled,
  }),
});

const openThread = (contactId: string, overrides = {}) =>
  renderApp({
    repositories: repositories(overrides),
    initialRoute: { name: 'MessageThread', contactId },
  });

describe('MessageThreadPage', () => {
  it('names the contact and their relationship in the page heading', async () => {
    openThread('c1');

    expect(await screen.findByRole('heading', { level: 1, name: 'Joyce' })).toBeInTheDocument();
    expect(screen.getAllByText('Caregiver · Daughter').length).toBeGreaterThan(0);
  });

  it('renders the seeded conversation oldest first', async () => {
    openThread('c1');

    const thread = await screen.findByRole('list', { name: /conversation with joyce/i });
    const bodies = within(thread)
      .getAllByText(/Goodnight Joyce|How are you feeling/i)
      .map((element) => element.textContent);

    expect(bodies[0]).toMatch(/Goodnight Joyce/);
    expect(bodies[1]).toMatch(/How are you feeling/);
  });

  it('groups the conversation by day in words, not by a bare date', async () => {
    openThread('c1');

    expect(await screen.findByRole('heading', { name: 'Yesterday' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Today' })).toBeInTheDocument();
  });

  it('renders a voicemail as its transcript', async () => {
    // The whole reason this application exists: audio always has a text
    // alternative, and the alternative is labelled as one.
    openThread('c2');

    expect(await screen.findByText(/Transcript · Voicemail · 0:34/)).toBeInTheDocument();
    expect(
      screen.getByText(/your blood test results are back/i),
    ).toBeInTheDocument();
  });

  it('says in words whether a video message carries captions', async () => {
    openThread('c3');

    expect(
      await screen.findByText(/Captions available · Video message · 1:12/),
    ).toBeInTheDocument();
  });

  it('writes the delivery state out next to its tick', async () => {
    // Never carried by an icon colour alone.
    openThread('c1');

    const thread = await screen.findByRole('list', { name: /conversation with joyce/i });
    expect(within(thread).getByText('Read')).toBeInTheDocument();
  });

  it('renders a CareConnect alert as a visible banner inside the conversation', async () => {
    openThread('c4');

    expect(await screen.findByText(/CareConnect alert ·/)).toBeInTheDocument();
    expect(screen.getByText(/Amlodipine 5 mg was due/)).toBeInTheDocument();
  });

  describe('sending', () => {
    it('appends what the user typed', async () => {
      const { user } = openThread('c1');

      await screen.findByTestId('composer-input');
      await user.type(screen.getByTestId('composer-input'), 'I slept well, thank you.');
      await user.click(screen.getByTestId('composer-send'));

      expect(await screen.findByText('I slept well, thank you.')).toBeInTheDocument();
      expect(screen.getByTestId('composer-input')).toHaveValue('');
    });

    it('sends with the platform shortcut from anywhere on the page', async () => {
      const { user } = openThread('c1');

      await screen.findByTestId('composer-input');
      await user.type(screen.getByTestId('composer-input'), 'Sent with the keyboard.');
      // Focus deliberately somewhere else: the command is registered for the
      // page, not bound to the textarea.
      screen.getByTestId('notify-button').focus();
      await user.keyboard('{Control>}{Enter}{/Control}');

      expect(await screen.findByText('Sent with the keyboard.')).toBeInTheDocument();
    });

    it('leaves Enter to insert a newline, as every desktop client does', async () => {
      const { user } = openThread('c1');

      const input = await screen.findByTestId('composer-input');
      await user.type(input, 'first{Enter}second');

      expect(input).toHaveValue('first\nsecond');
      expect(screen.queryByText('first')).not.toBeInTheDocument();
    });

    it('explains a refused send in words rather than only greying the button', async () => {
      const { user } = openThread('c1');

      await screen.findByTestId('composer-send');
      await user.click(screen.getByTestId('composer-send'));

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'Type a message before sending.',
      );
      expect(screen.getByTestId('composer-input')).toHaveFocus();
    });

    it('does not scold the user before they have tried to send', async () => {
      openThread('c1');
      await screen.findByTestId('composer-input');
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('counts down the remaining characters out loud', async () => {
      const { user } = openThread('c1');

      await user.type(await screen.findByTestId('composer-input'), 'hello');

      const counter = screen.getByText('495 characters left');
      expect(counter).toHaveAttribute('role', 'status');
    });
  });

  describe('the Notify alert', () => {
    it('says exactly what it will do before it is used', async () => {
      // A user who cannot hear a ringtone has no way to verify it afterwards
      // and should not have to guess.
      openThread('c1');

      const button = await screen.findByTestId('notify-button');
      expect(button).toHaveAccessibleName(/Alert Joyce you want to talk/);
      expect(button).toHaveAccessibleName(/visual flash and vibration — no sound/i);
    });

    it('reflects the user’s own vibration setting in its wording', async () => {
      openThread('c1', { vibrationEnabled: false });

      expect(await screen.findByTestId('notify-button')).toHaveAccessibleName(
        /vibration is off in your settings/i,
      );
    });

    it('plays a flash that carries words, and writes the alert into the conversation', async () => {
      const { user } = openThread('c1');

      await user.click(await screen.findByTestId('notify-button'));

      const flash = await screen.findByTestId('visual-flash');
      expect(flash).toHaveTextContent(/Alert sent to Joyce/);
      expect(flash).toHaveAttribute('role', 'status');

      // The flash is transient; the record of it is not. An action whose only
      // trace was a flash would leave the user no way to check it went.
      expect(
        await screen.findByText(/You alerted Joyce that you want to talk/),
      ).toBeInTheDocument();
      expect(screen.getByText(/No sound was played/)).toBeInTheDocument();
    });

    it('fires on the platform shortcut', async () => {
      const { user } = openThread('c1');

      await screen.findByTestId('notify-button');
      await user.keyboard('{Control>}{Shift>}n{/Shift}{/Control}');

      expect(
        await screen.findByText(/You alerted Joyce that you want to talk/),
      ).toBeInTheDocument();
    });

    it('never swallows focus behind the flash overlay', async () => {
      const { user } = openThread('c1');

      const button = await screen.findByTestId('notify-button');
      await user.click(button);

      const flash = await screen.findByTestId('visual-flash');
      expect(flash).toHaveClass('visual-flash');
      // `pointer-events: none` is in the stylesheet; what matters here is that
      // nothing has been made inert and the page is still operable.
      expect(screen.getByTestId('composer-input')).toBeEnabled();
    });
  });

  describe('captions', () => {
    it('warns when a conversation holds video and captions are off', async () => {
      const { user } = openThread('c3', { captionsEnabled: false });

      const banner = await screen.findByRole('heading', { name: /captions are turned off/i });
      expect(banner).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /open settings/i }));
      expect(
        await screen.findByRole('heading', { level: 1, name: /accessibility settings/i }),
      ).toBeInTheDocument();
    });

    it('stays quiet when captions are on', async () => {
      openThread('c3');
      await screen.findByText(/Captions available/);
      expect(
        screen.queryByRole('heading', { name: /captions are turned off/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe('the captioned video call', () => {
    it('is offered as a captioned call, never as a voice call', async () => {
      openThread('c1');

      const button = await screen.findByRole('button', { name: /call joyce now/i });
      expect(button).toHaveAccessibleName(/with live captions/i);
    });

    it('is not offered to a contact who cannot take one', async () => {
      // James is message-only. Offering a call he cannot answer would be worse
      // than not offering one at all.
      openThread('c4');
      await screen.findByTestId('composer-input');
      expect(screen.queryByRole('button', { name: /call james/i })).not.toBeInTheDocument();
    });

    it('confirms in a dismissible banner, not a toast that vanishes', async () => {
      const { user } = openThread('c1');

      await user.click(await screen.findByRole('button', { name: /call joyce now/i }));

      expect(
        await screen.findByRole('heading', { name: /captioned video call requested/i }),
      ).toBeInTheDocument();
      expect(screen.getByText(/Nothing will ring/)).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'OK' }));
      expect(
        screen.queryByRole('heading', { name: /captioned video call requested/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe('failure and empty states', () => {
    it('distinguishes a failed load from an empty conversation', async () => {
      const { user } = openThread('c1', { failures: 1 });

      const banner = await screen.findByRole('alert');
      expect(banner).toHaveTextContent(/could not be loaded/i);
      expect(screen.queryByRole('heading', { name: /no messages yet/i })).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Try again' }));
      expect(await screen.findByText(/How are you feeling today/)).toBeInTheDocument();
    });

    it('says who to write to first when a conversation is empty', async () => {
      renderApp({
        repositories: {
          contacts: createMockContactRepository(),
          messages: createMockMessageRepository({ now, seed: [] }),
          settings: createInMemorySettingsRepository(),
        },
        initialRoute: { name: 'MessageThread', contactId: 'c1' },
      });

      expect(
        await screen.findByRole('heading', { name: /no messages yet/i }),
      ).toBeInTheDocument();
      expect(screen.getByText(/as text, not as a call/i)).toBeInTheDocument();
    });

    it('recovers rather than blanking when the contact no longer exists', async () => {
      const { user } = renderApp({
        repositories: repositories(),
        initialRoute: { name: 'MessageThread', contactId: 'gone' },
      });

      expect(
        await screen.findByRole('heading', { name: /not in your list/i }),
      ).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'See all contacts' }));
      expect(await screen.findByTestId('contact-c1')).toBeInTheDocument();
    });
  });

  describe('keyboard', () => {
    it('leaves the conversation on Escape', async () => {
      const { user } = openThread('c1');

      await screen.findByTestId('composer-input');
      await user.click(screen.getByTestId('notify-button'));
      await user.keyboard('{Escape}');

      expect(await screen.findByTestId('contact-c1')).toBeInTheDocument();
    });

    it('goes back with the platform Back shortcut', async () => {
      const { user } = renderApp({ repositories: repositories() });

      await user.click(await screen.findByTestId('contact-c1'));
      await screen.findByRole('heading', { level: 1, name: 'Joyce' });

      await user.keyboard('{Alt>}{ArrowLeft}{/Alt}');

      expect(await screen.findByTestId('contact-c1')).toBeInTheDocument();
    });

    it('reaches the composer, the send button and the alert with Tab alone', async () => {
      const { container } = openThread('c1');
      await screen.findByTestId('composer-input');

      const tabbable = tabbableElements(container);
      expect(tabbable).toContain(screen.getByTestId('composer-input'));
      expect(tabbable).toContain(screen.getByTestId('composer-send'));
      expect(tabbable).toContain(screen.getByTestId('notify-button'));
      expect(tabbable).toContain(screen.getByRole('button', { name: 'Back to contacts' }));
    });
  });

  it('keeps the sidebar pointing at Contacts while a conversation is open', async () => {
    openThread('c1');
    await screen.findByTestId('composer-input');

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /^Contacts/ })).toHaveAttribute(
        'aria-current',
        'page',
      ),
    );
  });
});
