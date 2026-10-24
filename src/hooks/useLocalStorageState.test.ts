import { act, renderHook } from '@testing-library/react';

import { useLocalStorageState } from './useLocalStorageState';

beforeEach(() => localStorage.clear());

describe('useLocalStorageState', () => {
  it('uses the initial value when nothing is stored, then saves changes', () => {
    const { result } = renderHook(() => useLocalStorageState('k', () => 1));
    expect(result.current[0]).toBe(1);
    act(() => result.current[1](2));
    expect(localStorage.getItem('k')).toBe('2');
  });

  it('revives a stored value', () => {
    localStorage.setItem('k', JSON.stringify({ n: 5 }));
    const { result } = renderHook(() =>
      useLocalStorageState('k', () => 0, (stored) => (stored as { n: number }).n * 2),
    );
    expect(result.current[0]).toBe(10);
  });

  it('falls back to the initial value when the stored entry is not JSON', () => {
    localStorage.setItem('k', '{broken');
    const { result } = renderHook(() => useLocalStorageState('k', () => 'fresh'));
    expect(result.current[0]).toBe('fresh');
  });

  it('keeps working when storage refuses writes', () => {
    const setItem = jest.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    const { result } = renderHook(() => useLocalStorageState('k', () => 1));
    act(() => result.current[1](3));
    expect(result.current[0]).toBe(3);
    setItem.mockRestore();
  });
});
