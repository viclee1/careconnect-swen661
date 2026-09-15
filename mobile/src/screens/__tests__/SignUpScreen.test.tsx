import { act, fireEvent, screen } from '@testing-library/react-native';
import React from 'react';
import { SignUpScreen } from '../SignUpScreen';
import { renderWithProviders } from '../../test-support/harness';

describe('SignUpScreen', () => {
  const onSignUp = jest.fn();
  const onSignIn = jest.fn();

  beforeEach(() => {
    onSignUp.mockClear();
    onSignIn.mockClear();
  });

  it('renders correctly', async () => {
    await renderWithProviders(
      <SignUpScreen onSignUp={onSignUp} onSignIn={onSignIn} />
    );

    expect(await screen.findByText('CareConnect')).toBeTruthy();
    expect(screen.getByText('Create your account')).toBeTruthy();
    expect(screen.getByPlaceholderText('e.g. Alex Johnson')).toBeTruthy();
    expect(screen.getByPlaceholderText('e.g. alex@example.com')).toBeTruthy();
    expect(screen.getByPlaceholderText('Create a password')).toBeTruthy();
    expect(screen.getByPlaceholderText('Re-enter your password')).toBeTruthy();
    expect(screen.getByText('Create account')).toBeTruthy();
  });

  it('calls onSignUp when create account button is pressed', async () => {
    await renderWithProviders(
      <SignUpScreen onSignUp={onSignUp} onSignIn={onSignIn} />
    );

    await act(async () => {
      await fireEvent.press(screen.getByText('Create account'));
    });
    expect(onSignUp).toHaveBeenCalledTimes(1);
  });

  it('calls onSignIn when sign in link is pressed', async () => {
    await renderWithProviders(
      <SignUpScreen onSignUp={onSignUp} onSignIn={onSignIn} />
    );

    await act(async () => {
      await fireEvent.press(screen.getByText('Sign in'));
    });
    expect(onSignIn).toHaveBeenCalledTimes(1);
  });
});
