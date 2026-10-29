import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Caregiver from './Caregiver';

beforeEach(() => {
  jest.useFakeTimers({ advanceTimers: true });
});

afterEach(() => {
  jest.useRealTimers();
});

describe('Caregiver notes', () => {
  it('groups notes by day, newest first, labelling each with its priority and author', () => {
    render(<Caregiver />);
    expect(screen.getByRole('heading', { level: 1, name: 'Caregiver Notes' })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'Today',
      'Wednesday 3 June',
      'Tuesday 2 June',
    ]);

    const today = screen.getByRole('region', { name: 'Notes for Today' });
    expect(within(today).getByRole('article', { name: 'Routine note from Joyce Adeyemi' })).toBeInTheDocument();
    expect(within(today).getByRole('article', { name: 'Note note from Joyce Adeyemi' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Notes for Wednesday 3 June' })).toHaveTextContent('Maria Thompson');
  });

  it("calls the previous day's notes Yesterday", () => {
    // The fixtures are dated when the module loads; move the clock on a day.
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    jest.setSystemTime(tomorrow);
    render(<Caregiver />);
    expect(screen.getByRole('region', { name: 'Notes for Yesterday' })).toHaveTextContent('Joyce Adeyemi');
  });

  it('opens the composer, disables Save until there is text, and adds an urgent note at the top', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<Caregiver />);
    const add = screen.getByRole('button', { name: 'Add note' });
    expect(add).toHaveAttribute('aria-expanded', 'false');
    await user.click(add);
    expect(add).toHaveAttribute('aria-expanded', 'true');

    const composer = screen.getByRole('region', { name: 'Add a new caregiver note' });
    const save = within(composer).getByRole('button', { name: 'Save note' });
    expect(save).toBeDisabled();
    await user.type(within(composer).getByRole('textbox'), '   ');
    expect(save).toBeDisabled();

    await user.click(within(composer).getByRole('button', { name: 'Urgent' }));
    expect(within(composer).getByRole('button', { name: 'Urgent' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(composer).getByRole('button', { name: 'Routine' })).toHaveAttribute('aria-pressed', 'false');
    await user.type(within(composer).getByRole('textbox'), 'Fell in the garden — no injury.');
    await user.click(save);

    expect(screen.queryByRole('region', { name: 'Add a new caregiver note' })).not.toBeInTheDocument();
    const first = screen.getAllByRole('article')[0];
    expect(first).toHaveAccessibleName('Urgent note from Joyce Adeyemi');
    expect(first).toHaveTextContent('Fell in the garden — no injury.');
  });

  it('cancels without adding the note, and keeps the draft for when the composer reopens', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<Caregiver />);
    const before = screen.getAllByRole('article').length;
    await user.click(screen.getByRole('button', { name: 'Add note' }));
    await user.type(screen.getByRole('textbox'), 'Not this one');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.getAllByRole('article')).toHaveLength(before);
    await user.click(screen.getByRole('button', { name: 'Add note' }));
    expect(screen.getByRole('textbox')).toHaveValue('Not this one');
  });
});
