import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';

import { SETTINGS_KEY, SettingsProvider } from './SettingsContext';
import { useSettings } from './settings';
import { defaultSettings } from '../models/accessibilitySettings';

function wrapper({ children }: { children: ReactNode }) {
  return <SettingsProvider>{children}</SettingsProvider>;
}

beforeEach(() => localStorage.clear());

describe('SettingsProvider', () => {
  it('starts from the defaults', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });
    expect(result.current.settings).toEqual(defaultSettings);
  });

  it('clamps numbers, refuses to turn the banner off, and persists', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });
    act(() => result.current.update({ alertVolume: 4, visualAlertBanners: false }));
    expect(result.current.settings.alertVolume).toBe(1);
    expect(result.current.settings.visualAlertBanners).toBe(true);
    expect(JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}').alertVolume).toBe(1);
  });

  it('treats a stored non-object as the defaults', () => {
    localStorage.setItem(SETTINGS_KEY, '42');
    const { result } = renderHook(() => useSettings(), { wrapper });
    expect(result.current.settings).toEqual(defaultSettings);
  });

  it('throws a clear error outside the provider', () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => renderHook(() => useSettings())).toThrow('useSettings must be used inside SettingsProvider');
    jest.restoreAllMocks();
  });
});
