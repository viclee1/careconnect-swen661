import { Icon } from '../../components/Icon';
import { isMacPlatform } from '../../platform/bridge';
import { shortcutLabel } from '../../../shared/shortcuts';

/**
 * The Notify action from the Week 3 prototype.
 *
 * This is CareConnect's answer to "give me a ring": it lights up the other
 * person's screen and buzzes their phone, and plays nothing. The second line
 * says exactly what will happen, because a user who cannot hear a ringtone has
 * no way to verify it afterwards and should not have to guess.
 */
export function NotifyButton({
  contactName,
  vibrationEnabled,
  onActivate,
}: {
  contactName: string;
  /** Mirrors the user's own vibration setting, which the wording reflects. */
  vibrationEnabled: boolean;
  onActivate: () => void;
}) {
  const subtitle = vibrationEnabled
    ? 'Sends a visual flash and vibration — no sound'
    : 'Sends a visual flash — vibration is off in your settings';
  const keys = shortcutLabel('CmdOrCtrl+Shift+N', isMacPlatform());

  return (
    <button
      type="button"
      data-testid="notify-button"
      className="notify"
      onClick={onActivate}
    >
      <Icon name="notify" size={28} />
      <span className="notify__text">
        {/* No aria-label: the name is the printed title and subtitle, so what
            is announced is what is on screen (WCAG 2.5.3). */}
        <span className="notify__title">Alert {contactName} you want to talk</span>{' '}
        <span className="notify__subtitle">{subtitle}</span>
      </span>
      <kbd className="notify__keys" aria-hidden="true">
        {keys}
      </kbd>
    </button>
  );
}
