import { useEffect, useState } from 'react';

import { AlertBanner } from '../components/AlertBanner';
import { Button } from '../components/Button';
import { PageHeader } from '../components/PageHeader';
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
import { useNavigation } from '../navigation/NavigationProvider';
import { useCommand } from '../platform/CommandProvider';
import { colors } from '../theme/colors';
import { useSettings } from '../state/SettingsProvider';
import { SegmentedChoice } from './settings/SegmentedChoice';
import { SettingsSection } from './settings/SettingsSection';
import { SettingsSliderRow } from './settings/SettingsSliderRow';
import { SettingsSwitchRow } from './settings/SettingsSwitchRow';
import { VibrationPatternRow } from './settings/VibrationPatternRow';

/**
 * The Accessibility Settings page from the Week 3 prototype.
 *
 * Every preference here serves one of the team's assigned hearing-impairment
 * constraints, and the page is written so a user cannot configure their way
 * into a state where an alert would reach them by sound alone: the visible
 * banner is fixed on, and only the layers on top of it can be changed.
 *
 * On desktop the preferences are written by the main process to a JSON file in
 * the user's application-data directory, so they survive a restart and are not
 * tied to a browser profile. That round trip is the one place the renderer
 * touches the filesystem, and it does so only through the typed IPC bridge.
 */
