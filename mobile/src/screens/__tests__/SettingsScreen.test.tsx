import { act, fireEvent, screen } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';

import { createInMemorySettingsRepository } from '../../data/settingsRepository';
import { defaultSettings, withSettings } from '../../models/accessibilitySettings';
import { renderApp } from '../../test-support/harness';

const impactAsync = Haptics.impactAsync as jest.Mock;

/** Opens Settings from the header gear. */
async function openSettings() {
  await fireEvent.press(await screen.findByLabelText('Settings'));
  await screen.findByText('Accessibility Settings');
}

beforeEach(() => {
  impactAsync.mockClear();
});

describe('rendering', () => {
  it('uses the heading and sections from the prototype', async () => {
    await renderApp();
    await openSettings();

    expect(screen.getByText('Adjust how CareConnect alerts and informs you')).toBeTruthy();
    for (const section of ['Visual Alerts', 'Captions', 'Audio', 'Vibration', 'Account']) {
      expect(screen.getByText(section)).toBeTruthy();
    }
  });

  it('shows the conformance badge as met by default', async () => {
    await renderApp();
    await openSettings();

    expect(screen.getByText('WCAG 2.2 Compliant')).toBeTruthy();
    expect(screen.getByText('Hearing-accessibility requirements met')).toBeTruthy();
  });

  it('writes the state of each switch out as a word', async () => {
    await renderApp();
    await openSettings();

    // Banners, escalation, captions and vibration all start on.
    expect(screen.getAllByText('On')).toHaveLength(4);
    expect(screen.queryByText('Off')).toBeNull();
  });

  it('the visual banner is present but cannot be switched off', async () => {
    await renderApp();
    await openSettings();

    expect(screen.getByText('Visual alert banners')).toBeTruthy();
    expect(screen.getByText(/Always on\./)).toBeTruthy();
    expect(screen.getByTestId('switch-banners').props.accessibilityState.disabled).toBe(true);
  });

  it('shows the prototype values for volume and balance', async () => {
    await renderApp();
    await openSettings();

    expect(screen.getByText('Alert volume')).toBeTruthy();
    expect(screen.getByText('70%')).toBeTruthy();
    expect(screen.getByText('Audio balance')).toBeTruthy();
    expect(screen.getByText('Centre')).toBeTruthy();
  });

  it('names all three vibration rhythms and draws each one', async () => {
    await renderApp();
    await openSettings();

    expect(screen.getByText('Appointment')).toBeTruthy();
    expect(screen.getByText('Long-short-long')).toBeTruthy();
    expect(screen.getByText('Medication')).toBeTruthy();
    expect(screen.getByText('Double pulse')).toBeTruthy();
    expect(screen.getByText('Missed / Escalated')).toBeTruthy();
    expect(screen.getByText('Rapid burst')).toBeTruthy();
  });

  it('renders the caption preview from the prototype', async () => {
    await renderApp();
    await openSettings();

    expect(screen.getByTestId('caption-preview').props.children).toBe(
      '[Preview] Reminder: Take your morning medication.',
    );
    expect(screen.getByText('Currently medium.')).toBeTruthy();
  });
});

describe('interaction', () => {
  it('turning captions off flips the badge and persists', async () => {
    const repository = createInMemorySettingsRepository();
    await renderApp({ settingsRepository: repository });
    await openSettings();

    await act(async () => {
      await fireEvent(screen.getByTestId('switch-captions'), 'valueChange', false);
    });

    expect(screen.queryByText('WCAG 2.2 Compliant')).toBeNull();
    expect(screen.getByText('Check your captions')).toBeTruthy();
    expect((await repository.load()).captionsEnabled).toBe(false);
  });

  it('turning captions off disables the size control', async () => {
    await renderApp();
    await openSettings();

    await act(async () => {
      await fireEvent(screen.getByTestId('switch-captions'), 'valueChange', false);
    });

    expect(
      screen.getByText('Captions are off, so the size cannot be changed yet.'),
    ).toBeTruthy();
    expect(screen.getByTestId('caption-preview').props.children).toBe(
      'Captions are off. Nothing will appear here.',
    );
    expect(screen.getByTestId('segment-large').props.accessibilityState.disabled).toBe(true);
  });

  it('changing the caption size updates the live preview', async () => {
    const repository = createInMemorySettingsRepository();
    await renderApp({ settingsRepository: repository });
    await openSettings();

    await act(async () => {
      await fireEvent.press(screen.getByTestId('segment-large'));
    });

    expect(screen.getByText('Currently large.')).toBeTruthy();
    expect((await repository.load()).captionSize).toBe('large');
  });

  it('changing the caption colour repaints the preview', async () => {
    const repository = createInMemorySettingsRepository();
    await renderApp({ settingsRepository: repository });
    await openSettings();

    await act(async () => {
      await fireEvent.press(screen.getByTestId('segment-yellow'));
    });

    expect((await repository.load()).captionColor).toBe('yellow');
    const preview = screen.getByTestId('caption-preview');
    expect(preview.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ color: '#FFFF00' })]),
    );
  });

  it('the volume slider reports its value as a percentage', async () => {
    const repository = createInMemorySettingsRepository();
    await renderApp({ settingsRepository: repository });
    await openSettings();

    await act(async () => {
      await fireEvent(screen.getByTestId('slider-volume'), 'valueChange', 0);
    });

    // Silence is a legitimate setting here: the banner and the buzz remain.
    expect(screen.getByText('0%')).toBeTruthy();
    expect((await repository.load()).alertVolume).toBe(0);
  });

  it('the balance slider names the side it favours', async () => {
    await renderApp();
    await openSettings();

    await act(async () => {
      await fireEvent(screen.getByTestId('slider-balance'), 'valueChange', 1);
    });

    expect(screen.getByText('100% right')).toBeTruthy();
  });

  it('turning vibration off disables the pattern previews', async () => {
    const repository = createInMemorySettingsRepository();
    await renderApp({ settingsRepository: repository });
    await openSettings();

    await act(async () => {
      await fireEvent(screen.getByTestId('switch-vibration'), 'valueChange', false);
    });

    expect((await repository.load()).vibrationEnabled).toBe(false);
    expect(screen.getByText('Turn vibration on above to feel these.')).toBeTruthy();
    expect(screen.getByTestId('pattern-medication').props.accessibilityState.disabled).toBe(true);
  });

  it('a pattern can be previewed without changing anything', async () => {
    const repository = createInMemorySettingsRepository();
    await renderApp({ settingsRepository: repository });
    await openSettings();

    await act(async () => {
      await fireEvent.press(screen.getByTestId('pattern-medication'));
    });

    expect(impactAsync).toHaveBeenCalled();
    expect(await repository.load()).toEqual(defaultSettings);
  });

  it('sign out routes back to the welcome screen', async () => {
    await renderApp();
    await openSettings();

    await fireEvent.press(screen.getByText('Sign out'));

    expect(await screen.findByText('Your daily companion for calm, confident care.')).toBeTruthy();
    expect(screen.queryByText('Accessibility Settings')).toBeNull();
  });
});

describe('stored preferences', () => {
  it('are applied on first paint', async () => {
    await renderApp({
      settingsRepository: createInMemorySettingsRepository(
        withSettings(defaultSettings, {
          alertVolume: 0.3,
          audioBalance: -0.5,
          captionSize: 'small',
        }),
      ),
    });
    await openSettings();

    expect(screen.getByText('30%')).toBeTruthy();
    expect(screen.getByText('50% left')).toBeTruthy();
    expect(screen.getByText('Currently small.')).toBeTruthy();
  });
});
