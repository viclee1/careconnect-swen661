import { act, fireEvent, screen } from '@testing-library/react-native';

import {
  createFlakyAppointmentRepository,
  createMockAppointmentRepository,
} from '../../data/appointmentRepository';
import { createMockMedicineRepository } from '../../data/medicineRepository';
import type { CaregiverDestination } from '../../navigation/destinations';
import { renderApp, useTabletSize, type HarnessOptions } from '../../test-support/harness';

// The tablet test widens the window; put back jest.setup's 400×900 phone for
// the next test. (Not restoreAllMocks: that would remove the phone pin too.)
afterEach(() => useTabletSize(400, 900));

async function press(element: Parameters<typeof fireEvent.press>[0]) {
  await act(async () => {
    await fireEvent.press(element);
  });
}

/** The app as a caregiver sees it, on one of their tabs. */
function openAsCaregiver(tab: CaregiverDestination = 'Dashboard', options: HarnessOptions = {}) {
  return renderApp({
    role: 'caregiver',
    initialRouteName: 'CaregiverTabs',
    initialCaregiverTabName: tab,
    ...options,
  });
}

async function switchView() {
  await press(screen.getByLabelText('Settings'));
  await press(await screen.findByText(/^Switch to (caregiver|care recipient) view$/));
}

describe('Signing in leads to choosing a role', () => {
  it('a caregiver lands on the Dashboard, and Back does not return to sign-in', async () => {
    await renderApp({ initialRouteName: 'SignIn' });
    await press(screen.getByText('Sign in'));
    expect(await screen.findByText('Who is using CareConnect right now?')).toBeTruthy();

    await press(screen.getByLabelText(/^I am a caregiver/));
    expect(await screen.findByText("How Margaret's day is going")).toBeTruthy();
    expect(screen.getByTestId('tab-Dashboard')).toBeTruthy();
    expect(screen.queryByTestId('tab-MyDay')).toBeNull();
  });

  it('the care recipient lands on Home after signing up', async () => {
    await renderApp({ initialRouteName: 'SignUp' });
    await press(screen.getByLabelText('Create account'));
    await press(await screen.findByLabelText(/^I am the care recipient/));
    expect(await screen.findByTestId('tab-MyDay')).toBeTruthy();
    expect(screen.queryByTestId('tab-Dashboard')).toBeNull();
  });
});

describe('Caregiver tabs and switching views', () => {
  it("shows the caregiver's five tabs and marks the current one", async () => {
    await openAsCaregiver();
    for (const id of ['Dashboard', 'ManageMedicines', 'ManageAppointments', 'Activity', 'Notes']) {
      expect(screen.getByTestId(`tab-${id}`)).toBeTruthy();
    }
    expect(screen.getByLabelText('Dashboard, current screen')).toBeTruthy();
    await press(screen.getByTestId('tab-Notes'));
    expect(await screen.findByLabelText('Notes, current screen')).toBeTruthy();
  });

  it('switches to the care recipient view and back from Settings', async () => {
    await openAsCaregiver();
    await press(screen.getByLabelText('Settings'));
    expect(await screen.findByText('Margaret Whitfield · Caregiver view')).toBeTruthy();
    await press(screen.getByText('Switch to care recipient view'));
    expect(await screen.findByTestId('tab-MyDay')).toBeTruthy();

    await switchView();
    expect(await screen.findByTestId('tab-Dashboard')).toBeTruthy();
  });

  it('puts Settings in the tablet sidebar alongside the caregiver tabs', async () => {
    useTabletSize();
    await openAsCaregiver();
    expect(screen.getByTestId('tab-Settings')).toBeTruthy();
    expect(screen.getByLabelText('Go to Appointments')).toBeTruthy();
  });
});

describe('Dashboard', () => {
  it('sums up the day and loads the next appointment', async () => {
    await openAsCaregiver();
    expect(screen.getByLabelText('Medicines: 1 of 3 taken today')).toBeTruthy();
    expect(screen.getByLabelText(/^My Day: \d+ of \d+ tasks done$/)).toBeTruthy();
    expect(screen.getByLabelText('Check-in: Not checked in yet')).toBeTruthy();
    expect(await screen.findByLabelText(/^Next appointment: Dr\. .+ at .+/)).toBeTruthy();
    expect(screen.getByText(/Nothing yet today/)).toBeTruthy();
  });

  it("shows what the care recipient just did, newest first", async () => {
    await openAsCaregiver();
    await switchView();
    await press(await screen.findByTestId('tab-Medicines'));
    await press(screen.getByTestId('medicine-med2'));
    await press(screen.getByTestId('tab-MyDay'));
    await press(await screen.findByLabelText(/Morning check-in/));

    await switchView();
    expect(await screen.findByLabelText('Check-in: Checked in today')).toBeTruthy();
    expect(screen.getByLabelText('Medicines: 2 of 3 taken today')).toBeTruthy();
    const rows = screen.getAllByLabelText(/, \d{1,2}:\d{2}\s?[AP]M$/);
    expect(rows[0].props.accessibilityLabel).toMatch(/^Checked in for the day/);
    expect(rows[1].props.accessibilityLabel).toMatch(/^Took Metformin/);
  });

  it('opens Manage medicines, Manage appointments and Activity from its buttons', async () => {
    await openAsCaregiver();
    await press(screen.getByText('Manage medicines'));
    expect(await screen.findByLabelText('Medicines, current screen')).toBeTruthy();
    await press(screen.getByTestId('tab-Dashboard'));
    await press(await screen.findByText('Manage appointments'));
    expect(await screen.findByLabelText('Appointments, current screen')).toBeTruthy();
    await press(screen.getByTestId('tab-Dashboard'));
    await press(await screen.findByText('View all activity'));
    expect(await screen.findByLabelText('Activity, current screen')).toBeTruthy();
  });

  it('says when no appointment is booked', async () => {
    await openAsCaregiver('Dashboard', { appointmentRepository: createMockAppointmentRepository([]) });
    expect(await screen.findByLabelText('Next appointment: None booked')).toBeTruthy();
  });
});

