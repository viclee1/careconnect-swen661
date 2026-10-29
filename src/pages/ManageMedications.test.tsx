import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ManageMedications from './ManageMedications';
import { renderWithProviders } from '../test-utils/renderWithProviders';

const LIST_KEY = 'careconnect_medications_list';

function renderPage() {
  return renderWithProviders(<ManageMedications />, {
    path: '/app/manage-medicines',
    route: '/app/manage-medicines',
  });
}

const stored = () => JSON.parse(localStorage.getItem(LIST_KEY) ?? 'null');
const card = (name: string) => screen.getByRole('region', { name });

beforeEach(() => {
  localStorage.clear();
});

describe('Manage medicines', () => {
  it("lists Margaret's prescriptions with dose and 12-hour times", () => {
    renderPage();
    expect(screen.getByRole('heading', { level: 1, name: 'Manage medicines' })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual([
      'Amlodipine',
      'Lisinopril',
      'Metformin',
      'Atorvastatin',
    ]);
    expect(within(card('Amlodipine')).getByText('5 mg — 1 tablet')).toBeInTheDocument();
    expect(within(card('Amlodipine')).getByText('8:30 am')).toBeInTheDocument();
    expect(within(card('Atorvastatin')).getByText('8:00 pm')).toBeInTheDocument();
    expect(within(card('Metformin')).getByText('12:00 pm')).toBeInTheDocument();
  });

  it('refuses to save an empty form, listing every missing field and marking the time invalid', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: 'Add medicine' }));
    expect(screen.getByRole('heading', { level: 2, name: 'Add new medicine' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Add medicine' }));
    const summary = screen.getByText('Please fix the following before saving:').closest('[role="alert"]')!;
    expect(within(summary as HTMLElement).getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      'Medicine name is required.',
      'Dosage is required.',
      'At least one scheduled time is required.',
    ]);
    expect(screen.getByLabelText('Time')).toHaveAttribute('aria-invalid', 'true');
    expect(stored()).toBeNull();
  });

  it('adds a medication with two times, trimming the text, and keeps it after a remount', async () => {
    const user = userEvent.setup();
    const { unmount } = renderPage();
    await user.click(screen.getByRole('button', { name: 'Add medicine' }));

    await user.type(screen.getByRole('textbox', { name: /Medicine name/ }), '  Vitamin D  ');
    await user.type(screen.getByRole('textbox', { name: /Dose/ }), '1000 IU');
    await user.type(screen.getByLabelText('Time'), '07:15');
    await user.click(screen.getByRole('button', { name: 'Add another scheduled time' }));
    await user.type(screen.getByLabelText('Time 2'), '19:45');
    await user.type(screen.getByRole('textbox', { name: /Instructions/ }), 'With breakfast and dinner.');
    await user.click(screen.getByRole('button', { name: 'Add medicine' }));

    expect(screen.queryByRole('heading', { name: 'Add new medicine' })).not.toBeInTheDocument();
    const added = card('Vitamin D');
    expect(within(added).getByText('7:15 am')).toBeInTheDocument();
    expect(within(added).getByText('7:45 pm')).toBeInTheDocument();
    expect(within(added).getByText('With breakfast and dinner.')).toBeInTheDocument();
    expect(stored().at(-1)).toMatchObject({
      name: 'Vitamin D',
      dosage: '1000 IU',
      times: ['07:15', '19:45'],
      instructions: 'With breakfast and dinner.',
    });

    unmount();
    renderPage();
    expect(card('Vitamin D')).toBeInTheDocument();
  });

  it('removes an extra time and drops blank ones, saving only the times filled in', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: 'Add medicine' }));
    await user.type(screen.getByRole('textbox', { name: /Medicine name/ }), 'Aspirin');
    await user.type(screen.getByRole('textbox', { name: /Dose/ }), '75 mg');
    await user.click(screen.getByRole('button', { name: 'Add another scheduled time' }));
    await user.click(screen.getByRole('button', { name: 'Add another scheduled time' }));
    expect(screen.getAllByRole('button', { name: /Remove time/ })).toHaveLength(3);

    await user.click(screen.getByRole('button', { name: 'Remove time 1' }));
    await user.type(screen.getByLabelText('Time 1'), '10:00');
    await user.click(screen.getByRole('button', { name: 'Add medicine' }));

    expect(stored().at(-1)).toMatchObject({ name: 'Aspirin', times: ['10:00'] });
    expect(stored().at(-1).instructions).toBeUndefined();
  });

  it('edits a medication in place, keeping its position and its taken history', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(within(card('Lisinopril')).getByRole('button', { name: 'Edit Lisinopril' }));
    expect(screen.getByRole('heading', { level: 2, name: 'Edit medicine' })).toBeInTheDocument();
    const dose = screen.getByRole('textbox', { name: /Dose/ });
    expect(dose).toHaveValue('10 mg — 1 tablet');

    await user.clear(dose);
    await user.type(dose, '20 mg — 2 tablets');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(within(card('Lisinopril')).getByText('20 mg — 2 tablets')).toBeInTheDocument();
    const saved = stored();
    expect(saved.map((m: { name: string }) => m.name)).toEqual(['Amlodipine', 'Lisinopril', 'Metformin', 'Atorvastatin']);
    expect(saved[1].dosage).toBe('20 mg — 2 tablets');
  });

  it('cancels without saving, from either the Cancel button or the close button, and returns focus to Add', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: 'Add medicine' }));
    await user.type(screen.getByRole('textbox', { name: /Medicine name/ }), 'Never saved');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('region', { name: 'Never saved' })).not.toBeInTheDocument();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(screen.getByRole('button', { name: 'Add medicine' })).toHaveFocus();

    await user.click(screen.getByRole('button', { name: 'Add medicine' }));
    await user.click(screen.getByRole('button', { name: 'Cancel and close form' }));
    expect(screen.queryByRole('heading', { name: 'Add new medicine' })).not.toBeInTheDocument();
    expect(stored()).toBeNull();
  });

  it('deletes only after the caregiver confirms, and shows the empty state when none are left', async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      LIST_KEY,
      JSON.stringify([{ id: 'm1', name: 'Amlodipine', dosage: '5 mg', times: ['08:30'], colour: 'bg-calm-200', taken: {} }]),
    );
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Delete Amlodipine' }));
    const dialog = screen.getByRole('dialog', { name: 'Delete medicine' });
    expect(dialog).toHaveTextContent('Are you sure you want to delete Amlodipine?');
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    expect(card('Amlodipine')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Delete Amlodipine' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Yes, delete' }));
    expect(screen.getByText('No medicines added yet')).toBeInTheDocument();
    expect(stored()).toEqual([]);
  });

  it('falls back to the default list when the stored one is corrupt', () => {
    localStorage.setItem(LIST_KEY, '{not json');
    renderPage();
    expect(card('Amlodipine')).toBeInTheDocument();
  });
});
