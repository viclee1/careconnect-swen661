import 'dart:math' as math;

/// Size of the caption track drawn over video and audio content.
enum CaptionSize {
  small('Small', 1.0),
  medium('Medium', 1.25),
  large('Large', 1.6);

  const CaptionSize(this.label, this.scale);

  final String label;

  /// Multiplier applied to the caption text size.
  final double scale;

  static CaptionSize fromName(String? name) {
    for (final CaptionSize size in CaptionSize.values) {
      if (size.name == name) return size;
    }
    return CaptionSize.medium;
  }
}

/// Colour of caption text, as offered by the Week 3 prototype.
///
/// Both options are measured against the caption panel's dark blue backing
/// (`AppColors.primaryDark`, #0F5272): white reaches 8.5:1 and broadcast yellow
/// 8.1:1, so either choice clears WCAG 2.2 AA for body text with room to spare.
/// The colour is stored as an ARGB integer so the model stays free of any
/// Flutter import and can be unit tested on its own.
enum CaptionColor {
  white('White', 0xFFFFFFFF),
  yellow('Yellow', 0xFFFFFF00);

  const CaptionColor(this.label, this.argb);

  final String label;
  final int argb;

  static CaptionColor fromName(String? name) {
    for (final CaptionColor colour in CaptionColor.values) {
      if (colour.name == name) return colour;
    }
    return CaptionColor.white;
  }
}

/// The user's accessibility preferences.
///
/// An immutable value object. [AccessibilitySettings.defaults] is the state a
/// fresh install starts in, chosen so the application is already usable by a
/// deaf or hard-of-hearing person before anything is changed.
class AccessibilitySettings {
  const AccessibilitySettings({
    required this.visualAlertBanners,
    required this.smartEscalation,
    required this.captionsEnabled,
    required this.captionSize,
    required this.captionColor,
    required this.alertVolume,
    required this.audioBalance,
    required this.vibrationEnabled,
  });

  /// Volume runs 0–1; the screen renders it as a percentage.
  static const double minVolume = 0.0;
  static const double maxVolume = 1.0;

  /// Balance runs fully left (-1) through centre (0) to fully right (+1).
  static const double minBalance = -1.0;
  static const double maxBalance = 1.0;

  /// The out-of-the-box configuration, matching the prototype's screenshots.
  static const AccessibilitySettings defaults = AccessibilitySettings(
    visualAlertBanners: true,
    smartEscalation: true,
    captionsEnabled: true,
    captionSize: CaptionSize.medium,
    captionColor: CaptionColor.white,
    alertVolume: 0.7,
    audioBalance: 0.0,
    vibrationEnabled: true,
  );

  /// Flashing banners for every notification.
  ///
  /// This is the setting that cannot be switched off. Removing the banner would
  /// leave an alert that reaches the user by sound alone, which is precisely
  /// what the assigned constraint forbids — so the Settings screen shows the
  /// control, explains that it is fixed, and refuses to change it.
  final bool visualAlertBanners;

  /// Missed alerts are escalated automatically.
  final bool smartEscalation;

  final bool captionsEnabled;
  final CaptionSize captionSize;
  final CaptionColor captionColor;

  /// Volume of the optional sound layered on top of a banner, 0–1.
  ///
  /// Sound is never the only carrier, so zero is a perfectly valid setting: the
  /// banner and the vibration still arrive.
  final double alertVolume;

  /// Left/right balance, useful when only one ear is aided.
  final double audioBalance;

  /// Vibrate for every notification.
  final bool vibrationEnabled;

  static double clampVolume(double value) {
    if (value.isNaN) return minVolume;
    return math.min(math.max(value, minVolume), maxVolume);
  }

  static double clampBalance(double value) {
    if (value.isNaN) return 0.0;
    return math.min(math.max(value, minBalance), maxBalance);
  }

  /// The caption text size in logical pixels.
  double get captionFontSize => 18.0 * captionSize.scale;

  /// Alert volume as a whole percentage, for display.
  int get volumePercent => (alertVolume * 100).round();

