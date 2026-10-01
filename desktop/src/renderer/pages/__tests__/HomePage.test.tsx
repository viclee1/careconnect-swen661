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

describe('HomePage', () => {
  it('renders the Home page heading, progress, and next thing to do card', async () => {
    renderApp({
      repositories: repositories(),
      initialRoute: { name: 'Home' },
    });

    expect(
      await screen.findByText(/here's your day/i),
    ).toBeInTheDocument();

    expect(screen.getByText(/1 of 7 things done today/i)).toBeInTheDocument();
    expect(screen.getByText('NEXT THING TO DO')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Video call with Maria' })).toBeInTheDocument();
  });

  it('simulates an incoming call when simulate call button is clicked', async () => {
    const { user } = renderApp({
      repositories: repositories(),
      initialRoute: { name: 'Home' },
    });

    const simulateBtn = await screen.findByRole('button', { name: /simulate incoming call/i });
    await user.click(simulateBtn);

    expect(await screen.findByText('INCOMING VIDEO CALL')).toBeInTheDocument();
    expect(screen.getByText(/Screen is flashing — Maria is calling/i)).toBeInTheDocument();
  });
});
