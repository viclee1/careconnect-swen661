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
});
