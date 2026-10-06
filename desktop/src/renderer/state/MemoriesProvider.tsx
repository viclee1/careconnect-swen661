import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { MemoryRepository } from '../data/memoryRepository';
import type { Memory } from '../models/memory';

export interface MemoriesValue {
  memories: Memory[];
  isLoading: boolean;
  /** Non-null when the last load failed; the screen renders a banner for it. */
  error: Error | null;
  load: () => Promise<void>;
}

const MemoriesContext = createContext<MemoriesValue | null>(null);

export function MemoriesProvider({
  repository,
  children,
}: {
  repository: MemoryRepository;
  children: ReactNode;
}) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const loaded = await repository.fetchMemories();
      setMemories(loaded);
    } catch (caught) {
      setMemories([]);
      setError(caught instanceof Error ? caught : new Error(String(caught)));
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  const value = useMemo<MemoriesValue>(
    () => ({ memories, isLoading, error, load }),
    [memories, isLoading, error, load],
  );

  return <MemoriesContext.Provider value={value}>{children}</MemoriesContext.Provider>;
}

export function useMemories(): MemoriesValue {
  const value = useContext(MemoriesContext);
  if (!value) throw new Error('useMemories must be used inside a MemoriesProvider');
  return value;
}
