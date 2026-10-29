import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ActivityLog from './ActivityLog';
import type { ActivityEvent } from '../data/caregiverStore';

const LOG_KEY = 'careconnect_activity_log';

function at(daysAgo: number, hour: number, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function store(events: ActivityEvent[]) {
  localStorage.setItem(LOG_KEY, JSON.stringify(events));
}

beforeEach(() => {
  localStorage.clear();
});

describe('Activity log', () => {
  it('explains what will appear when nothing has happened yet', () => {
    render(<ActivityLog />);
    expect(screen.getByRole('heading', { level: 1, name: 'Activity log' })).toBeInTheDocument();
    expect(screen.getByText(/Events will appear here when Margaret takes medications/)).toBeInTheDocument();
  });

  it('names every kind of event in a legend', () => {
    render(<ActivityLog />);
    const legend = screen.getByRole('list', { name: 'Activity type legend' });
    expect(within(legend).getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      'Medication taken',
      'Medication unmarked',
      'Task completed',
      'Checked in',
    ]);
  });

  it('groups events by day — Today, Yesterday, then the date — with a count and the time of each', () => {
    store([
      { id: '1', kind: 'med_taken', label: 'Took Amlodipine', timestamp: at(0, 8, 35) },
      { id: '2', kind: 'check_in', label: 'Checked in for the day', timestamp: at(0, 8, 5) },
      { id: '3', kind: 'schedule_done', label: 'Finished breakfast', timestamp: at(1, 9) },
      { id: '4', kind: 'med_skipped', label: 'Unmarked Metformin', timestamp: at(5, 12) },
    ]);
    render(<ActivityLog />);

    const days = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(days[0]).toMatch(/^Today\s*— 2 events$/);
    expect(days[1]).toMatch(/^Yesterday\s*— 1 event$/);
    expect(days[2]).toMatch(/^\w+day \d+ \w+\s*— 1 event$/);

    const today = screen.getByRole('list', { name: 'Events for Today' });
    const [first] = within(today).getAllByRole('listitem');
    expect(first).toHaveTextContent('Took Amlodipine');
    expect(first).toHaveTextContent('Medication taken');
    expect(within(first).getByText('8:35 AM')).toHaveAttribute('datetime', at(0, 8, 35));
  });

  it('picks up new events on Refresh, and when the window regains focus', async () => {
    const user = userEvent.setup();
    render(<ActivityLog />);
    store([{ id: '1', kind: 'check_in', label: 'Said good morning', timestamp: at(0, 10) }]);
    await user.click(screen.getByRole('button', { name: 'Refresh activity log' }));
    expect(screen.getByText('Said good morning')).toBeInTheDocument();

    store([
      { id: '2', kind: 'med_taken', label: 'Took Lisinopril', timestamp: at(0, 11) },
      { id: '1', kind: 'check_in', label: 'Said good morning', timestamp: at(0, 10) },
    ]);
    act(() => {
      window.dispatchEvent(new Event('focus'));
    });
    expect(screen.getByText('Took Lisinopril')).toBeInTheDocument();
  });

  it('shows an empty log rather than failing when the stored one is corrupt', () => {
    localStorage.setItem(LOG_KEY, '{oops');
    render(<ActivityLog />);
    expect(screen.getByText(/Events will appear here/)).toBeInTheDocument();
  });
});
