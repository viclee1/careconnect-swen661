import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ManageAppointments from './ManageAppointments';
import { renderWithProviders } from '../test-utils/renderWithProviders';

const LIST_KEY = 'careconnect_appointments_list';
// The page compares against the UTC date, so the fixtures do too.
const today = new Date().toISOString().split('T')[0];

function renderPage() {
  return renderWithProviders(<ManageAppointments />, {
    path: '/app/manage-appointments',
    route: '/app/manage-appointments',
  });
}

const stored = () => JSON.parse(localStorage.getItem(LIST_KEY) ?? 'null');
const card = (title: string) => screen.getByRole('region', { name: title });
const titles = () => screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);

function seed() {
  localStorage.setItem(
    LIST_KEY,
    JSON.stringify([
      { id: 'a2', title: 'Eye test', date: '2099-03-02', time: '09:00', location: { name: 'Vision Centre', type: 'clinic' }, isInMyDay: true },
      { id: 'a1', title: 'Physio', date: today, time: '15:00', location: { name: 'Westfield Hospital', address: '1 High St', type: 'hospital' }, caregiver: 'Joyce', notes: 'Wear loose clothes.', isInMyDay: false },
      { id: 'a3', title: 'GP call', date: today, time: '08:15', location: { name: 'Telephone', type: 'telephone' }, isInMyDay: false },
    ]),
  );
}

async function fillRequired(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByRole('textbox', { name: /Appointment title/ }), '  Dentist  ');
  fireEvent.change(screen.getByLabelText(/^Date/), { target: { value: '2099-01-15' } });
  fireEvent.change(screen.getByLabelText(/^Time/), { target: { value: '13:05' } });
  await user.selectOptions(screen.getByRole('combobox', { name: /Location type/ }), 'clinic');
  await user.type(screen.getByRole('textbox', { name: /Location name/ }), 'Smile Dental');
}

beforeEach(() => {
  localStorage.clear();
});

