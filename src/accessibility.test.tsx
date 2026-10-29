import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { StrictMode, useRef, useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { axe, toHaveNoViolations } from 'jest-axe';

import App from './App';
import { SHOW_TEAMMATE_PAGES } from './branchScope';
import ChatBot from './components/ChatBot';
import ConfirmDialog from './components/ConfirmDialog';
import { AuthProvider } from './auth/AuthContext';
import SignIn from './pages/SignIn';

expect.extend(toHaveNoViolations);

/**
 * Assignment 10, Part 2 — web accessibility.
 *
 * jest-axe runs the axe-core rules on the real application at its main routes
 * for both roles, and the remaining tests pin the behaviour the web
 * accessibility documentation (docs/web/accessibility/) promises, including
 * each defect fixed during the audit. Colour contrast is checked in the browser
 * by `npm run a11y:web`: jsdom does no layout, so it cannot compute colours.
 */

// axe's label-in-name check measures icon-font ligatures on a canvas, which
// jsdom lacks; "no canvas" correctly means "not a ligature" for SVG icons.
beforeAll(() => {
  jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  Element.prototype.scrollIntoView = jest.fn();
});

// jsdom loads no Tailwind CSS, so both breakpoint variants of the navigation
// would be "visible" at once. These rules reproduce the one Tailwind utility
// that matters for each width, so the tests see what a browser at that width
// exposes to assistive technology (display:none leaves the tree).
const DESKTOP =
  '.hidden { display: none } .lg\\:block { display: block } .lg\\:flex { display: flex } .lg\\:hidden { display: none }';
const MOBILE = '.hidden { display: none }';
let viewportStyle: HTMLStyleElement;

function simulate(css: string) {
  viewportStyle.textContent = css;
}

beforeEach(() => {
  localStorage.clear();
  document.title = '';
  viewportStyle = document.createElement('style');
  document.head.appendChild(viewportStyle);
  simulate(DESKTOP);
});

afterEach(() => {
  viewportStyle.remove();
});

const axeOptions = {
  rules: {
    'color-contrast': { enabled: false },
    'label-content-name-mismatch': { enabled: true },
  },
};

const user = { id: 'u1', name: 'Margaret Whitfield', email: 'margaret@example.com' };

function renderAt(path: string, role: 'patient' | 'caregiver' | null) {
  if (role) localStorage.setItem('careconnect_session', JSON.stringify({ user, role }));
  window.history.pushState({}, '', path);
  // StrictMode, as in main.tsx: it runs mount effects twice, which is how a
  // "focus on first render" bug once slipped past these tests.
  return render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

const routes: Array<[string, string, 'patient' | 'caregiver' | null]> = [
  ['Landing', '/', null],
  ['Sign in', '/signin', null],
  ['Sign up', '/signup', null],
  ['Today', '/app', 'patient'],
  ['My Day', '/app/my-day', 'patient'],
  ['Appointments', '/app/appointments', 'patient'],
  ['Medicines', '/app/medicines', 'patient'],
  ['Memories', '/app/memories', 'patient'],
  ['Contacts', '/app/contacts', 'patient'],
  ['Conversation', '/app/contacts/c2', 'patient'],
  ['Accessibility Settings', '/app/settings', 'patient'],
  ['Caregiver dashboard', '/app', 'caregiver'],
  ['Manage medicines', '/app/manage-medicines', 'caregiver'],
];

describe('axe-core finds no violations', () => {
  it.each(routes)('on %s', async (_label, path, role) => {
    const { container } = renderAt(path, role);
    await screen.findAllByRole('heading', { level: 1 });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});

describe('page structure', () => {
  it.each(routes)('%s has one main landmark, one top-level banner and one h1', async (_label, path, role) => {
    renderAt(path, role);
    await screen.findAllByRole('heading', { level: 1 });
    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(screen.getAllByRole('banner')).toHaveLength(1);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it.each(routes)('%s starts with a "Skip to main content" link that targets <main>', async (_label, path, role) => {
    renderAt(path, role);
    await screen.findAllByRole('heading', { level: 1 });
    const links = document.querySelectorAll('a[href]');
    expect(links[0]).toHaveTextContent('Skip to main content');
    const target = document.querySelector(links[0].getAttribute('href') ?? '');
    expect(target?.tagName).toBe('MAIN');
    expect(target).toHaveAttribute('tabindex', '-1');
  });

  it('gives every page its own title', async () => {
    const titles = new Set<string>();
    for (const [, path, role] of routes) {
      localStorage.clear();
      const { unmount } = renderAt(path, role);
      await screen.findAllByRole('heading', { level: 1 });
      titles.add(document.title);
      unmount();
    }
    expect(titles.size).toBe(routes.length);
    expect(titles).toContain('Medicines — CareConnect');
    expect(titles).toContain('Dashboard — CareConnect');
  });

  // The real Landing page is Justin's; this branch shows a placeholder for it.
  (SHOW_TEAMMATE_PAGES ? it : it.skip)('labels the two navigations differently on the landing page and names the app nav "Main navigation"', async () => {
    renderAt('/', null);
    expect(await screen.findByRole('navigation', { name: 'Account navigation' })).toBeInTheDocument();
    localStorage.clear();
  });

  it('moves focus to <main> after an in-app navigation, but not on first load', async () => {
    renderAt('/app', 'patient');
    await screen.findByRole('heading', { level: 1 });
    expect(screen.getByRole('main')).not.toHaveFocus();

    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    fireEvent.click(within(nav).getByRole('link', { name: 'Medicines' }));
    await screen.findByRole('heading', { level: 1, name: /medicines/i });
    await waitFor(() => expect(screen.getByRole('main')).toHaveFocus());
    expect(document.title).toBe('Medicines — CareConnect');
  });

  it('marks the current page in the app navigation with aria-current', async () => {
    renderAt('/app/medicines', 'patient');
    const nav = await screen.findByRole('navigation', { name: 'Main navigation' });
    expect(within(nav).getByRole('link', { name: 'Medicines' })).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('link', { name: 'Contacts' })).not.toHaveAttribute('aria-current');
  });

  it('nests the appointment cards (h3) under date-group headings (h2)', async () => {
    renderAt('/app/appointments', 'patient');
    await screen.findByRole('heading', { level: 1 });
    const levels = screen.getAllByRole('heading').map((h) => Number(h.tagName[1]));
    for (let i = 1; i < levels.length; i += 1) {
      expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
    }
  });
});

describe('forms', () => {
  function renderSignIn() {
    return render(
      <MemoryRouter>
        <AuthProvider>
          <SignIn />
        </AuthProvider>
      </MemoryRouter>,
    );
  }

  it('labels every field and marks required ones for screen readers', () => {
    renderSignIn();
    const email = screen.getByLabelText(/email address/i);
    expect(email).toHaveAttribute('aria-required', 'true');
    expect(email).toHaveAttribute('autocomplete', 'email');
    expect(screen.getByLabelText(/password/i)).toHaveAttribute('autocomplete', 'current-password');
  });

  it('ties each error to its field and announces a summary', async () => {
    renderSignIn();
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    const email = await screen.findByLabelText(/email address/i);
    await waitFor(() => expect(email).toHaveAttribute('aria-invalid', 'true'));
    expect(email).toHaveAccessibleDescription(/email/i);
    expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
  });
});

describe('modal dialog', () => {
  function Harness() {
    const [open, setOpen] = useState(false);
    const trigger = useRef<HTMLButtonElement>(null);
    return (
      <>
        <button ref={trigger} onClick={() => setOpen(true)}>
          Delete Vitamin D3
        </button>
        <ConfirmDialog
          open={open}
          title="Delete medication"
          description="This cannot be undone."
          confirmLabel="Yes, delete"
          triggerRef={trigger}
          onConfirm={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </>
    );
  }

  it('does not move focus when the page loads (it used to focus the Delete button)', () => {
    render(<Harness />);
    expect(document.body).toHaveFocus();
  });

  it('is a labelled modal that takes focus, traps Tab, closes on Escape and returns focus', async () => {
    render(<Harness />);
    const trigger = screen.getByRole('button', { name: 'Delete Vitamin D3' });
    fireEvent.click(trigger);

    const dialog = screen.getByRole('dialog', { name: 'Delete medication' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleDescription('This cannot be undone.');
    expect(dialog).toContainElement(document.activeElement as HTMLElement);

    const buttons = within(dialog).getAllByRole('button');
    buttons[buttons.length - 1].focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(buttons[0]).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(buttons[buttons.length - 1]).toHaveFocus();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => expect(trigger).toHaveFocus());
  });
});

describe('assistant panel', () => {
  it('does not take focus on page load (it used to pull focus to the corner button)', () => {
    render(<ChatBot />);
    expect(document.body).toHaveFocus();
  });

  it('exposes its state, focuses its input on open, and returns focus on Escape', async () => {
    render(<ChatBot />);
    const launcher = screen.getByRole('button', { name: /open assistant/i });
    expect(launcher).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(launcher);
    expect(launcher).toHaveAttribute('aria-expanded', 'true');
    await waitFor(() => expect(screen.getByRole('textbox')).toHaveFocus());

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(screen.getByRole('button', { name: /open assistant/i })).toHaveFocus());
  });
});

describe('responsive navigation', () => {
  it('desktop: one sidebar navigation for each role, with Settings and the alerts at its foot', async () => {
    for (const role of ['patient', 'caregiver'] as const) {
      localStorage.clear();
      const { unmount } = renderAt('/app', role);
      await screen.findByRole('heading', { level: 1 });
      const navs = screen.getAllByRole('navigation', { name: 'Main navigation' });
      expect(navs).toHaveLength(1);
      expect(within(navs[0]).getByRole('link', { name: 'Settings' })).toHaveAttribute('href', '/app/settings');
      expect(within(navs[0]).getByRole('button', { name: /alerts?$/ })).toHaveAttribute('aria-expanded', 'false');
      unmount();
    }
  });

  it('desktop: the alerts button lists what is waiting, each a link', async () => {
    renderAt('/app', 'patient');
    const nav = await screen.findByRole('navigation', { name: 'Main navigation' });
    const toggle = within(nav).getByRole('button', { name: /alerts?$/ });
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(within(nav).getByRole('link', { name: /still to take today/ })).toHaveAttribute('href', '/app/medicines');
  });

  it.each(['patient', 'caregiver'] as const)(
    'phone and tablet, %s: the Menu button opens the navigation as a dialog; Escape closes it and returns focus',
    async (role) => {
      simulate(MOBILE);
      renderAt('/app', role);
      await screen.findByRole('heading', { level: 1 });
      expect(screen.queryByRole('navigation', { name: 'Main navigation' })).not.toBeInTheDocument();

      const menu = screen.getByRole('button', { name: 'Menu' });
      expect(menu).toHaveAttribute('aria-expanded', 'false');
      expect(menu).toHaveAttribute('aria-controls', 'nav-drawer');
      fireEvent.click(menu);
      expect(menu).toHaveAttribute('aria-expanded', 'true');
      const dialog = screen.getByRole('dialog', { name: 'Menu' });
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toContainElement(document.activeElement as HTMLElement);
      const panel = within(dialog).getByRole('navigation', { name: 'Main navigation' });
      // Every page plus Settings: six for the care recipient, five for a caregiver.
      expect(within(panel).getAllByRole('link').length).toBeGreaterThanOrEqual(role === 'patient' ? 7 : 6);

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByRole('dialog', { name: 'Menu' })).not.toBeInTheDocument();
      expect(menu).toHaveFocus();
    },
  );

  it('phone and tablet: choosing a page closes the menu', async () => {
    simulate(MOBILE);
    renderAt('/app', 'caregiver');
    await screen.findByRole('heading', { level: 1 });
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }));
    const dialog = screen.getByRole('dialog', { name: 'Menu' });
    fireEvent.click(within(dialog).getByRole('link', { name: 'Activity' }));
    await screen.findByRole('heading', { level: 1, name: /activity/i });
    expect(screen.queryByRole('dialog', { name: 'Menu' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Menu' })).toHaveAttribute('aria-expanded', 'false');
  });

  it.each(routes)('mobile: axe finds no violations on %s', async (_label, path, role) => {
    simulate(MOBILE);
    const { container } = renderAt(path, role);
    await screen.findAllByRole('heading', { level: 1 });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});

describe('header controls', () => {
  it('the CC button switches captions everywhere and says whether they are on', async () => {
    renderAt('/app', 'patient');
    const cc = await screen.findByRole('button', { name: 'CC captions' });
    expect(cc).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(/Upcoming: Video call with Maria/)).toBeInTheDocument();
    fireEvent.click(cc);
    expect(cc).toHaveAttribute('aria-pressed', 'false');
    expect(screen.queryByText(/Upcoming: Video call with Maria/)).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('careconnect_accessibility_settings') ?? '{}').captionsEnabled).toBe(false);
  });

  it('the high-contrast button themes the whole document and is remembered', async () => {
    renderAt('/app', 'patient');
    const button = await screen.findByRole('button', { name: 'High contrast' });
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(document.documentElement).toHaveClass('high-contrast');
    expect(localStorage.getItem('careconnect_high_contrast')).toBe('true');
    fireEvent.click(button);
    expect(document.documentElement).not.toHaveClass('high-contrast');
  });

  it('Ctrl+K focuses the search, which finds a medicine and opens its page', async () => {
    renderAt('/app', 'patient');
    await screen.findByRole('heading', { level: 1 });
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    const search = screen.getByRole('combobox', { name: /search medicines/i });
    expect(search).toHaveFocus();
    fireEvent.change(search, { target: { value: 'metf' } });
    expect(search).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('option', { name: /Metformin/ })).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(search, { key: 'Enter' });
    expect(await screen.findByRole('heading', { level: 1, name: 'Medicines' })).toBeInTheDocument();
  });

  it('Ctrl+K on a phone opens the menu with its search field focused', async () => {
    simulate(MOBILE);
    renderAt('/app', 'patient');
    await screen.findByRole('heading', { level: 1 });
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    const dialog = screen.getByRole('dialog', { name: 'Menu' });
    expect(within(dialog).getByRole('combobox', { name: /search medicines/i })).toHaveFocus();
  });

  it('the keyboard button opens the shortcuts dialog; Escape closes it; no single-key shortcut does (WCAG 2.1.4)', async () => {
    renderAt('/app', 'patient');
    await screen.findByRole('heading', { level: 1 });
    fireEvent.keyDown(document.body, { key: '?' });
    expect(screen.queryByRole('dialog', { name: 'Keyboard shortcuts' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Keyboard shortcuts' }));
    expect(screen.getByRole('dialog', { name: 'Keyboard shortcuts' })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog', { name: 'Keyboard shortcuts' })).not.toBeInTheDocument();
  });

  it('the account menu holds Switch role and Sign out, and closes on Escape', async () => {
    renderAt('/app', 'patient');
    const account = await screen.findByRole('button', { name: /^Margaret ?, account menu ?, \d+ alerts$/ });
    fireEvent.click(account);
    expect(account).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Switch to caregiver' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeVisible();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(account).toHaveAttribute('aria-expanded', 'false');
    expect(account).toHaveFocus();
  });

  it('the status bar says the app is online and how many alerts are waiting', async () => {
    renderAt('/app', 'patient');
    const footer = await screen.findByRole('contentinfo');
    expect(footer).toHaveTextContent('Online · synced just now');
    expect(footer).toHaveTextContent(/\d+ active alerts?/);
    expect(footer).toHaveTextContent('No sound required');
  });
});

describe('label in name (WCAG 2.5.3)', () => {
  it('opens the caregiver conversation from Home by a link named with its visible words, never a call', async () => {
    renderAt('/app', 'patient');
    const link = await screen.findByRole('link', { name: /^Video preview/ });
    expect(link).toHaveAttribute('href', '/app/contacts/c3');
    expect(document.querySelector('a[href^="tel:"]')).toBeNull();
  });

  it('names the role switch by its visible words', async () => {
    renderAt('/app', 'patient');
    fireEvent.click(await screen.findByRole('button', { name: /account menu/ }));
    const button = screen.getByRole('button', { name: 'Switch to caregiver' });
    expect(button).toHaveTextContent('Switch to caregiver');
  });
});
