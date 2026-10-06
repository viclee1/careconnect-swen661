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

describe('MyDayPage — keyboard and persistence', () => {
  beforeEach(() => localStorage.clear());

  const openMyDay = async () => {
    const rendered = renderApp({ repositories: repositories(), initialRoute: { name: 'MyDay' } });
    await screen.findByRole('heading', { level: 1, name: 'My Day' });
    return rendered;
  };

  it.each([['Enter', '{Enter}'], ['Space', ' ']])('toggles a task with %s', async (_key, keys) => {
    const { user } = await openMyDay();
    const task = screen.getByRole('button', { name: /morning check-in/i });

    task.focus();
    await user.keyboard(keys);
    expect(task).toHaveAttribute('aria-pressed', 'true');
    await user.keyboard(keys);
    expect(task).toHaveAttribute('aria-pressed', 'false');
  });

  it('ignores other keys', async () => {
    const { user } = await openMyDay();
    const task = screen.getByRole('button', { name: /morning check-in/i });
    task.focus();
    await user.keyboard('a');
    expect(task).toHaveAttribute('aria-pressed', 'false');
  });

  it('keeps a completed task completed after the app is reopened', async () => {
    const first = await openMyDay();
    await first.user.click(screen.getByRole('button', { name: /morning check-in/i }));
    first.unmount();

    await openMyDay();
    expect(screen.getByRole('button', { name: /morning check-in/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('falls back to the default list when the saved tasks are unreadable', async () => {
    localStorage.setItem('careconnect_desktop_myday_tasks', '{not json');
    await openMyDay();
    expect(screen.getByRole('button', { name: /morning check-in/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });
});