export function SettingsPage() {
  const { settings, update } = useSettings();
  const { navigate, back, canGoBack } = useNavigation();
  const [signOutNotice, setSignOutNotice] = useState(false);

  const compliant = meetsHearingConstraints(settings);
  const captionsOn = settings.captionsEnabled;

  const goBack = () => {
    if (canGoBack) back();
    else navigate({ name: 'Contacts' });
  };

  useCommand('navigate:back', goBack);

  // The page's own title is the first thing a returning screen-reader user
  // should hear, and a fresh render does not move focus on its own.
  useEffect(() => {
    document.title = 'Accessibility Settings — CareConnect';
    return () => {
      document.title = 'CareConnect';
    };
  }, []);

  return (
    <>
      <PageHeader
        title="Accessibility Settings"
        subtitle="Adjust how CareConnect alerts and informs you"
        onBack={goBack}
        backLabel="Back"
      />

      <div
        className="page-body"
        onKeyDown={(event) => {
          if (event.key === 'Escape') goBack();
        }}
      >
        <div className="readable stack">
          {/* Live rather than decorative: switching captions off flips it, so
              the page tells the truth about the configuration instead of
              always claiming to be compliant. */}
          <AlertBanner
            tone={compliant ? 'success' : 'warning'}
            icon={compliant ? 'accessibility' : 'warning'}
            title={compliant ? 'WCAG 2.2 Compliant' : 'Check your captions'}
            message={conformanceMessage(settings)}
          />

          <div>
            <SettingsSection
              icon="visibility"
              title="Visual Alerts"
              description="What appears on screen when CareConnect needs you."
            >
              <SettingsSwitchRow
                testId="switch-banners"
                title="Visual alert banners"
                description="Flashing banners for all notifications."
                value={settings.visualAlertBanners}
                onValueChange={() => undefined}
                locked
                lockedReason="Always on. Without a banner an alert could reach you by sound alone, which this application will not do."
              />
              <SettingsSwitchRow
                testId="switch-escalation"
                title="Smart alert escalation"
                description="Missed alerts are escalated automatically, so an alert you did not see is passed to your care team."
                value={settings.smartEscalation}
                onValueChange={(next) => void update({ smartEscalation: next })}
              />
            </SettingsSection>

            <SettingsSection
              icon="captions"
              title="Captions"
              description="Text for anything spoken aloud."
            >
              <SettingsSwitchRow
                testId="switch-captions"
                title="Show captions"
                description="Text for all audio and video content."
                value={settings.captionsEnabled}
                onValueChange={(next) => void update({ captionsEnabled: next })}
              />

              <div className="settings-block">
                <span className="settings-block__title">Caption size</span>
                <p className="settings-block__hint">
                  {captionsOn
                    ? `Currently ${captionSizes[settings.captionSize].label.toLowerCase()}.`
                    : 'Captions are off, so the size cannot be changed yet.'}
                </p>
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
              </div>

              <div className="settings-block">
                <span className="settings-block__title">Caption text colour</span>
                <p className="settings-block__hint">
                  Both choices clear WCAG 2.2 AA against the caption panel.
                </p>
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
              </div>

              <div className="settings-block">
                <div
                  className="caption-preview"
                  role="img"
                  aria-label={
                    captionsOn
                      ? `Caption preview, ${captionSizes[settings.captionSize].label.toLowerCase()} ${captionColors[settings.captionColor].label.toLowerCase()} text`
                      : 'Caption preview. Captions are off.'
                  }
                >
                  <p
                    data-testid="caption-preview"
                    className="caption-preview__text"
                    style={{
                      fontSize: `${captionFontSize(settings)}px`,
                      color: captionsOn
                        ? captionColors[settings.captionColor].hex
                        : colors.primaryLight,
                    }}
                  >
                    {captionsOn
                      ? '[Preview] Reminder: Take your morning medication.'
                      : 'Captions are off. Nothing will appear here.'}
                  </p>
                </div>
              </div>
            </SettingsSection>

            <SettingsSection
              icon="volume"
              title="Audio"
              description="Sound is never the only way CareConnect tells you something. These controls decide how much of it there is."
            >
              <SettingsSliderRow
                testId="slider-volume"
                title="Alert volume"
                valueLabel={`${volumePercent(settings)}%`}
                description="Use the pause button on any alert banner to stop the sound instantly. You can also pause audio during video calls from the in-call controls."
                value={settings.alertVolume}
                min={volumeRange.min}
                max={volumeRange.max}
                step={0.1}
                minLabel="0%"
                maxLabel="100%"
                onValueChange={(next) => void update({ alertVolume: next })}
                valueText={`Alert volume ${volumePercent(settings)} per cent`}
              />
              <SettingsSliderRow
                testId="slider-balance"
                title="Audio balance"
                valueLabel={balanceLabel(settings)}
                description="Adjust sound between left and right. Useful with hearing aids."
                value={settings.audioBalance}
                min={balanceRange.min}
                max={balanceRange.max}
                step={0.25}
                minLabel="L"
                maxLabel="R"
                onValueChange={(next) => void update({ audioBalance: next })}
                valueText={`Audio balance ${balanceLabel(settings)}`}
              />
            </SettingsSection>

            <SettingsSection
              icon="notify"
              title="Vibration"
              description="Each alert type has its own rhythm on your phone, so you can tell them apart without looking at it. This computer has no vibration motor, so the rhythms play back here as a visual pulse."
            >
              <SettingsSwitchRow
                testId="switch-vibration"
                title="Vibration alerts"
                description="Vibrate for every notification."
                value={settings.vibrationEnabled}
                onValueChange={(next) => void update({ vibrationEnabled: next })}
              />

              <div className="settings-block">
                <span className="settings-block__title">Vibration patterns</span>
                <p className="settings-block__hint">
                  {settings.vibrationEnabled
                    ? 'Choose a rhythm to watch it play.'
                    : 'Turn vibration on above to play these.'}
                </p>
              </div>

              {vibrationPatterns.map((pattern) => (
                <VibrationPatternRow
                  key={pattern.id}
                  pattern={pattern}
                  enabled={settings.vibrationEnabled}
                />
              ))}
            </SettingsSection>

            <SettingsSection
              icon="person"
              title="Account"
              description="Margaret Whitfield · Care Recipient"
            >
              <div className="settings-block">
                <Button
                  label="Sign out"
                  icon="signOut"
                  variant="danger"
                  fullWidth
                  onClick={() => setSignOutNotice(true)}
                />
                {signOutNotice ? (
                  <div style={{ marginTop: '1rem' }}>
                    <AlertBanner
                      tone="info"
                      icon="signOut"
                      title="Sign out is not ready yet"
                      message="Signing out arrives with the Welcome, Sign In and Sign Up pages, which are being built on another branch. Nothing has changed."
                      action={<Button label="OK" onClick={() => setSignOutNotice(false)} />}
                    />
                  </div>
                ) : null}
              </div>
            </SettingsSection>
          </div>
        </div>
      </div>
    </>
  );
}
