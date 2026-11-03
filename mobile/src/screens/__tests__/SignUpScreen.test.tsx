import { act, fireEvent, screen } from '@testing-library/react-native';
import React from 'react';
import { AccessibilityInfo } from 'react-native';
import { SignUpScreen } from '../SignUpScreen';
import { renderWithProviders } from '../../test-support/harness';

describe('SignUpScreen', () => {
  const onSignUp = jest.fn();
  const onSignIn = jest.fn();
  let announce: jest.SpyInstance;

  beforeEach(() => {
    onSignUp.mockClear();
    onSignIn.mockClear();
    announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
  });

  afterEach(() => announce.mockRestore());

  async function renderScreen() {
    await renderWithProviders(<SignUpScreen onSignUp={onSignUp} onSignIn={onSignIn} />);
    await screen.findByText('CareConnect');
  }

  async function pressCreate() {
    await act(async () => {
      await fireEvent.press(screen.getByText('Create account'));
    });
  }

  async function fill(values: Partial<Record<'name' | 'email' | 'password' | 'confirm', string>>) {
    for (const [field, text] of Object.entries(values)) {
      await fireEvent.changeText(screen.getByTestId(`sign-up-${field}`), text);
    }
  }

  it('renders correctly', async () => {
    await renderScreen();
    expect(screen.getByText('Create your account')).toBeTruthy();
    expect(screen.getByPlaceholderText('e.g. Alex Johnson')).toBeTruthy();
    expect(screen.getByPlaceholderText('e.g. alex@example.com')).toBeTruthy();
    expect(screen.getByPlaceholderText('Create a password')).toBeTruthy();
    expect(screen.getByPlaceholderText('Re-enter your password')).toBeTruthy();
    expect(screen.getByText('Create account')).toBeTruthy();
  });

  it('refuses an empty form, explaining all four fields and announcing the first', async () => {
    await renderScreen();
    await pressCreate();

    expect(onSignUp).not.toHaveBeenCalled();
    for (const message of [
      'Please enter your name.',
      'Please enter your email address.',
      'Please create a password.',
      'Please confirm your password.',
    ]) {
      expect(screen.getByText(message)).toBeTruthy();
    }
    expect(announce).toHaveBeenCalledWith('4 things need fixing. Please enter your name.');
  });

  it('re-checks Confirm password when the password changes', async () => {
    await renderScreen();
    await fill({ name: 'Margaret', email: 'margaret@example.com', password: 'secret1', confirm: 'secret2' });
    await pressCreate();
    expect(screen.getByText('Passwords do not match.')).toBeTruthy();

    // Fixing the first field, not the one flagged, clears the mismatch.
    await fill({ password: 'secret2' });
    expect(screen.queryByText('Passwords do not match.')).toBeNull();
  });

  it('says how long the password must be', async () => {
    await renderScreen();
    await fill({ name: 'Margaret', email: 'margaret@example.com', password: 'abc', confirm: 'abc' });
    await pressCreate();
    expect(screen.getByText('Password must be at least 6 characters.')).toBeTruthy();
    expect(onSignUp).not.toHaveBeenCalled();
  });

  it('creates the account once the form is complete', async () => {
    await renderScreen();
    await fill({ name: 'Margaret', email: 'margaret@example.com', password: 'secret1', confirm: 'secret1' });
    await pressCreate();
    expect(onSignUp).toHaveBeenCalledTimes(1);
  });

  it('calls onSignIn when sign in link is pressed', async () => {
    await renderScreen();
    await act(async () => {
      await fireEvent.press(screen.getByText('Sign in'));
    });
    expect(onSignIn).toHaveBeenCalledTimes(1);
  });
});
