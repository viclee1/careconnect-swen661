import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AlertBanner } from '../components/AlertBanner';
import { AppButton } from '../components/AppButton';
import { AppHeader } from '../components/AppHeader';
import { ReadableWidth } from '../components/ReadableWidth';
import {
  balanceLabel,
  balanceRange,
  captionColors,
  captionFontSize,
  captionSizes,
  conformanceMessage,
  meetsHearingConstraints,
  volumePercent,
  volumeRange,
  type CaptionColor,
  type CaptionSize,
} from '../models/accessibilitySettings';
import { vibrationPatterns } from '../models/vibrationPattern';
import { useSettings } from '../state/SettingsProvider';
import { colors } from '../theme/colors';
import { layout } from '../theme/layout';
import { type } from '../theme/typography';
import { playPattern } from '../utils/haptics';
import { SegmentedChoice } from './settings/SegmentedChoice';
import { SettingsSection } from './settings/SettingsSection';
import { SettingsSliderRow } from './settings/SettingsSliderRow';
import { SettingsSwitchRow } from './settings/SettingsSwitchRow';
import { VibrationPatternRow } from './settings/VibrationPatternRow';

/**
 * The Accessibility Settings screen from the Week 3 prototype.
 *
 * Every preference here serves one of the team's assigned hearing-impairment
 * constraints, and the screen is written so a user cannot configure their way
 * into a state where an alert would reach them by sound alone: the visible
 * banner is fixed on, and only the layers on top of it can be changed.
 */
