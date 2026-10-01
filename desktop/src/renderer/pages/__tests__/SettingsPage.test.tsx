import { act, fireEvent, screen, waitFor } from '@testing-library/react';

import { createMockContactRepository } from '../../data/contactRepository';
import { createMockMessageRepository } from '../../data/messageRepository';
import { createInMemorySettingsRepository } from '../../data/settingsRepository';
import { defaultSettings, type AccessibilitySettings } from '../../models/accessibilitySettings';
import { renderApp } from '../../test-support/harness';

const openSettings = (initial: Partial<AccessibilitySettings> = {}) => {
  const settings = createInMemorySettingsRepository({ ...defaultSettings, ...initial });
  return {
    settings,
    ...renderApp({
      repositories: {
        contacts: createMockContactRepository(),
        messages: createMockMessageRepository({ now: Date.now() }),
        settings,
      },
      initialRoute: { name: 'Settings' },
    }),
  };
};

describe('SettingsPage', () => {
  it('groups every preference under a heading a screen reader can jump to', async () => {
    openSettings();

    for (const title of ['Visual Alerts', 'Captions', 'Audio', 'Vibration', 'Account']) {
      expect(await screen.findByRole('heading', { name: title })).toBeInTheDocument();
    }
  });

  describe('the banner that cannot be switched off', () => {
    it('is shown, explained, and refuses to change', async () => {
      // Removing the banner would leave an alert that reaches the user by sound
      // alone, which is precisely what the assigned constraint forbids.
      const { user, settings } = openSettings();

      const control = await screen.findByTestId('switch-banners');
      expect(control).toBeChecked();
      expect(control).toBeDisabled();

      await user.click(control);

      expect(control).toBeChecked();
      expect(settings.saves).toHaveLength(0);
    });

    it('says why, rather than just being greyed out', async () => {
      openSettings();
      expect(
        await screen.findByText(/an alert could reach you by sound alone/i),
      ).toBeInTheDocument();
    });

    it('cannot be forced off through the store either', async () => {
      // A hand-edited preferences file must not be able to produce a
      // sound-only alert.
      const { settings } = openSettings({ visualAlertBanners: false });
      await waitFor(() => expect(screen.getByTestId('switch-banners')).toBeChecked());
      expect(settings.saves.every((saved) => saved.visualAlertBanners)).toBe(true);
    });
  });

  it('writes the state of every switch out as a word', async () => {
    // A switch carries its state through position and colour; the word is what
    // carries it for anyone who finds the knob ambiguous.
    openSettings();
    await screen.findByTestId('switch-captions');
    expect(screen.getAllByText('On').length).toBeGreaterThanOrEqual(3);
  });

  it('toggles and persists a preference', async () => {
    const { user, settings } = openSettings();

    const escalation = await screen.findByTestId('switch-escalation');
    await user.click(escalation);

    expect(escalation).not.toBeChecked();
    await waitFor(() => expect(settings.saves.at(-1)?.smartEscalation).toBe(false));
  });

  it('toggles a switch with the Space key', async () => {
    const { user } = openSettings();

    const vibration = await screen.findByTestId('switch-vibration');
    vibration.focus();
    await user.keyboard(' ');

    expect(vibration).not.toBeChecked();
  });

  describe('the conformance badge', () => {
    it('claims compliance only while the configuration actually is', async () => {
      const { user } = openSettings();

      expect(
        await screen.findByRole('heading', { name: /WCAG 2.2 Compliant/i }),
      ).toBeInTheDocument();

      await user.click(screen.getByTestId('switch-captions'));

      expect(
        await screen.findByRole('heading', { name: /check your captions/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/some spoken content will have no text/i),
      ).toBeInTheDocument();
    });
  });

  describe('captions', () => {
    it('offers size as a radio group, not a row of unrelated buttons', async () => {
      openSettings();

      const group = await screen.findByRole('radiogroup', { name: 'Caption size' });
      expect(group).toBeInTheDocument();
      expect(screen.getByTestId('segment-medium')).toHaveAttribute('aria-checked', 'true');
    });

    it('moves the selection with the arrow keys', async () => {
      // The Assignment 7 keyboard table: arrow keys navigate within a group.
      const { user, settings } = openSettings();

      const medium = await screen.findByTestId('segment-medium');
      medium.focus();
      await user.keyboard('{ArrowRight}');

      expect(screen.getByTestId('segment-large')).toHaveAttribute('aria-checked', 'true');
      await waitFor(() => expect(settings.saves.at(-1)?.captionSize).toBe('large'));
    });

    it('wraps around at the end of the group', async () => {
      const { user } = openSettings({ captionSize: 'large' });

      const large = await screen.findByTestId('segment-large');
      large.focus();
      await user.keyboard('{ArrowRight}');

      expect(screen.getByTestId('segment-small')).toHaveAttribute('aria-checked', 'true');
    });

    it('keeps the group to a single Tab stop', async () => {
      openSettings();

      await screen.findByTestId('segment-medium');
      expect(screen.getByTestId('segment-medium')).toHaveAttribute('tabindex', '0');
      expect(screen.getByTestId('segment-small')).toHaveAttribute('tabindex', '-1');
    });

    it('scales the preview with the chosen size', async () => {
      const { user } = openSettings();

      const preview = await screen.findByTestId('caption-preview');
      const before = preview.style.fontSize;

      await user.click(screen.getByTestId('segment-large'));

      expect(screen.getByTestId('caption-preview').style.fontSize).not.toBe(before);
    });

    it('disables the size and colour choices while captions are off, and says so', async () => {
      const { user } = openSettings();

      await user.click(await screen.findByTestId('switch-captions'));

      expect(screen.getByTestId('segment-small')).toBeDisabled();
      expect(screen.getByTestId('segment-white')).toBeDisabled();
      expect(
        screen.getByText(/Captions are off, so the size cannot be changed yet/i),
      ).toBeInTheDocument();
      expect(screen.getByTestId('caption-preview')).toHaveTextContent(
        /Captions are off\. Nothing will appear here\./,
      );
    });
  });

  describe('audio', () => {
    it('prints the value as well as drawing the thumb', async () => {
      openSettings();

      const volume = await screen.findByTestId('slider-volume');
      expect(volume).toHaveAttribute('aria-valuetext', 'Alert volume 70 per cent');
      expect(screen.getByText('70%')).toBeInTheDocument();
    });

    it('accepts zero, because sound is never the only carrier', async () => {
      const { settings } = openSettings({ alertVolume: 0 });

      const volume = await screen.findByTestId('slider-volume');
      await waitFor(() => expect(volume).toHaveValue('0'));
      expect(volume).toHaveAttribute('aria-valuetext', 'Alert volume 0 per cent');
      // Nothing was corrected on the way in: silence is a valid configuration,
      // because the banner and the vibration still arrive.
      expect(settings.saves).toHaveLength(0);
    });

    it('writes the balance out in words rather than as a number', async () => {
      openSettings({ audioBalance: -0.5 });
      await waitFor(() => expect(screen.getByText('50% left')).toBeInTheDocument());
    });

    it('is a native range input, so the platform supplies its arrow keys', async () => {
      // Arrow keys, Home, End, Page Up and Page Down all come from the control
      // itself. jsdom does not implement them, so what is worth asserting here
      // is that we did not replace the native control with something that would
      // have to reimplement them — and that its bounds are right.
      openSettings();

      const volume = await screen.findByTestId('slider-volume');
      expect(volume.tagName).toBe('INPUT');
      expect(volume).toHaveAttribute('type', 'range');
      expect(volume).toHaveAttribute('min', '0');
      expect(volume).toHaveAttribute('max', '1');
      expect(volume).toHaveAttribute('step', '0.1');
    });

    it('persists a change to the slider', async () => {
      const { settings } = openSettings();

      const volume = await screen.findByTestId('slider-volume');
      fireEvent.change(volume, { target: { value: '0.8' } });

      await waitFor(() => expect(settings.saves.at(-1)?.alertVolume).toBeCloseTo(0.8));
      expect(screen.getByText('80%')).toBeInTheDocument();
    });
  });

  describe('vibration patterns', () => {
    it('draws each rhythm as well as naming it', async () => {
      // A rhythm you can only learn by feeling it is useless to someone
      // comparing two of them on a desktop screen.
      openSettings();

      expect(await screen.findByText('— · —')).toBeInTheDocument();
      expect(screen.getByText('·· ··')).toBeInTheDocument();
      expect(screen.getByText('Long-short-long')).toBeInTheDocument();
    });

    it('plays the rhythm back as a visual pulse, since a desktop cannot buzz', async () => {
      // Driven with `fireEvent` rather than `userEvent`, which waits on real
      // timers and would deadlock against the fake ones this test needs.
      jest.useFakeTimers();
      try {
        openSettings();

        await act(async () => {
          await jest.advanceTimersByTimeAsync(0);
        });

        const lamp = screen.getByTestId('pattern-lamp-appointment');
        expect(lamp).not.toHaveClass('pattern-row__lamp--on');

        act(() => {
          fireEvent.click(screen.getByTestId('pattern-appointment'));
        });

        // Every step of the rhythm is a scheduled timer, the first at offset
        // zero, so nothing is lit until the clock has moved at all.
        act(() => {
          jest.advanceTimersByTime(0);
        });

        // The rhythm opens on a 400ms buzz, then a 150ms gap.
        expect(lamp).toHaveClass('pattern-row__lamp--on');

        act(() => {
          jest.advanceTimersByTime(400);
        });
        expect(lamp).not.toHaveClass('pattern-row__lamp--on');

        // And the lamp is never left lit once the rhythm is over.
        act(() => {
          jest.advanceTimersByTime(2000);
        });
        expect(lamp).not.toHaveClass('pattern-row__lamp--on');
      } finally {
        jest.useRealTimers();
      }
    });

    it('cannot be played while vibration is off, and explains why', async () => {
      const { user } = openSettings();

      await user.click(await screen.findByTestId('switch-vibration'));

      expect(screen.getByTestId('pattern-appointment')).toBeDisabled();
      expect(screen.getByTestId('pattern-appointment')).toHaveAccessibleName(
        /Turn vibration on to play it/i,
      );
      expect(screen.getByText(/Turn vibration on above to play these/i)).toBeInTheDocument();
    });
  });

  describe('leaving the page', () => {
    it('goes back with the Back button', async () => {
      const { user } = renderApp({
        repositories: {
          contacts: createMockContactRepository(),
          messages: createMockMessageRepository({ now: Date.now() }),
          settings: createInMemorySettingsRepository(),
        },
      });

      await user.click(await screen.findByRole('button', { name: /^Accessibility/ }));
      await screen.findByRole('heading', { level: 1, name: /accessibility settings/i });

      await user.click(screen.getByRole('button', { name: 'Back' }));
      expect(await screen.findByTestId('contact-c1')).toBeInTheDocument();
    });

    it('goes back on Escape', async () => {
      const { user } = renderApp({
        repositories: {
          contacts: createMockContactRepository(),
          messages: createMockMessageRepository({ now: Date.now() }),
          settings: createInMemorySettingsRepository(),
        },
      });

      await user.click(await screen.findByRole('button', { name: /^Accessibility/ }));
      await screen.findByRole('heading', { level: 1, name: /accessibility settings/i });

      screen.getByTestId('switch-escalation').focus();
      await user.keyboard('{Escape}');

      expect(await screen.findByTestId('contact-c1')).toBeInTheDocument();
    });

    it('lands on Contacts rather than nowhere when opened directly', async () => {
      const { user } = openSettings();

      await user.click(await screen.findByRole('button', { name: 'Back' }));
      expect(await screen.findByTestId('contact-c1')).toBeInTheDocument();
    });
  });

  it('signs out and returns the user to the splash screen', async () => {
    const { user } = openSettings();

    await user.click(await screen.findByRole('button', { name: 'Sign out' }));

    expect(
      await screen.findByRole('heading', { level: 1, name: /your daily companion/i }),
    ).toBeInTheDocument();
  });
});
