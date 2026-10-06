import { useCallback, useEffect } from 'react';

import { AlertBanner } from '../components/AlertBanner';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { useMemories } from '../state/MemoriesProvider';
import { MemoryCard } from './memories/MemoryCard';
import './carePages.css';

/**
 * The Memories page: captured moments and milestones, as the React Native
 * client shows them, in a grid that fills a wide desktop window.
 */
export function MemoriesPage() {
  const { memories, isLoading, error, load } = useMemories();

  const bootstrap = useCallback(async () => {
    await load();
  }, [load]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  return (
    <>
      <PageHeader title="Memories" subtitle="Captured moments and milestones" />

      <div className="page-body">
        <div className="readable readable--wide stack">
          {isLoading ? (
            <p role="status">Loading memories…</p>
          ) : error ? (
            <AlertBanner
              tone="error"
              title="Memories could not be loaded"
              message="Your memories are saved on this computer, so nothing has been lost. Try again in a moment."
              action={
                <Button label="Try again" icon="refresh" onClick={() => void bootstrap()} />
              }
            />
          ) : memories.length === 0 ? (
            <EmptyState
              icon="memories"
              title="No memories yet"
              message="Moments you save will appear here."
            />
          ) : (
            <ul className="card-grid" aria-label="Saved memories">
              {memories.map((memory) => (
                <li key={memory.id}>
                  <MemoryCard memory={memory} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
