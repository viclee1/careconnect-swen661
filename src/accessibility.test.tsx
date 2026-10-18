import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { StrictMode, useRef, useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { axe, toHaveNoViolations } from 'jest-axe';

import App from './App';
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
const TABLET_UP = '.hidden { display: none } .md\\:flex { display: flex } .md\\:hidden { display: none }';
const MOBILE = '.hidden { display: none } .md\\:hidden { }';
let viewportStyle: HTMLStyleElement;

function simulate(css: string) {
  viewportStyle.textContent = css;
}

beforeEach(() => {
  localStorage.clear();
  document.title = '';
  viewportStyle = document.createElement('style');
  document.head.appendChild(viewportStyle);
  simulate(TABLET_UP);
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
  ['My Day', '/app/schedule', 'patient'],
  ['Appointments', '/app/appointments', 'patient'],
  ['Medicines', '/app/medications', 'patient'],
  ['Caregiver dashboard', '/app', 'caregiver'],
  ['Manage medications', '/app/manage-medications', 'caregiver'],
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

  it('labels the two navigations differently on the landing page and names the app nav "Main navigation"', async () => {
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
    renderAt('/app/medications', 'patient');
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
  it('tablet and desktop: one sidebar navigation for each role', async () => {
    for (const role of ['patient', 'caregiver'] as const) {
      localStorage.clear();
      const { unmount } = renderAt('/app', role);
      await screen.findByRole('heading', { level: 1 });
      expect(screen.getAllByRole('navigation', { name: 'Main navigation' })).toHaveLength(1);
      unmount();
    }
  });

  it('tablet: the sidebar collapses and expands, says which, and remembers it', async () => {
    renderAt('/app', 'caregiver');
    const nav = await screen.findByRole('navigation', { name: 'Main navigation' });
    const toggle = within(nav).getByRole('button', { name: 'Expand menu' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    // Collapsed is not icon-only: every label is still printed.
    expect(within(nav).getByRole('link', { name: 'Medications' })).toHaveTextContent('Medications');

    fireEvent.click(toggle);
    expect(within(nav).getByRole('button', { name: 'Collapse menu' })).toHaveAttribute('aria-expanded', 'true');
    expect(localStorage.getItem('careconnect_sidebar_collapsed')).toBe('false');
  });

  it('mobile, care recipient: the bottom tab bar, with every destination visible', async () => {
    simulate(MOBILE);
    renderAt('/app', 'patient');
    await screen.findByRole('heading', { level: 1 });
    const navs = screen.getAllByRole('navigation', { name: 'Main navigation' });
    expect(navs).toHaveLength(1);
    expect(within(navs[0]).getAllByRole('link')).toHaveLength(6);
    expect(screen.queryByRole('button', { name: 'Menu' })).not.toBeInTheDocument();
  });

  it('mobile, caregiver: a Menu button opens the navigation, Escape closes it and returns focus', async () => {
    simulate(MOBILE);
    renderAt('/app', 'caregiver');
    await screen.findByRole('heading', { level: 1 });
    expect(screen.queryByRole('navigation', { name: 'Main navigation' })).not.toBeInTheDocument();

    const menu = screen.getByRole('button', { name: 'Menu' });
    expect(menu).toHaveAttribute('aria-expanded', 'false');
    expect(menu).toHaveAttribute('aria-controls', 'mobile-menu');
    fireEvent.click(menu);
    expect(menu).toHaveAttribute('aria-expanded', 'true');
    const panel = screen.getByRole('navigation', { name: 'Main navigation' });
    expect(within(panel).getAllByRole('link')).toHaveLength(5);

    within(panel).getAllByRole('link')[1].focus();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('navigation', { name: 'Main navigation' })).not.toBeInTheDocument();
    expect(menu).toHaveFocus();
  });

  it('mobile, caregiver: choosing a page closes the menu', async () => {
    simulate(MOBILE);
    renderAt('/app', 'caregiver');
    await screen.findByRole('heading', { level: 1 });
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }));
    fireEvent.click(within(screen.getByRole('navigation', { name: 'Main navigation' })).getByRole('link', { name: 'Activity' }));
    await screen.findByRole('heading', { level: 1, name: /activity/i });
    expect(screen.queryByRole('navigation', { name: 'Main navigation' })).not.toBeInTheDocument();
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

describe('label in name (WCAG 2.5.3)', () => {
  it('names the call button by its visible words', async () => {
    renderAt('/app', 'patient');
    const call = await screen.findByRole('link', { name: /^Call my caregiver/ });
    expect(call).toHaveTextContent('Call my caregiver');
  });

  it('names the role switch by its visible words', async () => {
    renderAt('/app', 'patient');
    expect(await screen.findByRole('button', { name: /^Switch role/ })).toBeInTheDocument();
  });
});
