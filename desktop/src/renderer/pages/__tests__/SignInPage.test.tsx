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

describe('SignInPage', () => {
  it('renders sign in form and submits successfully', async () => {
    const { user } = renderApp({
      repositories: repositories(),
      initialRoute: { name: 'SignIn' },
    });

    expect(
      await screen.findByRole('heading', { level: 1, name: /welcome back/i }),
    ).toBeInTheDocument();

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    const submitBtn = screen.getByRole('button', { name: 'Sign in' });
    await user.click(submitBtn);

    expect(
      await screen.findByRole('heading', { level: 1, name: /here's your day/i }),
    ).toBeInTheDocument();
  });

  beforeEach(() => localStorage.clear());

  const openSignIn = async () => {
    const rendered = renderApp({ repositories: repositories(), initialRoute: { name: 'SignIn' } });
    await screen.findByRole('heading', { level: 1, name: /welcome back/i });
    return rendered;
  };

  it('stops an empty form and says what is missing', async () => {
    const { user } = await openSignIn();
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Please correct the errors below to continue.',
    );
    expect(screen.getByText('Please enter your email address.')).toBeInTheDocument();
    expect(screen.getByText('Please enter your password.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: /welcome back/i })).toBeInTheDocument();
  });

  it('rejects an email address without a domain', async () => {
    const { user } = await openSignIn();
    await user.type(screen.getByLabelText(/email address/i), 'margaret');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
    expect(screen.queryByText('Please enter your password.')).not.toBeInTheDocument();
  });

  it('signs in once the errors are corrected', async () => {
    const { user } = await openSignIn();
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();

    await user.type(screen.getByLabelText(/email address/i), 'Margaret@Example.com ');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(
      await screen.findByRole('heading', { level: 1, name: /here's your day/i }),
    ).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('careconnect_desktop_user') ?? '{}')).toMatchObject({
      email: 'margaret@example.com',
    });
  });

  it('goes to Sign Up from "Create an account"', async () => {
    const { user } = await openSignIn();
    await user.click(screen.getByRole('button', { name: 'Create an account' }));
    expect(
      await screen.findByRole('heading', { level: 1, name: /create your account/i }),
    ).toBeInTheDocument();
  });

  it('goes back to the Splash page from the logo', async () => {
    const { user } = await openSignIn();
    await user.click(screen.getByRole('button', { name: 'Go to CareConnect homepage' }));
    expect(
      await screen.findByRole('heading', { level: 1, name: /your daily companion/i }),
    ).toBeInTheDocument();
  });

  it('confirms a password reset link was sent', async () => {
    const alert = jest.spyOn(window, 'alert').mockImplementation(() => undefined);
    const { user } = await openSignIn();
    await user.click(screen.getByRole('button', { name: 'Forgot password?' }));
    expect(alert).toHaveBeenCalledWith('Password reset link sent to your email.');
    alert.mockRestore();
  });
});

