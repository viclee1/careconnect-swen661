import { act, renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import {
  createFlakyMemoryRepository,
  createMockMemoryRepository,
  type MemoryRepository,
} from '../../data/memoryRepository';
import { MemoriesProvider, useMemories } from '../MemoriesProvider';

const wrapperFor = (repository: MemoryRepository) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return <MemoriesProvider repository={repository}>{children}</MemoriesProvider>;
  };

async function mount(repository: MemoryRepository) {
  return renderHook(() => useMemories(), { wrapper: wrapperFor(repository) });
}

describe('useMemories', () => {
  it('starts empty and not loading', async () => {
    const { result } = await mount(createMockMemoryRepository());
    expect(result.current.memories).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('populates the list in the order the design lists it', async () => {
    const { result } = await mount(createMockMemoryRepository());

    await act(async () => {
      await result.current.load();
    });

    expect(result.current.memories.map((m) => m.id)).toEqual(['mem1', 'mem2']);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('records the error and empties the list when loading fails', async () => {
    const { result } = await mount(createFlakyMemoryRepository(99));

    await act(async () => {
      await result.current.load();
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.memories).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('a successful retry clears the error', async () => {
    const { result } = await mount(createFlakyMemoryRepository(1));

    await act(async () => {
      await result.current.load();
    });
    expect(result.current.error).toBeInstanceOf(Error);

    await act(async () => {
      await result.current.load();
    });
    expect(result.current.error).toBeNull();
    expect(result.current.memories).toHaveLength(2);
  });
});

describe('useMemories outside its provider', () => {
  it('fails loudly rather than returning a broken value', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(renderHook(() => useMemories())).rejects.toThrow(
      'useMemories must be used inside a MemoriesProvider',
    );
    spy.mockRestore();
  });
});
