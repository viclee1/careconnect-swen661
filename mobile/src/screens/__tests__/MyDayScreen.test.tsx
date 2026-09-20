import { act, fireEvent, screen } from '@testing-library/react-native';
import React from 'react';
import { MyDayScreen } from '../MyDayScreen';
import { renderWithProviders } from '../../test-support/harness';

describe('MyDayScreen', () => {
  const onOpenSettings = jest.fn();

  beforeEach(() => {
    onOpenSettings.mockClear();
  });

  it('renders correctly', async () => {
    await renderWithProviders(<MyDayScreen onOpenSettings={onOpenSettings} />);

    expect(await screen.findByText('My Day')).toBeTruthy();
    expect(screen.getByText('Everything to do — Thursday 4 June')).toBeTruthy();

    // Check for some default tasks by their accessibility labels
    expect(screen.getByLabelText(/Take Amlodipine/)).toBeTruthy();
    expect(screen.getByLabelText(/Morning check-in/)).toBeTruthy();
  });

  it('toggles task status when pressed', async () => {
    await renderWithProviders(<MyDayScreen onOpenSettings={onOpenSettings} />);

    const task = await screen.findByTestId('task-1');

    await act(async () => {
      await fireEvent.press(task);
    });

    // The Progress text should update.
    expect(await screen.findByText(/1 of 7 done/)).toBeTruthy();
    // The label should also update to "completed"
    expect(screen.getByLabelText(/Take Amlodipine.*Status: completed/)).toBeTruthy();

    // Accessibility: Check for faded effect (opacity 0.6)
    const completedTask = screen.getByTestId('task-1');
    const styles = Array.isArray(completedTask.props.style) ? completedTask.props.style : [completedTask.props.style];
    expect(styles).toEqual(expect.arrayContaining([expect.objectContaining({ opacity: 0.6 })]));

    await act(async () => {
      await fireEvent.press(completedTask);
    });
    expect(await screen.findByText(/0 of 7 done/)).toBeTruthy();
    expect(screen.getByLabelText(/Take Amlodipine.*Status: pending/)).toBeTruthy();

    // Accessibility: Check for full opacity (1.0)
    const pendingTask = screen.getByTestId('task-1');
    const resetStyles = Array.isArray(pendingTask.props.style) ? pendingTask.props.style : [pendingTask.props.style];
    expect(resetStyles).toEqual(expect.arrayContaining([expect.objectContaining({ opacity: 1.0 })]));
  });

  it('dismisses notification', async () => {
    await renderWithProviders(<MyDayScreen onOpenSettings={onOpenSettings} />);

    expect(await screen.findByText('Upcoming appointment')).toBeTruthy();
    await act(async () => {
      await fireEvent.press(screen.getByText('OK'));
    });
    expect(screen.queryByText('Upcoming appointment')).toBeNull();
  });
});
