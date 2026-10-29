import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import RoleChooser from './RoleChooser';
import SignIn from './SignIn';
import SignUp from './SignUp';
import { AuthProvider } from '../auth/AuthContext';
import { getSession, persistSession } from '../auth/mockAuth';
import { AppProvider } from '../context/AppContext';

/** Sign up, sign in and the role chooser, with stand-ins where they lead. */
function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <AppProvider>
          <Routes>
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/role" element={<RoleChooser />} />
            <Route path="/app" element={<h1>App home</h1>} />
            <Route path="/" element={<h1>Landing</h1>} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}

const users = () => JSON.parse(localStorage.getItem('careconnect_users') ?? '[]');

beforeEach(() => {
  localStorage.clear();
});

describe('Sign up', () => {
  it('explains every missing field at once, without leaving the page', async () => {
    const user = userEvent.setup();
    renderAt('/signup');
    expect(document.title).toMatch(/^Create an account/);
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(screen.getByText('Please correct the errors below to continue.')).toBeInTheDocument();
    expect(screen.getByText('Please enter your name.')).toBeInTheDocument();
    expect(screen.getByText('Please enter your email address.')).toBeInTheDocument();
    expect(screen.getByText('Please create a password.')).toBeInTheDocument();
    expect(screen.getByText('Please confirm your password.')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Your name/ })).toHaveAttribute('aria-invalid', 'true');
    expect(screen.queryByRole('heading', { name: 'Choose your role' })).not.toBeInTheDocument();
  });

  it('rejects a malformed email, a short password and a confirmation that does not match', async () => {
    const user = userEvent.setup();
    renderAt('/signup');
    await user.type(screen.getByRole('textbox', { name: /Your name/ }), 'Dorothy');
    await user.type(screen.getByRole('textbox', { name: /Email address/ }), 'dorothy.example.com');
    await user.type(screen.getByLabelText(/^Password/), '12345');
    await user.type(screen.getByLabelText(/Confirm password/), '54321');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
    expect(screen.getByText('Password must be at least 6 characters.')).toBeInTheDocument();
    expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
    expect(users()).toEqual([]);
  });

  it('creates the account, signs in and moves on to choosing a role', async () => {
    const user = userEvent.setup();
    renderAt('/signup');
    await user.type(screen.getByRole('textbox', { name: /Your name/ }), ' Dorothy Smith ');
    await user.type(screen.getByRole('textbox', { name: /Email address/ }), 'Dorothy@Example.com');
    await user.type(screen.getByLabelText(/^Password/), 'secret1');
    await user.type(screen.getByLabelText(/Confirm password/), 'secret1');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByRole('heading', { level: 1, name: /Dorothy/ })).toBeInTheDocument();
    expect(users()).toEqual([expect.objectContaining({ name: 'Dorothy Smith', email: 'dorothy@example.com' })]);
    expect(getSession()).toMatchObject({ user: { email: 'dorothy@example.com' }, role: null });
  });

  it('signs an existing email in rather than duplicating it', async () => {
    const user = userEvent.setup();
    localStorage.setItem('careconnect_users', JSON.stringify([{ id: 'u1', name: 'Margaret', email: 'margaret@example.com' }]));
    renderAt('/signup');
    await user.type(screen.getByRole('textbox', { name: /Your name/ }), 'Someone else');
    await user.type(screen.getByRole('textbox', { name: /Email address/ }), 'MARGARET@example.com');
    await user.type(screen.getByLabelText(/^Password/), 'secret1');
    await user.type(screen.getByLabelText(/Confirm password/), 'secret1');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByRole('heading', { level: 1, name: /Margaret/ })).toBeInTheDocument();
    expect(users()).toHaveLength(1);
  });
});

describe('Sign in', () => {
  it('asks for both fields, and for a real email address', async () => {
    const user = userEvent.setup();
    renderAt('/signin');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(screen.getByText('Please enter your email address.')).toBeInTheDocument();
    expect(screen.getByText('Please enter your password.')).toBeInTheDocument();

    await user.type(screen.getByRole('textbox', { name: /Email address/ }), 'not-an-email');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
  });

  it('signs in and goes on to the role chooser, greeting the user by name', async () => {
    const user = userEvent.setup();
    renderAt('/signin');
    await user.type(screen.getByRole('textbox', { name: /Email address/ }), 'joyce@example.com');
    await user.type(screen.getByLabelText(/^Password/), 'anything');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('heading', { level: 1, name: /joyce/i })).toBeInTheDocument();
    expect(getSession()?.user.email).toBe('joyce@example.com');
  });
});

describe('Role chooser', () => {
  it.each([
    ['I am the Care Recipient', 'patient'],
    ['I am the Caregiver', 'caregiver'],
  ])('“%s” remembers the role and opens the app', async (label, role) => {
    const user = userEvent.setup();
    persistSession({ user: { id: 'u1', name: 'Margaret Whitfield', email: 'm@example.com' }, role: null });
    renderAt('/role');
    await user.click(screen.getByRole('button', { name: new RegExp(label) }));
    expect(await screen.findByRole('heading', { name: 'App home' })).toBeInTheDocument();
    expect(getSession()?.role).toBe(role);
  });
});
