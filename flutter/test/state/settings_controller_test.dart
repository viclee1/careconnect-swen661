import 'package:careconnect_mobile/data/settings_repository.dart';
import 'package:careconnect_mobile/models/accessibility_settings.dart';
import 'package:careconnect_mobile/state/settings_controller.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Records what was written, so persistence can be asserted without a channel.
class _RecordingSettingsRepository implements SettingsRepository {
  _RecordingSettingsRepository([this.initial = AccessibilitySettings.defaults]);

  final AccessibilitySettings initial;
  final List<AccessibilitySettings> saves = <AccessibilitySettings>[];
  int clears = 0;

  @override
  Future<AccessibilitySettings> load() async => initial;

  @override
  Future<void> save(AccessibilitySettings settings) async {
    saves.add(settings);
  }

  @override
  Future<void> clear() async {
    clears++;
  }
}

/// A repository whose load always throws.
class _BrokenSettingsRepository implements SettingsRepository {
  @override
  Future<AccessibilitySettings> load() async => throw StateError('corrupt');

  @override
  Future<void> save(AccessibilitySettings settings) async {}

  @override
  Future<void> clear() async {}
}

void main() {
  group('SettingsController', () {
    test('starts at the defaults before loading', () {
      final SettingsController controller = SettingsController(
        repository: _RecordingSettingsRepository(),
      );
      expect(controller.settings, AccessibilitySettings.defaults);
      expect(controller.isLoading, isFalse);
    });

    test('load applies what storage returned', () async {
      final AccessibilitySettings stored =
          AccessibilitySettings.defaults.copyWith(
        alertVolume: 0.2,
        captionColor: CaptionColor.yellow,
      );
      final SettingsController controller = SettingsController(
        repository: _RecordingSettingsRepository(stored),
      );

      await controller.load();

      expect(controller.alertVolume, 0.2);
      expect(controller.captionColor, CaptionColor.yellow);
    });

    test('load falls back to defaults when storage throws', () async {
      final SettingsController controller = SettingsController(
        repository: _BrokenSettingsRepository(),
      );

      await controller.load();

      expect(controller.settings, AccessibilitySettings.defaults);
      expect(controller.isLoading, isFalse);
    });

    test('each setter persists and notifies exactly once', () async {
      final _RecordingSettingsRepository repository =
          _RecordingSettingsRepository();
      final SettingsController controller =
          SettingsController(repository: repository);

      int notifications = 0;
      controller.addListener(() => notifications++);

      await controller.setSmartEscalation(false);
      await controller.setCaptionsEnabled(false);
      await controller.setCaptionSize(CaptionSize.large);
      await controller.setCaptionColor(CaptionColor.yellow);
      await controller.setAlertVolume(0.4);
      await controller.setAudioBalance(-0.5);
      await controller.setVibrationEnabled(false);

      expect(repository.saves, hasLength(7));
      expect(notifications, 7);
      expect(controller.smartEscalation, isFalse);
      expect(controller.captionsEnabled, isFalse);
      expect(controller.captionSize, CaptionSize.large);
      expect(controller.captionColor, CaptionColor.yellow);
      expect(controller.alertVolume, 0.4);
      expect(controller.audioBalance, -0.5);
      expect(controller.vibrationEnabled, isFalse);
    });

    test('setting a value to what it already is writes nothing', () async {
      final _RecordingSettingsRepository repository =
          _RecordingSettingsRepository();
      final SettingsController controller =
          SettingsController(repository: repository);

      await controller.setCaptionsEnabled(true);
      await controller.setAlertVolume(AccessibilitySettings.defaults.alertVolume);

      expect(repository.saves, isEmpty);
    });

    test('an out-of-range volume is clamped before it is stored', () async {
      final _RecordingSettingsRepository repository =
          _RecordingSettingsRepository();
      final SettingsController controller =
          SettingsController(repository: repository);

      await controller.setAlertVolume(99);

      expect(controller.alertVolume, AccessibilitySettings.maxVolume);
      expect(repository.saves.single.alertVolume,
          AccessibilitySettings.maxVolume);
    });

    test('the visual alert banner has no setter to switch it off', () async {
      final SettingsController controller = SettingsController(
        repository: _RecordingSettingsRepository(),
      );
      await controller.load();
      expect(controller.visualAlertBanners, isTrue);
    });
  });

  group('SharedPreferencesSettingsRepository', () {
    setUp(() {
      TestWidgetsFlutterBinding.ensureInitialized();
      SharedPreferences.setMockInitialValues(<String, Object>{});
    });

    test('an empty store loads the defaults', () async {
      final SharedPreferences prefs = await SharedPreferences.getInstance();
      final SettingsRepository repository =
          SharedPreferencesSettingsRepository(preferences: prefs);

      expect(await repository.load(), AccessibilitySettings.defaults);
    });

    test('saved settings survive a reload', () async {
      final SharedPreferences prefs = await SharedPreferences.getInstance();
      final SettingsRepository repository =
          SharedPreferencesSettingsRepository(preferences: prefs);

      final AccessibilitySettings settings =
          AccessibilitySettings.defaults.copyWith(
        smartEscalation: false,
        captionsEnabled: false,
        captionSize: CaptionSize.large,
        captionColor: CaptionColor.yellow,
        alertVolume: 0.25,
        audioBalance: 0.5,
        vibrationEnabled: false,
      );

      await repository.save(settings);

      expect(await repository.load(), settings);
    });

    test('clear returns the store to the defaults', () async {
      final SharedPreferences prefs = await SharedPreferences.getInstance();
      final SettingsRepository repository =
          SharedPreferencesSettingsRepository(preferences: prefs);

      await repository.save(
        AccessibilitySettings.defaults.copyWith(vibrationEnabled: false),
      );
      await repository.clear();

      expect(await repository.load(), AccessibilitySettings.defaults);
    });
  });

  group('InMemorySettingsRepository', () {
    test('round-trips a save', () async {
      final SettingsRepository repository = InMemorySettingsRepository();
      final AccessibilitySettings settings =
          AccessibilitySettings.defaults.copyWith(alertVolume: 0.1);

      await repository.save(settings);
      expect(await repository.load(), settings);

      await repository.clear();
      expect(await repository.load(), AccessibilitySettings.defaults);
    });
  });
}
