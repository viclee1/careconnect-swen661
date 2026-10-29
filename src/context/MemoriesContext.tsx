import { useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';

import { memoryCards } from '../data/mockData';
import { useLocalStorageState } from '../hooks/useLocalStorageState';
import { createMemory, reviveMemories, type MemoryCard, type MemoryDraft } from '../models/memory';
import { MemoriesContext } from './memories';

// ── Storage ────────────────────────────────────────────────────────────────────

export const MEMORIES_KEY = 'careconnect_memories';

function revive(stored: unknown): MemoryCard[] {
  return reviveMemories(stored) ?? memoryCards;
}

let sequence = 0;

function newId(): string {
  sequence += 1;
  return `mem-${Date.now().toString(36)}-${sequence}`;
}

// ── Provider ────────────────────────────────────────────────────────────────────

/** The memory book, saved in localStorage so it opens with no connection. */
export function MemoriesProvider({ children }: { children: ReactNode }) {
  const [memories, setMemories] = useLocalStorageState<MemoryCard[]>(
    MEMORIES_KEY,
    () => memoryCards,
    revive,
  );

  const addMemory = useCallback(
    (draft: MemoryDraft) => {
      const memory = createMemory(draft, newId());
      // Newest first, so the user sees what they just saved.
      setMemories((current) => [memory, ...current]);
      return memory;
    },
    [setMemories],
  );

  const togglePinned = useCallback(
    (id: string) =>
      setMemories((current) => current.map((m) => (m.id === id ? { ...m, pinned: !m.pinned } : m))),
    [setMemories],
  );

  const removeMemory = useCallback(
    (id: string) => setMemories((current) => current.filter((m) => m.id !== id || !m.addedByUser)),
    [setMemories],
  );

  const value = useMemo(
    () => ({ memories, addMemory, togglePinned, removeMemory }),
    [memories, addMemory, togglePinned, removeMemory],
  );

  return <MemoriesContext.Provider value={value}>{children}</MemoriesContext.Provider>;
}