  /// The audio balance written out — "Centre", "60% left", "25% right".
  String get balanceLabel {
    final int magnitude = (audioBalance.abs() * 100).round();
    if (magnitude == 0) return 'Centre';
    return audioBalance < 0 ? '$magnitude% left' : '$magnitude% right';
  }

  /// True when the current configuration still satisfies every assigned
  /// hearing-impairment constraint.
  ///
  /// The banner is fixed on, so the only way to fall out of conformance is to
  /// switch captions off and leave spoken content with nothing to read.
  bool get meetsHearingConstraints => visualAlertBanners && captionsEnabled;

  /// The sentence printed under the conformance badge.
  String get conformanceMessage => meetsHearingConstraints
      ? 'Hearing-accessibility requirements met'
      : 'Captions are off, so some spoken content will have no text';

  AccessibilitySettings copyWith({
    bool? visualAlertBanners,
    bool? smartEscalation,
    bool? captionsEnabled,
    CaptionSize? captionSize,
    CaptionColor? captionColor,
    double? alertVolume,
    double? audioBalance,
    bool? vibrationEnabled,
  }) {
    return AccessibilitySettings(
      visualAlertBanners: visualAlertBanners ?? this.visualAlertBanners,
      smartEscalation: smartEscalation ?? this.smartEscalation,
      captionsEnabled: captionsEnabled ?? this.captionsEnabled,
      captionSize: captionSize ?? this.captionSize,
      captionColor: captionColor ?? this.captionColor,
      alertVolume: clampVolume(alertVolume ?? this.alertVolume),
      audioBalance: clampBalance(audioBalance ?? this.audioBalance),
      vibrationEnabled: vibrationEnabled ?? this.vibrationEnabled,
    );
  }

  /// Serialises to the flat map shape stored in `SharedPreferences`.
  Map<String, Object> toMap() {
    return <String, Object>{
      'visualAlertBanners': visualAlertBanners,
      'smartEscalation': smartEscalation,
      'captionsEnabled': captionsEnabled,
      'captionSize': captionSize.name,
      'captionColor': captionColor.name,
      'alertVolume': alertVolume,
      'audioBalance': audioBalance,
      'vibrationEnabled': vibrationEnabled,
    };
  }

  /// Rebuilds settings from stored values, falling back to [defaults] for any
  /// key that is missing or the wrong type, so a partially written or corrupt
  /// preference store degrades to a safe configuration instead of throwing on
  /// startup.
  factory AccessibilitySettings.fromMap(Map<String, Object?> map) {
    T read<T>(String key, T fallback) {
      final Object? value = map[key];
      return value is T ? value : fallback;
    }

    return AccessibilitySettings(
      // Never read back as false: the banner is not the user's to disable.
      visualAlertBanners: true,
      smartEscalation: read<bool>('smartEscalation', defaults.smartEscalation),
      captionsEnabled: read<bool>('captionsEnabled', defaults.captionsEnabled),
      captionSize: CaptionSize.fromName(read<String?>('captionSize', null)),
      captionColor: CaptionColor.fromName(read<String?>('captionColor', null)),
      alertVolume: clampVolume(read<double>('alertVolume', defaults.alertVolume)),
      audioBalance:
          clampBalance(read<double>('audioBalance', defaults.audioBalance)),
      vibrationEnabled:
          read<bool>('vibrationEnabled', defaults.vibrationEnabled),
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is AccessibilitySettings &&
        other.visualAlertBanners == visualAlertBanners &&
        other.smartEscalation == smartEscalation &&
        other.captionsEnabled == captionsEnabled &&
        other.captionSize == captionSize &&
        other.captionColor == captionColor &&
        other.alertVolume == alertVolume &&
        other.audioBalance == audioBalance &&
        other.vibrationEnabled == vibrationEnabled;
  }

  @override
  int get hashCode => Object.hash(
        visualAlertBanners,
        smartEscalation,
        captionsEnabled,
        captionSize,
        captionColor,
        alertVolume,
        audioBalance,
        vibrationEnabled,
      );
}
