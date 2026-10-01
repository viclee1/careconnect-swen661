import { useId } from 'react';

/**
 * A single on/off preference.
 *
 * Built on a real checkbox with `role="switch"`. The native control brings
 * Space, the focus ring, forced-colours rendering and the platform's own
 * "switch, on" announcement; only the visual skin is ours. A styled div would
 * have to fake every one of those, and would fake at least one of them badly.
 *
 * The current state is also written out as the word "On" or "Off" beside the
 * control. A switch communicates its state through position and colour, and the
 * design philosophy rules out colour-only signals, so the word carries the
 * state for anyone who finds the knob position ambiguous.
 */
export function SettingsSwitchRow({
  title,
  description,
  value,
  onValueChange,
  locked = false,
  lockedReason,
  testId,
}: {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
  /** When true the control is shown but cannot be changed. */
  locked?: boolean;
  lockedReason?: string;
  testId?: string;
}) {
  const labelId = useId();
  const descriptionId = useId();
  const text = locked && lockedReason ? lockedReason : description;

  return (
    <div className="settings-row">
      <div className="settings-row__text">
        <div className="settings-row__title-line">
          <span className="settings-row__title" id={labelId}>
            {title}
          </span>
          <span className="settings-row__state">{value ? 'On' : 'Off'}</span>
        </div>
        <p className="settings-row__description" id={descriptionId}>
          {text}
        </p>
      </div>

      <span className="switch">
        <input
          type="checkbox"
          role="switch"
          className="switch__input"
          data-testid={testId}
          checked={value}
          disabled={locked}
          aria-labelledby={labelId}
          aria-describedby={descriptionId}
          onChange={(event) => onValueChange(event.target.checked)}
        />
        <span className="switch__track" aria-hidden="true" />
      </span>
    </div>
  );
}
