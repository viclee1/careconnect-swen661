import { screen, within } from '@testing-library/react';

import { createMockContactRepository } from '../../data/contactRepository';
import { createMockMessageRepository } from '../../data/messageRepository';
import { createInMemorySettingsRepository } from '../../data/settingsRepository';
import { renderApp } from '../../test-support/harness';

/**
 * The header Home and My Day share: the appointment banner, the captioned
 * reminder, and the toolbar. Rendered through the real app, so its buttons
 * navigate with the real router.
 */
const repositories = () => ({
  contacts: createMockContactRepository(),
  messages: createMockMessageRepository(),
  settings: createInMemorySettingsRepository(),
});

const openHome = async () => {
  const rendered = renderApp({ repositories: repositories(), initialRoute: { name: 'Home' } });
  await screen.findByText(/here's your day/i);
  return rendered;
};

const appointmentBanner = () =>
  screen.queryByRole('region', { name: 'Upcoming appointment notification' });

afterEach(() => document.body.classList.remove('high-contrast'));

describe('TopNotificationHeader', () => {
  it('shows the upcoming appointment as text, with its time', async () => {
    await openHome();
    const banner = appointmentBanner()!;
    expect(within(banner).getByText('Upcoming appointment')).toBeInTheDocument();
    expect(within(banner).getByText('Today at 10:30 am')).toBeInTheDocument();
  });

  it('pauses and resumes the reminder, naming the action each time', async () => {
    const { user } = await openHome();

    await user.click(screen.getByRole('button', { name: 'Pause reminder sound' }));
    const resume = screen.getByRole('button', { name: 'Resume reminder sound' });
    expect(resume).toHaveTextContent('Resume');

    await user.click(resume);
    expect(screen.getByRole('button', { name: 'Pause reminder sound' })).toBeInTheDocument();
  });

  it('removes the banner once the appointment is acknowledged', async () => {
    const { user } = await openHome();
    await user.click(screen.getByRole('button', { name: 'OK, acknowledge upcoming appointment' }));
    expect(appointmentBanner()).not.toBeInTheDocument();
  });

  it('shows the captioned reminder on Home but not on My Day', async () => {
    const { user } = await openHome();
    expect(
      screen.getByRole('region', { name: 'Captioned reminder notification' }),
    ).toHaveTextContent('[CC]');

    await user.click(screen.getAllByRole('button', { name: /my day/i })[0]);
    await screen.findByRole('heading', { level: 1, name: 'My Day' });
    expect(
      screen.queryByRole('region', { name: 'Captioned reminder notification' }),
    ).not.toBeInTheDocument();
  });

  it('keeps Back disabled, since a sidebar page starts a fresh history', async () => {
    // Home and My Day are top-level destinations: reaching one from the sidebar
    // resets the history, so there is never anything for Back to return to.
    const { user } = await openHome();
    expect(screen.getByRole('button', { name: 'Go back' })).toBeDisabled();

    await user.click(screen.getAllByRole('button', { name: /my day/i })[0]);
    await screen.findByRole('heading', { level: 1, name: 'My Day' });
    expect(screen.getByRole('button', { name: 'Go back' })).toBeDisabled();
  });

  it('returns Home from the toolbar', async () => {
    const { user } = renderApp({ repositories: repositories(), initialRoute: { name: 'MyDay' } });
    await screen.findByRole('heading', { level: 1, name: 'My Day' });
    await user.click(screen.getByRole('button', { name: 'Go to Home' }));
    expect(await screen.findByText(/here's your day/i)).toBeInTheDocument();
  });

  it('opens Accessibility Settings from Alerts', async () => {
    const { user } = await openHome();
    await user.click(screen.getByRole('button', { name: 'Alerts' }));
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Accessibility Settings' }),
    ).toBeInTheDocument();
  });

  it('opens the keyboard shortcut card', async () => {
    const { user } = await openHome();
    await user.click(screen.getByRole('button', { name: 'View keyboard shortcuts' }));
    expect(screen.getByRole('dialog', { name: 'Keyboard shortcuts' })).toBeInTheDocument();
  });

  it('toggles contrast mode on and off', async () => {
    const { user } = await openHome();
    const toggle = screen.getByRole('button', { name: 'Toggle contrast mode' });

    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await user.click(toggle);
    expect(document.body).toHaveClass('high-contrast');
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await user.click(toggle);
    expect(document.body).not.toHaveClass('high-contrast');
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
  });

  it('accepts a search query', async () => {
    const { user } = await openHome();
    const search = screen.getByRole('searchbox', { name: 'Search CareConnect' });
    await user.type(search, 'Maria');
    expect(search).toHaveValue('Maria');
  });

  it('keeps every toolbar control reachable by keyboard', async () => {
    const { user } = await openHome();
    const toolbar = screen.getByRole('toolbar', { name: 'Desktop application controls' });
    const home = within(toolbar).getByRole('button', { name: 'Go to Home' });

    home.focus();
    await user.tab();
    expect(within(toolbar).getByRole('searchbox')).toHaveFocus();
    await user.tab();
    expect(within(toolbar).getByRole('button', { name: 'Toggle contrast mode' })).toHaveFocus();
  });
});
