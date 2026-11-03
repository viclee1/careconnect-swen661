import { fireEvent, screen, within } from '@testing-library/react';

import { MEDS_TAKEN_DATE_KEY, MEDS_TAKEN_KEY } from '../context/MedicinesContext';
import { MY_DAY_DONE_KEY } from '../hooks/useMyDay';
import { renderWithProviders } from '../test-utils/renderWithProviders';
import { localISODate } from '../utils/dates';
import Home from './Home';
import Schedule from './Schedule';

const today = localISODate();

function row(name: RegExp) {
  return within(screen.getByRole('main')).getByRole('button', { name });
}

function renderMyDay() {
  return renderWithProviders(
    <main>
      <Schedule />
    </main>,
    { path: '/app/my-day' },
  );
}

beforeEach(() => localStorage.clear());

describe('My Day', () => {
  it('shows the medicines, today’s visits and the routines, with Amlodipine already taken', () => {
    renderMyDay();
    expect(screen.getByText('1 of 9 done')).toBeInTheDocument();
    expect(row(/^Take Amlodipine/)).toHaveAttribute('aria-pressed', 'true');
    expect(row(/^Take Metformin/)).toHaveAttribute('aria-pressed', 'false');
    expect(row(/^Blood pressure check — Dr\. Sharma/)).toBeInTheDocument();
    // Tomorrow's blood test is not today, whatever its My Day choice.
    expect(screen.queryByRole('button', { name: /^Blood test/ })).not.toBeInTheDocument();
  });

  it('ticking a medicine here ticks it on Medicines and for the caregiver', () => {
    renderMyDay();
    fireEvent.click(row(/^Take Metformin/));
    expect(row(/^Take Metformin/)).toHaveAttribute('aria-pressed', 'true');
    expect(JSON.parse(localStorage.getItem(MEDS_TAKEN_KEY) ?? '{}')).toEqual({ m3: true });
    expect(screen.getByText('2 of 9 done')).toBeInTheDocument();
  });

  it('shows a medicine ticked on the Medicines screen', () => {
    localStorage.setItem(MEDS_TAKEN_KEY, JSON.stringify({ m4: true, m1: false }));
    localStorage.setItem(MEDS_TAKEN_DATE_KEY, today);
    renderMyDay();
    expect(row(/^Take Atorvastatin/)).toHaveAttribute('aria-pressed', 'true');
    expect(row(/^Take Amlodipine/)).toHaveAttribute('aria-pressed', 'false');
  });

  it('keeps visit and routine ticks for the day, and starts fresh the next day', () => {
    const { unmount } = renderMyDay();
    fireEvent.click(row(/^Morning check-in/));
    fireEvent.click(row(/^Blood pressure check/));
    expect(JSON.parse(localStorage.getItem(MY_DAY_DONE_KEY) ?? '{}')).toEqual({
      date: today,
      done: { checkin: true, 'appt:a1': true },
    });
    unmount();

    renderMyDay();
    expect(row(/^Morning check-in/)).toHaveAttribute('aria-pressed', 'true');
    expect(row(/^Blood pressure check/)).toHaveAttribute('aria-pressed', 'true');
  });

  it('drops yesterday’s routine ticks', () => {
    localStorage.setItem(MY_DAY_DONE_KEY, JSON.stringify({ date: '2000-01-01', done: { checkin: true } }));
    renderMyDay();
    expect(row(/^Morning check-in/)).toHaveAttribute('aria-pressed', 'false');
  });
});

describe('Home', () => {
  it('counts the same list as My Day', () => {
    localStorage.setItem(MEDS_TAKEN_KEY, JSON.stringify({ m3: true }));
    localStorage.setItem(MEDS_TAKEN_DATE_KEY, today);
    renderWithProviders(<Home view="patient" />, { path: '/app' });
    expect(screen.getByText('2 of 9 things done today')).toBeInTheDocument();
  });
});
