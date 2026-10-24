import { Captions, Eye, RotateCcw, Vibrate, Volume2 } from 'lucide-react';

import Banner from '../components/Banner';
import Button from '../components/Button';
import SegmentedChoice from '../components/settings/SegmentedChoice';
import SettingsSection from '../components/settings/SettingsSection';
import SettingsSliderRow from '../components/settings/SettingsSliderRow';
import SettingsSwitchRow from '../components/settings/SettingsSwitchRow';
import VibrationPatternRow from '../components/settings/VibrationPatternRow';
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
import { vibrationPatterns } from '../models/vibrationPattern';

/** Caption panel backing; white and yellow text both exceed 8:1 on it. */
const CAPTION_PANEL = '#0F5272';

/**
 * Accessibility Settings.
 *
 * Every preference serves one of the team's assigned hearing-impairment
 * constraints, and the page will not let a user configure their way into an
 * alert that reaches them by sound alone: the visual banner is fixed on, and
 * only the layers on top of it can change. Preferences are saved in this
 * browser and work offline.
 */
export default function AccessibilitySettings() {
  const { settings, update, reset } = useSettings();
  const compliant = meetsHearingConstraints(settings);
  const captionsOn = settings.captionsEnabled;
  const sizeLabel = captionSizes[settings.captionSize].label.toLowerCase();
  const colourLabel = captionColors[settings.captionColor].label.toLowerCase();

  return (
    <div className="space-y-8 page-container max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">Accessibility Settings</h1>
        <p className="text-neutral-600 mt-1">Adjust how CareConnect alerts and informs you</p>
      </div>

      {/* Live rather than decorative: switching captions off flips it. */}
      <Banner
        variant={compliant ? 'success' : 'warning'}
        title={compliant ? 'WCAG 2.2 compliant' : 'Check your captions'}
      >
        {conformanceMessage(settings)}
      </Banner>

      <SettingsSection
        Icon={Eye}
        title="Visual alerts"
        description="What appears on screen when CareConnect needs you."
      >
        <SettingsSwitchRow
          testId="switch-banners"
          title="Visual alert banners"
          description="Flashing banners for all notifications."
          value={settings.visualAlertBanners}
          onValueChange={() => undefined}
          locked
          lockedReason="Always on. Without a banner an alert could reach you by sound alone, which CareConnect will not do."
        />
        <SettingsSwitchRow
          testId="switch-escalation"
          title="Smart alert escalation"
          description="Alerts you miss are passed to your care team automatically."
          value={settings.smartEscalation}
          onValueChange={(next) => update({ smartEscalation: next })}
        />
      </SettingsSection>

      <SettingsSection Icon={Captions} title="Captions" description="Text for anything spoken aloud.">
        <SettingsSwitchRow
          testId="switch-captions"
          title="Show captions"
          description="Text for all audio and video content."
          value={settings.captionsEnabled}
          onValueChange={(next) => update({ captionsEnabled: next })}
        />

        <div className="p-4 space-y-4">
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
          {!captionsOn && (
            <p className="text-sm text-neutral-600">
              Captions are off, so size and colour cannot be changed yet.
            </p>
          )}

          <figure className="m-0">
            <figcaption className="text-sm font-semibold text-neutral-700 mb-1">
              Caption preview{captionsOn ? ` — ${sizeLabel}, ${colourLabel} text` : ''}
            </figcaption>
            <div className="rounded-lg px-4 py-5" style={{ backgroundColor: CAPTION_PANEL }}>
              <p
                data-testid="caption-preview"
                className="font-semibold leading-snug m-0"
                style={{
                  fontSize: `${captionFontSize(settings)}px`,
                  color: captionsOn ? captionColors[settings.captionColor].hex : '#d1eaf4',
                }}
              >
                {captionsOn
                  ? 'Reminder: take your morning medication.'
                  : 'Captions are off. Nothing will appear here.'}
              </p>
            </div>
          </figure>
        </div>
      </SettingsSection>

      <SettingsSection
        Icon={Volume2}
        title="Audio"
        description="Sound is never the only way CareConnect tells you something. These controls decide how much of it there is."
      >
        <SettingsSliderRow
          testId="slider-volume"
          title="Alert volume"
          valueLabel={`${volumePercent(settings)}%`}
          description="Zero is fine: the banner and vibration still arrive. Every alert banner also has a pause button."
          value={settings.alertVolume}
          min={volumeRange.min}
          max={volumeRange.max}
          step={0.1}
          minLabel="0%"
          maxLabel="100%"
          onValueChange={(next) => update({ alertVolume: next })}
          valueText={`${volumePercent(settings)} per cent`}
        />
        <SettingsSliderRow
          testId="slider-balance"
          title="Audio balance"
          valueLabel={balanceLabel(settings)}
          description="Move sound between left and right. Useful with a hearing aid in one ear."
          value={settings.audioBalance}
          min={balanceRange.min}
          max={balanceRange.max}
          step={0.25}
          minLabel="Left"
          maxLabel="Right"
          onValueChange={(next) => update({ audioBalance: next })}
          valueText={balanceLabel(settings)}
        />
      </SettingsSection>

      <SettingsSection
        Icon={Vibrate}
        title="Vibration"
        description="Each alert type has its own rhythm, so you can tell them apart without looking. Play one to see it pulse — and, on a phone, feel it."
      >
        <SettingsSwitchRow
          testId="switch-vibration"
          title="Vibration alerts"
          description="Vibrate for every notification."
          value={settings.vibrationEnabled}
          onValueChange={(next) => update({ vibrationEnabled: next })}
        />
        <div className="px-4 pt-4">
          <h3 className="text-base font-semibold text-neutral-800">Vibration patterns</h3>
          <p className="text-sm text-neutral-600">
            {settings.vibrationEnabled
              ? 'Choose a rhythm to play it.'
              : 'Turn vibration on above to play these.'}
          </p>
        </div>
        {vibrationPatterns.map((pattern) => (
          <VibrationPatternRow key={pattern.id} pattern={pattern} enabled={settings.vibrationEnabled} />
        ))}
      </SettingsSection>

      <div className="pt-2">
        <Button
          variant="danger"
          icon={<RotateCcw className="w-5 h-5" />}
          onClick={reset}
          confirmTitle="Reset accessibility settings?"
          confirmDescription="Captions, volume, balance and vibration go back to how CareConnect started. Visual alert banners stay on."
          confirmLabel="Reset settings"
        >
          Reset to defaults
        </Button>
      </div>
    </div>
  );
}
