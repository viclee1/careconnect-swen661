import { screen, within } from '@testing-library/react';

import { createMockContactRepository } from '../../data/contactRepository';
import { createMockMedicineRepository } from '../../data/medicineRepository';
import { createMockMessageRepository } from '../../data/messageRepository';
import { mockMedicines } from '../../data/mockMedicines';
import { createInMemorySettingsRepository } from '../../data/settingsRepository';
import { renderApp, tabbableElements } from '../../test-support/harness';

const repositories = (medicines = createMockMedicineRepository()) => ({
  contacts: createMockContactRepository(),
  messages: createMockMessageRepository(),
  settings: createInMemorySettingsRepository(),
  medicines,
});

async function openMedicines(medicines = createMockMedicineRepository()) {
  const rendered = renderApp({
    repositories: repositories(medicines),
    initialRoute: { name: 'Medicines' },
  });
  await screen.findByRole('heading', { level: 1, name: 'Medicines' });
  return rendered;
}

const box = (name: string) => screen.getByRole('checkbox', { name: new RegExp(`^${name}`) });

describe('MedicinesPage', () => {
  it("lists today's medicines as checkboxes named by medicine, dose and time", async () => {
    await openMedicines();

    expect(screen.getAllByRole('checkbox')).toHaveLength(mockMedicines.length);
    expect(box('Amlodipine')).toHaveAccessibleName('Amlodipine 5 mg — 1 tablet with food · 8:30 am');
    expect(box('Amlodipine')).toBeChecked();
    expect(box('Metformin')).not.toBeChecked();
  });

  it('states how many are taken as words, in a status region', async () => {
    await openMedicines();

    const status = screen.getByText('1 of 3 taken');
    expect(status).toHaveAttribute('role', 'status');
  });

  it('shows taken-ness as a word as well as a tick, never colour alone', async () => {
    await openMedicines();

    expect(within(screen.getByTestId('medicine-med1')).getByText('Taken')).toBeInTheDocument();
    expect(within(screen.getByTestId('medicine-med2')).getByText('Not taken')).toBeInTheDocument();
  });

  it('marks a medicine taken when its row is clicked, and updates the count', async () => {
    const { user } = await openMedicines();

    // Clicking the name, not the box — the whole row is the target.
    await user.click(screen.getByText('Metformin'));

    expect(box('Metformin')).toBeChecked();
    expect(screen.getByText('2 of 3 taken')).toBeInTheDocument();
    expect(within(screen.getByTestId('medicine-med2')).getByText('Taken')).toBeInTheDocument();
  });

  it('un-marks a medicine ticked by mistake', async () => {
    const { user } = await openMedicines();

    await user.click(box('Amlodipine'));

    expect(box('Amlodipine')).not.toBeChecked();
    expect(screen.getByText('0 of 3 taken')).toBeInTheDocument();
  });

  it('works from the keyboard alone: Tab to a medicine, Space to tick it', async () => {
    const { user } = await openMedicines();

    // Every medicine is a Tab stop, in the order it is listed, and nothing
    // else on the page gets in the way.
    expect(tabbableElements(screen.getByRole('main'))).toEqual(screen.getAllByRole('checkbox'));

    box('Amlodipine').focus();
    await user.tab();
    expect(box('Metformin')).toHaveFocus();

    await user.keyboard(' ');
    expect(box('Metformin')).toBeChecked();

    await user.tab();
    expect(box('Atorvastatin')).toHaveFocus();
  });

  it('celebrates in a banner, not a toast, once everything is taken', async () => {
    const { user } = await openMedicines();
    expect(screen.queryByText('All done for today')).not.toBeInTheDocument();

    await user.click(box('Metformin'));
    await user.click(box('Atorvastatin'));

    const heading = screen.getByRole('heading', { name: 'All done for today' });
    expect(heading.closest('.banner')).toHaveAttribute('role', 'status');
    expect(screen.getByText('3 of 3 taken')).toBeInTheDocument();
  });

  it('remembers what was ticked when the user leaves the page and comes back', async () => {
    const { user } = await openMedicines();

    await user.click(box('Metformin'));
    await user.keyboard('{Control>}6{/Control}');
    await screen.findByRole('heading', { level: 1, name: 'Contacts' });
    await user.keyboard('{Control>}4{/Control}');
    await screen.findByRole('heading', { level: 1, name: 'Medicines' });

    expect(box('Metformin')).toBeChecked();
    expect(screen.getByText('2 of 3 taken')).toBeInTheDocument();
  });

  it('groups the boxes under a legend a screen reader announces on entry', async () => {
    await openMedicines();

    expect(screen.getByRole('group', { name: 'Mark each medicine as taken' })).toBeInTheDocument();
  });

  it('says so when there is nothing to take today', async () => {
    await openMedicines(createMockMedicineRepository([]));

    expect(screen.getByRole('heading', { name: 'No medicines today' })).toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.queryByText(/of 0 taken/)).not.toBeInTheDocument();
  });
});
