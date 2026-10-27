import { useState } from 'react';
import {
  Captions,
  Eye,
  LogOut,
  Monitor,
  Siren,
  Smartphone,
  Vibrate,
  Volume2,
  Zap,
} from 'lucide-react';

import Banner from '../components/Banner';
import Button from '../components/Button';
import VisualFlash from '../components/messaging/VisualFlash';
import FlashCueRow from '../components/settings/FlashCueRow';
import SegmentedChoice from '../components/settings/SegmentedChoice';
import SettingsSection from '../components/settings/SettingsSection';
import SettingsSliderRow from '../components/settings/SettingsSliderRow';
import SettingsSwitchRow from '../components/settings/SettingsSwitchRow';
import VibrationPatternRow from '../components/settings/VibrationPatternRow';
import { useAuth } from '../auth/AuthContext';
import { useSettings } from '../context/settings';
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
import { flashCueMessage, flashCues, type FlashCue } from '../models/flashCue';
import { vibrationPatterns } from '../models/vibrationPattern';
import { enableDesktopNotifications, notificationProblem } from '../utils/notifications';

/** Caption panel backing; white and yellow text both exceed 8:1 on it. */
const CAPTION_PANEL = '#0F5272';

/**
 * Accessibility Settings.
 *
 * Every preference serves one of the team's assigned hearing-impairment
 * constraints, and the page will not let a user configure their way into an
 * alert that reaches them by sound alone: the visual banner is fixed on, and
 * only the layers on top of it — screen flash, vibration, sound — can change.
 * Preferences are saved in this browser and work offline.
 *
 * The sections, their order and their wording follow the Week 11 web design,
 * which matches the desktop, React Native and Flutter clients.
 */
