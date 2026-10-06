import { screen, waitFor, within } from '@testing-library/react';

import {
  createFlakyContactRepository,
  createMockContactRepository,
} from '../../data/contactRepository';
import { createMockMessageRepository } from '../../data/messageRepository';
import { createInMemorySettingsRepository } from '../../data/settingsRepository';
import { mockContacts } from '../../data/mockContacts';
import { renderApp, tabbableElements } from '../../test-support/harness';

const settings = () => createInMemorySettingsRepository();

/** The clock the seeded conversations are built around. */
const now = new Date('2026-09-30T12:00:00').getTime();

const repositories = () => ({
  contacts: createMockContactRepository(),
  messages: createMockMessageRepository({ now }),
  settings: settings(),
});

describe('ContactsPage', () => {
  it('lists the roster the Week 3 prototype shows, primary contact first', async () => {
    renderApp({ repositories: repositories() });

    await screen.findByTestId('contact-c1');
    const rows = screen.getAllByRole('button', { name: /caregiver|gp|daughter|son|helpline/i });

    expect(rows[0]).toHaveAccessibleName(/Joyce/);
    expect(rows[0]).toHaveAccessibleName(/primary contact/i);
    for (const contact of mockContacts) {
      expect(screen.getByTestId(`contact-${contact.id}`)).toBeInTheDocument();
    }
  });

  it('never offers a way to place a voice call', async () => {
    // The governing constraint of the whole application. A voice call is the one
    // channel these users cannot rely on, so every row leads to text.
    renderApp({ repositories: repositories() });
    await screen.findByTestId('contact-c1');

    expect(screen.queryByRole('button', { name: /^call/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /dial|phone|ring/i })).not.toBeInTheDocument();
  });

  it('explains how to get someone’s attention without sound', async () => {
    renderApp({ repositories: repositories() });
    await screen.findByTestId('contact-c1');

    const heading = screen.getByRole('heading', { name: /getting someone's attention/i });
    const banner = heading.closest('[role="status"]');
    // A banner, not a toast: announced once when it appears and then left on
    // screen, because nothing in this application disappears on a timer.
    expect(banner).not.toBeNull();
    expect(banner).toHaveTextContent(/visual flash and vibration/i);
    expect(banner).toHaveTextContent(/No sound needed/i);
  });

  it('shows a preview and a waiting count in the row’s accessible name', async () => {
    // The badge is a shape; the accessible name is what carries the same fact
    // to a screen reader, so both have to say it.
    renderApp({ repositories: repositories() });

    const joyce = await screen.findByTestId('contact-c1');
    await waitFor(() =>
      expect(joyce).toHaveAccessibleName(/1 message waiting/i),
    );
    expect(joyce).toHaveAccessibleName(/How are you feeling today/i);
    expect(within(joyce).getByText('waiting')).toBeInTheDocument();
  });

  it('previews a media message by its words, not by the word "video"', async () => {
    // A preview that just said "Video message" would leave a deaf user with no
    // idea whether it mattered.
    renderApp({ repositories: repositories() });

    const maria = await screen.findByTestId('contact-c3');
    await waitFor(() => expect(maria).toHaveAccessibleName(/Captions available —/));
    expect(maria).toHaveAccessibleName(/the garden is finally done/i);
  });

  it('opens the conversation when a row is activated', async () => {
    const { user } = renderApp({ repositories: repositories() });

    await user.click(await screen.findByTestId('contact-c1'));

    expect(await screen.findByRole('heading', { level: 1, name: 'Joyce' })).toBeInTheDocument();
    expect(screen.getByTestId('composer-input')).toBeInTheDocument();
  });

  it('opens a conversation from the keyboard with Enter', async () => {
    const { user } = renderApp({ repositories: repositories() });

    const row = await screen.findByTestId('contact-c1');
    row.focus();
    await user.keyboard('{Enter}');

    expect(await screen.findByRole('heading', { level: 1, name: 'Joyce' })).toBeInTheDocument();
  });

  it('opens a conversation from the keyboard with Space', async () => {
    const { user } = renderApp({ repositories: repositories() });

    const row = await screen.findByTestId('contact-c3');
    row.focus();
    await user.keyboard(' ');

    expect(await screen.findByRole('heading', { level: 1, name: 'Maria' })).toBeInTheDocument();
  });

  it('clears a conversation’s waiting badge once it has been opened', async () => {
    const { user } = renderApp({ repositories: repositories() });

    await waitFor(() =>
      expect(screen.getByTestId('contact-c1')).toHaveAccessibleName(/1 message waiting/i),
    );

    await user.click(screen.getByTestId('contact-c1'));
    await screen.findByRole('heading', { level: 1, name: 'Joyce' });
    await user.click(screen.getByRole('button', { name: 'Back to contacts' }));

    const joyce = await screen.findByTestId('contact-c1');
    await waitFor(() => expect(joyce).not.toHaveAccessibleName(/message waiting/i));
  });

  describe('search', () => {
    it('filters the list as the user types', async () => {
      const { user } = renderApp({ repositories: repositories() });
      await screen.findByTestId('contact-c1');

      await user.type(screen.getByRole('searchbox', { name: /find a contact/i }), 'daughter');

      expect(screen.getByTestId('contact-c1')).toBeInTheDocument();
      expect(screen.getByTestId('contact-c3')).toBeInTheDocument();
      expect(screen.queryByTestId('contact-c4')).not.toBeInTheDocument();
    });

    it('announces the result count, because rows disappearing is not audible', async () => {
      const { user } = renderApp({ repositories: repositories() });
      await screen.findByTestId('contact-c1');

      await user.type(screen.getByRole('searchbox', { name: /find a contact/i }), 'joyce');

      expect(
        screen.getByText('1 contact matches "joyce".'),
      ).toHaveAttribute('role', 'status');
    });

    it('offers a way back when a search matches nothing', async () => {
      // Not an error state, and not a silent blank area — it says what happened
      // and what to do about it.
      const { user } = renderApp({ repositories: repositories() });
      await screen.findByTestId('contact-c1');

      await user.type(screen.getByRole('searchbox', { name: /find a contact/i }), 'zzzz');

      expect(
        screen.getByRole('heading', { name: /no contacts match your search/i }),
      ).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Clear search' }));
      expect(screen.getByTestId('contact-c1')).toBeInTheDocument();
    });

    it('is reachable with the platform Find shortcut', async () => {
      const { user } = renderApp({ repositories: repositories() });
      await screen.findByTestId('contact-c1');

      document.body.focus();
      await user.keyboard('{Control>}f{/Control}');

      expect(screen.getByRole('searchbox', { name: /find a contact/i })).toHaveFocus();
    });

    it('clears the box on Escape rather than leaving the list filtered', async () => {
      const { user } = renderApp({ repositories: repositories() });
      await screen.findByTestId('contact-c1');

      const box = screen.getByRole('searchbox', { name: /find a contact/i });
      await user.type(box, 'joyce');
      await user.type(box, '{Escape}');

      expect(box).toHaveValue('');
      expect(screen.getByTestId('contact-c4')).toBeInTheDocument();
    });
  });

  describe('when contacts cannot be loaded', () => {
    it('says so, rather than looking like an empty list', async () => {
      // "No contacts yet" and "we could not reach your contacts" are different
      // facts, and a user who sees the wrong one draws the wrong conclusion.
      renderApp({
        repositories: {
          contacts: createFlakyContactRepository(1),
          messages: createMockMessageRepository({ now }),
          settings: settings(),
        },
      });

      const banner = await screen.findByRole('alert');
      expect(banner).toHaveTextContent(/Contacts could not be loaded/i);
      expect(banner).toHaveTextContent(/nothing has been lost/i);
      expect(screen.queryByRole('heading', { name: /no contacts yet/i })).not.toBeInTheDocument();
    });

    it('recovers when the user tries again', async () => {
      const { user } = renderApp({
        repositories: {
          contacts: createFlakyContactRepository(1),
          messages: createMockMessageRepository({ now }),
          settings: settings(),
        },
      });

      await screen.findByRole('alert');
      await user.click(screen.getByRole('button', { name: 'Try again' }));

      expect(await screen.findByTestId('contact-c1')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  it('says what an empty roster means and what will fill it', async () => {
    renderApp({
      repositories: {
        contacts: createMockContactRepository([]),
        messages: createMockMessageRepository({ now }),
        settings: settings(),
      },
    });

    expect(
      await screen.findByRole('heading', { name: /no contacts yet/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/your care team will appear here/i)).toBeInTheDocument();
  });

  it('can be worked through with Tab alone', async () => {
    const { container } = renderApp({ repositories: repositories() });
    await screen.findByTestId('contact-c1');

    const tabbable = tabbableElements(container);

    // Skip link, then the sidebar, then the search box, then every contact.
    expect(tabbable[0]).toHaveTextContent('Skip to main content');
    for (const contact of mockContacts) {
      expect(tabbable).toContain(screen.getByTestId(`contact-${contact.id}`));
    }
    expect(tabbable).toContain(screen.getByRole('searchbox', { name: /find a contact/i }));
  });
});
