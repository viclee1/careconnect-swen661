import { act, renderHook } from '@testing-library/react';

import { useMediaQuery, WIDE_LAYOUT } from './useMediaQuery';

const original = window.matchMedia;

afterEach(() => {
  window.matchMedia = original;
});

describe('useMediaQuery', () => {
  it('follows the query as the window changes size', () => {
    let matches = false;
    let listener: (() => void) | null = null;
    window.matchMedia = ((query: string) => ({
        matches: matches && query === WIDE_LAYOUT,
        addEventListener: (_: string, fn: () => void) => {
          listener = fn;
        },
        removeEventListener: () => {
          listener = null;
        },
      })) as unknown as typeof window.matchMedia;

    const { result, unmount } = renderHook(() => useMediaQuery(WIDE_LAYOUT));
    expect(result.current).toBe(false);

    matches = true;
    act(() => listener?.());
    expect(result.current).toBe(true);

    unmount();
    expect(listener).toBeNull();
  });

  it('reports no match where matchMedia does not exist', () => {
    window.matchMedia = undefined as unknown as typeof window.matchMedia;
    const { result } = renderHook(() => useMediaQuery(WIDE_LAYOUT));
    expect(result.current).toBe(false);
  });
});
