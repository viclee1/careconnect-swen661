import { useEffect, useRef, useState } from 'react';
import { Pin, Plus } from 'lucide-react';

import PageHeader from '../components/PageHeader';
import AddMemoryForm from '../components/memories/AddMemoryForm';
import MemoryCard from '../components/memories/MemoryCard';
import MemoryFilters from '../components/memories/MemoryFilters';
import { useMemories } from '../context/memories';
import {
  emptyDraft,
  filterMemories,
  memoryFilters,
  memoryHeadingId,
  memoryPinId,
  splitPinned,
  type MemoryCard as Memory,
  type MemoryDraft,
  type MemoryFilter,
} from '../models/memory';

const gridClass = 'grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 list-none p-0 m-0';

/**
 * The Memories screen: people, places and moments that matter to the user,
 * pinned ones first, filtered by kind. The user can add their own memories,
 * pin any of them, and remove the ones they added.
 *
 * Everything is saved on the device (photos included, as same-origin WebP
 * files the service worker caches), so the memory book opens offline.
 *
 * Focus is managed wherever the page changes under the user: after saving
 * (to the new memory's heading), pinning (the card moves, so focus follows its
 * Pin button), removing and closing the form (back to Add a memory).
 */
export default function Memories() {
  const { memories, addMemory, togglePinned, removeMemory } = useMemories();
  const [filter, setFilter] = useState<MemoryFilter>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState<MemoryDraft>(emptyDraft);
  const [announcement, setAnnouncement] = useState('');
  const [focusTarget, setFocusTarget] = useState<string | null>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);

  // Runs after the render that moved or added the element.
  useEffect(() => {
    if (!focusTarget) return;
    document.getElementById(focusTarget)?.focus();
    setFocusTarget(null);
  }, [focusTarget]);

  const visible = filterMemories(memories, filter);
  const { pinned, rest } = splitPinned(visible);
  const filterLabel = memoryFilters.find((f) => f.value === filter)?.label ?? 'All';

  function openForm() {
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    addButtonRef.current?.focus();
  }

  function save(valid: MemoryDraft) {
    const memory = addMemory(valid);
    setDraft(emptyDraft);
    setFormOpen(false);
    // Show the new memory even if the filter would have hidden it.
    if (filter !== 'all' && filter !== memory.category) setFilter('all');
    setAnnouncement(`Saved “${memory.title}” to your memories.`);
    setFocusTarget(memoryHeadingId(memory.id));
  }

  function pin(memory: Memory) {
    togglePinned(memory.id);
    setAnnouncement(memory.pinned ? `Unpinned “${memory.title}”.` : `Pinned “${memory.title}” to the top.`);
    setFocusTarget(memoryPinId(memory.id));
  }

  function remove(memory: Memory) {
    removeMemory(memory.id);
    setAnnouncement(`Removed “${memory.title}”.`);
    addButtonRef.current?.focus();
  }

  // Into the form's first field once it has rendered, so typing can start at once.
  useEffect(() => {
    if (formOpen) document.querySelector<HTMLInputElement>('#add-memory-form input')?.focus();
  }, [formOpen]);

  const renderCards = (list: Memory[]) =>
    list.map((memory) => (
      <li key={memory.id}>
        <MemoryCard memory={memory} onTogglePinned={() => pin(memory)} onRemove={() => remove(memory)} />
      </li>
    ));

  return (
    <div className="space-y-6 page-container">
      <PageHeader
        title="Memories"
        subtitle="People, places and moments that matter to you"
        action={
          <button
            ref={addButtonRef}
            type="button"
            onClick={() => (formOpen ? closeForm() : openForm())}
            aria-expanded={formOpen}
            aria-controls="add-memory-form"
            className="inline-flex items-center justify-center gap-2 min-h-[2.75rem] px-5 py-3 rounded-lg border-2 border-calm-600 bg-calm-600 font-semibold text-white hover:bg-calm-700 hover:border-calm-700 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" aria-hidden="true" />
            Add a memory
          </button>
        }
      />

      {/* Always on the page, so what it says is announced when it changes. */}
      <p role="status" aria-live="polite" className={announcement ? 'rounded-xl border-2 border-success-300 bg-success-50 text-success-800 font-semibold px-4 py-3' : 'sr-only'}>
        {announcement}
      </p>

      {formOpen && (
        <AddMemoryForm draft={draft} onDraftChange={setDraft} onSave={save} onCancel={closeForm} />
      )}

      <MemoryFilters value={filter} onChange={setFilter} />

      {pinned.length > 0 && (
        <section aria-labelledby="memories-pinned">
          <h2
            id="memories-pinned"
            className="flex items-center gap-2 text-sm font-bold text-neutral-600 uppercase tracking-wider mb-3"
          >
            <Pin className="w-4 h-4" aria-hidden="true" />
            Pinned
          </h2>
          <ul className={gridClass} role="list">
            {renderCards(pinned)}
          </ul>
        </section>
      )}

      {rest.length > 0 && (
        <section aria-labelledby="memories-more">
          <h2 id="memories-more" className="text-sm font-bold text-neutral-600 uppercase tracking-wider mb-3">
            {pinned.length > 0 ? 'More memories' : 'Your memories'}
          </h2>
          <ul className={gridClass} role="list">
            {renderCards(rest)}
          </ul>
        </section>
      )}

      {visible.length === 0 && (
        <div className="bg-white rounded-xl border-2 border-neutral-300 shadow-card text-center py-12 px-6 space-y-2">
          <h2 className="text-xl font-bold text-neutral-800">
            {memories.length === 0 ? 'No memories yet' : `No memories under “${filterLabel}” yet`}
          </h2>
          <p className="text-neutral-700">Use “Add a memory” to save one.</p>
        </div>
      )}
    </div>
  );
}