describe('Manage medicines', () => {
  it('refuses an empty medicine, naming each field', async () => {
    await openAsCaregiver('ManageMedicines');
    await press(screen.getByText('Add medicine'));
    await press(screen.getByText('Add medicine'));
    expect(screen.getByText('3 things need fixing')).toBeTruthy();
    expect(screen.getByText('Medicine name is required.')).toBeTruthy();
    expect(screen.getByText('Dose is required.')).toBeTruthy();
    expect(screen.getByText('Time to take it is required.')).toBeTruthy();

    await fireEvent.changeText(screen.getByTestId('field-name'), 'Aspirin');
    expect(screen.queryByText('Medicine name is required.')).toBeNull();
    expect(screen.getByText('2 things need fixing')).toBeTruthy();
  });

  it("adds a medicine that then appears, not taken, on the care recipient's Medicines screen", async () => {
    await openAsCaregiver('ManageMedicines');
    await press(screen.getByText('Add medicine'));
    await fireEvent.changeText(screen.getByTestId('field-name'), '  Vitamin D ');
    await fireEvent.changeText(screen.getByTestId('field-dosage'), '1000 IU');
    await fireEvent.changeText(screen.getByTestId('field-time'), '9:00 am');
    await press(screen.getByText('Add medicine'));

    expect(screen.getByText('Added Vitamin D.')).toBeTruthy();
    expect(screen.getByLabelText('Vitamin D, 1000 IU, 9:00 am')).toBeTruthy();
    expect(screen.getByText('4 medicines')).toBeTruthy();
    await press(screen.getByLabelText('OK, dismiss'));
    expect(screen.queryByText('Added Vitamin D.')).toBeNull();

    await switchView();
    await press(await screen.findByTestId('tab-Medicines'));
    expect(screen.getByLabelText('Vitamin D, 1000 IU, 9:00 am. Not taken')).toBeTruthy();
    expect(screen.getByText('1 of 4 taken')).toBeTruthy();
  });

  it('edits a medicine, and cancelling changes nothing', async () => {
    await openAsCaregiver('ManageMedicines');
    await press(screen.getByLabelText('Edit Metformin'));
    expect(screen.getByText('Edit Metformin')).toBeTruthy();
    expect(screen.getByTestId('field-dosage').props.value).toBe('500 mg — 1 tablet with lunch');
    await fireEvent.changeText(screen.getByTestId('field-dosage'), '850 mg');
    await press(screen.getByText('Save changes'));
    expect(screen.getByText('Saved Metformin.')).toBeTruthy();
    expect(screen.getByLabelText('Metformin, 850 mg, 12:30 pm')).toBeTruthy();

    await press(screen.getByText('Add medicine'));
    await fireEvent.changeText(screen.getByTestId('field-name'), 'Never saved');
    await press(screen.getByText('Cancel'));
    expect(screen.getByText('3 medicines')).toBeTruthy();
  });

  it('asks before deleting, and empties to a message', async () => {
    await openAsCaregiver('ManageMedicines', {
      medicineRepository: createMockMedicineRepository([
        { id: 'm1', name: 'Amlodipine', dosage: '5 mg', time: '8:30 am', taken: false },
      ]),
    });
    expect(screen.getByText('1 medicine')).toBeTruthy();
    await press(screen.getByLabelText('Delete Amlodipine'));
    expect(screen.getByText('Delete Amlodipine?')).toBeTruthy();
    await press(screen.getByText('Cancel'));
    expect(screen.queryByText('Delete Amlodipine?')).toBeNull();

    await press(screen.getByLabelText('Delete Amlodipine'));
    await press(screen.getByLabelText('Yes, delete Amlodipine'));
    expect(screen.getByText('No medicines yet')).toBeTruthy();
    expect(screen.getByText('Deleted Amlodipine.')).toBeTruthy();
  });
});

