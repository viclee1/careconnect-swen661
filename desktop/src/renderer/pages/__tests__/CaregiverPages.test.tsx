import { act, screen, within } from '@testing-library/react';

import {
  createFlakyAppointmentRepository,
  createMockAppointmentRepository,
} from '../../data/appointmentRepository';
import { createMockMedicineRepository } from '../../data/medicineRepository';
import type { Route } from '../../navigation/NavigationProvider';
import { installBridge, renderApp } from '../../test-support/harness';

/** Signed in as a caregiver on this computer, as RoleChooser leaves it. */
function signInAs(role: 'patient' | 'caregiver') {
  localStorage.setItem(
    'careconnect_desktop_user',
    JSON.stringify({ name: 'Margaret Whitfield', email: 'margaret@example.com' }),
  );
  localStorage.setItem('careconnect_desktop_role', role);
}

function open(initialRoute: Route, repositories = {}) {
  signInAs('caregiver');
  return renderApp({
    initialRoute,
    repositories: {
      medicines: createMockMedicineRepository(),
      appointments: createMockAppointmentRepository(),
      ...repositories,
    },
  });
}

const sidebar = () => screen.getByRole('navigation', { name: 'Main' });
const main = () => screen.getByRole('main');

beforeEach(() => localStorage.clear());

