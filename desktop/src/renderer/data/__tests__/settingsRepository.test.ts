import { defaultSettings, withSettings } from '../../models/accessibilitySettings';
import { installBridge } from '../../test-support/harness';
import {
  createInMemorySettingsRepository,
  createSettingsRepository,
  storageKey,
} from '../settingsRepository';

describe('createSettingsRepository', () => {
  describe('inside the desktop shell', () => {
    it('loads over IPC rather than from the browser', async () => {
      const bridge = installBridge({
        load: jest.fn().mockResolvedValue({ ...defaultSettings, captionSize: 'large' }),
      });
      try {
        const settings = await createSettingsRepository().load();
        expect(bridge.load).toHaveBeenCalled();
        expect(settings.captionSize).toBe('large');
      } finally {
        bridge.uninstall();
      }
    });

    it('saves over IPC', async () => {
      const bridge = installBridge();
      try {
        const next = withSettings(defaultSettings, { vibrationEnabled: false });
        await createSettingsRepository().save(next);
        expect(bridge.save).toHaveBeenCalledWith(next);
        expect(window.localStorage.getItem(storageKey)).toBeNull();
      } finally {
        bridge.uninstall();
      }
    });

    it('clears over IPC', async () => {
      const bridge = installBridge();
      try {
        await createSettingsRepository().clear();
        expect(bridge.clear).toHaveBeenCalled();
      } finally {
        bridge.uninstall();
      }
    });

    it('falls back to the defaults when the main process is empty', async () => {
      const bridge = installBridge({ load: jest.fn().mockResolvedValue({}) });
      try {
        expect(await createSettingsRepository().load()).toEqual(defaultSettings);
      } finally {
        bridge.uninstall();
      }
    });

    it('falls back to the defaults when IPC rejects', async () => {
      // A user who cannot hear the application has no fallback if it refuses to
      // open, so a broken preference channel must degrade, never throw.
      const bridge = installBridge({
        load: jest.fn().mockRejectedValue(new Error('no such channel')),
      });
      try {
        expect(await createSettingsRepository().load()).toEqual(defaultSettings);
      } finally {
        bridge.uninstall();
      }
    });

    it('swallows a failed save rather than interrupting the user', async () => {
      const bridge = installBridge({
        save: jest.fn().mockRejectedValue(new Error('disk full')),
      });
      try {
        await expect(createSettingsRepository().save(defaultSettings)).resolves.toBeUndefined();
      } finally {
        bridge.uninstall();
      }
    });

    it('never restores a sound-only configuration from the stored file', async () => {
      // The one rule a hand-edited preferences file must not be able to break.
      const bridge = installBridge({
        load: jest.fn().mockResolvedValue({ ...defaultSettings, visualAlertBanners: false }),
      });
      try {
        const settings = await createSettingsRepository().load();
        expect(settings.visualAlertBanners).toBe(true);
      } finally {
        bridge.uninstall();
      }
    });
  });

  describe('outside the desktop shell', () => {
    it('round-trips through localStorage, so the renderer runs in a browser', async () => {
      const repository = createSettingsRepository();
      const next = withSettings(defaultSettings, { captionColor: 'yellow' });

      await repository.save(next);
      expect(JSON.parse(window.localStorage.getItem(storageKey) ?? '{}')).toMatchObject({
        captionColor: 'yellow',
      });
      expect(await repository.load()).toEqual(next);
    });

    it('returns the defaults when nothing is stored', async () => {
      expect(await createSettingsRepository().load()).toEqual(defaultSettings);
    });

    it('returns the defaults for a corrupt stored value', async () => {
      window.localStorage.setItem(storageKey, '{ not json');
      expect(await createSettingsRepository().load()).toEqual(defaultSettings);
    });

    it('returns the defaults when the stored value is not an object', async () => {
      window.localStorage.setItem(storageKey, '"a string"');
      expect(await createSettingsRepository().load()).toEqual(defaultSettings);
    });

    it('fills in the defaults for a partially written value', async () => {
      window.localStorage.setItem(storageKey, JSON.stringify({ captionSize: 'small' }));

      const settings = await createSettingsRepository().load();
      expect(settings.captionSize).toBe('small');
      expect(settings.alertVolume).toBe(defaultSettings.alertVolume);
    });

    it('clamps a stored value that is out of range', async () => {
      window.localStorage.setItem(storageKey, JSON.stringify({ alertVolume: 99 }));
      expect((await createSettingsRepository().load()).alertVolume).toBe(1);
    });

    it('clears what it stored', async () => {
      const repository = createSettingsRepository();
      await repository.save(defaultSettings);
      await repository.clear();
      expect(window.localStorage.getItem(storageKey)).toBeNull();
    });
  });
});

describe('createInMemorySettingsRepository', () => {
  it('records every save, so tests can assert on persistence', async () => {
    const repository = createInMemorySettingsRepository();
    const next = withSettings(defaultSettings, { smartEscalation: false });

    await repository.save(next);

    expect(repository.saves).toEqual([next]);
    expect(await repository.load()).toEqual(next);
  });

  it('resets to the defaults on clear', async () => {
    const repository = createInMemorySettingsRepository(
      withSettings(defaultSettings, { captionsEnabled: false }),
    );
    await repository.clear();
    expect(await repository.load()).toEqual(defaultSettings);
  });
});
