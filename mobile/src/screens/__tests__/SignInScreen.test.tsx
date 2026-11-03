import { act, fireEvent, screen } from '@testing-library/react-native';
import React from 'react';
import { AccessibilityInfo } from 'react-native';
import { SignInScreen } from '../SignInScreen';
import { renderWithProviders } from '../../test-support/harness';

describe('SignInScreen', () => {
  const onSignIn = jest.fn();
  const onSignUp = jest.fn();
  let announce: jest.SpyInstance;

  beforeEach(() => {
    onSignIn.mockClear();
    onSignUp.mockClear();
    announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
  });

  afterEach(() => announce.mockRestore());

  async function renderScreen() {
    await renderWithProviders(<SignInScreen onSignIn={onSignIn} onSignUp={onSignUp} />);
    await screen.findByText('CareConnect');
  }

  async function pressSignIn() {
    await act(async () => {
      await fireEvent.press(screen.getByText('Sign in'));
    });
  }

  it('renders correctly', async () => {
    await renderScreen();
    expect(screen.getByText('Welcome back')).toBeTruthy();
    expect(screen.getByPlaceholderText('e.g. alex@example.com')).toBeTruthy();
    expect(screen.getByPlaceholderText('Enter your password')).toBeTruthy();
    expect(screen.getByText('Sign in')).toBeTruthy();
  });

  it('refuses an empty form, explaining each field and announcing the summary', async () => {
    await renderScreen();
    await pressSignIn();

    expect(onSignIn).not.toHaveBeenCalled();
    expect(screen.getByText('Please correct the errors below to continue.')).toBeTruthy();
    expect(screen.getByText('Please enter your email address.')).toBeTruthy();
    expect(screen.getByText('Please enter your password.')).toBeTruthy();
    // The error is what a screen reader hears on the field, not the usual hint.
    expect(screen.getByLabelText('Email address').props.accessibilityHint).toBe('Please enter your email address.');
    expect(announce).toHaveBeenCalledWith('2 things need fixing. Please enter your email address.');
  });

  it('explains a malformed email, and clears it once it is fixed', async () => {
    await renderScreen();
    await fireEvent.changeText(screen.getByTestId('sign-in-email'), 'margaret');
    await fireEvent.changeText(screen.getByTestId('sign-in-password'), 'secret');
    await pressSignIn();
    expect(screen.getByText('Please enter a valid email address.')).toBeTruthy();

    await fireEvent.changeText(screen.getByTestId('sign-in-email'), 'margaret@example.com');
    expect(screen.queryByText('Please enter a valid email address.')).toBeNull();
    expect(screen.queryByText('Please correct the errors below to continue.')).toBeNull();
  });

  it('signs in once both fields are filled', async () => {
    await renderScreen();
    await fireEvent.changeText(screen.getByTestId('sign-in-email'), 'margaret@example.com');
    await fireEvent.changeText(screen.getByTestId('sign-in-password'), 'secret');
    await pressSignIn();
    expect(onSignIn).toHaveBeenCalledTimes(1);
    expect(announce).not.toHaveBeenCalled();
  });

  it('calls onSignUp when create account is pressed', async () => {
    await renderScreen();
    await act(async () => {
      await fireEvent.press(screen.getByText('Create an account'));
    });
    expect(onSignUp).toHaveBeenCalledTimes(1);
  });
});
