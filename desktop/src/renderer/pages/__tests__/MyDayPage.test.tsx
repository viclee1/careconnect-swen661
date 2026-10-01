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

describe('MyDayPage', () => {
  it('renders My Day header and tasks list', async () => {
    renderApp({
      repositories: repositories(),
      initialRoute: { name: 'MyDay' },
    });

    expect(
      await screen.findByRole('heading', { level: 1, name: 'My Day' }),
    ).toBeInTheDocument();

    expect(screen.getByText('Everything to do — Thursday 4 June')).toBeInTheDocument();
    expect(screen.getByText('Take Amlodipine')).toBeInTheDocument();
    expect(screen.getByText('Morning check-in')).toBeInTheDocument();
    expect(screen.getByText('Blood pressure check')).toBeInTheDocument();
  });

  it('toggles task completed state when clicked', async () => {
    const { user } = renderApp({
      repositories: repositories(),
      initialRoute: { name: 'MyDay' },
    });

    const checkInTask = await screen.findByRole('button', { name: /morning check-in/i });
    expect(checkInTask).toHaveAttribute('aria-pressed', 'false');

    await user.click(checkInTask);

    expect(checkInTask).toHaveAttribute('aria-pressed', 'true');
  });
});
