import { fireEvent, screen } from '@testing-library/react-native';

import { createFlakyMemoryRepository } from '../../data/memoryRepository';
import { renderApp, useTabletSize } from '../../test-support/harness';

describe('MemoriesScreen rendering', () => {
  it('shows the heading', async () => {
    await renderApp({ initialTabName: 'Memories' });
    // Twice: the header and the bottom navigation label.
    expect(await screen.findAllByText('Memories')).toHaveLength(2);
    expect(screen.getByText('Captured moments and milestones')).toBeTruthy();
  });

  it('lists the seeded memories', async () => {
    await renderApp({ initialTabName: 'Memories' });
    expect(await screen.findByText('Family Picnic at Quiet Waters')).toBeTruthy();
    expect(screen.getByText('August 2026')).toBeTruthy();
    expect(screen.getByText('First Day of School')).toBeTruthy();
  });

  it('announces each memory as one sentence', async () => {
    await renderApp({ initialTabName: 'Memories' });
    const card = await screen.findByTestId('memory-mem1');
    expect(card.props.accessibilityLabel).toContain('Family Picnic at Quiet Waters');
    expect(card.props.accessibilityLabel).toContain('August 2026');
  });
});

describe('MemoriesScreen when loading fails', () => {
  it('explains the failure instead of showing an empty list', async () => {
    await renderApp({
      initialTabName: 'Memories',
      memoryRepository: createFlakyMemoryRepository(99),
    });

    expect(await screen.findByText('Memories could not be loaded')).toBeTruthy();
    expect(screen.getByText(/nothing has been lost/)).toBeTruthy();
    expect(screen.queryByText('No memories yet')).toBeNull();
    expect(screen.queryByTestId('memory-mem1')).toBeNull();
  });

  it('recovers when the retry button succeeds', async () => {
    await renderApp({
      initialTabName: 'Memories',
      memoryRepository: createFlakyMemoryRepository(1),
    });

    await fireEvent.press(await screen.findByText('Try again'));

    expect(await screen.findByTestId('memory-mem1')).toBeTruthy();
    expect(screen.queryByText('Memories could not be loaded')).toBeNull();
  });
});

describe('MemoriesScreen layout', () => {
  it('lays cards two across on a tablet', async () => {
    useTabletSize();
    await renderApp({ initialTabName: 'Memories' });
    expect(await screen.findByTestId('memory-mem1')).toBeTruthy();
    expect(screen.getByTestId('memory-mem2')).toBeTruthy();
  });
});
