import type { Memory } from '../models/memory';
import { mockMemories } from './mockMemories';

/**
 * Read access to the memory journal.
 *
 * The interface exists so the UI never depends on where memories come from.
 * Week 5 ships the in-memory implementation below; swapping in an HTTP or
 * SQLite backed version later is a one-line change in `App.tsx`.
 */
export interface MemoryRepository {
  fetchMemories(): Promise<Memory[]>;
}

/** In-memory implementation backed by the design's seed data. */
export function createMockMemoryRepository(seed: Memory[] = mockMemories): MemoryRepository {
  return {
    async fetchMemories() {
      return seed;
    },
  };
}

/**
 * A repository whose first `failures` loads fail, for exercising the error
 * path — and the recovery from it — through the real screen.
 */
export function createFlakyMemoryRepository(
  failures = 1,
  seed: Memory[] = mockMemories,
): MemoryRepository {
  let attempts = 0;
  return {
    async fetchMemories() {
      attempts += 1;
      if (attempts <= failures) throw new Error('offline');
      return seed;
    },
  };
}
