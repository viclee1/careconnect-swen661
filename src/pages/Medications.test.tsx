import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Medications from './Medications';
import { MEDS_TAKEN_DATE_KEY, MEDS_TAKEN_KEY } from '../context/MedicinesContext';
import { SETTINGS_KEY } from '../context/SettingsContext';
import { appendActivityEvent } from '../data/caregiverStore';
import { renderWithProviders } from '../test-utils/renderWithProviders';
import { addDays, localISODate } from '../utils/dates';

jest.mock('../data/caregiverStore');

function renderPage() {
  return renderWithProviders(<Medications />, { path: '/app/medicines', route: '/app/medicines' });
}

const stored = () => JSON.parse(localStorage.getItem(MEDS_TAKEN_KEY) ?? 'null');
const status = () => screen.getByRole('status');
const detail = () => screen.getByRole('region', { name: /amlodipine|lisinopril|metformin|atorvastatin/i });

beforeEach(() => {
  localStorage.clear();
  jest.mocked(appendActivityEvent).mockClear();
});

describe('Medicines page', () => {
  it('shows how many are still to take beside the title, and announces the full sentence', () => {
    renderPage();
    expect(screen.getByRole('heading', { level: 1, name: 'Medicines' })).toBeInTheDocument();
    expect(status()).toHaveTextContent('3 still to take today');
    expect(status()).toHaveTextContent('1 of 4 taken. 3 medicines still to take today.');
  });

  it('lists the four medicines, each with a “taken” checkbox', () => {
    renderPage();
    expect(screen.getAllByRole('checkbox')).toHaveLength(4);
    expect(screen.getByRole('checkbox', { name: 'Amlodipine taken' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Lisinopril taken' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Metformin taken' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Atorvastatin taken' })).not.toBeChecked();
  });

  it('shows the first medicine in detail: when, status and how to take it', () => {
    renderPage();
    const panel = detail();
    expect(within(panel).getByRole('heading', { level: 2, name: 'Amlodipine' })).toBeInTheDocument();
    expect(panel).toHaveTextContent('When8:30 am');
    expect(panel).toHaveTextContent('StatusTaken ✓');
    expect(panel).toHaveTextContent('Take with food.');
    expect(panel).toHaveTextContent('Helps lower your blood pressure.');
    expect(screen.getByRole('button', { name: /^Amlodipine/ })).toHaveAttribute('aria-current', 'true');
  });

  it('choosing a medicine in the list shows it in the detail panel', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: /^Metformin/ }));
    expect(screen.getByRole('button', { name: /^Metformin/ })).toHaveAttribute('aria-current', 'true');
    expect(within(detail()).getByRole('heading', { level: 2, name: 'Metformin' })).toBeInTheDocument();
    expect(detail()).toHaveTextContent('Take with lunch.');
  });

  it('names each row in words: dose, time and whether it is taken', () => {
    renderPage();
    expect(screen.getByRole('button', { name: /^Atorvastatin/ })).toHaveAccessibleName(
      /^Atorvastatin ?, 20 mg — 1 tablet, at 8:00 pm, not taken yet$/,
    );
  });

  it('ticks a medicine, announces the new count, saves it and logs it for the caregiver', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('checkbox', { name: 'Atorvastatin taken' }));

    expect(screen.getByRole('checkbox', { name: 'Atorvastatin taken' })).toBeChecked();
    expect(status()).toHaveTextContent('2 of 4 taken. 2 medicines still to take today.');
    expect(stored()).toEqual({ m4: true });
    expect(localStorage.getItem(MEDS_TAKEN_DATE_KEY)).toBe(localISODate());
    expect(appendActivityEvent).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'med_taken', label: 'Marked Atorvastatin as taken' }),
    );
  });

  it('marks the medicine shown from the detail panel’s big button, and undoes it', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: /^Lisinopril/ }));
    await user.click(screen.getByRole('button', { name: 'Mark Lisinopril as taken' }));
    expect(screen.getByRole('checkbox', { name: 'Lisinopril taken' })).toBeChecked();
    expect(detail()).toHaveTextContent('StatusTaken ✓');

    await user.click(screen.getByRole('button', { name: 'Taken — tap to undo' }));
    expect(screen.getByRole('checkbox', { name: 'Lisinopril taken' })).not.toBeChecked();
  });

  it('un-ticks with Space and logs that too', async () => {
    const user = userEvent.setup();
    renderPage();
    screen.getByRole('checkbox', { name: 'Amlodipine taken' }).focus();
    await user.keyboard(' ');

    expect(screen.getByRole('checkbox', { name: 'Amlodipine taken' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Amlodipine taken' })).toHaveFocus();
    expect(appendActivityEvent).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'med_skipped', label: 'Unmarked Amlodipine (not taken)' }),
    );
  });

  it('moves down the list with Tab: each row, then its tick', async () => {
    const user = userEvent.setup();
    renderPage();
    screen.getByRole('checkbox', { name: 'Amlodipine taken' }).focus();
    await user.tab();
    expect(screen.getByRole('button', { name: /^Lisinopril/ })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('checkbox', { name: 'Lisinopril taken' })).toHaveFocus();
  });

  it('congratulates when everything is taken', async () => {
    const user = userEvent.setup();
    renderPage();
    for (const name of ['Lisinopril', 'Metformin', 'Atorvastatin']) {
      await user.click(screen.getByRole('checkbox', { name: `${name} taken` }));
    }
    expect(status()).toHaveTextContent('All taken today');
    expect(status()).toHaveTextContent('All 4 medicines taken today. Well done!');
  });

  it('writes out the next reminder as a caption, and hides it when captions are off', () => {
    const { unmount } = renderPage();
    expect(screen.getByText(/^Reminder: /)).toBeInTheDocument();
    unmount();

    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ captionsEnabled: false }));
    renderPage();
    expect(screen.queryByText(/^Reminder: /)).not.toBeInTheDocument();
  });

  it('keeps today’s ticks after a reload', () => {
    localStorage.setItem(MEDS_TAKEN_DATE_KEY, localISODate());
    localStorage.setItem(MEDS_TAKEN_KEY, JSON.stringify({ m4: true, m1: false }));
    renderPage();
    expect(screen.getByRole('checkbox', { name: 'Atorvastatin taken' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Amlodipine taken' })).not.toBeChecked();
  });

  it('starts fresh when the saved ticks are from yesterday', () => {
    localStorage.setItem(MEDS_TAKEN_DATE_KEY, addDays(-1));
    localStorage.setItem(MEDS_TAKEN_KEY, JSON.stringify({ m4: true }));
    renderPage();
    expect(screen.getByRole('checkbox', { name: 'Atorvastatin taken' })).not.toBeChecked();
  });

  it('survives corrupt saved data', () => {
    localStorage.setItem(MEDS_TAKEN_DATE_KEY, localISODate());
    localStorage.setItem(MEDS_TAKEN_KEY, '{not json');
    renderPage();
    expect(status()).toHaveTextContent('1 of 4 taken');
  });

  it('explains an empty list', () => {
    localStorage.setItem('careconnect_medications_list', '[]');
    renderPage();
    expect(screen.getByRole('heading', { level: 2, name: 'No medicines today' })).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
