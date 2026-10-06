import { screen, within } from '@testing-library/react';

import { createMockContactRepository } from '../../data/contactRepository';
import {
  createFlakyMemoryRepository,
  createMockMemoryRepository,
} from '../../data/memoryRepository';
import { createMockMessageRepository } from '../../data/messageRepository';
import { mockMemories } from '../../data/mockMemories';
import { createInMemorySettingsRepository } from '../../data/settingsRepository';
import { renderApp, tabbableElements } from '../../test-support/harness';

const repositories = (memories = createMockMemoryRepository()) => ({
  contacts: createMockContactRepository(),
  messages: createMockMessageRepository(),
  settings: createInMemorySettingsRepository(),
  memories,
});

describe('MemoriesPage', () => {
  it('shows every saved memory with its title, date and description', async () => {
    renderApp({ repositories: repositories(), initialRoute: { name: 'Memories' } });

    await screen.findByTestId('memory-mem1');
    expect(screen.getByRole('heading', { level: 1, name: 'Memories' })).toBeInTheDocument();

    for (const memory of mockMemories) {
      const card = screen.getByTestId(`memory-${memory.id}`);
      expect(card).toHaveAccessibleName(memory.title);
      expect(within(card).getByText(memory.date)).toBeInTheDocument();
      expect(within(card).getByText(memory.description)).toBeInTheDocument();
    }
  });

  it('lets a screen-reader user move between memories by heading', async () => {
    renderApp({ repositories: repositories(), initialRoute: { name: 'Memories' } });
    await screen.findByTestId('memory-mem1');

    expect(
      screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent),
    ).toEqual(mockMemories.map((memory) => memory.title));
    expect(screen.getByRole('list', { name: 'Saved memories' })).toBeInTheDocument();
  });

  it('hides the placeholder thumbnails from assistive technology', async () => {
    renderApp({ repositories: repositories(), initialRoute: { name: 'Memories' } });
    const card = await screen.findByTestId('memory-mem1');

    expect(card.querySelector('.memory-card__thumbnail')).toHaveAttribute('aria-hidden', 'true');
  });

  it('adds no Tab stops, because there is nothing on the page to operate', async () => {
    renderApp({ repositories: repositories(), initialRoute: { name: 'Memories' } });
    await screen.findByTestId('memory-mem1');

    expect(tabbableElements(screen.getByRole('main'))).toEqual([]);
  });

  it('says so when nothing has been saved yet', async () => {
    renderApp({
      repositories: repositories(createMockMemoryRepository([])),
      initialRoute: { name: 'Memories' },
    });

    expect(await screen.findByRole('heading', { name: 'No memories yet' })).toBeInTheDocument();
  });

  it('tells a failed load apart from an empty journal, and recovers on Try again', async () => {
    const { user } = renderApp({
      repositories: repositories(createFlakyMemoryRepository(1)),
      initialRoute: { name: 'Memories' },
    });

    expect(await screen.findByRole('alert')).toHaveTextContent('Memories could not be loaded');
    expect(screen.queryByText('No memories yet')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByTestId('memory-mem1')).toBeInTheDocument();
  });

  it('is reachable from anywhere with Ctrl+5', async () => {
    const { user } = renderApp({ repositories: repositories() });
    await screen.findByTestId('contact-c1');

    await user.keyboard('{Control>}5{/Control}');

    expect(await screen.findByTestId('memory-mem1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Memories' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});
