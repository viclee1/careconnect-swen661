import type { MemoryCard } from '../types';

export type { MemoryCard };
export type MemoryCategory = MemoryCard['category'];
export type MemoryFilter = MemoryCategory | 'all';

/** The badge printed on each card. */
export const categoryLabel: Record<MemoryCategory, string> = {
  family: 'Family',
  place: 'Place',
  event: 'Memory',
  hobby: 'Hobby',
  pet: 'Pet',
};

/** The filter choices, in the order they are shown. */
export const memoryFilters: Array<{ value: MemoryFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'family', label: 'Family' },
  { value: 'place', label: 'Places' },
  { value: 'event', label: 'Memories' },
  { value: 'hobby', label: 'Hobbies' },
  { value: 'pet', label: 'Pets' },
];

const categories = Object.keys(categoryLabel) as MemoryCategory[];

export function isCategory(value: unknown): value is MemoryCategory {
  return typeof value === 'string' && (categories as string[]).includes(value);
}

export function filterMemories(memories: MemoryCard[], filter: MemoryFilter): MemoryCard[] {
  return filter === 'all' ? memories : memories.filter((m) => m.category === filter);
}

/** Pinned memories first, each group keeping its saved order. */
export function splitPinned(memories: MemoryCard[]): { pinned: MemoryCard[]; rest: MemoryCard[] } {
  return {
    pinned: memories.filter((m) => m.pinned),
    rest: memories.filter((m) => !m.pinned),
  };
}

/** The heading id focus moves to after a memory is saved. */
export const memoryHeadingId = (id: string) => `memory-${id}-title`;
/** The Pin button's id, so focus can follow it when the card moves section. */
export const memoryPinId = (id: string) => `memory-${id}-pin`;

/** Text longer than this is cut to three lines behind a "Read more" button. */
export const longStoryLength = 120;

export function isLongStory(body: string): boolean {
  return body.length > longStoryLength;
}

// ── Adding a memory ───────────────────────────────────────────────────────────

export interface MemoryDraft {
  title: string;
  when: string;
  category: MemoryCategory | '';
  body: string;
  pinned: boolean;
}

export const emptyDraft: MemoryDraft = { title: '', when: '', category: '', body: '', pinned: false };

export const memoryLimits = { title: 60, when: 40, bodyMin: 10, body: 500 } as const;

export type MemoryErrors = Partial<Record<'title' | 'when' | 'category' | 'body', string>>;

/**
 * Checks the Add a memory form. Each message says what to do, in plain words,
 * because it is printed under the field and read out by screen readers.
 * An empty object means the draft can be saved.
 */
export function validateMemoryDraft(draft: MemoryDraft): MemoryErrors {
  const errors: MemoryErrors = {};
  const title = draft.title.trim();
  const when = draft.when.trim();
  const body = draft.body.trim();

  if (!title) errors.title = 'Give this memory a name, such as “Our wedding day”.';
  else if (title.length > memoryLimits.title) {
    errors.title = `Names can be up to ${memoryLimits.title} characters. This one is ${title.length}.`;
  }

  if (when.length > memoryLimits.when) {
    errors.when = `Keep “When” to ${memoryLimits.when} characters or fewer, such as “Summer 1975”.`;
  }

  if (!isCategory(draft.category)) errors.category = 'Choose what kind of memory this is.';

  if (!body) errors.body = 'Write a few words about this memory.';
  else if (body.length < memoryLimits.bodyMin) {
    errors.body = `Write at least ${memoryLimits.bodyMin} characters so the memory makes sense later.`;
  } else if (body.length > memoryLimits.body) {
    errors.body = `Memories can be up to ${memoryLimits.body} characters. This one is ${body.length}.`;
  }

  return errors;
}

/** The order the form's fields appear in, for focusing the first problem. */
export const draftFieldOrder = ['title', 'when', 'category', 'body'] as const;

export function firstErrorField(errors: MemoryErrors): keyof MemoryErrors | null {
  return draftFieldOrder.find((field) => errors[field]) ?? null;
}

/** Turns a valid draft into a saved memory. */
export function createMemory(draft: MemoryDraft, id: string): MemoryCard {
  if (!isCategory(draft.category)) throw new Error('createMemory needs a valid draft');
  const when = draft.when.trim();
  return {
    id,
    title: draft.title.trim(),
    body: draft.body.trim(),
    category: draft.category,
    pinned: draft.pinned,
    ...(when ? { when } : {}),
    addedByUser: true,
  };
}

/**
 * Turns whatever was stored back into memories. Entries missing a title, a
 * story or a known category are dropped, so a corrupt entry cannot break the
 * screen. `null` means nothing usable was stored.
 */
export function reviveMemories(stored: unknown): MemoryCard[] | null {
  if (!Array.isArray(stored)) return null;
  return stored.filter(
    (item): item is MemoryCard =>
      Boolean(item) &&
      typeof item === 'object' &&
      typeof item.id === 'string' &&
      typeof item.title === 'string' &&
      typeof item.body === 'string' &&
      isCategory(item.category) &&
      typeof item.pinned === 'boolean',
  );
}
