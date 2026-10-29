import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Appointments from './Appointments';
import { MY_DAY_KEY } from '../context/AppointmentsContext';
import type { Appointment } from '../models/appointment';
import { renderWithProviders } from '../test-utils/renderWithProviders';
import { addDays } from '../utils/dates';

const LIST_KEY = 'careconnect_appointments_list';

function renderPage() {
  return renderWithProviders(<Appointments />, { path: '/app/appointments', route: '/app/appointments' });
}

function store(list: Appointment[]) {
  localStorage.setItem(LIST_KEY, JSON.stringify(list));
}

const visit = (overrides: Partial<Appointment>): Appointment => ({
  id: 'x1',
  title: 'Hearing aid fitting',
  date: addDays(0),
  time: '10:00',
  location: { name: 'Westfield Audiology', address: '2 High Street', type: 'clinic' },
  isInMyDay: false,
  ...overrides,
});

beforeEach(() => {
  localStorage.clear();
  Object.assign(URL, { createObjectURL: jest.fn(() => 'blob:ics'), revokeObjectURL: jest.fn() });
  jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
});

afterEach(() => jest.restoreAllMocks());

describe('Appointments page', () => {
  it('lists the visits under Today, Later this week and Coming up, and shows the first in detail', () => {
    renderPage();
    expect(screen.getByRole('heading', { level: 1, name: 'My Appointments' })).toBeInTheDocument();
    expect(screen.getByText('8 upcoming visits. Choose one to see the details.')).toBeInTheDocument();

    const today = screen.getByRole('region', { name: /today/i });
    expect(within(today).getAllByRole('button')).toHaveLength(2);
    expect(within(screen.getByRole('region', { name: 'Later this week' })).getAllByRole('button')).toHaveLength(3);
    expect(within(screen.getByRole('region', { name: 'Coming up' })).getAllByRole('button')).toHaveLength(3);

    expect(within(today).getByRole('button', { name: /^Blood pressure check — Dr. Sharma/ })).toHaveAttribute(
      'aria-current',
      'true',
    );
    expect(screen.getByRole('article', { name: 'Blood pressure check — Dr. Sharma' })).toHaveTextContent('Clinic visit');
  });

  it('choosing a visit in the list shows it in the detail panel', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: /^Memory clinic follow-up/ }));
    expect(screen.getByRole('button', { name: /^Memory clinic follow-up/ })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('article', { name: 'Memory clinic follow-up — Dr. Patel' })).toBeInTheDocument();
  });

  it('writes the date and time in full words in a machine-readable <time>', () => {
    store([visit({ date: '2030-06-06', time: '14:30' })]);
    renderPage();
    const time = within(screen.getByRole('article')).getByText('Thursday, 6 June — 2:30 pm');
    expect(time.tagName).toBe('TIME');
    expect(time).toHaveAttribute('datetime', '2030-06-06T14:30');
  });

  it('says who is taking the user and shows the caregiver’s note', () => {
    renderPage();
    const card = screen.getByRole('article', { name: 'Blood pressure check — Dr. Sharma' });
    expect(within(card).getByText('is taking you to this appointment', { exact: false })).toHaveTextContent(
      'Joyce is taking you to this appointment',
    );
    expect(within(card).getByText(/bring your medicines list/i)).toBeInTheDocument();
  });

  it('links to directions in a new tab, and says so', () => {
    renderPage();
    const card = screen.getByRole('article', { name: 'Blood pressure check — Dr. Sharma' });
    const link = within(card).getByRole('link', {
      name: 'Get directions to Greenfield Surgery (opens in a new tab)',
    });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link.getAttribute('href')).toContain('google.com/maps/search');
  });

  it('shows “No travel needed” instead of directions for a telephone visit', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: /^GP telephone review/ }));
    const card = screen.getByRole('article', { name: 'GP telephone review — Dr. Sharma' });
    expect(within(card).queryByRole('link')).not.toBeInTheDocument();
    expect(within(card).getByText('No travel needed')).toBeInTheDocument();
    expect(within(card).getByText('Telephone — no travel needed')).toBeInTheDocument();
  });

  it('adds a visit to My Day with a checkbox, keeps focus on it and saves the choice', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: /^Blood test — fasting needed/ }));
    const box = screen.getByRole('checkbox', { name: /blood test — fasting needed/i });
    expect(box).not.toBeChecked();

    await user.click(box);
    expect(box).toBeChecked();
    expect(box).toHaveFocus();
    expect(box).toHaveAccessibleName('In My Day: Blood test — fasting needed');
    expect(JSON.parse(localStorage.getItem(MY_DAY_KEY) ?? '{}')).toEqual({ a3: true });

    await user.keyboard(' ');
    expect(box).not.toBeChecked();
    expect(JSON.parse(localStorage.getItem(MY_DAY_KEY) ?? '{}')).toEqual({ a3: false });
  });

  it('starts with the caregiver’s My Day choices ticked, and remembers the user’s', async () => {
    const user = userEvent.setup();
    localStorage.setItem(MY_DAY_KEY, JSON.stringify({ a1: false, a4: true }));
    renderPage();
    expect(screen.getByRole('checkbox', { name: /blood pressure check/i })).not.toBeChecked();
    await user.click(screen.getByRole('button', { name: /^Heart checkup/ }));
    expect(screen.getByRole('checkbox', { name: /heart checkup/i })).toBeChecked();
    await user.click(screen.getByRole('button', { name: /^Memory clinic/ }));
    expect(screen.getByRole('checkbox', { name: /memory clinic/i })).toBeChecked();
  });

  it('exports the visits to a calendar file and reports it in words', async () => {
    const user = userEvent.setup();
    renderPage();
    const button = screen.getByRole('button', { name: 'Export to calendar' });
    expect(button).toHaveAccessibleDescription(/on-screen reminder an hour before — no sound/);

    await user.click(button);
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    const banner = screen.getByRole('status');
    expect(banner).toHaveTextContent('8 appointments saved to “careconnect-appointments.ics”');

    await user.click(within(banner).getByRole('button', { name: 'Dismiss this message' }));
    expect(screen.queryByText(/appointments saved/)).not.toBeInTheDocument();
    expect(button).toHaveFocus();
  });

  it('warns when some visits could not be exported', async () => {
    const user = userEvent.setup();
    store([visit({ id: 'ok' }), visit({ id: 'bad', time: 'after lunch' })]);
    renderPage();
    await user.click(screen.getByRole('button', { name: 'Export to calendar' }));
    expect(screen.getByRole('status')).toHaveTextContent(
      '1 appointment saved to “careconnect-appointments.ics”',
    );
    expect(screen.getByRole('status')).toHaveTextContent('1 appointment had no date a calendar can read and was left out.');
  });

  it('makes no file when no visit has a readable time', async () => {
    const user = userEvent.setup();
    store([visit({ time: 'after lunch' })]);
    renderPage();
    await user.click(screen.getByRole('button', { name: 'Export to calendar' }));
    expect(URL.createObjectURL).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Appointments were not exported');
  });

  it('shows a calm empty state when nothing is booked', () => {
    store([visit({ date: addDays(-2) })]);
    renderPage();
    expect(screen.getByRole('heading', { level: 2, name: 'No upcoming appointments' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Export to calendar' })).not.toBeInTheDocument();
  });
});
