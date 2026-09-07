import 'package:shared_preferences/shared_preferences.dart';

import '../models/accessibility_settings.dart';

/// Persistence for [AccessibilitySettings].
abstract interface class SettingsRepository {
  Future<AccessibilitySettings> load();
  Future<void> save(AccessibilitySettings settings);
  Future<void> clear();
}

/// `SharedPreferences` implementation.
///
/// Each field is stored under its own key rather than as one JSON blob. That
/// costs a few extra reads but means a preference added by a teammate later
/// cannot invalidate the whole stored object.
class SharedPreferencesSettingsRepository implements SettingsRepository {
  SharedPreferencesSettingsRepository({SharedPreferences? preferences})
      : _injected = preferences;

  static const String _prefix = 'careconnect.a11y.';

  final SharedPreferences? _injected;
  SharedPreferences? _cached;

  Future<SharedPreferences> get _prefs async {
    final SharedPreferences? injected = _injected;
    if (injected != null) return injected;
    return _cached ??= await SharedPreferences.getInstance();
  }

  @override
  Future<AccessibilitySettings> load() async {
    final SharedPreferences prefs = await _prefs;
    final Map<String, Object?> stored = <String, Object?>{};
    for (final String key in AccessibilitySettings.defaults.toMap().keys) {
      final Object? value = prefs.get('$_prefix$key');
      if (value != null) stored[key] = value;
    }
    return AccessibilitySettings.fromMap(stored);
  }

  @override
  Future<void> save(AccessibilitySettings settings) async {
    final SharedPreferences prefs = await _prefs;
    for (final MapEntry<String, Object> entry in settings.toMap().entries) {
      final String key = '$_prefix${entry.key}';
      final Object value = entry.value;
      if (value is bool) {
        await prefs.setBool(key, value);
      } else if (value is double) {
        await prefs.setDouble(key, value);
      } else if (value is int) {
        await prefs.setInt(key, value);
      } else {
        await prefs.setString(key, value.toString());
      }
    }
  }

  @override
  Future<void> clear() async {
    final SharedPreferences prefs = await _prefs;
    for (final String key in AccessibilitySettings.defaults.toMap().keys) {
      await prefs.remove('$_prefix$key');
    }
  }
}

/// A repository that keeps settings in memory only.
///
/// Used by widget tests that are not exercising persistence, so they do not
/// need to install the `shared_preferences` mock channel.
class InMemorySettingsRepository implements SettingsRepository {
  InMemorySettingsRepository([this._settings = AccessibilitySettings.defaults]);

  AccessibilitySettings _settings;

  @override
  Future<AccessibilitySettings> load() async => _settings;

  @override
  Future<void> save(AccessibilitySettings settings) async {
    _settings = settings;
  }

  @override
  Future<void> clear() async {
    _settings = AccessibilitySettings.defaults;
  }
}
