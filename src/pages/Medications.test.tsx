import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Medications from './Medications';
import { MEDS_TAKEN_DATE_KEY, MEDS_TAKEN_KEY } from '../context/MedicinesContext';
import { appendActivityEvent } from '../data/caregiverStore';
import { renderWithProviders } from '../test-utils/renderWithProviders';
import { addDays, localISODate } from '../utils/dates';

jest.mock('../data/caregiverStore');

function renderPage() {
  return renderWithProviders(<Medications />, { path: '/app/medications', route: '/app/medications' });
}

const stored = () => JSON.parse(localStorage.getItem(MEDS_TAKEN_KEY) ?? 'null');

beforeEach(() => {
  localStorage.clear();
  jest.mocked(appendActivityEvent).mockClear();
});

describe('Medicines page', () => {
  it('shows today’s progress as a sentence and a native progress bar', () => {
    renderPage();
    expect(screen.getByRole('heading', { level: 1, name: 'Medicines' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('2 of 4 taken. 2 medicines still to take today.');
    const bar = screen.getByRole('progressbar', { name: 'Taken today' });
    expect(bar).toHaveAttribute('value', '2');
    expect(bar).toHaveAttribute('max', '4');
  });

  it('lists each medicine as a checkbox in a named group', () => {
    renderPage();
    const group = screen.getByRole('group', { name: 'Mark each medicine as taken' });
    expect(group.tagName).toBe('FIELDSET');
    expect(screen.getAllByRole('checkbox')).toHaveLength(4);
    expect(screen.getByRole('checkbox', { name: 'Amlodipine 5 mg — 1 tablet' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Atorvastatin 20 mg — 1 tablet' })).not.toBeChecked();
  });

  it('describes each checkbox with when to take it, in words', () => {
    renderPage();
    expect(screen.getByRole('checkbox', { name: /atorvastatin/i })).toHaveAccessibleDescription(
      'Take at 8:00 pm. Take in the evening.',
    );
  });

  it('ticks a medicine, announces the new count, saves it and logs it for the caregiver', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('checkbox', { name: /atorvastatin/i }));

    expect(screen.getByRole('checkbox', { name: /atorvastatin/i })).toBeChecked();
    expect(screen.getByRole('status')).toHaveTextContent('3 of 4 taken. 1 medicine still to take today.');
    expect(stored()).toEqual({ m2: true });
    expect(localStorage.getItem(MEDS_TAKEN_DATE_KEY)).toBe(localISODate());
    expect(appendActivityEvent).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'med_taken', label: 'Marked Atorvastatin as taken' }),
    );
  });

  it('un-ticks with Space and logs that too', async () => {
    const user = userEvent.setup();
    renderPage();
    screen.getByRole('checkbox', { name: /amlodipine/i }).focus();
    await user.keyboard(' ');

    expect(screen.getByRole('checkbox', { name: /amlodipine/i })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: /amlodipine/i })).toHaveFocus();
    expect(appendActivityEvent).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'med_skipped', label: 'Unmarked Amlodipine (not taken)' }),
    );
  });

  it('moves between medicines with Tab', async () => {
    const user = userEvent.setup();
    renderPage();
    screen.getByRole('checkbox', { name: /amlodipine/i }).focus();
    await user.tab();
    expect(screen.getByRole('checkbox', { name: /atorvastatin/i })).toHaveFocus();
  });

  it('ticks a medicine when its name is clicked, not only the box', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByText('Vitamin D3'));
    expect(screen.getByRole('checkbox', { name: /vitamin d3/i })).toBeChecked();
  });

  it('congratulates when everything is taken', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('checkbox', { name: /atorvastatin/i }));
    await user.click(screen.getByRole('checkbox', { name: /vitamin d3/i }));
    expect(screen.getByRole('status')).toHaveTextContent('All 4 medicines taken today. Well done!');
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '4');
  });

  it('keeps today’s ticks after a reload', () => {
    localStorage.setItem(MEDS_TAKEN_DATE_KEY, localISODate());
    localStorage.setItem(MEDS_TAKEN_KEY, JSON.stringify({ m2: true, m1: false }));
    renderPage();
    expect(screen.getByRole('checkbox', { name: /atorvastatin/i })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /amlodipine/i })).not.toBeChecked();
  });

  it('starts fresh when the saved ticks are from yesterday', () => {
    localStorage.setItem(MEDS_TAKEN_DATE_KEY, addDays(-1));
    localStorage.setItem(MEDS_TAKEN_KEY, JSON.stringify({ m2: true }));
    renderPage();
    expect(screen.getByRole('checkbox', { name: /atorvastatin/i })).not.toBeChecked();
  });

  it('survives corrupt saved data', () => {
    localStorage.setItem(MEDS_TAKEN_DATE_KEY, localISODate());
    localStorage.setItem(MEDS_TAKEN_KEY, '{not json');
    renderPage();
    expect(screen.getByRole('status')).toHaveTextContent('2 of 4 taken');
  });

  it('explains an empty list', () => {
    localStorage.setItem('careconnect_medications_list', '[]');
    renderPage();
    expect(screen.getByRole('heading', { level: 2, name: 'No medicines today' })).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
});
