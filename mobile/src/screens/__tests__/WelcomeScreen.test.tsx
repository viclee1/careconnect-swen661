import { act, fireEvent, screen } from '@testing-library/react-native';
import React from 'react';
import { WelcomeScreen } from '../WelcomeScreen';
import { renderWithProviders } from '../../test-support/harness';

describe('WelcomeScreen', () => {
  const onGetStarted = jest.fn();
  const onSignIn = jest.fn();

  beforeEach(() => {
    onGetStarted.mockClear();
    onSignIn.mockClear();
  });

  it('renders correctly', async () => {
    await renderWithProviders(
      <WelcomeScreen onGetStarted={onGetStarted} onSignIn={onSignIn} />,
    );

    expect(await screen.findByText('CareConnect')).toBeTruthy();
    expect(screen.getByText('Built for hearing accessibility')).toBeTruthy();
    expect(screen.getByText('Visual alerts')).toBeTruthy();
    expect(screen.getByText('Captions everywhere')).toBeTruthy();
    expect(screen.getByText('Vibration patterns')).toBeTruthy();
  });

  it('calls onGetStarted when the primary action is pressed', async () => {
    await renderWithProviders(
      <WelcomeScreen onGetStarted={onGetStarted} onSignIn={onSignIn} />,
    );

    await act(async () => {
      await fireEvent.press(screen.getByText("Get started — it's free →"));
    });
    expect(onGetStarted).toHaveBeenCalledTimes(1);
    expect(onSignIn).not.toHaveBeenCalled();
  });

  it('calls onSignIn when the returning-user action is pressed', async () => {
    await renderWithProviders(
      <WelcomeScreen onGetStarted={onGetStarted} onSignIn={onSignIn} />,
    );

    await act(async () => {
      await fireEvent.press(screen.getByText('I already have an account'));
    });
    expect(onSignIn).toHaveBeenCalledTimes(1);
    expect(onGetStarted).not.toHaveBeenCalled();
  });
});
