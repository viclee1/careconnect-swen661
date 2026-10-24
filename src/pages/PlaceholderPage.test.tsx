import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import PlaceholderPage from './PlaceholderPage';
import { renderWithProviders } from '../test-utils/renderWithProviders';

beforeEach(() => {
  localStorage.clear();
  document.title = '';
});

describe('PlaceholderPage', () => {
  it('names the screen, says it is coming from another branch and who owns it', () => {
    renderWithProviders(<PlaceholderPage title="Medicines" owner="Upneet Bir" />);
    expect(screen.getByRole('heading', { level: 1, name: 'Medicines' })).toBeInTheDocument();
    expect(screen.getByText('Coming from another branch')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Medicines is not on this branch yet' })).toBeInTheDocument();
    expect(screen.getByText(/Upneet Bir is building this page/)).toBeInTheDocument();
    expect(screen.getByText('Owner: Upneet Bir')).toBeInTheDocument();
  });

  it('says when a screen has no owner yet', () => {
    renderWithProviders(<PlaceholderPage title="Activity log" />);
    expect(screen.getByText('Owner: not yet assigned')).toBeInTheDocument();
    expect(screen.getByText(/not part of the Assignment 11 screen split/)).toBeInTheDocument();
  });

  it('inside the app, offers a way to Contacts and leaves the page structure to the layout', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PlaceholderPage title="My Day" owner="Justin Zhang" />);
    expect(screen.queryByRole('main')).not.toBeInTheDocument();
    expect(document.title).toBe('');
    await user.click(screen.getByRole('link', { name: 'Go to Contacts' }));
    expect(await screen.findByRole('heading', { name: 'Contacts list' })).toBeInTheDocument();
  });

  it('standing in for a sign-in screen, gives the page its own skip link, banner, main and title', () => {
    renderWithProviders(<PlaceholderPage title="Welcome" owner="Justin Zhang" standalone />);
    expect(screen.getByRole('link', { name: 'Skip to main content' })).toHaveAttribute('href', '#main-content');
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
    expect(document.title).toBe('Welcome — CareConnect');
  });

  it('continues to Contacts as the demo care recipient, creating the account the first time', async () => {
    const user = userEvent.setup();
    const { unmount } = renderWithProviders(<PlaceholderPage title="Sign In" owner="Justin Zhang" standalone />);
    await user.click(screen.getByRole('button', { name: 'Continue to Contacts as Margaret Whitfield' }));
    expect(await screen.findByRole('heading', { name: 'Contacts list' })).toBeInTheDocument();
    const session = JSON.parse(localStorage.getItem('careconnect_session') ?? '{}');
    expect(session).toMatchObject({ role: 'patient', user: { email: 'margaret@example.com' } });
    unmount();

    // Second visit: the account exists, so it signs in rather than signing up.
    localStorage.removeItem('careconnect_session');
    renderWithProviders(<PlaceholderPage title="Sign In" owner="Justin Zhang" standalone />);
    await user.click(screen.getByRole('button', { name: 'Continue to Contacts as Margaret Whitfield' }));
    await waitFor(() =>
      expect(JSON.parse(localStorage.getItem('careconnect_session') ?? '{}').role).toBe('patient'),
    );
  });
});
