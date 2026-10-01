import { screen, waitFor, within } from '@testing-library/react';

import { createMockContactRepository } from '../../data/contactRepository';
import { createMockMessageRepository } from '../../data/messageRepository';
import { createInMemorySettingsRepository } from '../../data/settingsRepository';
import { destinations } from '../../navigation/destinations';
import { allShortcuts } from '../../../shared/shortcuts';
import { installBridge, renderApp, tabbableElements } from '../../test-support/harness';

const repositories = () => ({
  contacts: createMockContactRepository(),
  messages: createMockMessageRepository({ now: Date.now() }),
  settings: createInMemorySettingsRepository(),
});

describe('the desktop shell', () => {
  describe('the sidebar', () => {
    it('keeps every destination visible at once, as the design calls for', async () => {
      renderApp({ repositories: repositories() });

      const nav = await screen.findByRole('navigation', { name: 'Main' });
      for (const entry of destinations) {
        expect(within(nav).getByRole('button', { name: entry.label })).toBeInTheDocument();
      }
    });

    it('marks the current page with more than a colour', async () => {
      const { user } = renderApp({ repositories: repositories() });

      const contacts = await screen.findByRole('button', { name: 'Contacts' });
      expect(contacts).toHaveAttribute('aria-current', 'page');

      await user.click(screen.getByRole('button', { name: 'Medicines' }));

      expect(screen.getByRole('button', { name: 'Medicines' })).toHaveAttribute(
        'aria-current',
        'page',
      );
      expect(screen.getByRole('button', { name: 'Contacts' })).not.toHaveAttribute(
        'aria-current',
      );
    });

    it('moves between destinations with the arrow keys', async () => {
      const { user } = renderApp({ repositories: repositories() });

      const home = await screen.findByRole('button', { name: 'Home' });
      home.focus();
      await user.keyboard('{ArrowDown}');

      expect(screen.getByRole('button', { name: 'My Day' })).toHaveFocus();

      await user.keyboard('{ArrowUp}');
      expect(home).toHaveFocus();
    });

    it('wraps at the ends of the list', async () => {
      const { user } = renderApp({ repositories: repositories() });

      const home = await screen.findByRole('button', { name: 'Home' });
      home.focus();
      await user.keyboard('{ArrowUp}');

      expect(screen.getByRole('button', { name: 'Contacts' })).toHaveFocus();
    });

    it('leaves every destination in the tab order as well', async () => {
      // A landmark's links are expected to be tabbable. Taking that away to
      // implement a roving tabindex would trade one convention for another.
      const { container } = renderApp({ repositories: repositories() });
      await screen.findByRole('navigation', { name: 'Main' });

      const tabbable = tabbableElements(container);
      for (const entry of destinations) {
        expect(tabbable).toContain(screen.getByRole('button', { name: entry.label }));
      }
    });
  });

  describe('the skip link', () => {
    it('is the first thing Tab reaches', async () => {
      // Without it a keyboard user pays for the persistent sidebar on every
      // page, tabbing past eight items before reaching the content.
      const { container } = renderApp({ repositories: repositories() });
      await screen.findByTestId('contact-c1');

      expect(tabbableElements(container)[0]).toHaveTextContent('Skip to main content');
    });

    it('points at the main landmark', async () => {
      renderApp({ repositories: repositories() });

      const link = await screen.findByRole('link', { name: 'Skip to main content' });
      expect(link).toHaveAttribute('href', '#main-content');
      expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
    });
  });

  describe('keyboard shortcuts', () => {
    it('opens each destination with its digit', async () => {
      const { user } = renderApp({ repositories: repositories() });
      await screen.findByTestId('contact-c1');

      await user.keyboard('{Control>}4{/Control}');
      expect(
        await screen.findByRole('heading', { level: 1, name: 'Medicines' }),
      ).toBeInTheDocument();

      await user.keyboard('{Control>}6{/Control}');
      expect(await screen.findByTestId('contact-c1')).toBeInTheDocument();
    });

    it('opens Accessibility Settings on the platform preferences shortcut', async () => {
      const { user } = renderApp({ repositories: repositories() });
      await screen.findByTestId('contact-c1');

      await user.keyboard('{Control>},{/Control}');

      expect(
        await screen.findByRole('heading', { level: 1, name: /accessibility settings/i }),
      ).toBeInTheDocument();
    });

    it('does not intercept a shortcut nothing is listening for', async () => {
      // Ctrl+F on a page with no search box should go on being whatever the
      // platform does with it.
      const { user } = renderApp({
        repositories: repositories(),
        initialRoute: { name: 'Settings' },
      });
      await screen.findByTestId('switch-captions');

      await user.keyboard('{Control>}f{/Control}');

      expect(
        screen.getByRole('heading', { level: 1, name: /accessibility settings/i }),
      ).toBeInTheDocument();
    });
  });

  describe('the keyboard reference card', () => {
    it('opens from the sidebar and from its shortcut', async () => {
      const { user } = renderApp({ repositories: repositories() });
      await screen.findByTestId('contact-c1');

      await user.click(screen.getByRole('button', { name: 'Keyboard shortcuts' }));
      expect(await screen.findByRole('dialog')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Close' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

      await user.keyboard('{Control>}/{/Control}');
      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    it('prints every shortcut the application actually binds', async () => {
      // The card and the native menu are built from one table, so the card
      // cannot advertise a shortcut that does not exist.
      const { user } = renderApp({ repositories: repositories() });
      await screen.findByTestId('contact-c1');

      await user.click(screen.getByRole('button', { name: 'Keyboard shortcuts' }));
      const dialog = await screen.findByRole('dialog');

      for (const spec of allShortcuts) {
        // `getAllByText`, because the card's own row ("Keyboard shortcuts")
        // shares its wording with the dialog title above it.
        expect(within(dialog).getAllByText(spec.label).length).toBeGreaterThan(0);
      }
    });

    it('puts navigation before the editing commands everyone already knows', async () => {
      const { user } = renderApp({ repositories: repositories() });
      await screen.findByTestId('contact-c1');

      await user.click(screen.getByRole('button', { name: 'Keyboard shortcuts' }));
      const dialog = await screen.findByRole('dialog');

      const captions = within(dialog)
        .getAllByRole('table')
        .map((table) => table.querySelector('caption')?.textContent);

      expect(captions[0]).toBe('Getting around');
      expect(captions.indexOf('Editing text')).toBeGreaterThan(captions.indexOf('Doing things'));
    });

    it('spells the keys out rather than drawing them as symbols', async () => {
      const { user } = renderApp({ repositories: repositories() });
      await screen.findByTestId('contact-c1');

      await user.click(screen.getByRole('button', { name: 'Keyboard shortcuts' }));
      const dialog = await screen.findByRole('dialog');

      for (const key of ['Ctrl', 'Shift', 'Enter', 'Tab', 'Esc', 'Space']) {
        expect(within(dialog).getAllByText(key).length).toBeGreaterThan(0);
      }
      // And no symbol-only key legend anywhere on the card.
      expect(within(dialog).queryByText('⌘')).not.toBeInTheDocument();
      expect(within(dialog).queryByText('⇧')).not.toBeInTheDocument();
    });

    it('takes focus on open and gives it back on close', async () => {
      const { user } = renderApp({ repositories: repositories() });
      await screen.findByTestId('contact-c1');

      const opener = screen.getByRole('button', { name: 'Keyboard shortcuts' });
      await user.click(opener);

      expect(await screen.findByRole('button', { name: 'Close' })).toHaveFocus();

      await user.keyboard('{Escape}');
      await waitFor(() => expect(opener).toHaveFocus());
    });

    it('keeps Tab inside the dialog', async () => {
      // A modal whose focus escapes to the page behind it is, for a
      // keyboard-only user, a modal they cannot close.
      const { user } = renderApp({ repositories: repositories() });
      await screen.findByTestId('contact-c1');

      await user.click(screen.getByRole('button', { name: 'Keyboard shortcuts' }));
      const dialog = await screen.findByRole('dialog');

      await user.tab();
      expect(dialog).toContainElement(document.activeElement as HTMLElement);

      await user.tab();
      expect(dialog).toContainElement(document.activeElement as HTMLElement);

      await user.tab({ shift: true });
      expect(dialog).toContainElement(document.activeElement as HTMLElement);
    });

    it('is a modal dialog, not a styled div', async () => {
      const { user } = renderApp({ repositories: repositories() });
      await screen.findByTestId('contact-c1');

      await user.click(screen.getByRole('button', { name: 'Keyboard shortcuts' }));
      const dialog = await screen.findByRole('dialog');

      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAccessibleName('Keyboard shortcuts');
    });
  });

  describe('the native menu', () => {
    it('routes a menu command from the main process to the page it names', async () => {
      const bridge = installBridge();
      try {
        renderApp({ repositories: repositories() });
        await screen.findByTestId('contact-c1');

        bridge.emitMenuCommand('navigate:settings');

        expect(
          await screen.findByRole('heading', { level: 1, name: /accessibility settings/i }),
        ).toBeInTheDocument();
      } finally {
        bridge.uninstall();
      }
    });

    it('opens the reference card from the Help menu', async () => {
      const bridge = installBridge();
      try {
        renderApp({ repositories: repositories() });
        await screen.findByTestId('contact-c1');

        bridge.emitMenuCommand('help:shortcuts');

        expect(await screen.findByRole('dialog')).toBeInTheDocument();
      } finally {
        bridge.uninstall();
      }
    });

    it('runs without a menu at all, so the renderer is usable in a browser', async () => {
      // There is no bridge installed here. Every shortcut is bound in the
      // renderer as well as in the native menu, which is what makes the whole
      // suite able to press them.
      const { user } = renderApp({ repositories: repositories() });
      await screen.findByTestId('contact-c1');

      await user.keyboard('{Control>}1{/Control}');

      expect(await screen.findByRole('heading', { level: 1, name: /Home|Here's your day/i })).toBeInTheDocument();
    });
  });

  describe('pages owned by other branches', () => {
    it('says whose work is landing there instead of showing a dead tab', async () => {
      const { user } = renderApp({ repositories: repositories() });
      await screen.findByTestId('contact-c1');

      await user.click(screen.getByRole('button', { name: 'Appointments' }));

      expect(
        await screen.findByRole('heading', { name: /appointments is not on this branch yet/i }),
      ).toBeInTheDocument();
      expect(screen.getByText('Owner: Rehman')).toBeInTheDocument();
    });

    it('offers a way back to a page that does exist', async () => {
      const { user } = renderApp({ repositories: repositories() });
      await screen.findByTestId('contact-c1');

      await user.click(screen.getByRole('button', { name: 'Memories' }));
      await user.click(await screen.findByRole('button', { name: 'Go to Contacts' }));

      expect(await screen.findByTestId('contact-c1')).toBeInTheDocument();
    });
  });
});
