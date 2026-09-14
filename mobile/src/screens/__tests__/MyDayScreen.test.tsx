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

    // Check for some default tasks
    expect(screen.getByText('Take Amlodipine')).toBeTruthy();
    expect(screen.getByText('Morning check-in')).toBeTruthy();
  });

  it('toggles task status when pressed', async () => {
    await renderWithProviders(<MyDayScreen onOpenSettings={onOpenSettings} />);

    const task = await screen.findByText('Take Amlodipine');

    await act(async () => {
      await fireEvent.press(task);
    });

    // The Progress text should update.
    expect(await screen.findByText(/1 of 7 done/)).toBeTruthy();

    await act(async () => {
      await fireEvent.press(task);
    });
    expect(await screen.findByText(/0 of 7 done/)).toBeTruthy();
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