describe('Manage appointments', () => {
  it('adds an appointment the care recipient then sees', async () => {
    await openAsCaregiver('ManageAppointments');
    expect(await screen.findByText(/^\d+ appointments?$/)).toBeTruthy();

    await press(screen.getByText('Add appointment'));
    await press(screen.getByText('Add appointment'));
    expect(screen.getByText('5 things need fixing')).toBeTruthy();

    await fireEvent.changeText(screen.getByTestId('field-doctor'), 'Dr. Okafor');
    await fireEvent.changeText(screen.getByTestId('field-specialty'), 'Eye test');
    await fireEvent.changeText(screen.getByTestId('field-date'), 'Dec 1, 2026');
    await fireEvent.changeText(screen.getByTestId('field-time'), '9:15 am');
    await fireEvent.changeText(screen.getByTestId('field-location'), 'Vision Centre');
    await press(screen.getByText('Add appointment'));

    expect(await screen.findByText('Added the appointment with Dr. Okafor.')).toBeTruthy();
    expect(
      screen.getByLabelText('Dr. Okafor — Eye test, Dec 1, 2026 at 9:15 am, Vision Centre'),
    ).toBeTruthy();

    await switchView();
    await press(await screen.findByTestId('tab-Appointments'));
    expect(await screen.findByLabelText(/Appointment with Dr\. Okafor/)).toBeTruthy();
  });

  it('edits, then deletes after confirming', async () => {
    await openAsCaregiver('ManageAppointments');
    const edit = (await screen.findAllByLabelText(/^Edit /))[0];
    const title = String(edit.props.accessibilityLabel).replace(/^Edit /, '');
    await press(edit);
    await fireEvent.changeText(screen.getByTestId('field-location'), 'Westfield Hospital');
    await press(screen.getByText('Save changes'));
    expect(await screen.findByLabelText(new RegExp(`Westfield Hospital$`))).toBeTruthy();

    await press(screen.getByLabelText(`Delete ${title}`));
    await press(screen.getByLabelText(`Yes, delete ${title}`));
    expect(await screen.findByText(/^Deleted the appointment with /)).toBeTruthy();
    expect(screen.queryByLabelText(`Delete ${title}`)).toBeNull();
  });

  it('says when there are none', async () => {
    await openAsCaregiver('ManageAppointments', {
      appointmentRepository: createMockAppointmentRepository([]),
    });
    expect(await screen.findByText('No appointments booked')).toBeTruthy();
  });

  it('shows a failed load as an error, not an empty list, and recovers', async () => {
    await openAsCaregiver('ManageAppointments', {
      appointmentRepository: createFlakyAppointmentRepository(1),
    });
    expect(await screen.findByText('Appointments could not be loaded')).toBeTruthy();
    expect(screen.queryByText('No appointments booked')).toBeNull();
    await press(screen.getByText('Try again'));
    expect(await screen.findByText(/^\d+ appointments?$/)).toBeTruthy();
    expect(screen.queryByText('Appointments could not be loaded')).toBeNull();
  });
});

describe('Activity', () => {
  it('explains the empty log, then lists events newest first with their kind', async () => {
    await openAsCaregiver('Activity');
    expect(screen.getByText('Nothing yet')).toBeTruthy();

    await switchView();
    await press(await screen.findByTestId('tab-Medicines'));
    await press(screen.getByTestId('medicine-med1')); // was taken: unmarks
    await switchView();
    await press(await screen.findByTestId('tab-Activity'));

    expect(screen.getByText('1 event this session')).toBeTruthy();
    expect(screen.getByLabelText(/^Unmarked Amlodipine\. Medicine unmarked, /)).toBeTruthy();
  });
});

describe('Care notes', () => {
  it('shows the notes so far, newest first, with priority and author', async () => {
    await openAsCaregiver('Notes');
    const notes = screen.getAllByLabelText(/ note from /);
    expect(notes[0].props.accessibilityLabel).toMatch(/^Note note from Joyce Adeyemi, Today/);
    expect(notes[1].props.accessibilityLabel).toMatch(/^Routine note from Maria Thompson, Yesterday/);
  });

  it('refuses an empty note, then saves an urgent one at the top and resets the form', async () => {
    await openAsCaregiver('Notes');
    await press(screen.getByText('Save note'));
    expect(screen.getByText('Write the note before saving it.')).toBeTruthy();

    await fireEvent.changeText(screen.getByTestId('note-text'), 'Fell in the garden — no injury.');
    expect(screen.queryByText('Write the note before saving it.')).toBeNull();
    const urgent = screen.getByRole('radio', { name: 'Urgent' });
    await press(urgent);
    expect(screen.getByRole('radio', { name: 'Urgent' }).props.accessibilityState.checked).toBe(true);
    await press(screen.getByText('Save note'));

    expect(screen.getByText('Urgent note saved.')).toBeTruthy();
    expect(screen.getAllByLabelText(/ note from /)[0].props.accessibilityLabel).toMatch(
      /^Urgent note from Joyce Adeyemi, Today, .+\. Fell in the garden — no injury\.$/,
    );
    expect(screen.getByTestId('note-text').props.value).toBe('');
    expect(screen.getByRole('radio', { name: 'Routine' }).props.accessibilityState.checked).toBe(true);
  });
});
