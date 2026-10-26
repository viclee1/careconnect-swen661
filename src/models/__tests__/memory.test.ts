import {
  createMemory,
  emptyDraft,
  filterMemories,
  firstErrorField,
  isCategory,
  isLongStory,
  memoryHeadingId,
  memoryLimits,
  memoryPinId,
  reviveMemories,
  splitPinned,
  validateMemoryDraft,
  type MemoryCard,
  type MemoryDraft,
} from '../memory';

const card = (id: string, category: MemoryCard['category'], pinned = false): MemoryCard => ({
  id,
  title: `Memory ${id}`,
  body: 'A story long enough.',
  category,
  pinned,
});

const valid: MemoryDraft = {
  title: '  Our wedding day ',
  when: ' June 1968 ',
  category: 'event',
  body: ' We married at St Mary’s in the rain. ',
  pinned: true,
};

describe('filtering and pinning', () => {
  const list = [card('a', 'family', true), card('b', 'pet'), card('c', 'family')];

  it('filters by category, or shows all', () => {
    expect(filterMemories(list, 'all')).toHaveLength(3);
    expect(filterMemories(list, 'family').map((m) => m.id)).toEqual(['a', 'c']);
    expect(filterMemories(list, 'hobby')).toEqual([]);
  });

  it('puts pinned memories in their own group, keeping order', () => {
    const { pinned, rest } = splitPinned(list);
    expect(pinned.map((m) => m.id)).toEqual(['a']);
    expect(rest.map((m) => m.id)).toEqual(['b', 'c']);
  });

  it('knows its categories', () => {
    expect(isCategory('pet')).toBe(true);
    expect(isCategory('dog')).toBe(false);
    expect(isCategory(3)).toBe(false);
  });

  it('cuts long stories only', () => {
    expect(isLongStory('x'.repeat(120))).toBe(false);
    expect(isLongStory('x'.repeat(121))).toBe(true);
  });

  it('builds stable element ids', () => {
    expect(memoryHeadingId('mc1')).toBe('memory-mc1-title');
    expect(memoryPinId('mc1')).toBe('memory-mc1-pin');
  });
});

describe('validateMemoryDraft', () => {
  it('accepts a complete draft', () => {
    expect(validateMemoryDraft(valid)).toEqual({});
  });

  it('explains every missing required field', () => {
    const errors = validateMemoryDraft(emptyDraft);
    expect(errors.title).toMatch(/give this memory a name/i);
    expect(errors.category).toMatch(/choose what kind/i);
    expect(errors.body).toMatch(/write a few words/i);
    expect(errors.when).toBeUndefined();
    expect(firstErrorField(errors)).toBe('title');
  });

  it('treats spaces alone as empty', () => {
    expect(validateMemoryDraft({ ...valid, title: '   ' }).title).toBeDefined();
  });

  it('enforces the length limits with the numbers', () => {
    const errors = validateMemoryDraft({
      ...valid,
      title: 'x'.repeat(memoryLimits.title + 1),
      when: 'y'.repeat(memoryLimits.when + 1),
      body: 'z'.repeat(memoryLimits.body + 5),
    });
    expect(errors.title).toBe(`Names can be up to 60 characters. This one is 61.`);
    expect(errors.when).toMatch(/40 characters/);
    expect(errors.body).toBe('Memories can be up to 500 characters. This one is 505.');
  });

  it('asks for more than a couple of words', () => {
    expect(validateMemoryDraft({ ...valid, body: 'Nice' }).body).toMatch(/at least 10/);
    expect(firstErrorField({ body: 'x' })).toBe('body');
    expect(firstErrorField({})).toBeNull();
  });
});

describe('createMemory', () => {
  it('trims the draft and marks it as the user’s own', () => {
    expect(createMemory(valid, 'new')).toEqual({
      id: 'new',
      title: 'Our wedding day',
      when: 'June 1968',
      category: 'event',
      body: 'We married at St Mary’s in the rain.',
      pinned: true,
      addedByUser: true,
    });
  });

  it('leaves “when” out when it was blank', () => {
    expect(createMemory({ ...valid, when: ' ' }, 'new')).not.toHaveProperty('when');
  });

  it('refuses a draft with no category', () => {
    expect(() => createMemory({ ...valid, category: '' }, 'new')).toThrow();
  });
});

describe('reviveMemories', () => {
  it('drops entries that would break the screen', () => {
    const stored = [card('ok', 'pet'), { id: 'x', title: 'No body', category: 'pet', pinned: false }, null, card('bad', 'pet')];
    (stored[3] as { category: string }).category = 'dragon';
    expect(reviveMemories(stored)?.map((m) => m.id)).toEqual(['ok']);
  });

  it('returns null when nothing usable was stored', () => {
    expect(reviveMemories({})).toBeNull();
    expect(reviveMemories('x')).toBeNull();
  });
});
