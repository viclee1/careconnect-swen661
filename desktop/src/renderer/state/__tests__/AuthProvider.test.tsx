import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';

import { AuthProvider, useAuth } from '../AuthProvider';

const STORAGE_KEY = 'careconnect_desktop_user';

const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>;
const renderAuth = () => renderHook(() => useAuth(), { wrapper });

describe('AuthProvider', () => {
  beforeEach(() => localStorage.clear());

  it('starts signed out', () => {
    const { result } = renderAuth();
    expect(result.current.isSignedIn).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('signs in with a normalised email and remembers the user', async () => {
    const { result } = renderAuth();
    await act(async () => {
      expect(await result.current.signIn('  Margaret@Example.COM ', 'pw')).toEqual({});
    });

    expect(result.current.isSignedIn).toBe(true);
    expect(result.current.user).toEqual({
      name: 'Margaret Whitfield',
      email: 'margaret@example.com',
    });
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual(result.current.user);
  });

  it('refuses a blank email on sign in and sign up', async () => {
    const { result } = renderAuth();
    await act(async () => {
      expect(await result.current.signIn('   ', 'pw')).toEqual({
        error: 'Please enter a valid email address.',
      });
      expect(await result.current.signUp('Dorothy', '', 'pw')).toEqual({
        error: 'Please fill in all required fields.',
      });
    });
    expect(result.current.isSignedIn).toBe(false);
  });

  it('signs up and signs in the new user', async () => {
    const { result } = renderAuth();
    await act(async () => {
      expect(await result.current.signUp('Dorothy', 'dorothy@example.com', 'secret1')).toEqual({});
    });
    expect(result.current.user?.email).toBe('dorothy@example.com');
  });

  it('restores the signed-in user from the last session', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ name: 'Margaret', email: 'm@example.com' }));
    const { result } = renderAuth();
    expect(result.current.isSignedIn).toBe(true);
    expect(result.current.user?.email).toBe('m@example.com');
  });

  it('starts signed out when the saved user is unreadable', () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    expect(renderAuth().result.current.isSignedIn).toBe(false);
  });

  it('signs out and forgets the user', async () => {
    const { result } = renderAuth();
    await act(async () => {
      await result.current.signIn('margaret@example.com', 'pw');
    });
    act(() => result.current.signOut());

    expect(result.current.isSignedIn).toBe(false);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('keeps working when storage is unavailable', async () => {
    const setItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    const { result } = renderAuth();
    await act(async () => {
      await result.current.signIn('margaret@example.com', 'pw');
    });
    expect(result.current.isSignedIn).toBe(true);
    setItem.mockRestore();
  });

  it('throws a clear error outside the provider', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used inside an AuthProvider');
    error.mockRestore();
  });
});
