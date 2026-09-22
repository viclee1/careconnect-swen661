import { act, fireEvent, screen } from '@testing-library/react-native';
import React from 'react';
import { HomeScreen } from '../HomeScreen';
import { renderWithProviders } from '../../test-support/harness';

describe('HomeScreen', () => {
  const onOpenSettings = jest.fn();

  beforeEach(() => {
    onOpenSettings.mockClear();
  });

  it('renders correctly', async () => {
    await renderWithProviders(<HomeScreen onOpenSettings={onOpenSettings} />);

    expect(await screen.findByText('Dashboard')).toBeTruthy();
    expect(screen.getByText(/Here's your day, Margaret/)).toBeTruthy();
    expect(screen.getByText('Next thing to do')).toBeTruthy();
    expect(screen.getByText('Simulate incoming call')).toBeTruthy();
  });

  it('dismisses notification when OK is pressed', async () => {
    await renderWithProviders(<HomeScreen onOpenSettings={onOpenSettings} />);

    expect(await screen.findByText('Upcoming appointment')).toBeTruthy();
    await act(async () => {
      await fireEvent.press(screen.getByText('OK'));
    });
    expect(screen.queryByText('Upcoming appointment')).toBeNull();
  });

  it('triggers incoming call simulation and decline it', async () => {
    await renderWithProviders(<HomeScreen onOpenSettings={onOpenSettings} />);

    await act(async () => {
      await fireEvent.press(screen.getByText('Simulate incoming call'));
    });

    // Check if incoming call UI is visible
    expect(await screen.findByText('Maria')).toBeTruthy();
    expect(screen.getByText('Your daughter')).toBeTruthy();
    expect(screen.getByLabelText('Decline')).toBeTruthy();
    expect(screen.getByLabelText('Answer')).toBeTruthy();

    await act(async () => {
      await fireEvent.press(screen.getByLabelText('Decline'));
    });
    // Simulation should be closed, back to dashboard
    expect(screen.queryByText('Decline')).toBeNull();
  });

  it('answers incoming call and shows active call UI', async () => {
    await renderWithProviders(<HomeScreen onOpenSettings={onOpenSettings} />);

    await act(async () => {
      await fireEvent.press(screen.getByText('Simulate incoming call'));
    });
    await act(async () => {
      await fireEvent.press(screen.getByLabelText('Answer'));
    });

    // Check if active call UI is visible
    expect(await screen.findByText('LIVE')).toBeTruthy();
    expect(screen.getByText(/Your daughter · Video call/)).toBeTruthy();
    expect(screen.getByText('End call')).toBeTruthy();

    await act(async () => {
      await fireEvent.press(screen.getByText('End call'));
    });
    // Back to dashboard
    expect(screen.queryByText('LIVE')).toBeNull();
  });

  it('toggles CC in active call', async () => {
    await renderWithProviders(<HomeScreen onOpenSettings={onOpenSettings} />);

    await act(async () => {
      await fireEvent.press(screen.getByText('Simulate incoming call'));
    });
    await act(async () => {
      await fireEvent.press(screen.getByLabelText('Answer'));
    });

    // CC is enabled by default
    expect(await screen.findByText(/\[CC LIVE\]/)).toBeTruthy();

    await act(async () => {
      await fireEvent.press(screen.getByTestId('toggle-cc'));
    });
    expect(screen.queryByText(/\[CC LIVE\]/)).toBeNull();

    await act(async () => {
      await fireEvent.press(screen.getByTestId('toggle-cc'));
    });
    expect(await screen.findByText(/\[CC LIVE\]/)).toBeTruthy();
  });

  it('toggles Mute and Pause in active call', async () => {
    await renderWithProviders(<HomeScreen onOpenSettings={onOpenSettings} />);

    await act(async () => {
      await fireEvent.press(screen.getByText('Simulate incoming call'));
    });
    await act(async () => {
      await fireEvent.press(screen.getByLabelText('Answer'));
    });

    // Check Mute toggle
    await act(async () => {
      await fireEvent.press(screen.getByLabelText('Mute'));
    });
    expect(screen.getByLabelText('Mute')).toBeTruthy();

    // Check Pause toggle
    await act(async () => {
      await fireEvent.press(screen.getByLabelText('Pause'));
    });
    expect(screen.getByLabelText('Pause')).toBeTruthy();
  });
});