export default function AccessibilitySettings() {
  const { settings, update } = useSettings();
  const { user, signOut } = useAuth();
  const [flash, setFlash] = useState<{ cue: FlashCue; trigger: number } | null>(null);
  const [notificationNote, setNotificationNote] = useState<string | null>(null);

  const compliant = meetsHearingConstraints(settings);
  const captionsOn = settings.captionsEnabled;
  const sizeLabel = captionSizes[settings.captionSize].label.toLowerCase();
  const colourLabel = captionColors[settings.captionColor].label.toLowerCase();

  function previewFlash(cue: FlashCue) {
    setFlash((current) => ({ cue, trigger: (current?.trigger ?? 0) + 1 }));
  }

  async function changeDesktopNotifications(next: boolean) {
    setNotificationNote(null);
    if (!next) {
      update({ desktopNotifications: false });
      return;
    }
    const outcome = await enableDesktopNotifications();
    update({ desktopNotifications: outcome === 'granted' });
    setNotificationNote(notificationProblem(outcome));
  }

  return (
    <div className="space-y-5 page-container max-w-4xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-normal text-neutral-800">Accessibility Settings</h1>
        <p className="text-neutral-600 mt-1">Adjust how CareConnect alerts and informs you</p>
      </div>

      {/* Live rather than decorative: switching captions off flips it. */}
      <Banner
        variant={compliant ? 'success' : 'warning'}
        title={compliant ? 'WCAG 2.2 Compliant' : 'Check your captions'}
      >
        {conformanceMessage(settings)}
      </Banner>

      <SettingsSection title="Visual Alerts">
        <SettingsSwitchRow
          Icon={Eye}
          tone="warm"
          testId="switch-banners"
          title="Visual alert banners"
          description="Flashing banners for all notifications."
          value={settings.visualAlertBanners}
          onValueChange={() => undefined}
          locked
          lockedReason="Always on — an alert could reach you by sound alone without it, which this application will not do."
        />
        <SettingsSwitchRow
          Icon={Siren}
          tone="alert"
          testId="switch-escalation"
          title="Smart alert escalation"
          description="Missed alerts are escalated automatically to your care team."
          value={settings.smartEscalation}
          onValueChange={(next) => update({ smartEscalation: next })}
        />
      </SettingsSection>

      <SettingsSection title="Captions">
        <SettingsSwitchRow
          Icon={Captions}
          tone="calm"
          testId="switch-captions"
          title="Show captions"
          description="Text for all audio and video content."
          value={settings.captionsEnabled}
          onValueChange={(next) => update({ captionsEnabled: next })}
        />

        <div className="py-3 space-y-4">
          <SegmentedChoice<CaptionSize>
            name="caption-size"
            legend="Caption size"
            value={settings.captionSize}
            disabled={!captionsOn}
            onChange={(next) => update({ captionSize: next })}
            segments={(Object.keys(captionSizes) as CaptionSize[]).map((key) => ({
              value: key,
              label: captionSizes[key].label,
            }))}
          />
          <SegmentedChoice<CaptionColor>
            name="caption-colour"
            legend="Caption text colour"
            value={settings.captionColor}
            disabled={!captionsOn}
            onChange={(next) => update({ captionColor: next })}
            segments={(Object.keys(captionColors) as CaptionColor[]).map((key) => ({
              value: key,
              label: captionColors[key].label,
            }))}
          />

          <figure className="m-0">
            <figcaption className="text-sm font-semibold text-neutral-700 mb-1">
              Caption preview{captionsOn ? ` — ${sizeLabel}, ${colourLabel} text` : ''}
            </figcaption>
            <div className="rounded-xl px-4 py-4" style={{ backgroundColor: CAPTION_PANEL }}>
              <p
                data-testid="caption-preview"
                className="font-semibold leading-snug m-0"
                style={{
                  fontSize: `${captionFontSize(settings)}px`,
                  color: captionsOn ? captionColors[settings.captionColor].hex : '#d1eaf4',
                }}
              >
                {captionsOn
                  ? '[Preview] Reminder: Take your morning medication.'
                  : 'Captions are off. Nothing will appear here.'}
              </p>
            </div>
          </figure>
          <p className="text-sm text-neutral-600">
            {captionsOn
              ? 'Both colours clear WCAG 2.2 AA against the caption panel.'
              : 'Captions are off, so the size cannot be changed yet.'}
          </p>
        </div>
      </SettingsSection>

      <SettingsSection title="Audio">
        <SettingsSliderRow
          Icon={Volume2}
          tone="success"
          testId="slider-volume"
          title="Alert volume"
          valueLabel={`${volumePercent(settings)}%`}
          description="Sound is never the only way CareConnect tells you something. Use the pause button on any alert banner to stop the sound instantly, or pause audio during a video call from the in-call controls."
          value={settings.alertVolume}
          min={volumeRange.min}
          max={volumeRange.max}
          step={0.1}
          minLabel="0%"
          maxLabel="100%"
          onValueChange={(next) => update({ alertVolume: next })}
          valueText={`Alert volume ${volumePercent(settings)} per cent`}
        />
        <SettingsSliderRow
          testId="slider-balance"
          title="Audio balance"
          valueLabel={balanceLabel(settings)}
          description="Adjust sound between left and right — useful with hearing aids."
          value={settings.audioBalance}
          min={balanceRange.min}
          max={balanceRange.max}
          step={0.25}
          minLabel="Left"
          maxLabel="Right"
          onValueChange={(next) => update({ audioBalance: next })}
          valueText={`Audio balance ${balanceLabel(settings)}`}
        />
      </SettingsSection>

      <SettingsSection title="Screen Flash & Desktop Alerts">
        <SettingsSwitchRow
          Icon={Zap}
          tone="warm"
          testId="switch-screen-flash"
          title="Screen flash alerts"
          description="Flash the whole screen for every notification."
          value={settings.screenFlashEnabled}
          onValueChange={(next) => update({ screenFlashEnabled: next })}
        />
        <div className="py-3 space-y-2">
          <h3 className="text-sm font-semibold text-neutral-700">Flash cues — choose one to preview it</h3>
          <ul className="list-none p-0 m-0 space-y-2" aria-label="Flash cues">
            {flashCues.map((cue) => (
              <FlashCueRow
                key={cue.id}
                cue={cue}
                enabled={settings.screenFlashEnabled}
                onPreview={previewFlash}
              />
            ))}
          </ul>
          <p className="text-sm text-neutral-600">
            {settings.screenFlashEnabled
              ? 'Each alert type flashes a different colour so you can tell them apart at a glance — no sound needed. The alert’s name is always shown too.'
              : 'Turn screen flash alerts on above to preview these.'}
          </p>
        </div>
        <SettingsSwitchRow
          Icon={Monitor}
          tone="calm"
          testId="switch-desktop-notifications"
          title="Desktop notifications"
          description={
            notificationNote ?? 'Show a notification even when CareConnect is in the background.'
          }
          value={settings.desktopNotifications}
          onValueChange={(next) => void changeDesktopNotifications(next)}
        />
        <SettingsSwitchRow
          Icon={Smartphone}
          tone="success"
          testId="switch-connected-devices"
          title="Alert my connected devices"
          description="Also flash a smart light and notify your phone and watch."
          value={settings.connectedDevices}
          onValueChange={(next) => update({ connectedDevices: next })}
        />
      </SettingsSection>

      <SettingsSection title="Vibration">
        <SettingsSwitchRow
          Icon={Vibrate}
          tone="violet"
          testId="switch-vibration"
          title="Vibration alerts"
          description="Vibrate your phone for every notification."
          value={settings.vibrationEnabled}
          onValueChange={(next) => update({ vibrationEnabled: next })}
        />
        <div className="py-3 space-y-2">
          <h3 className="text-sm font-semibold text-neutral-700">Vibration patterns</h3>
          <p className="text-sm text-neutral-600">
            {settings.vibrationEnabled
              ? 'Each alert has its own rhythm, so you can tell them apart with your phone in a pocket. Choose Play to feel it on a phone, or watch the lamp pulse on a computer.'
              : 'Turn vibration on above to play these.'}
          </p>
          <ul className="list-none p-0 m-0 space-y-2" aria-label="Vibration patterns">
            {vibrationPatterns.map((pattern) => (
              <VibrationPatternRow key={pattern.id} pattern={pattern} enabled={settings.vibrationEnabled} />
            ))}
          </ul>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Account"
        description={`${user?.name ?? 'Margaret Whitfield'} · Care Recipient`}
      >
        <div className="pt-3">
          {/* Danger variant: asks in a dialog first, as the header's sign-out
              does not — leaving by accident from a settings page is easy. */}
          <Button
            variant="danger"
            icon={<LogOut className="w-5 h-5" />}
            onClick={signOut}
            className="w-full"
            confirmTitle="Sign out of CareConnect?"
            confirmDescription="Your messages and settings stay saved on this device."
            confirmLabel="Sign out"
          >
            Sign out
          </Button>
        </div>
      </SettingsSection>

      {flash && (
        <VisualFlash
          trigger={flash.trigger}
          tone={flash.cue.tone}
          flashes={flash.cue.flashes}
          message={flashCueMessage(flash.cue)}
        />
      )}
    </div>
  );
}
