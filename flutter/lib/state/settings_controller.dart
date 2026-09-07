import 'package:flutter/foundation.dart';

import '../data/settings_repository.dart';
import '../models/accessibility_settings.dart';

/// Owns the accessibility preferences and writes every change straight through
/// to storage.
///
/// The controller is exposed app-wide, so a caption or vibration choice made on
/// the Settings screen changes how the Contacts and Messaging screens behave —
/// the clearest demonstration in this slice of why shared state does not belong
/// in `setState`.
class SettingsController extends ChangeNotifier {
  SettingsController({required SettingsRepository repository})
      : _repository = repository;

  final SettingsRepository _repository;

  AccessibilitySettings _settings = AccessibilitySettings.defaults;
  bool _isLoading = false;

  AccessibilitySettings get settings => _settings;
  bool get isLoading => _isLoading;

  // Convenience getters so a widget can select one value without reaching
  // through `settings` every time.
  bool get visualAlertBanners => _settings.visualAlertBanners;
  bool get smartEscalation => _settings.smartEscalation;
  bool get captionsEnabled => _settings.captionsEnabled;
  CaptionSize get captionSize => _settings.captionSize;
  CaptionColor get captionColor => _settings.captionColor;
  double get alertVolume => _settings.alertVolume;
  double get audioBalance => _settings.audioBalance;
  bool get vibrationEnabled => _settings.vibrationEnabled;

  /// Reads persisted settings. Falls back to defaults if storage is unreadable.
  Future<void> load() async {
    _isLoading = true;
    notifyListeners();
    try {
      _settings = await _repository.load();
    } catch (_) {
      _settings = AccessibilitySettings.defaults;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Applies [next] and persists it.
  ///
  /// Identical values short-circuit, so dragging a slider across a pixel that
  /// maps to the same value does not spam the preference store.
  Future<void> _update(AccessibilitySettings next) async {
    if (next == _settings) return;
    _settings = next;
    notifyListeners();
    await _repository.save(next);
  }

  Future<void> setSmartEscalation(bool value) =>
      _update(_settings.copyWith(smartEscalation: value));

  Future<void> setCaptionsEnabled(bool value) =>
      _update(_settings.copyWith(captionsEnabled: value));

  Future<void> setCaptionSize(CaptionSize value) =>
      _update(_settings.copyWith(captionSize: value));

  Future<void> setCaptionColor(CaptionColor value) =>
      _update(_settings.copyWith(captionColor: value));

  Future<void> setAlertVolume(double value) =>
      _update(_settings.copyWith(alertVolume: value));

  Future<void> setAudioBalance(double value) =>
      _update(_settings.copyWith(audioBalance: value));

  Future<void> setVibrationEnabled(bool value) =>
      _update(_settings.copyWith(vibrationEnabled: value));
}
