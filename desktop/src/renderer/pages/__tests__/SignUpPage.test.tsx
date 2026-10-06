import { screen } from '@testing-library/react';
import { createMockContactRepository } from '../../data/contactRepository';
import { createMockMessageRepository } from '../../data/messageRepository';
import { createInMemorySettingsRepository } from '../../data/settingsRepository';
import { renderApp } from '../../test-support/harness';

const repositories = () => ({
  contacts: createMockContactRepository(),
  messages: createMockMessageRepository(),
  settings: createInMemorySettingsRepository(),
});

describe('SignUpPage', () => {
  it('renders sign up form and validates matching passwords', async () => {
    const { user } = renderApp({
      repositories: repositories(),
      initialRoute: { name: 'SignUp' },
    });

    expect(
      await screen.findByRole('heading', { level: 1, name: /create your account/i }),
    ).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/your name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password \*/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);

    await user.type(nameInput, 'Dorothy Smith');
    await user.type(emailInput, 'dorothy@example.com');
    await user.type(passwordInput, 'secret123');
    await user.type(confirmInput, 'secret123');

    const submitBtn = screen.getByRole('button', { name: 'Create account' });
    await user.click(submitBtn);

    expect(
      await screen.findByRole('heading', { level: 1, name: /here's your day/i }),
    ).toBeInTheDocument();
  });

  beforeEach(() => localStorage.clear());

  const openSignUp = async () => {
    const rendered = renderApp({ repositories: repositories(), initialRoute: { name: 'SignUp' } });
    await screen.findByRole('heading', { level: 1, name: /create your account/i });
    return rendered;
  };

  const fill = async (
    user: Awaited<ReturnType<typeof openSignUp>>['user'],
    values: { name?: string; email?: string; password?: string; confirm?: string },
  ) => {
    if (values.name) await user.type(screen.getByLabelText(/your name/i), values.name);
    if (values.email) await user.type(screen.getByLabelText(/email address/i), values.email);
    if (values.password) await user.type(screen.getByLabelText(/^password \*/i), values.password);
    if (values.confirm) await user.type(screen.getByLabelText(/confirm password/i), values.confirm);
    await user.click(screen.getByRole('button', { name: 'Create account' }));
  };

  it('stops an empty form and names every missing field', async () => {
    const { user } = await openSignUp();
    await fill(user, {});

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Please correct the errors below to continue.',
    );
    expect(screen.getByText('Please enter your name.')).toBeInTheDocument();
    expect(screen.getByText('Please enter your email address.')).toBeInTheDocument();
    expect(screen.getByText('Please create a password.')).toBeInTheDocument();
    expect(screen.getByText('Please confirm your password.')).toBeInTheDocument();
  });

  it('rejects an invalid email, a short password and a mismatched confirmation', async () => {
    const { user } = await openSignUp();
    await fill(user, { name: 'Dorothy', email: 'dorothy@', password: 'abc', confirm: 'abcd' });

    expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
    expect(screen.getByText('Password must be at least 6 characters.')).toBeInTheDocument();
    expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
    expect(screen.queryByText('Please enter your name.')).not.toBeInTheDocument();
  });

  it('accepts a password of exactly six characters', async () => {
    const { user } = await openSignUp();
    await fill(user, {
      name: 'Dorothy',
      email: 'dorothy@example.com',
      password: 'abcdef',
      confirm: 'abcdef',
    });
    expect(
      await screen.findByRole('heading', { level: 1, name: /here's your day/i }),
    ).toBeInTheDocument();
  });

  it('goes to Sign In from "Already have an account?"', async () => {
    const { user } = await openSignUp();
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(
      await screen.findByRole('heading', { level: 1, name: /welcome back/i }),
    ).toBeInTheDocument();
  });

  it('goes back to the Splash page from the logo', async () => {
    const { user } = await openSignUp();
    await user.click(screen.getByRole('button', { name: 'Go to CareConnect homepage' }));
    expect(
      await screen.findByRole('heading', { level: 1, name: /your daily companion/i }),
    ).toBeInTheDocument();
  });
});

