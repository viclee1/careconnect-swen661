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
});
