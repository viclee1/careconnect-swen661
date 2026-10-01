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

describe('SplashPage', () => {
  it('renders splash heading and accessibility features', async () => {
    renderApp({
      repositories: repositories(),
      initialRoute: { name: 'Splash' },
    });

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /your daily companion for calm, confident care/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText(/built for hearing accessibility/i)).toBeInTheDocument();
    expect(screen.getByText(/visual alerts/i)).toBeInTheDocument();
    expect(screen.getByText(/captions everywhere/i)).toBeInTheDocument();
  });

  it('navigates to sign up when get started button is clicked', async () => {
    const { user } = renderApp({
      repositories: repositories(),
      initialRoute: { name: 'Splash' },
    });

    const getStartedBtn = await screen.findByRole('button', { name: /get started — it's free/i });
    await user.click(getStartedBtn);

    expect(
      await screen.findByRole('heading', { level: 1, name: /create your account/i }),
    ).toBeInTheDocument();
  });
});