describe('Role chooser', () => {
  it('a caregiver lands on the Dashboard, and the choice is remembered', async () => {
    signInAs('caregiver');
    localStorage.removeItem('careconnect_desktop_role');
    const { user } = renderApp({ initialRoute: { name: 'RoleChooser' } });
    expect(screen.getByRole('heading', { level: 1, name: 'Welcome, Margaret' })).toBeInTheDocument();
    expect(document.title).toBe('Choose your role — CareConnect');

    await user.click(screen.getByRole('button', { name: /I am a caregiver/ }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Dashboard' })).toBeInTheDocument();
    expect(localStorage.getItem('careconnect_desktop_role')).toBe('caregiver');
  });
});

describe('Caregiver sidebar', () => {
  it("shows the caregiver's pages, marks the current one, and switches views both ways", async () => {
    const { user } = open({ name: 'Dashboard' });
    const nav = sidebar();
    expect(within(nav).getByText('Caregiver view')).toBeInTheDocument();
    expect(within(nav).getByText('Caring for Margaret')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toHaveTextContent("Caregiver view · Margaret Whitfield's plan");
    for (const label of ['Dashboard', 'Medicines', 'Appointments', 'Activity', 'Notes']) {
      expect(within(nav).getByRole('button', { name: new RegExp(`^${label}`) })).toBeInTheDocument();
    }
    expect(within(nav).queryByRole('button', { name: /^My Day/ })).not.toBeInTheDocument();
    expect(within(nav).getByRole('button', { name: /^Dashboard/ })).toHaveAttribute('aria-current', 'page');

    await user.click(within(nav).getByRole('button', { name: /^Notes/ }));
    expect(within(sidebar()).getByRole('button', { name: /^Notes/ })).toHaveAttribute('aria-current', 'page');
    expect(document.title).toBe('Care notes — CareConnect');

    await user.click(within(sidebar()).getByRole('button', { name: 'Switch to care recipient view' }));
    expect(await screen.findByRole('heading', { level: 1, name: /here's your day/i })).toBeInTheDocument();
    expect(within(sidebar()).getByText('♡ Care Recipient')).toBeInTheDocument();
    expect(localStorage.getItem('careconnect_desktop_role')).toBe('patient');

    await user.click(within(sidebar()).getByRole('button', { name: 'Switch to caregiver view' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Dashboard' })).toBeInTheDocument();
  });

  it('Ctrl + 1 opens the Dashboard for a caregiver, and Home for the care recipient', async () => {
    const bridge = installBridge();
    try {
      const { user } = open({ name: 'Notes' });
      act(() => bridge.emitMenuCommand('navigate:home'));
      expect(await screen.findByRole('heading', { level: 1, name: 'Dashboard' })).toBeInTheDocument();

      await user.click(within(sidebar()).getByRole('button', { name: 'Switch to care recipient view' }));
      await user.click(within(sidebar()).getByRole('button', { name: /^Contacts/ }));
      act(() => bridge.emitMenuCommand('navigate:home'));
      expect(await screen.findByRole('heading', { level: 1, name: /here's your day/i })).toBeInTheDocument();
    } finally {
      bridge.uninstall();
    }
  });
});

describe('Dashboard', () => {
  it("sums up the day: medicines, My Day, the check-in and the next appointment", async () => {
    open({ name: 'Dashboard' });
    const glance = screen.getByRole('list', { name: 'Today at a glance' });
    expect(within(glance).getByRole('region', { name: 'Medicines' })).toHaveTextContent('1 of 3 taken today');
    expect(within(glance).getByRole('region', { name: 'My Day' })).toHaveTextContent(/1 of \d+ tasks done/);
    expect(within(glance).getByRole('region', { name: 'Check-in' })).toHaveTextContent('Not checked in yet');
    expect(
      await within(glance).findByText(/^Dr\. .+ at .+/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Nothing yet today/)).toBeInTheDocument();
  });

  it('shows what the care recipient just did, newest first, and links onward', async () => {
    const { user } = open({ name: 'Dashboard' });
    await user.click(within(sidebar()).getByRole('button', { name: 'Switch to care recipient view' }));
    await user.click(within(sidebar()).getByRole('button', { name: /^Medicines/ }));
    await user.click(screen.getByRole('checkbox', { name: /Metformin/ }));
    await user.click(within(sidebar()).getByRole('button', { name: /^My Day/ }));
    await user.click(screen.getByRole('button', { name: /Morning check-in/ }));

    await user.click(within(sidebar()).getByRole('button', { name: 'Switch to caregiver view' }));
    const recent = await screen.findByRole('region', { name: 'Recent activity' });
    expect(within(recent).getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      expect.stringContaining('Checked in for the day'),
      expect.stringContaining('Took Metformin'),
    ]);
    expect(screen.getByRole('region', { name: 'Check-in' })).toHaveTextContent('Checked in today');
    expect(screen.getByRole('region', { name: 'Medicines' })).toHaveTextContent('2 of 3 taken today');

    await user.click(screen.getByRole('button', { name: 'View all activity' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Activity' })).toBeInTheDocument();
  });

  it('opens Manage medicines and Manage appointments from their cards', async () => {
    const { user } = open({ name: 'Dashboard' });
    await user.click(screen.getByRole('button', { name: 'Manage medicines' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Manage medicines' })).toBeInTheDocument();
    await user.click(within(sidebar()).getByRole('button', { name: /^Dashboard/ }));
    await user.click(screen.getByRole('button', { name: 'Manage appointments' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Manage appointments' })).toBeInTheDocument();
  });

  it('says when no appointment is booked', async () => {
    open({ name: 'Dashboard' }, { appointments: createMockAppointmentRepository([]) });
    expect(await screen.findByText('None booked')).toBeInTheDocument();
  });
});

describe('Manage medicines', () => {
  it('refuses an empty medicine, naming each field, and focuses the first', async () => {
    const { user } = open({ name: 'ManageMedicines' });
    await user.click(screen.getByRole('button', { name: 'Add medicine' }));
    const form = screen.getByRole('region', { name: 'Add a medicine' });
    await user.click(within(form).getByRole('button', { name: 'Add medicine' }));

    expect(within(form).getByRole('alert')).toHaveTextContent('3 things need fixing');
    expect(within(form).getByText('Medicine name is required.')).toBeInTheDocument();
    expect(within(form).getByText('Dose is required.')).toBeInTheDocument();
    expect(within(form).getByText('Time to take it is required.')).toBeInTheDocument();
    const name = within(form).getByRole('textbox', { name: 'Medicine name' });
    expect(name).toHaveFocus();
    expect(name).toHaveAttribute('aria-invalid', 'true');

    // Fixing a field clears its error at once.
    await user.type(name, 'Aspirin');
    expect(within(form).queryByText('Medicine name is required.')).not.toBeInTheDocument();
    expect(within(form).getByRole('alert')).toHaveTextContent('2 things need fixing');
  });

  it("adds a medicine that then appears on the care recipient's Medicines page, not yet taken", async () => {
    const { user } = open({ name: 'ManageMedicines' });
    await user.click(screen.getByRole('button', { name: 'Add medicine' }));
    await user.type(screen.getByRole('textbox', { name: 'Medicine name' }), '  Vitamin D ');
    await user.type(screen.getByRole('textbox', { name: 'Dose' }), '1000 IU');
    await user.type(screen.getByRole('textbox', { name: 'Time to take it' }), '9:00 am');
    await user.click(screen.getByRole('button', { name: 'Add medicine' }));

    expect(screen.getByRole('status', { hidden: true })).toHaveTextContent('Added Vitamin D.');
    expect(screen.getByRole('article', { name: 'Vitamin D' })).toHaveTextContent('1000 IU');
    expect(screen.getByRole('button', { name: 'Add medicine' })).toHaveFocus();
    expect(screen.getByText('4 medicines')).toBeInTheDocument();

    await user.click(within(sidebar()).getByRole('button', { name: 'Switch to care recipient view' }));
    await user.click(within(sidebar()).getByRole('button', { name: /^Medicines/ }));
    expect(screen.getByRole('checkbox', { name: /Vitamin D/ })).not.toBeChecked();
    expect(screen.getByRole('status')).toHaveTextContent('1 of 4 taken');
  });

  it('edits a medicine in place', async () => {
    const { user } = open({ name: 'ManageMedicines' });
    await user.click(screen.getByRole('button', { name: 'Edit Metformin' }));
    const form = screen.getByRole('region', { name: 'Edit Metformin' });
    const dose = within(form).getByRole('textbox', { name: 'Dose' });
    expect(dose).toHaveValue('500 mg — 1 tablet with lunch');
    await user.clear(dose);
    await user.type(dose, '850 mg');
    await user.click(within(form).getByRole('button', { name: 'Save changes' }));

    expect(screen.getByRole('article', { name: 'Metformin' })).toHaveTextContent('850 mg');
    expect(screen.getByRole('status', { hidden: true })).toHaveTextContent('Saved Metformin.');
  });

  it('cancels an add or an edit without changing anything', async () => {
    const { user } = open({ name: 'ManageMedicines' });
    await user.click(screen.getByRole('button', { name: 'Add medicine' }));
    await user.type(screen.getByRole('textbox', { name: 'Medicine name' }), 'Never saved');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('article', { name: 'Never saved' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add medicine' })).toHaveFocus();

    await user.click(screen.getByRole('button', { name: 'Edit Amlodipine' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByText('3 medicines')).toBeInTheDocument();
  });

  it('asks before deleting, puts focus back on Delete when cancelled, and empties to a message', async () => {
    const { user } = open(
      { name: 'ManageMedicines' },
      {
        medicines: createMockMedicineRepository([
          { id: 'm1', name: 'Amlodipine', dosage: '5 mg', time: '8:30 am', taken: false },
        ]),
      },
    );
    expect(screen.getByText('1 medicine')).toBeInTheDocument();
    const del = screen.getByRole('button', { name: 'Delete Amlodipine' });
    await user.click(del);
    const confirm = screen.getByRole('group', { name: 'Delete Amlodipine?' });
    expect(within(confirm).getByRole('button', { name: 'Yes, delete' })).toHaveFocus();

    await user.click(within(confirm).getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('button', { name: 'Delete Amlodipine' })).toHaveFocus();

    await user.click(screen.getByRole('button', { name: 'Delete Amlodipine' }));
    await user.click(screen.getByRole('button', { name: 'Yes, delete' }));
    expect(screen.getByText('No medicines yet')).toBeInTheDocument();
    expect(screen.getByRole('status', { hidden: true })).toHaveTextContent('Deleted Amlodipine.');
  });
});

describe('Manage appointments', () => {
  it('lists the appointments once loaded, and adds one the care recipient then sees', async () => {
    const { user } = open({ name: 'ManageAppointments' });
    expect(await screen.findByText(/^\d+ appointments?$/)).toBeInTheDocument();
    const before = screen.getAllByRole('article').length;

    await user.click(screen.getByRole('button', { name: 'Add appointment' }));
    const form = screen.getByRole('region', { name: 'Add an appointment' });
    await user.click(within(form).getByRole('button', { name: 'Add appointment' }));
    expect(within(form).getByRole('alert')).toHaveTextContent('5 things need fixing');

    await user.type(within(form).getByRole('textbox', { name: 'Who it is with' }), 'Dr. Okafor');
    await user.type(within(form).getByRole('textbox', { name: 'What it is for' }), 'Eye test');
    await user.type(within(form).getByRole('textbox', { name: 'Date' }), 'Dec 1, 2026');
    await user.type(within(form).getByRole('textbox', { name: 'Time' }), '9:15 am');
    await user.type(within(form).getByRole('textbox', { name: 'Where' }), 'Vision Centre');
    await user.click(within(form).getByRole('button', { name: 'Add appointment' }));

    const added = await screen.findByRole('article', { name: 'Dr. Okafor — Eye test' });
    expect(added).toHaveTextContent('Dec 1, 2026 at 9:15 am');
    expect(screen.getAllByRole('article')).toHaveLength(before + 1);
    expect(screen.getByRole('status', { hidden: true })).toHaveTextContent(
      'Added the appointment with Dr. Okafor.',
    );

    await user.click(within(sidebar()).getByRole('button', { name: 'Switch to care recipient view' }));
    await user.click(within(sidebar()).getByRole('button', { name: /^Appointments/ }));
    expect(await screen.findByText(/Dr\. Okafor/)).toBeInTheDocument();
  });

  it('edits, then deletes after confirming', async () => {
    const { user } = open({ name: 'ManageAppointments' });
    const first = (await screen.findAllByRole('article'))[0];
    const title = first.getAttribute('aria-label')!;
    await user.click(within(first).getByRole('button', { name: /^Edit/ }));
    const where = screen.getByRole('textbox', { name: 'Where' });
    await user.clear(where);
    await user.type(where, 'Westfield Hospital');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(await screen.findByRole('article', { name: title })).toHaveTextContent('Westfield Hospital');

    await user.click(screen.getByRole('button', { name: `Delete ${title}` }));
    await user.click(screen.getByRole('button', { name: 'Yes, delete' }));
    expect(await screen.findByRole('status', { hidden: true })).toHaveTextContent(/^Deleted the appointment/);
    expect(screen.queryByRole('article', { name: title })).not.toBeInTheDocument();
  });

  it('says when there are none, and recovers from a failed load', async () => {
    const { unmount } = open(
      { name: 'ManageAppointments' },
      { appointments: createMockAppointmentRepository([]) },
    );
    expect(await screen.findByText('No appointments booked')).toBeInTheDocument();
    unmount();

    const flaky = open({ name: 'ManageAppointments' }, { appointments: createFlakyAppointmentRepository(1) });
    expect(await screen.findByText('Appointments could not be loaded')).toBeInTheDocument();
    await flaky.user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText(/^\d+ appointments?$/)).toBeInTheDocument();
    expect(screen.queryByText('Appointments could not be loaded')).not.toBeInTheDocument();
  });
});

describe('Activity', () => {
  it('explains the empty log, then lists events newest first with their kind and time', async () => {
    const { user } = open({ name: 'Activity' });
    expect(screen.getByText('Nothing yet')).toBeInTheDocument();

    await user.click(within(sidebar()).getByRole('button', { name: 'Switch to care recipient view' }));
    await user.click(within(sidebar()).getByRole('button', { name: /^Medicines/ }));
    await user.click(screen.getByRole('checkbox', { name: /Amlodipine/ })); // was taken: unmarks
    await user.click(within(sidebar()).getByRole('button', { name: /^My Day/ }));
    await user.click(screen.getByRole('button', { name: /Blood pressure check/ }));
    await user.click(within(sidebar()).getByRole('button', { name: 'Switch to caregiver view' }));
    await user.click(within(sidebar()).getByRole('button', { name: /^Activity/ }));

    expect(screen.getByRole('status')).toHaveTextContent('2 events this session');
    const rows = within(screen.getByRole('list', { name: 'Activity, newest first' })).getAllByRole('listitem');
    expect(rows[0]).toHaveTextContent('Finished: Blood pressure check');
    expect(rows[0]).toHaveTextContent('Task finished');
    expect(rows[1]).toHaveTextContent('Unmarked Amlodipine');
    expect(rows[1]).toHaveTextContent('Medicine unmarked');
    expect(within(rows[1]).getByText(/\d{1,2}:\d{2}\s?[AP]M/)).toHaveAttribute('datetime');
  });

  it('counts a single event in the singular', async () => {
    const { user } = open({ name: 'Activity' });
    await user.click(within(sidebar()).getByRole('button', { name: 'Switch to care recipient view' }));
    await user.click(within(sidebar()).getByRole('button', { name: /^Medicines/ }));
    await user.click(screen.getByRole('checkbox', { name: /Atorvastatin/ }));
    await user.click(within(sidebar()).getByRole('button', { name: 'Switch to caregiver view' }));
    await user.click(within(sidebar()).getByRole('button', { name: /^Activity/ }));
    expect(screen.getByRole('status')).toHaveTextContent('1 event this session');
    expect(screen.getByText('Took Atorvastatin')).toBeInTheDocument();
  });
});

describe('Care notes', () => {
  it('shows the notes so far, newest first, with priority and author', () => {
    open({ name: 'Notes' });
    const notes = screen.getAllByRole('article');
    expect(notes[0]).toHaveAccessibleName('Note note from Joyce Adeyemi');
    expect(notes[0]).toHaveTextContent('Today');
    expect(notes[1]).toHaveAccessibleName('Routine note from Maria Thompson');
    expect(notes[1]).toHaveTextContent('Yesterday');
  });

  it('refuses an empty note, then saves an urgent one at the top and resets the form', async () => {
    const { user } = open({ name: 'Notes' });
    const form = screen.getByRole('region', { name: 'Add a note' });
    await user.click(within(form).getByRole('button', { name: 'Save note' }));
    expect(within(form).getByRole('alert')).toHaveTextContent('Write the note before saving it.');
    const text = within(form).getByRole('textbox', { name: 'Note' });
    expect(text).toHaveFocus();
    expect(text).toHaveAttribute('aria-invalid', 'true');

    await user.type(text, 'Fell in the garden — no injury.');
    expect(within(form).queryByRole('alert')).not.toBeInTheDocument();
    await user.click(within(form).getByRole('radio', { name: 'Urgent' }));
    await user.click(within(form).getByRole('button', { name: 'Save note' }));

    const first = within(main()).getAllByRole('article')[0];
    expect(first).toHaveAccessibleName('Urgent note from Joyce Adeyemi');
    expect(first).toHaveTextContent('Fell in the garden — no injury.');
    expect(text).toHaveValue('');
    expect(within(form).getByRole('radio', { name: 'Routine' })).toBeChecked();
    expect(screen.getAllByRole('status', { hidden: true }).some((s) => s.textContent === 'Urgent note saved.')).toBe(true);
  });
});
