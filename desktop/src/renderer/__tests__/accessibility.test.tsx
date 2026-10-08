import { act, screen, waitFor, within } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

import { createMockContactRepository } from '../data/contactRepository';
import { createMockMessageRepository } from '../data/messageRepository';
import { createInMemorySettingsRepository } from '../data/settingsRepository';
import type { Route } from '../navigation/NavigationProvider';
import { renderApp } from '../test-support/harness';

expect.extend(toHaveNoViolations);

// axe's label-in-name check measures icon-font ligatures on a canvas, which
// jsdom does not implement. No canvas means "not a ligature", which is true:
// this application draws its icons as inline SVG.
beforeAll(() => {
  jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
});

/**
 * Assignment 9: the automated half of the WCAG 2.1 AA audit, run on every
 * build rather than once by hand.
 *
 * `scripts/a11y-audit.mjs` runs the same axe-core engine against the real
 * renderer in Chromium, where it can measure colour contrast and layout. This
 * suite runs it under jsdom on every page of the real application shell, so a
 * regression in names, roles, landmarks or ARIA fails `npm test` before anyone
 * opens a browser. Contrast is left to the browser run, because jsdom does no
 * layout and cannot compute a colour.
 *
 * The second half pins each fix made during the audit, so the specific defect
 * cannot quietly come back.
 */

const repositories = () => ({
  contacts: createMockContactRepository(),
  messages: createMockMessageRepository({ now: Date.now() }),
  settings: createInMemorySettingsRepository(),
});

const axeOptions = {
  runOnly: { type: 'tag' as const, values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] },
  rules: {
    // Needs real layout and colour; covered by the Chromium audit.
    'color-contrast': { enabled: false },
    // Experimental in axe, so switched on explicitly — WCAG 2.5.3.
    'label-content-name-mismatch': { enabled: true },
  },
};

