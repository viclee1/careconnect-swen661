import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import InstallPrompt from './InstallPrompt';

const DISMISS_KEY = 'careconnect_install_dismissed_until';
const FOURTEEN_DAYS = 14 * 24 * 60 * 60 * 1000;

/** Fires the browser's install offer, as Chrome does once the PWA qualifies. */
function offerInstall(outcome: 'accepted' | 'dismissed' = 'accepted') {
  const event = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), {
    prompt: jest.fn().mockResolvedValue(undefined),
    userChoice: Promise.resolve({ outcome }),
  });
  act(() => {
    window.dispatchEvent(event);
  });
  return event;
}

const prompt = () => screen.queryByRole('region', { name: 'Install CareConnect' });

beforeEach(() => {
  localStorage.clear();
});

describe('Install prompt', () => {
  it('stays hidden until the browser offers installation, then replaces its mini-infobar', () => {
    render(<InstallPrompt />);
    expect(prompt()).not.toBeInTheDocument();

    const event = offerInstall();
    expect(event.defaultPrevented).toBe(true);
    expect(prompt()).toHaveTextContent("Add CareConnect to your device for quick, offline access to today's plan.");
  });

  it('Install opens the browser dialog, then hides and stays quiet for two weeks', async () => {
    const user = userEvent.setup();
    render(<InstallPrompt />);
    const event = offerInstall('dismissed');
    await user.click(screen.getByRole('button', { name: 'Install' }));

    expect(event.prompt).toHaveBeenCalledTimes(1);
    expect(prompt()).not.toBeInTheDocument();
    expect(Number(localStorage.getItem(DISMISS_KEY))).toBeGreaterThan(Date.now() + FOURTEEN_DAYS - 60_000);
  });

  it.each([
    ['Not now', async (user: ReturnType<typeof userEvent.setup>) => user.click(screen.getByRole('button', { name: 'Not now' }))],
    ['the close button', async (user: ReturnType<typeof userEvent.setup>) => user.click(screen.getByRole('button', { name: 'Dismiss install prompt' }))],
    ['Escape', async (user: ReturnType<typeof userEvent.setup>) => {
      screen.getByRole('button', { name: 'Install' }).focus();
      await user.keyboard('{Escape}');
    }],
  ])('%s dismisses it and snoozes it', async (_how, dismiss) => {
    const user = userEvent.setup();
    render(<InstallPrompt />);
    offerInstall();
    await dismiss(user);
    expect(prompt()).not.toBeInTheDocument();
    expect(localStorage.getItem(DISMISS_KEY)).not.toBeNull();
  });

  it('does not offer again while snoozed, but does once the snooze has passed', () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now() + 60_000));
    const { unmount } = render(<InstallPrompt />);
    offerInstall();
    expect(prompt()).not.toBeInTheDocument();
    unmount();

    localStorage.setItem(DISMISS_KEY, String(Date.now() - 1));
    render(<InstallPrompt />);
    offerInstall();
    expect(prompt()).toBeInTheDocument();
  });

  it('never offers inside the installed app', () => {
    jest.mocked(window.matchMedia).mockImplementationOnce((query: string) => ({
      matches: query === '(display-mode: standalone)',
      media: query,
    }) as MediaQueryList);
    render(<InstallPrompt />);
    offerInstall();
    expect(prompt()).not.toBeInTheDocument();
  });

  it('hides itself when the app is installed some other way', () => {
    render(<InstallPrompt />);
    offerInstall();
    act(() => {
      window.dispatchEvent(new Event('appinstalled'));
    });
    expect(prompt()).not.toBeInTheDocument();
  });
});
