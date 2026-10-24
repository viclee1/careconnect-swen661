import { act, fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AccessibilitySettings from './AccessibilitySettings';
import { SETTINGS_KEY } from '../context/SettingsContext';
import { renderWithProviders } from '../test-utils/renderWithProviders';

function renderSettings() {
  return renderWithProviders(<AccessibilitySettings />, { path: '/', route: '/' });
}

function stored() {
  return JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}');
}

beforeEach(() => localStorage.clear());

describe('AccessibilitySettings', () => {
  it('groups the preferences under labelled sections', () => {
    renderSettings();
    for (const name of ['Visual Alerts', 'Captions', 'Audio', 'Screen Flash & Desktop Alerts', 'Vibration', 'Account']) {
      expect(screen.getByRole('region', { name })).toBeInTheDocument();
    }
  });

  it('starts compliant, with every switch named and on', () => {
    renderSettings();
    expect(screen.getByText('WCAG 2.2 Compliant')).toBeInTheDocument();
    for (const name of ['Visual alert banners', 'Smart alert escalation', 'Show captions', 'Vibration alerts']) {
      expect(screen.getByRole('switch', { name })).toBeChecked();
    }
  });

  it('will not let the visual alert banner be switched off, and says why', () => {
    renderSettings();
    const banners = screen.getByRole('switch', { name: 'Visual alert banners' });
    expect(banners).toBeDisabled();
    expect(banners).toHaveAccessibleDescription(/could reach you by sound alone/);
  });

  it('toggles a switch with Space and saves the change', async () => {
    const user = userEvent.setup();
    renderSettings();
    const escalation = screen.getByRole('switch', { name: 'Smart alert escalation' });
    escalation.focus();
    await user.keyboard(' ');
    expect(escalation).not.toBeChecked();
    expect(stored().smartEscalation).toBe(false);
  });

  it('turning captions off flips the conformance banner and disables caption styling', async () => {
    const user = userEvent.setup();
    renderSettings();
    await user.click(screen.getByRole('switch', { name: 'Show captions' }));

    expect(screen.getByText('Check your captions')).toBeInTheDocument();
    expect(screen.getByText('Captions are off, so some spoken content will have no text')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Large' })).toBeDisabled();
    expect(screen.getByTestId('caption-preview')).toHaveTextContent('Captions are off.');
  });

  it('changes caption size and colour from radio groups and updates the preview', async () => {
    const user = userEvent.setup();
    renderSettings();
    const size = screen.getByRole('group', { name: 'Caption size' });
    expect(size).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Medium' })).toBeChecked();

    await user.click(screen.getByRole('radio', { name: 'Large' }));
    await user.click(screen.getByRole('radio', { name: 'Yellow' }));

    const preview = screen.getByTestId('caption-preview');
    expect(preview).toHaveStyle({ fontSize: '28.8px', color: '#FFFF00' });
    expect(screen.getByText('Caption preview — large, yellow text')).toBeInTheDocument();
    expect(stored()).toMatchObject({ captionSize: 'large', captionColor: 'yellow' });
  });

  it('moves between caption sizes with the arrow keys', async () => {
    const user = userEvent.setup();
    renderSettings();
    screen.getByRole('radio', { name: 'Medium' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'Large' })).toBeChecked();
  });

  it('prints slider values in words and announces them', () => {
    renderSettings();
    const volume = screen.getByRole('slider', { name: 'Alert volume' });
    expect(volume).toHaveAttribute('aria-valuetext', 'Alert volume 70 per cent');
    fireEvent.change(volume, { target: { value: '0.3' } });
    expect(screen.getByText('30%')).toBeInTheDocument();

    const balance = screen.getByRole('slider', { name: 'Audio balance' });
    fireEvent.change(balance, { target: { value: '-0.5' } });
    expect(balance).toHaveAttribute('aria-valuetext', 'Audio balance 50% left');
    expect(stored()).toMatchObject({ alertVolume: 0.3, audioBalance: -0.5 });
  });

  it('disables the vibration patterns when vibration is off', async () => {
    const user = userEvent.setup();
    renderSettings();
    await user.click(screen.getByRole('switch', { name: 'Vibration alerts' }));
    expect(screen.getByRole('button', { name: /Appointment Long-short-long/ })).toBeDisabled();
    expect(screen.getByText('Turn vibration on above to play these.')).toBeInTheDocument();
  });

  it('plays a vibration rhythm as a visual pulse and on the device', () => {
    jest.useFakeTimers();
    const vibrate = jest.fn();
    Object.defineProperty(navigator, 'vibrate', { configurable: true, value: vibrate });
    try {
      renderSettings();
      fireEvent.click(screen.getByRole('button', { name: /Medication Double pulse/ }));
      expect(vibrate).toHaveBeenCalledWith([120, 100, 120, 400, 120, 100, 120]);
      expect(screen.getByText('Playing the Double pulse rhythm.')).toBeInTheDocument();

      act(() => jest.advanceTimersByTime(10));
      expect(screen.getByTestId('pattern-lamp-medication')).toHaveAttribute('data-on', 'true');

      act(() => jest.advanceTimersByTime(2000));
      expect(screen.getByTestId('pattern-lamp-medication')).toHaveAttribute('data-on', 'false');
      expect(screen.queryByText('Playing the Double pulse rhythm.')).not.toBeInTheDocument();
    } finally {
      jest.useRealTimers();
      delete (navigator as { vibrate?: unknown }).vibrate;
    }
  });

  it('shows the account and signs out only after confirming in a dialog', async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      'careconnect_session',
      JSON.stringify({ user: { id: 'u1', name: 'Margaret Whitfield', email: 'm@example.com' }, role: 'patient' }),
    );
    renderSettings();
    expect(screen.getByText('Margaret Whitfield · Care Recipient')).toBeInTheDocument();

    const signOut = screen.getByRole('button', { name: 'Sign out' });
    await user.click(signOut);
    expect(screen.getByRole('dialog', { name: 'Sign out of CareConnect?' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(localStorage.getItem('careconnect_session')).not.toBeNull();

    await user.click(signOut);
    const dialog = screen.getByRole('dialog', { name: 'Sign out of CareConnect?' });
    await user.click(within(dialog).getByRole('button', { name: 'Sign out' }));
    expect(localStorage.getItem('careconnect_session')).toBeNull();
  });

  it('restores saved preferences and repairs a corrupt store', () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ captionsEnabled: false, alertVolume: 9 }));
    const { unmount } = renderSettings();
    expect(screen.getByRole('switch', { name: 'Show captions' })).not.toBeChecked();
    expect(screen.getByRole('slider', { name: 'Alert volume' })).toHaveAttribute('aria-valuetext', 'Alert volume 100 per cent');
    unmount();

    localStorage.setItem(SETTINGS_KEY, '{not json');
    renderSettings();
    expect(screen.getByRole('switch', { name: 'Show captions' })).toBeChecked();
  });

  it('draws the locked banner setting as "Always on" while keeping its switch', () => {
    renderSettings();
    expect(screen.getByText('Always on')).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Visual alert banners' })).toBeChecked();
  });

  it('previews each alert type\'s screen flash in its own colour, in words too', () => {
    jest.useFakeTimers();
    try {
      renderSettings();
      fireEvent.click(screen.getByRole('button', { name: /Missed \/ Escalated Rapid red double-flash/ }));
      const flash = screen.getByTestId('visual-flash');
      expect(flash).toHaveAttribute('data-tone', 'alert');
      expect(flash).toHaveTextContent('Missed / Escalated alert');
      expect(flash).toHaveStyle({ animationIterationCount: '2' });
      act(() => jest.advanceTimersByTime(1700));
      expect(screen.queryByTestId('visual-flash')).not.toBeInTheDocument();
    } finally {
      jest.useRealTimers();
    }
  });

  it('disables the flash previews when screen flashes are off', async () => {
    const user = userEvent.setup();
    renderSettings();
    await user.click(screen.getByRole('switch', { name: 'Screen flash alerts' }));
    expect(screen.getByRole('button', { name: /Medication Amber flash/ })).toBeDisabled();
    expect(screen.getByText('Turn screen flash alerts on above to preview these.')).toBeInTheDocument();
    expect(stored().screenFlashEnabled).toBe(false);
  });

  it('turns connected devices on and off', async () => {
    const user = userEvent.setup();
    renderSettings();
    const devices = screen.getByRole('switch', { name: 'Alert my connected devices' });
    expect(devices).not.toBeChecked();
    await user.click(devices);
    expect(devices).toBeChecked();
    expect(stored().connectedDevices).toBe(true);
  });

  describe('desktop notifications', () => {
    afterEach(() => {
      delete (window as { Notification?: unknown }).Notification;
    });

    function mockNotification(permission: NotificationPermission, answer: NotificationPermission) {
      const shown: string[] = [];
      const Fake = jest.fn((title: string) => {
        shown.push(title);
      }) as unknown as typeof Notification & { permission: NotificationPermission };
      Object.assign(Fake, { permission, requestPermission: jest.fn().mockResolvedValue(answer) });
      Object.defineProperty(window, 'Notification', { configurable: true, writable: true, value: Fake });
      return shown;
    }

    it('asks the browser, then shows a notification once allowed', async () => {
      const user = userEvent.setup();
      const shown = mockNotification('default', 'granted');
      renderSettings();
      const toggle = screen.getByRole('switch', { name: 'Desktop notifications' });
      await user.click(toggle);
      expect(await screen.findByRole('switch', { name: 'Desktop notifications', checked: true })).toBeInTheDocument();
      expect(shown).toEqual(['CareConnect notifications are on']);

      await user.click(toggle);
      expect(toggle).not.toBeChecked();
      expect(stored().desktopNotifications).toBe(false);
    });

    it('stays off and explains when the browser blocks notifications', async () => {
      const user = userEvent.setup();
      mockNotification('default', 'denied');
      renderSettings();
      await user.click(screen.getByRole('switch', { name: 'Desktop notifications' }));
      expect(await screen.findByText(/Your browser blocked notifications/)).toBeInTheDocument();
      expect(screen.getByRole('switch', { name: 'Desktop notifications' })).not.toBeChecked();
    });

    it('explains a browser with no notifications at all', async () => {
      const user = userEvent.setup();
      renderSettings();
      await user.click(screen.getByRole('switch', { name: 'Desktop notifications' }));
      expect(await screen.findByText(/This browser cannot show notifications/)).toBeInTheDocument();
    });
  });
});