const pages: Array<[string, Route, RegExp]> = [
  ['Splash', { name: 'Splash' }, /calm, confident care/i],
  ['Sign In', { name: 'SignIn' }, /welcome back/i],
  ['Sign Up', { name: 'SignUp' }, /create/i],
  ['Home', { name: 'Home' }, /here's your day/i],
  ['My Day', { name: 'MyDay' }, /my day/i],
  ['Appointments', { name: 'Appointments' }, /^appointments$/i],
  ['Medicines', { name: 'Medicines' }, /^medicines$/i],
  ['Memories', { name: 'Memories' }, /^memories$/i],
  ['Contacts', { name: 'Contacts' }, /^contacts$/i],
  ['Message thread', { name: 'MessageThread', contactId: 'c1' }, /^joyce$/i],
  ['Accessibility Settings', { name: 'Settings' }, /accessibility settings/i],
];

describe('axe-core finds no WCAG 2.1 A/AA violations', () => {
  it.each(pages)('on %s', async (_label, initialRoute, heading) => {
    const { container } = renderApp({ repositories: repositories(), initialRoute });
    await screen.findByRole('heading', { level: 1, name: heading });
    // Let every provider finish loading so the scan sees the settled page.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });

  it('with the keyboard shortcuts dialog open', async () => {
    const { container, user } = renderApp({ repositories: repositories() });
    await screen.findByTestId('contact-c1');
    await user.click(screen.getByRole('button', { name: 'Keyboard shortcuts' }));
    await screen.findByRole('dialog', { name: 'Keyboard shortcuts' });

    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });

  it('with sign-in validation errors showing', async () => {
    const { container, user } = renderApp({
      repositories: repositories(),
      initialRoute: { name: 'SignIn' },
    });
    await user.click(await screen.findByRole('button', { name: /^sign in$/i }));
    await screen.findByRole('alert');

    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});

describe('fixes from the Assignment 9 audit', () => {
  it('keeps one top-level contentinfo landmark, outside <main>', async () => {
    renderApp({ repositories: repositories(), initialRoute: { name: 'Home' } });
    await screen.findByRole('heading', { level: 1, name: /here's your day/i });

    const footers = screen.getAllByRole('contentinfo');
    expect(footers).toHaveLength(1);
    expect(screen.getByRole('main')).not.toContainElement(footers[0]);
  });

  it('shows the status bar on every signed-in page, not just Home and My Day', async () => {
    renderApp({ repositories: repositories(), initialRoute: { name: 'Medicines' } });
    await screen.findByRole('heading', { level: 1, name: /^medicines$/i });

    expect(screen.getByRole('contentinfo', { name: 'Application status' })).toBeInTheDocument();
  });

  it('names the status-bar shortcut button by its visible words', async () => {
    renderApp({ repositories: repositories(), initialRoute: { name: 'Home' } });
    const footer = await screen.findByRole('contentinfo');

    const button = within(footer).getByRole('button');
    expect(button).toHaveAccessibleName(button.textContent ?? '');
    expect(button).toHaveTextContent('Keyboard shortcuts: Ctrl + Slash');
  });

  it('names the Settings sidebar item by its visible label', async () => {
    renderApp({ repositories: repositories() });
    const nav = await screen.findByRole('navigation', { name: 'Main' });

    const settings = within(nav).getByRole('button', { name: /^Settings/ });
    expect(settings).not.toHaveAttribute('aria-label');
    expect(within(nav).queryByRole('button', { name: 'Accessibility' })).not.toBeInTheDocument();
  });

  it('keeps every sidebar label in the accessibility tree, so the narrow sidebar stays named', async () => {
    renderApp({ repositories: repositories() });
    const nav = await screen.findByRole('navigation', { name: 'Main' });

    for (const button of within(nav).getAllByRole('button')) {
      expect(button.querySelector('.sidebar__label')).not.toBeNull();
      expect(button).toHaveAccessibleName(/\w/);
    }
  });

  it('lets the conversation history be scrolled from the keyboard', async () => {
    renderApp({
      repositories: repositories(),
      initialRoute: { name: 'MessageThread', contactId: 'c1' },
    });

    const history = await screen.findByRole('region', { name: 'Conversation with Joyce' });
    expect(history).toHaveAttribute('tabindex', '0');
  });

  it('lets the shortcut card be scrolled from the keyboard, inside the focus trap', async () => {
    const { user } = renderApp({ repositories: repositories() });
    await screen.findByTestId('contact-c1');
    await user.click(screen.getByRole('button', { name: 'Keyboard shortcuts' }));

    const dialog = await screen.findByRole('dialog');
    const body = within(dialog).getByRole('region', { name: 'Shortcut list' });
    expect(body).toHaveAttribute('tabindex', '0');

    // Close → Print → body → back to Close: the trap includes the new stop.
    expect(within(dialog).getByRole('button', { name: 'Close' })).toHaveFocus();
    await user.tab();
    expect(body).toHaveFocus();
    await user.tab();
    expect(within(dialog).getByRole('button', { name: 'Print' })).toHaveFocus();
  });

  it('makes each My Day task a real toggle button that Space and Enter operate', async () => {
    const { user } = renderApp({ repositories: repositories(), initialRoute: { name: 'MyDay' } });
    await screen.findByRole('heading', { level: 1, name: /my day/i });

    const list = screen.getByRole('list');
    const first = within(list).getAllByRole('button')[0];
    expect(first.tagName).toBe('BUTTON');
    const before = first.getAttribute('aria-pressed');

    first.focus();
    await user.keyboard(' ');
    expect(first).toHaveAttribute('aria-pressed', before === 'true' ? 'false' : 'true');
    await user.keyboard('{Enter}');
    expect(first).toHaveAttribute('aria-pressed', before ?? 'false');
  });

  it('names a My Day task by the words on the card', async () => {
    renderApp({ repositories: repositories(), initialRoute: { name: 'MyDay' } });
    await screen.findByRole('heading', { level: 1, name: /my day/i });

    for (const card of within(screen.getByRole('list')).getAllByRole('button')) {
      const title = card.querySelector('.myday-card__title')?.textContent ?? '';
      expect(card).toHaveAccessibleName(new RegExp(`^${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
      expect(card).not.toHaveAttribute('aria-label');
    }
  });

  it('names a contact row by its printed words, and adds what is not printed', async () => {
    renderApp({ repositories: repositories() });
    const helpline = await screen.findByRole('button', { name: /urgent care service/i });

    expect(helpline).not.toHaveAttribute('aria-label');
    const name = helpline.querySelector('.contact-row__name')?.textContent ?? '';
    expect(helpline).toHaveAccessibleName(new RegExp(`^${name}`));
  });

  it('describes a vibration pattern without changing its name', async () => {
    renderApp({ repositories: repositories(), initialRoute: { name: 'Settings' } });
    const row = await screen.findByTestId('pattern-medication');

    expect(row).toHaveAccessibleName(/^Medication Double pulse$/);
    expect(row).toHaveAccessibleDescription(/Activate to see the Double pulse rhythm/);
  });

  it('starts the appointment acknowledgement name with the visible "OK"', async () => {
    renderApp({ repositories: repositories(), initialRoute: { name: 'Home' } });
    await screen.findByRole('heading', { level: 1, name: /here's your day/i });

    const ok = screen.getByRole('button', { name: /acknowledge upcoming appointment/i });
    expect(ok).toHaveTextContent('OK');
    expect(ok).toHaveAccessibleName(/^OK/);
  });

  it('ties each sign-in error to its field and moves focus to the first one', async () => {
    const { user } = renderApp({ repositories: repositories(), initialRoute: { name: 'SignIn' } });
    await user.click(await screen.findByRole('button', { name: /^sign in$/i }));

    const email = screen.getByLabelText('Email address');
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveAccessibleDescription('Please enter your email address.');
    expect(screen.getByLabelText('Password')).toHaveAccessibleDescription(
      'Please enter your password.',
    );
    await waitFor(() => expect(email).toHaveFocus());

    await user.type(email, 'margaret@example.com');
    await user.click(screen.getByRole('button', { name: /^sign in$/i }));
    expect(email).toHaveAttribute('aria-invalid', 'false');
    await waitFor(() => expect(screen.getByLabelText('Password')).toHaveFocus());
  });

  it('ties each sign-up error to its field', async () => {
    const { user } = renderApp({ repositories: repositories(), initialRoute: { name: 'SignUp' } });
    const heading = await screen.findByRole('heading', { level: 1 });
    const form = heading.closest('main') as HTMLElement;
    await user.click(within(form).getAllByRole('button', { name: /create|sign up/i }).pop()!);

    const invalid = form.querySelectorAll('[aria-invalid="true"]');
    expect(invalid.length).toBeGreaterThan(0);
    for (const field of Array.from(invalid)) {
      expect(field).toHaveAccessibleDescription(/\w/);
    }
    await waitFor(() => expect(invalid[0]).toHaveFocus());
  });

  it('announces Notify by its printed title and subtitle', async () => {
    renderApp({
      repositories: repositories(),
      initialRoute: { name: 'MessageThread', contactId: 'c1' },
    });
    const notify = await screen.findByTestId('notify-button');

    await waitFor(() =>
      expect(notify).toHaveAccessibleName(
        'Alert Joyce you want to talk Sends a visual flash and vibration — no sound',
      ),
    );
  });
});
