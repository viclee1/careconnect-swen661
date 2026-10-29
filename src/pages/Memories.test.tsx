import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Memories from './Memories';
import { MEMORIES_KEY } from '../context/MemoriesContext';
import { renderWithProviders } from '../test-utils/renderWithProviders';

function renderPage() {
  return renderWithProviders(<Memories />, { path: '/app/memories', route: '/app/memories' });
}

const saved = () => JSON.parse(localStorage.getItem(MEMORIES_KEY) ?? '[]') as Array<{ id: string; title: string }>;
const titlesIn = (region: HTMLElement) =>
  within(region).getAllByRole('heading', { level: 3 }).map((h) => h.textContent);

async function fillValidMemory(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByRole('textbox', { name: /name of the memory/i }), 'Our wedding day');
  await user.type(screen.getByRole('textbox', { name: 'When' }), 'June 1968');
  await user.selectOptions(screen.getByRole('combobox', { name: /kind of memory/i }), 'event');
  await user.type(screen.getByRole('textbox', { name: /^the memory/i }), 'We married at St Mary’s in the rain.');
}

beforeEach(() => localStorage.clear());

describe('Memories page', () => {
  it('shows pinned memories first, then the rest, under their own headings', () => {
    renderPage();
    expect(screen.getByRole('heading', { level: 1, name: 'Memories' })).toBeInTheDocument();
    expect(titlesIn(screen.getByRole('region', { name: 'Pinned' }))).toEqual([
      'Maria — Your Daughter',
      'Your Home',
      'Buddy — Your Cat',
    ]);
    expect(titlesIn(screen.getByRole('region', { name: 'More memories' }))).toHaveLength(3);
  });

  it('describes each photo and loads it lazily as responsive WebP', () => {
    renderPage();
    const photo = screen.getByRole('img', { name: 'A fluffy white kitten with blue eyes' });
    expect(photo).toHaveAttribute('loading', 'lazy');
    expect(photo.getAttribute('src')).toMatch(/\.webp$/);
    expect(photo.getAttribute('srcset')).toContain('800w');
  });

  it('filters with a radio group', async () => {
    const user = userEvent.setup();
    renderPage();
    const group = screen.getByRole('group', { name: 'Show' });
    expect(within(group).getByRole('radio', { name: 'All' })).toBeChecked();

    await user.click(within(group).getByRole('radio', { name: 'Pets' }));
    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 3, name: 'Buddy — Your Cat' })).toBeInTheDocument();

    // Arrow keys move the choice, as in any radio group.
    await user.keyboard('{ArrowLeft}');
    expect(within(group).getByRole('radio', { name: 'Hobbies' })).toBeChecked();
    expect(screen.getByRole('region', { name: 'Your memories' })).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Pinned' })).not.toBeInTheDocument();
  });

  it('expands and collapses a long story', async () => {
    const user = userEvent.setup();
    renderPage();
    const button = screen.getByRole('button', { name: 'Read more about Your Home' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(button).toHaveAccessibleName('Show less about Your Home');
  });

  it('pins a memory, keeps focus on its button as the card moves and announces it', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: 'Pin to top: Your Garden' }));

    expect(titlesIn(screen.getByRole('region', { name: 'Pinned' }))).toContain('Your Garden');
    expect(screen.getByRole('button', { name: 'Unpin: Your Garden' })).toHaveFocus();
    expect(screen.getByRole('status')).toHaveTextContent('Pinned “Your Garden” to the top.');

    await user.keyboard('{Enter}');
    expect(titlesIn(screen.getByRole('region', { name: 'More memories' }))).toContain('Your Garden');
    expect(screen.getByRole('status')).toHaveTextContent('Unpinned “Your Garden”.');
  });

  describe('Add a memory', () => {
    it('opens the form as a disclosure and moves focus into its first field', async () => {
      const user = userEvent.setup();
      renderPage();
      const toggle = screen.getByRole('button', { name: 'Add a memory' });
      expect(toggle).toHaveAttribute('aria-expanded', 'false');

      await user.click(toggle);
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByRole('form', { name: 'Add a memory' })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /name of the memory/i })).toHaveFocus();
    });

    it('refuses an empty form, explains each problem and focuses the first', async () => {
      const user = userEvent.setup();
      renderPage();
      await user.click(screen.getByRole('button', { name: 'Add a memory' }));
      await user.click(screen.getByRole('button', { name: 'Save memory' }));

      const title = screen.getByRole('textbox', { name: /name of the memory/i });
      expect(title).toHaveFocus();
      expect(title).toHaveAttribute('aria-invalid', 'true');
      expect(title).toHaveAccessibleDescription(/give this memory a name/i);
      expect(screen.getByRole('combobox', { name: /kind of memory/i })).toHaveAccessibleDescription(
        'Choose what kind of memory this is.',
      );
      expect(screen.getAllByRole('alert')).toHaveLength(3);
      expect(saved()).toHaveLength(6);
    });

    it('clears an error as soon as the field is put right', async () => {
      const user = userEvent.setup();
      renderPage();
      await user.click(screen.getByRole('button', { name: 'Add a memory' }));
      await user.click(screen.getByRole('button', { name: 'Save memory' }));
      await user.type(screen.getByRole('textbox', { name: /name of the memory/i }), 'Picnic');
      expect(screen.getByRole('textbox', { name: /name of the memory/i })).not.toHaveAttribute('aria-invalid');
      expect(screen.getAllByRole('alert')).toHaveLength(2);
    });

    it('focuses the story field when only the story is wrong', async () => {
      const user = userEvent.setup();
      renderPage();
      await user.click(screen.getByRole('button', { name: 'Add a memory' }));
      await user.type(screen.getByRole('textbox', { name: /name of the memory/i }), 'Picnic');
      await user.selectOptions(screen.getByRole('combobox', { name: /kind of memory/i }), 'place');
      await user.type(screen.getByRole('textbox', { name: /^the memory/i }), 'Nice');
      await user.click(screen.getByRole('button', { name: 'Save memory' }));
      expect(screen.getByRole('textbox', { name: /^the memory/i })).toHaveFocus();
      expect(screen.getByRole('alert')).toHaveTextContent('Write at least 10 characters');
    });

    it('counts the characters left in the story', async () => {
      const user = userEvent.setup();
      renderPage();
      await user.click(screen.getByRole('button', { name: 'Add a memory' }));
      await user.type(screen.getByRole('textbox', { name: /^the memory/i }), 'Twelve chars');
      expect(screen.getByRole('textbox', { name: /^the memory/i })).toHaveAccessibleDescription(/488 characters left/);
    });

    it('saves a valid memory, focuses its heading, announces it and keeps it after a reload', async () => {
      const user = userEvent.setup();
      const { unmount } = renderPage();
      await user.click(screen.getByRole('button', { name: 'Add a memory' }));
      await fillValidMemory(user);
      await user.click(screen.getByRole('checkbox', { name: /pin to the top/i }));
      await user.click(screen.getByRole('button', { name: 'Save memory' }));

      expect(screen.queryByRole('form')).not.toBeInTheDocument();
      const heading = screen.getByRole('heading', { level: 3, name: 'Our wedding day' });
      expect(heading).toHaveFocus();
      expect(screen.getByRole('status')).toHaveTextContent('Saved “Our wedding day” to your memories.');
      expect(titlesIn(screen.getByRole('region', { name: 'Pinned' }))[0]).toBe('Our wedding day');
      expect(screen.getByText('June 1968')).toBeInTheDocument();
      expect(saved()[0].title).toBe('Our wedding day');

      unmount();
      renderPage();
      expect(screen.getByRole('heading', { level: 3, name: 'Our wedding day' })).toBeInTheDocument();
    });

    it('switches the filter back to All when it would hide the new memory', async () => {
      const user = userEvent.setup();
      renderPage();
      await user.click(screen.getByRole('radio', { name: 'Pets' }));
      await user.click(screen.getByRole('button', { name: 'Add a memory' }));
      await fillValidMemory(user);
      await user.click(screen.getByRole('button', { name: 'Save memory' }));
      expect(screen.getByRole('radio', { name: 'All' })).toBeChecked();
      expect(screen.getByRole('heading', { level: 3, name: 'Our wedding day' })).toHaveFocus();
    });

    it('closes with Escape, returns focus to the button and keeps the draft', async () => {
      const user = userEvent.setup();
      renderPage();
      const toggle = screen.getByRole('button', { name: 'Add a memory' });
      await user.click(toggle);
      await user.type(screen.getByRole('textbox', { name: /name of the memory/i }), 'Half-typed');
      await user.keyboard('{Escape}');

      expect(screen.queryByRole('form')).not.toBeInTheDocument();
      expect(toggle).toHaveFocus();

      await user.click(toggle);
      expect(screen.getByRole('textbox', { name: /name of the memory/i })).toHaveValue('Half-typed');
      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(toggle).toHaveFocus();
    });

    it('lets the user remove only memories they added, after confirming', async () => {
      const user = userEvent.setup();
      renderPage();
      expect(screen.queryByRole('button', { name: /^Remove/ })).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Add a memory' }));
      await fillValidMemory(user);
      await user.click(screen.getByRole('button', { name: 'Save memory' }));

      await user.click(screen.getByRole('button', { name: 'Remove: Our wedding day' }));
      const dialog = screen.getByRole('dialog', { name: 'Remove “Our wedding day”?' });
      await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
      expect(screen.getByRole('heading', { level: 3, name: 'Our wedding day' })).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Remove: Our wedding day' }));
      await user.click(screen.getByRole('button', { name: 'Remove memory' }));
      expect(screen.queryByRole('heading', { level: 3, name: 'Our wedding day' })).not.toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveTextContent('Removed “Our wedding day”.');
      expect(screen.getByRole('button', { name: 'Add a memory' })).toHaveFocus();
      expect(saved()).toHaveLength(6);
    });
  });

  it('closes the form from the same button that opened it', async () => {
    const user = userEvent.setup();
    renderPage();
    const toggle = screen.getByRole('button', { name: 'Add a memory' });
    await user.click(toggle);
    await user.click(toggle);
    expect(screen.queryByRole('form')).not.toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveFocus();
  });

  it('says when a filter has nothing in it', async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      MEMORIES_KEY,
      JSON.stringify([{ id: 'p', title: 'Buddy', body: 'Our cat.', category: 'pet', pinned: false }]),
    );
    renderPage();
    await user.click(screen.getByRole('radio', { name: 'Family' }));
    expect(screen.getByRole('heading', { level: 2, name: 'No memories under “Family” yet' })).toBeInTheDocument();
  });

  it('explains an empty memory book', () => {
    localStorage.setItem(MEMORIES_KEY, '[]');
    renderPage();
    expect(screen.getByRole('heading', { level: 2, name: 'No memories yet' })).toBeInTheDocument();
  });

  it('falls back to the starting memories when saved data is unreadable', () => {
    localStorage.setItem(MEMORIES_KEY, JSON.stringify({ not: 'a list' }));
    renderPage();
    expect(screen.getAllByRole('article')).toHaveLength(6);
  });
});
