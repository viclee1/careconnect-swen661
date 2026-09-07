import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../core/routing/routes.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/haptics.dart';
import '../../models/accessibility_settings.dart';
import '../../models/vibration_pattern.dart';
import '../../state/settings_controller.dart';
import '../../widgets/app_back_button.dart';
import '../../widgets/app_scaffold.dart';
import '../../widgets/responsive.dart';
import 'widgets/settings_section.dart';
import 'widgets/settings_slider_tile.dart';
import 'widgets/settings_switch_tile.dart';
import 'widgets/vibration_pattern_tile.dart';

/// The Accessibility Settings screen from the Week 3 prototype.
///
/// Every preference here serves one of the team's assigned hearing-impairment
/// constraints, and the screen is written so a user cannot configure their way
/// into a state where an alert would reach them by sound alone: the visible
/// banner is fixed on, and only the layers on top of it can be changed.
class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final SettingsController controller = context.watch<SettingsController>();
    final AccessibilitySettings settings = controller.settings;

    return AppScaffold(
      title: 'Accessibility Settings',
      subtitle: 'Adjust how CareConnect alerts and informs you',
      showSettingsAction: false,
      leading: const AppBackButton(tooltip: 'Back to contacts'),
      body: ReadableWidth(
        child: ListView(
          padding: const EdgeInsets.all(AppTheme.gutter),
          children: <Widget>[
            _ConformanceCard(settings: settings),
            const SizedBox(height: 20),

            // ── Visual Alerts ───────────────────────────────────────────
            SettingsSection(
              icon: Icons.visibility_outlined,
              title: 'Visual Alerts',
              description:
                  'What appears on screen when CareConnect needs you.',
              children: <Widget>[
                SettingsSwitchTile(
                  title: 'Visual alert banners',
                  description: 'Flashing banners for all notifications.',
                  value: settings.visualAlertBanners,
                  onChanged: (bool _) {},
                  locked: true,
                  lockedReason: 'Always on. Without a banner an alert could '
                      'reach you by sound alone, which this app will not do.',
                ),
                const Divider(height: 1, color: AppColors.border),
                SettingsSwitchTile(
                  title: 'Smart alert escalation',
                  description:
                      'Missed alerts are escalated automatically, so an alert '
                      'you did not see is passed to your care team.',
                  value: settings.smartEscalation,
                  onChanged: (bool value) =>
                      controller.setSmartEscalation(value),
                ),
              ],
            ),

            // ── Captions ────────────────────────────────────────────────
            SettingsSection(
              icon: Icons.closed_caption_outlined,
              title: 'Captions',
              description: 'Text for anything spoken aloud.',
              children: <Widget>[
                SettingsSwitchTile(
                  title: 'Show captions',
                  description: 'Text for all audio and video content.',
                  value: settings.captionsEnabled,
                  onChanged: (bool value) =>
                      controller.setCaptionsEnabled(value),
                ),
                const Divider(height: 1, color: AppColors.border),
                _CaptionSizeTile(
                  value: settings.captionSize,
                  enabled: settings.captionsEnabled,
                  onChanged: controller.setCaptionSize,
                ),
                const Divider(height: 1, color: AppColors.border),
                _CaptionColorTile(
                  value: settings.captionColor,
                  enabled: settings.captionsEnabled,
                  onChanged: controller.setCaptionColor,
                ),
                _CaptionPreview(settings: settings),
              ],
            ),

            // ── Audio ───────────────────────────────────────────────────
            SettingsSection(
              icon: Icons.volume_up_outlined,
              title: 'Audio',
              description:
                  'Sound is never the only way CareConnect tells you '
                  'something. These controls decide how much of it there is.',
              children: <Widget>[
                SettingsSliderTile(
                  title: 'Alert volume',
                  valueLabel: '${settings.volumePercent}%',
                  description:
                      'Use the pause button on any alert banner to stop the '
                      'sound instantly. You can also pause audio during video '
                      'calls from the in-call controls.',
                  value: settings.alertVolume,
                  min: AccessibilitySettings.minVolume,
                  max: AccessibilitySettings.maxVolume,
                  divisions: 10,
                  minLabel: '0%',
                  maxLabel: '100%',
                  onChanged: (double value) =>
                      controller.setAlertVolume(value),
                  semanticFormatter: (double v) =>
                      'Alert volume ${(v * 100).round()} per cent',
                ),
                const Divider(height: 1, color: AppColors.border),
                SettingsSliderTile(
                  title: 'Audio balance',
                  valueLabel: settings.balanceLabel,
                  description:
                      'Adjust sound between left and right. Useful with '
                      'hearing aids.',
                  value: settings.audioBalance,
                  min: AccessibilitySettings.minBalance,
                  max: AccessibilitySettings.maxBalance,
                  divisions: 8,
                  minLabel: 'L',
                  maxLabel: 'R',
                  onChanged: (double value) =>
                      controller.setAudioBalance(value),
                  semanticFormatter: (double v) {
                    final int magnitude = (v.abs() * 100).round();
                    if (magnitude == 0) return 'Audio balance centred';
                    final String side = v < 0 ? 'left' : 'right';
                    return 'Audio balance $magnitude per cent $side';
                  },
                ),
              ],
            ),

            // ── Vibration ───────────────────────────────────────────────
            SettingsSection(
              icon: Icons.vibration,
              title: 'Vibration',
              description:
                  'Each alert type has its own rhythm, so you can tell them '
                  'apart without looking at your phone.',
              children: <Widget>[
                SettingsSwitchTile(
                  title: 'Vibration alerts',
                  description: 'Vibrate for every notification.',
                  value: settings.vibrationEnabled,
                  onChanged: (bool value) =>
                      controller.setVibrationEnabled(value),
                ),
                const Divider(height: 1, color: AppColors.border),
                _PatternsHeading(enabled: settings.vibrationEnabled),
                for (final VibrationPattern pattern in VibrationPattern.values)
                  VibrationPatternTile(
                    pattern: pattern,
                    enabled: settings.vibrationEnabled,
                    onPreview: () => Haptics.play(
                      pattern,
                      enabled: settings.vibrationEnabled,
                    ),
                  ),
              ],
            ),

            // ── Account ─────────────────────────────────────────────────
            SettingsSection(
              icon: Icons.person_outline,
              title: 'Account',
              description: 'Margaret Whitfield · Care Recipient',
              children: <Widget>[
                _SignOutTile(onSignOut: () => _confirmSignOut(context)),
              ],
            ),

            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  /// Sign-out belongs to the authentication screens, which land on another
  /// branch. The control is present so the section matches the design; it says
  /// plainly that it is not wired up rather than failing silently.
  void _confirmSignOut(BuildContext context) {
    context.go(Routes.welcome);
  }
}

/// The conformance badge at the top of the prototype's screen.
///
/// It is live rather than decorative: switching captions off flips it, so the
/// screen tells the truth about the configuration instead of always claiming
/// to be compliant.
class _ConformanceCard extends StatelessWidget {
  const _ConformanceCard({required this.settings});

  final AccessibilitySettings settings;

  @override
  Widget build(BuildContext context) {
    final bool ok = settings.meetsHearingConstraints;
    final Color fill = ok ? AppColors.successFill : AppColors.warningFill;
    final Color ink = ok ? AppColors.successText : AppColors.warningText;

    return Semantics(
      container: true,
      liveRegion: true,
      label: ok
          ? 'WCAG 2.2 compliant. ${settings.conformanceMessage}'
          : 'Attention. ${settings.conformanceMessage}',
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(AppTheme.gutter),
        decoration: BoxDecoration(
          color: fill,
          borderRadius: BorderRadius.circular(AppTheme.radius),
          border: Border.all(color: ink, width: 1.5),
        ),
        child: ExcludeSemantics(
          child: Row(
            children: <Widget>[
              Icon(
                ok ? Icons.accessible_forward : Icons.warning_amber_rounded,
                size: 28,
                color: ink,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: <Widget>[
                    Text(
                      ok ? 'WCAG 2.2 Compliant' : 'Check your captions',
                      style: TextStyle(
                        fontSize: 17,
                        height: 1.3,
                        fontWeight: FontWeight.bold,
                        color: ink,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      settings.conformanceMessage,
                      style: TextStyle(fontSize: 15, height: 1.4, color: ink),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Caption size, as a three-way choice.
class _CaptionSizeTile extends StatelessWidget {
  const _CaptionSizeTile({
    required this.value,
    required this.enabled,
    required this.onChanged,
  });

  final CaptionSize value;
  final bool enabled;
  final ValueChanged<CaptionSize> onChanged;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text('Caption size', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 4),
          Text(
            enabled
                ? 'Currently ${value.label.toLowerCase()}.'
                : 'Captions are off, so the size cannot be changed yet.',
            style: Theme.of(context).textTheme.bodySmall,
          ),
          const SizedBox(height: 10),
          SegmentedButton<CaptionSize>(
            segments: CaptionSize.values
                .map(
                  (CaptionSize size) => ButtonSegment<CaptionSize>(
                    value: size,
                    label: Text(size.label),
                  ),
                )
                .toList(),
            selected: <CaptionSize>{value},
            showSelectedIcon: false,
            onSelectionChanged: enabled
                ? (Set<CaptionSize> selection) => onChanged(selection.first)
                : null,
          ),
        ],
      ),
    );
  }
}

/// Caption text colour, as a two-way choice.
class _CaptionColorTile extends StatelessWidget {
  const _CaptionColorTile({
    required this.value,
    required this.enabled,
    required this.onChanged,
  });

  final CaptionColor value;
  final bool enabled;
  final ValueChanged<CaptionColor> onChanged;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(
            'Caption text colour',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 4),
          Text(
            'Both choices clear WCAG 2.2 AA against the caption panel.',
            style: Theme.of(context).textTheme.bodySmall,
          ),
          const SizedBox(height: 10),
          SegmentedButton<CaptionColor>(
            segments: CaptionColor.values
                .map(
                  (CaptionColor colour) => ButtonSegment<CaptionColor>(
                    value: colour,
                    label: Text(colour.label),
                  ),
                )
                .toList(),
            selected: <CaptionColor>{value},
            showSelectedIcon: false,
            onSelectionChanged: enabled
                ? (Set<CaptionColor> selection) => onChanged(selection.first)
                : null,
          ),
        ],
      ),
    );
  }
}

/// A live sample of a caption at the chosen size and colour.
class _CaptionPreview extends StatelessWidget {
  const _CaptionPreview({required this.settings});

  final AccessibilitySettings settings;

  @override
  Widget build(BuildContext context) {
    final bool on = settings.captionsEnabled;

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 4, 16, 16),
      child: Semantics(
        label: on
            ? 'Caption preview, ${settings.captionSize.label.toLowerCase()} '
                '${settings.captionColor.label.toLowerCase()} text'
            : 'Caption preview. Captions are off.',
        child: ExcludeSemantics(
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.primaryDark,
              borderRadius: BorderRadius.circular(AppTheme.radius),
            ),
            child: Text(
              on
                  ? '[Preview] Reminder: Take your morning medication.'
                  : 'Captions are off. Nothing will appear here.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: settings.captionFontSize,
                height: 1.4,
                fontWeight: FontWeight.w600,
                color: on
                    ? Color(settings.captionColor.argb)
                    : AppColors.primaryLight,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// The "Vibration patterns — tap to preview" heading.
class _PatternsHeading extends StatelessWidget {
  const _PatternsHeading({required this.enabled});

  final bool enabled;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(
            'Vibration patterns',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          Text(
            enabled
                ? 'Tap a rhythm to feel it.'
                : 'Turn vibration on above to feel these.',
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ],
      ),
    );
  }
}

/// The Account section's single control.
class _SignOutTile extends StatelessWidget {
  const _SignOutTile({required this.onSignOut});

  final VoidCallback onSignOut;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: OutlinedButton.icon(
        onPressed: onSignOut,
        icon: const Icon(Icons.logout),
        style: OutlinedButton.styleFrom(
          minimumSize: const Size(double.infinity, AppTheme.minTouchTarget),
          foregroundColor: AppColors.errorText,
          side: const BorderSide(color: AppColors.errorText, width: 1.5),
        ),
        label: const Text('Sign out'),
      ),
    );
  }
}