describe('Manage appointments', () => {
  it('lists appointments by date, then time, marking those today', () => {
    seed();
    renderPage();
    expect(screen.getByRole('heading', { level: 1, name: 'Manage appointments' })).toBeInTheDocument();
    expect(titles()).toEqual(['GP call', 'Physio', 'Eye test']);
    expect(within(card('Physio')).getByText('Today')).toBeInTheDocument();
    expect(within(card('Eye test')).queryByText('Today')).not.toBeInTheDocument();
    expect(within(card('Eye test')).getByText(/9:00 am/)).toBeInTheDocument();
    expect(within(card('Physio')).getByText(/3:00 pm/)).toBeInTheDocument();
  });

  it('shows the address, assigned caregiver and patient notes when they are set', () => {
    seed();
    renderPage();
    const physio = card('Physio');
    expect(physio).toHaveTextContent('Westfield Hospital — 1 High St');
    expect(within(physio).getByText('Joyce')).toBeInTheDocument();
    expect(within(physio).getByText('is assigned')).toBeInTheDocument();
    expect(within(physio).getByText('Wear loose clothes.')).toBeInTheDocument();
    expect(card('GP call')).not.toHaveTextContent('is assigned');
  });

  it('refuses an empty form, naming each of the five required fields', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: 'Add appointment' }));
    await user.click(screen.getByRole('button', { name: 'Add appointment' }));

    const summary = screen.getByText('Please fix the following before saving:').closest('[role="alert"]') as HTMLElement;
    expect(within(summary).getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      'Appointment title is required.',
      'Date is required.',
      'Time is required.',
      'Location name is required.',
      'Location type is required.',
    ]);
    expect(screen.getByRole('combobox', { name: /Location type/ })).toHaveAttribute('aria-invalid', 'true');
    expect(stored()).toBeNull();
  });

  it('asks for an address only for a place you travel to', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: 'Add appointment' }));
    const type = screen.getByRole('combobox', { name: /Location type/ });
    expect(screen.queryByRole('textbox', { name: /Address/ })).not.toBeInTheDocument();

    await user.selectOptions(type, 'telephone');
    expect(screen.queryByRole('textbox', { name: /Address/ })).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Location name/ })).toHaveAttribute(
      'placeholder',
      'e.g. Telephone — Dr. Sharma will call you',
    );

    await user.selectOptions(type, 'home');
    expect(screen.getByRole('textbox', { name: /Address/ })).toBeInTheDocument();
  });

  it('adds an appointment, trimmed and without the optional fields, and keeps it after a remount', async () => {
    const user = userEvent.setup();
    const { unmount } = renderPage();
    await user.click(screen.getByRole('button', { name: 'Add appointment' }));
    await fillRequired(user);
    await user.click(screen.getByRole('button', { name: 'Add appointment' }));

    expect(screen.queryByRole('heading', { name: 'Add new appointment' })).not.toBeInTheDocument();
    expect(card('Dentist')).toHaveTextContent('1:05 pm');
    expect(stored().find((a: { title: string }) => a.title === 'Dentist')).toEqual({
      id: expect.stringMatching(/^appt-/),
      title: 'Dentist',
      date: '2099-01-15',
      time: '13:05',
      location: { name: 'Smile Dental', type: 'clinic' },
      isInMyDay: false,
    });

    unmount();
    renderPage();
    expect(card('Dentist')).toBeInTheDocument();
  });

  it('edits an appointment, keeping whether it is on My Day', async () => {
    const user = userEvent.setup();
    seed();
    renderPage();
    await user.click(screen.getByRole('button', { name: 'Edit: Eye test' }));
    expect(screen.getByRole('heading', { level: 2, name: 'Edit appointment' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Location type/ })).toHaveValue('clinic');

    await user.type(screen.getByRole('textbox', { name: /Assigned caregiver/ }), 'Maria');
    await user.type(screen.getByRole('textbox', { name: /Patient notes/ }), 'Bring your glasses.');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(within(card('Eye test')).getByText('Maria')).toBeInTheDocument();
    expect(stored().find((a: { id: string }) => a.id === 'a2')).toMatchObject({
      caregiver: 'Maria',
      notes: 'Bring your glasses.',
      isInMyDay: true,
    });
  });

  it('cancels without saving and puts focus back on Add appointment', async () => {
    const user = userEvent.setup();
    seed();
    renderPage();
    await user.click(screen.getByRole('button', { name: 'Add appointment' }));
    await user.type(screen.getByRole('textbox', { name: /Appointment title/ }), 'Not kept');
    await user.click(screen.getByRole('button', { name: 'Cancel and close form' }));
    expect(titles()).toEqual(['GP call', 'Physio', 'Eye test']);
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(screen.getByRole('button', { name: 'Add appointment' })).toHaveFocus();

    await user.click(screen.getByRole('button', { name: 'Add appointment' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('heading', { name: 'Add new appointment' })).not.toBeInTheDocument();
  });

  it('deletes only after confirming, then shows the empty state', async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      LIST_KEY,
      JSON.stringify([{ id: 'x', title: 'Only one', date: '2099-01-01', time: '10:00', location: { name: 'Home', type: 'home' }, isInMyDay: false }]),
    );
    renderPage();
    await user.click(screen.getByRole('button', { name: 'Delete: Only one' }));
    const dialog = screen.getByRole('dialog', { name: 'Delete appointment' });
    expect(dialog).toHaveTextContent('Are you sure you want to delete "Only one"?');
    await user.click(within(dialog).getByRole('button', { name: 'Yes, delete' }));

    expect(screen.getByText('No appointments yet')).toBeInTheDocument();
    expect(stored()).toEqual([]);
  });

  it('shows the default appointments when nothing has been saved yet', () => {
    renderPage();
    expect(card('Blood pressure check — Dr. Sharma')).toBeInTheDocument();
  });
});
