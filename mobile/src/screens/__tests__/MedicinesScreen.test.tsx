import { act, fireEvent, screen } from '@testing-library/react-native';

import { renderApp } from '../../test-support/harness';

describe('MedicinesScreen', () => {
  it('shows the heading and today\'s medicines', async () => {
    await renderApp({ initialTabName: 'Medicines' });

    // Twice: the header and the bottom navigation label.
    expect(await screen.findAllByText('Medicines')).toHaveLength(2);
    expect(screen.getByText("Today's medication tracker")).toBeTruthy();
    expect(screen.getByText('Amlodipine')).toBeTruthy();
    expect(screen.getByText('Metformin')).toBeTruthy();
    expect(screen.getByText('Atorvastatin')).toBeTruthy();
  });

  it('starts with the seeded taken count', async () => {
    await renderApp({ initialTabName: 'Medicines' });
    expect(await screen.findByText('1 of 3 taken')).toBeTruthy();
  });

  it('toggles a medicine taken when its row is pressed', async () => {
    await renderApp({ initialTabName: 'Medicines' });

    const row = await screen.findByTestId('medicine-med2');
    expect(row.props.accessibilityState.checked).toBe(false);

    await act(async () => {
      await fireEvent.press(row);
    });

    expect(await screen.findByText('2 of 3 taken')).toBeTruthy();
    expect(screen.getByTestId('medicine-med2').props.accessibilityState.checked).toBe(true);

    await act(async () => {
      await fireEvent.press(row);
    });

    expect(await screen.findByText('1 of 3 taken')).toBeTruthy();
  });

  it('announces the taken status in words', async () => {
    await renderApp({ initialTabName: 'Medicines' });
    const taken = await screen.findByTestId('medicine-med1');
    const notTaken = await screen.findByTestId('medicine-med2');

    expect(taken.props.accessibilityLabel).toContain('Taken');
    expect(notTaken.props.accessibilityLabel).toContain('Not taken');
  });
});
