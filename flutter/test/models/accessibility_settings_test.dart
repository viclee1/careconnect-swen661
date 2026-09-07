import 'package:careconnect_mobile/models/accessibility_settings.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('defaults', () {
    test('ship in a configuration a deaf user can rely on', () {
      const AccessibilitySettings defaults = AccessibilitySettings.defaults;
      expect(defaults.visualAlertBanners, isTrue);
      expect(defaults.captionsEnabled, isTrue);
      expect(defaults.vibrationEnabled, isTrue);
      expect(defaults.smartEscalation, isTrue);
      expect(defaults.meetsHearingConstraints, isTrue);
    });

    test('match the values the prototype screenshots show', () {
      expect(AccessibilitySettings.defaults.volumePercent, 70);
      expect(AccessibilitySettings.defaults.balanceLabel, 'Centre');
      expect(AccessibilitySettings.defaults.captionSize, CaptionSize.medium);
      expect(AccessibilitySettings.defaults.captionColor, CaptionColor.white);
    });
  });

  group('CaptionSize', () {
    test('scales upwards through the three sizes', () {
      expect(CaptionSize.small.scale, lessThan(CaptionSize.medium.scale));
      expect(CaptionSize.medium.scale, lessThan(CaptionSize.large.scale));
    });

    test('fromName falls back to medium', () {
      expect(CaptionSize.fromName('large'), CaptionSize.large);
      expect(CaptionSize.fromName('gigantic'), CaptionSize.medium);
      expect(CaptionSize.fromName(null), CaptionSize.medium);
    });

    test('caption font size follows the chosen scale', () {
      const AccessibilitySettings base = AccessibilitySettings.defaults;
      expect(
        base.copyWith(captionSize: CaptionSize.large).captionFontSize,
        greaterThan(
          base.copyWith(captionSize: CaptionSize.small).captionFontSize,
        ),
      );
    });
  });

  group('CaptionColor', () {
    test('offers exactly the two choices the prototype shows', () {
      expect(
        CaptionColor.values.map((CaptionColor c) => c.label),
        <String>['White', 'Yellow'],
      );
    });

    test('carries opaque colours', () {
      for (final CaptionColor colour in CaptionColor.values) {
        // Top byte is the alpha channel; captions are never translucent.
        expect(colour.argb >> 24 & 0xFF, 0xFF);
      }
    });

    test('fromName falls back to white', () {
      expect(CaptionColor.fromName('yellow'), CaptionColor.yellow);
      expect(CaptionColor.fromName('chartreuse'), CaptionColor.white);
      expect(CaptionColor.fromName(null), CaptionColor.white);
    });
  });

  group('volume and balance', () {
    test('volume clamps to its range', () {
      expect(AccessibilitySettings.clampVolume(0.5), 0.5);
      expect(AccessibilitySettings.clampVolume(-2), 0.0);
      expect(AccessibilitySettings.clampVolume(9), 1.0);
      expect(AccessibilitySettings.clampVolume(double.nan), 0.0);
    });

    test('balance clamps to its range and treats NaN as centred', () {
      expect(AccessibilitySettings.clampBalance(-0.5), -0.5);
      expect(AccessibilitySettings.clampBalance(-9), -1.0);
      expect(AccessibilitySettings.clampBalance(9), 1.0);
      expect(AccessibilitySettings.clampBalance(double.nan), 0.0);
    });

    test('volume is reported as a whole percentage', () {
      const AccessibilitySettings base = AccessibilitySettings.defaults;
      expect(base.copyWith(alertVolume: 0.0).volumePercent, 0);
      expect(base.copyWith(alertVolume: 0.256).volumePercent, 26);
      expect(base.copyWith(alertVolume: 1.0).volumePercent, 100);
    });

    test('balance is written out with its side', () {
      const AccessibilitySettings base = AccessibilitySettings.defaults;
      expect(base.copyWith(audioBalance: 0.0).balanceLabel, 'Centre');
      expect(base.copyWith(audioBalance: -0.6).balanceLabel, '60% left');
      expect(base.copyWith(audioBalance: 0.25).balanceLabel, '25% right');
    });

    test('silence is a valid setting, because sound is never the only cue', () {
      final AccessibilitySettings silent =
          AccessibilitySettings.defaults.copyWith(alertVolume: 0);
      expect(silent.volumePercent, 0);
      expect(silent.meetsHearingConstraints, isTrue);
    });
  });

  group('copyWith', () {
    test('changes only the named field', () {
      final AccessibilitySettings updated =
          AccessibilitySettings.defaults.copyWith(captionsEnabled: false);
      expect(updated.captionsEnabled, isFalse);
      expect(updated.vibrationEnabled, isTrue);
      expect(updated.captionSize, CaptionSize.medium);
    });

    test('clamps a volume passed through it', () {
      expect(
        AccessibilitySettings.defaults.copyWith(alertVolume: 4.0).alertVolume,
        AccessibilitySettings.maxVolume,
      );
    });
  });

  group('conformance', () {
    test('is met by the defaults', () {
      expect(AccessibilitySettings.defaults.conformanceMessage,
          'Hearing-accessibility requirements met');
    });

    test('fails, and says why, when captions are switched off', () {
      final AccessibilitySettings settings =
          AccessibilitySettings.defaults.copyWith(captionsEnabled: false);
      expect(settings.meetsHearingConstraints, isFalse);
      expect(settings.conformanceMessage, contains('no text'));
    });
  });

  group('serialisation', () {
    test('round-trips through a map', () {
      final AccessibilitySettings original =
          AccessibilitySettings.defaults.copyWith(
        smartEscalation: false,
        captionsEnabled: false,
        captionSize: CaptionSize.large,
        captionColor: CaptionColor.yellow,
        alertVolume: 0.3,
        audioBalance: -0.5,
        vibrationEnabled: false,
      );
      final AccessibilitySettings restored =
          AccessibilitySettings.fromMap(original.toMap());
      expect(restored, equals(original));
      expect(restored.hashCode, original.hashCode);
    });

    test('an empty map yields the defaults', () {
      expect(
        AccessibilitySettings.fromMap(const <String, Object?>{}),
        AccessibilitySettings.defaults,
      );
    });

    test('values of the wrong type fall back instead of throwing', () {
      final AccessibilitySettings restored =
          AccessibilitySettings.fromMap(const <String, Object?>{
        'captionsEnabled': 'yes please',
        'alertVolume': 'loud',
        'captionSize': 42,
      });
      expect(restored, AccessibilitySettings.defaults);
    });

    test('a partially written store keeps the values it does have', () {
      final AccessibilitySettings restored =
          AccessibilitySettings.fromMap(const <String, Object?>{
        'vibrationEnabled': false,
      });
      expect(restored.vibrationEnabled, isFalse);
      expect(restored.captionsEnabled, isTrue);
    });

    test('an out-of-range stored volume is clamped on read', () {
      final AccessibilitySettings restored =
          AccessibilitySettings.fromMap(const <String, Object?>{
        'alertVolume': 12.0,
      });
      expect(restored.alertVolume, AccessibilitySettings.maxVolume);
    });

    test('the visual banner cannot be switched off through storage', () {
      // Editing the preference file by hand must not be a way around the
      // no-sound-only-alerts rule.
      final AccessibilitySettings restored =
          AccessibilitySettings.fromMap(const <String, Object?>{
        'visualAlertBanners': false,
      });
      expect(restored.visualAlertBanners, isTrue);
    });
  });

  group('equality', () {
    test('identical settings compare equal', () {
      expect(
        AccessibilitySettings.defaults,
        AccessibilitySettings.defaults.copyWith(),
      );
    });

    test('a single differing field breaks equality', () {
      expect(
        AccessibilitySettings.defaults ==
            AccessibilitySettings.defaults.copyWith(vibrationEnabled: false),
        isFalse,
      );
    });
  });
}