export function SettingsScreen({
  onBack,
  onSignOut,
}: {
  onBack: () => void;
  onSignOut?: () => void;
}) {
  const { settings, update } = useSettings();
  const [signOutNotice, setSignOutNotice] = useState(false);

  const compliant = meetsHearingConstraints(settings);
  const captionsOn = settings.captionsEnabled;

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Accessibility Settings"
        subtitle="Adjust how CareConnect alerts and informs you"
        onBack={onBack}
        backLabel="Back to contacts"
      />

      <ReadableWidth>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Live rather than decorative: switching captions off flips it, so
              the screen tells the truth about the configuration instead of
              always claiming to be compliant. */}
          <AlertBanner
            tone={compliant ? 'success' : 'warning'}
            icon={compliant ? 'accessible-forward' : 'warning-amber'}
            title={compliant ? 'WCAG 2.2 Compliant' : 'Check your captions'}
            message={conformanceMessage(settings)}
          />

          <View style={styles.spacer} />

          <SettingsSection
            icon="visibility"
            title="Visual Alerts"
            description="What appears on screen when CareConnect needs you."
          >
            <SettingsSwitchRow
              testID="switch-banners"
              title="Visual alert banners"
              description="Flashing banners for all notifications."
              value={settings.visualAlertBanners}
              onValueChange={() => undefined}
              locked
              lockedReason="Always on. Without a banner an alert could reach you by sound alone, which this app will not do."
            />
            <View style={styles.divider} />
            <SettingsSwitchRow
              testID="switch-escalation"
              title="Smart alert escalation"
              description="Missed alerts are escalated automatically, so an alert you did not see is passed to your care team."
              value={settings.smartEscalation}
              onValueChange={(next) => void update({ smartEscalation: next })}
            />
          </SettingsSection>

          <SettingsSection
            icon="closed-caption"
            title="Captions"
            description="Text for anything spoken aloud."
          >
            <SettingsSwitchRow
              testID="switch-captions"
              title="Show captions"
              description="Text for all audio and video content."
              value={settings.captionsEnabled}
              onValueChange={(next) => void update({ captionsEnabled: next })}
            />
            <View style={styles.divider} />

            <View style={styles.choiceBlock}>
              <Text style={styles.choiceTitle}>Caption size</Text>
              <Text style={styles.choiceHint}>
                {captionsOn
                  ? `Currently ${captionSizes[settings.captionSize].label.toLowerCase()}.`
                  : 'Captions are off, so the size cannot be changed yet.'}
              </Text>
              <SegmentedChoice<CaptionSize>
                groupLabel="Caption size"
                value={settings.captionSize}
                disabled={!captionsOn}
                onChange={(next) => void update({ captionSize: next })}
                segments={(Object.keys(captionSizes) as CaptionSize[]).map((key) => ({
                  value: key,
                  label: captionSizes[key].label,
                }))}
              />
            </View>

            <View style={styles.choiceBlock}>
              <Text style={styles.choiceTitle}>Caption text colour</Text>
              <Text style={styles.choiceHint}>
                Both choices clear WCAG 2.2 AA against the caption panel.
              </Text>
              <SegmentedChoice<CaptionColor>
                groupLabel="Caption text colour"
                value={settings.captionColor}
                disabled={!captionsOn}
                onChange={(next) => void update({ captionColor: next })}
                segments={(Object.keys(captionColors) as CaptionColor[]).map((key) => ({
                  value: key,
                  label: captionColors[key].label,
                }))}
              />
            </View>

            <View style={styles.previewBlock}>
              <View
                style={styles.preview}
                accessibilityLabel={
                  captionsOn
                    ? `Caption preview, ${captionSizes[settings.captionSize].label.toLowerCase()} ${captionColors[settings.captionColor].label.toLowerCase()} text`
                    : 'Caption preview. Captions are off.'
                }
              >
                <Text
                  testID="caption-preview"
                  style={[
                    styles.previewText,
                    {
                      fontSize: captionFontSize(settings),
                      color: captionsOn
                        ? captionColors[settings.captionColor].hex
                        : colors.primaryLight,
                    },
                  ]}
                >
                  {captionsOn
                    ? '[Preview] Reminder: Take your morning medication.'
                    : 'Captions are off. Nothing will appear here.'}
                </Text>
              </View>
            </View>
          </SettingsSection>

          <SettingsSection
            icon="volume-up"
            title="Audio"
            description="Sound is never the only way CareConnect tells you something. These controls decide how much of it there is."
          >
            <SettingsSliderRow
              testID="slider-volume"
              title="Alert volume"
              valueLabel={`${volumePercent(settings)}%`}
              description="Use the pause button on any alert banner to stop the sound instantly. You can also pause audio during video calls from the in-call controls."
              value={settings.alertVolume}
              minimumValue={volumeRange.min}
              maximumValue={volumeRange.max}
              step={0.1}
              minLabel="0%"
              maxLabel="100%"
              onValueChange={(next) => void update({ alertVolume: next })}
              accessibilityValueText={`Alert volume ${volumePercent(settings)} per cent`}
            />
            <View style={styles.divider} />
            <SettingsSliderRow
              testID="slider-balance"
              title="Audio balance"
              valueLabel={balanceLabel(settings)}
              description="Adjust sound between left and right. Useful with hearing aids."
              value={settings.audioBalance}
              minimumValue={balanceRange.min}
              maximumValue={balanceRange.max}
              step={0.25}
              minLabel="L"
              maxLabel="R"
              onValueChange={(next) => void update({ audioBalance: next })}
              accessibilityValueText={`Audio balance ${balanceLabel(settings)}`}
            />
          </SettingsSection>

          <SettingsSection
            icon="vibration"
            title="Vibration"
            description="Each alert type has its own rhythm, so you can tell them apart without looking at your phone."
          >
            <SettingsSwitchRow
              testID="switch-vibration"
              title="Vibration alerts"
              description="Vibrate for every notification."
              value={settings.vibrationEnabled}
              onValueChange={(next) => void update({ vibrationEnabled: next })}
            />
            <View style={styles.divider} />
            <View style={styles.choiceBlock}>
              <Text style={styles.choiceTitle}>Vibration patterns</Text>
              <Text style={styles.choiceHint}>
                {settings.vibrationEnabled
                  ? 'Tap a rhythm to feel it.'
                  : 'Turn vibration on above to feel these.'}
              </Text>
            </View>
            {vibrationPatterns.map((pattern) => (
              <VibrationPatternRow
                key={pattern.id}
                pattern={pattern}
                enabled={settings.vibrationEnabled}
                onPreview={() => void playPattern(pattern, settings.vibrationEnabled)}
              />
            ))}
          </SettingsSection>

          <SettingsSection
            icon="person-outline"
            title="Account"
            description="Margaret Whitfield · Care Recipient"
          >
            <View style={styles.accountBlock}>
              <AppButton
                label="Sign out"
                icon="logout"
                variant="outlined"
                tone={colors.errorText}
                fullWidth
                onPress={onSignOut ?? (() => setSignOutNotice(true))}
              />
              {signOutNotice ? (
                <View style={{ marginTop: 16 }}>
                  <AlertBanner
                    tone="info"
                    icon="logout"
                    title="Sign out is not ready yet"
                    message="Signing out arrives with the login and signup screens, which are being built on another branch. Nothing has changed."
                    action={<AppButton label="OK" onPress={() => setSignOutNotice(false)} />}
                  />
                </View>
              ) : null}
            </View>
          </SettingsSection>
        </ScrollView>
      </ReadableWidth>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.primaryLight },
  content: { padding: layout.gutter, paddingBottom: 40 },
  spacer: { height: 20 },
  divider: { height: 1, backgroundColor: colors.border },
  choiceBlock: { paddingHorizontal: 16, paddingVertical: 14, gap: 6 },
  choiceTitle: { ...type.rowTitle, color: colors.primaryDark },
  choiceHint: { ...type.bodySmall, color: colors.secondaryDark, marginBottom: 4 },
  previewBlock: { paddingHorizontal: 16, paddingBottom: 16 },
  preview: {
    borderRadius: layout.radius,
    backgroundColor: colors.primaryDark,
    padding: 14,
  },
  previewText: { fontWeight: '600', textAlign: 'center' },
  accountBlock: { padding: 16 },
});
