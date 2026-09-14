import { act, fireEvent, screen } from '@testing-library/react-native';
import React from 'react';
import { SignInScreen } from '../SignInScreen';
import { renderWithProviders } from '../../test-support/harness';

describe('SignInScreen', () => {
  const onSignIn = jest.fn();
  const onSignUp = jest.fn();

  beforeEach(() => {
    onSignIn.mockClear();
    onSignUp.mockClear();
  });

  it('renders correctly', async () => {
    await renderWithProviders(
      <SignInScreen onSignIn={onSignIn} onSignUp={onSignUp} />
    );

    expect(await screen.findByText('CareConnect')).toBeTruthy();
    expect(screen.getByText('Welcome back')).toBeTruthy();
    expect(screen.getByPlaceholderText('e.g. alex@example.com')).toBeTruthy();
    expect(screen.getByPlaceholderText('Enter your password')).toBeTruthy();
    expect(screen.getByText('Sign in')).toBeTruthy();
  });

  it('calls onSignIn when sign in button is pressed', async () => {
    await renderWithProviders(
      <SignInScreen onSignIn={onSignIn} onSignUp={onSignUp} />
    );

    await act(async () => {
      await fireEvent.press(screen.getByText('Sign in'));
    });
    expect(onSignIn).toHaveBeenCalledTimes(1);
  });

  it('calls onSignUp when create account is pressed', async () => {
    await renderWithProviders(
      <SignInScreen onSignIn={onSignIn} onSignUp={onSignUp} />
    );

    await act(async () => {
      await fireEvent.press(screen.getByText('Create an account'));
    });
    expect(onSignUp).toHaveBeenCalledTimes(1);
  });
});
