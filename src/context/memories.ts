import { createContext, useContext } from 'react';

import type { MemoryCard, MemoryDraft } from '../models/memory';

export interface MemoriesContextValue {
  memories: MemoryCard[];
  /** Saves a valid draft and returns the new memory. */
  addMemory: (draft: MemoryDraft) => MemoryCard;
  togglePinned: (id: string) => void;
  /** Removes a memory the user added. Memories from the care team stay. */
  removeMemory: (id: string) => void;
}

export const MemoriesContext = createContext<MemoriesContextValue | null>(null);

/** The memory book. Provided by MemoriesProvider. */
export function useMemories(): MemoriesContextValue {
  const ctx = useContext(MemoriesContext);
  if (!ctx) throw new Error('useMemories must be used inside MemoriesProvider');
  return ctx;
}
