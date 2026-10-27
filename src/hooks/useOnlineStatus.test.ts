import { act, renderHook } from '@testing-library/react';

import { useOnlineStatus } from './useOnlineStatus';

function setOnline(online: boolean) {
  Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => online });
  act(() => {
    window.dispatchEvent(new Event(online ? 'online' : 'offline'));
  });
}

describe('useOnlineStatus', () => {
  afterEach(() => setOnline(true));

  it('follows the browser between online and offline', () => {
    setOnline(true);
    const { result, unmount } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);
    setOnline(false);
    expect(result.current).toBe(false);
    setOnline(true);
    expect(result.current).toBe(true);
    unmount();
  });
});
