import { act, renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import {
  createInMemorySettingsRepository,
  type SettingsRepository,
} from '../../data/settingsRepository';
import {
  defaultSettings,
  withSettings,
  type AccessibilitySettings,
} from '../../models/accessibilitySettings';
import { SettingsProvider, useSettings } from '../SettingsProvider';

async function mount(repository: SettingsRepository) {
  function Wrapper({ children }: { children: ReactNode }) {
    return <SettingsProvider repository={repository}>{children}</SettingsProvider>;
  }
  return renderHook(() => useSettings(), { wrapper: Wrapper });
}

/** A repository whose load always throws. */
const brokenRepository: SettingsRepository = {
  async load(): Promise<AccessibilitySettings> {
    throw new Error('corrupt');
  },
  async save() {},
  async clear() {},
};

describe('useSettings', () => {
  it('starts at the defaults before loading', async () => {
    const { result } = await mount(createInMemorySettingsRepository());
    expect(result.current.settings).toEqual(defaultSettings);
    expect(result.current.isLoading).toBe(false);
  });

  it('load applies what storage returned', async () => {
    const stored = withSettings(defaultSettings, { alertVolume: 0.2, captionColor: 'yellow' });
    const { result } = await mount(createInMemorySettingsRepository(stored));

    await act(async () => {
      await result.current.load();
    });

    expect(result.current.settings.alertVolume).toBe(0.2);
    expect(result.current.settings.captionColor).toBe('yellow');
  });

  it('load falls back to the defaults when storage throws', async () => {
    const { result } = await mount(brokenRepository);

    await act(async () => {
      await result.current.load();
    });

    expect(result.current.settings).toEqual(defaultSettings);
    expect(result.current.isLoading).toBe(false);
  });

  it('every change persists exactly once', async () => {
    const repository = createInMemorySettingsRepository();
    const { result } = await mount(repository);

    await act(async () => {
      await result.current.update({ smartEscalation: false });
      await result.current.update({ captionsEnabled: false });
      await result.current.update({ captionSize: 'large' });
      await result.current.update({ captionColor: 'yellow' });
      await result.current.update({ alertVolume: 0.4 });
      await result.current.update({ audioBalance: -0.5 });
      await result.current.update({ vibrationEnabled: false });
    });

    expect(repository.saves).toHaveLength(7);
    expect(result.current.settings).toMatchObject({
      smartEscalation: false,
      captionsEnabled: false,
      captionSize: 'large',
      captionColor: 'yellow',
      alertVolume: 0.4,
      audioBalance: -0.5,
      vibrationEnabled: false,
    });
  });

  it('setting a value to what it already is writes nothing', async () => {
    const repository = createInMemorySettingsRepository();
    const { result } = await mount(repository);

    await act(async () => {
      await result.current.update({ captionsEnabled: true });
      await result.current.update({ alertVolume: defaultSettings.alertVolume });
    });

    expect(repository.saves).toHaveLength(0);
  });

  it('an out-of-range value is clamped before it is stored', async () => {
    const repository = createInMemorySettingsRepository();
    const { result } = await mount(repository);

    await act(async () => {
      await result.current.update({ alertVolume: 99 });
    });

    expect(result.current.settings.alertVolume).toBe(1);
    expect(repository.saves[0].alertVolume).toBe(1);
  });

  it('the visual alert banner cannot be switched off', async () => {
    const repository = createInMemorySettingsRepository();
    const { result } = await mount(repository);

    await act(async () => {
      await result.current.update({ visualAlertBanners: false });
    });

    expect(result.current.settings.visualAlertBanners).toBe(true);
    // Nothing changed, so nothing was written.
    expect(repository.saves).toHaveLength(0);
  });
});

describe('useSettings outside its provider', () => {
  it('fails loudly rather than returning a broken value', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(renderHook(() => useSettings())).rejects.toThrow(
      'useSettings must be used inside a SettingsProvider',
    );
    spy.mockRestore();
  });
});
