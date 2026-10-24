import { useId } from 'react';

/**
 * A single on/off preference, built on a real checkbox with role="switch".
 *
 * The native control brings Space to toggle, the focus ring and the "switch,
 * on" announcement; only the skin is ours. The state is also written out as
 * "On" or "Off", because a switch otherwise shows its state by position and
 * colour alone.
 */
export default function SettingsSwitchRow({
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
  /** Shown but cannot be changed. */
  locked?: boolean;
  lockedReason?: string;
  testId?: string;
}) {
  const inputId = useId();
  const descriptionId = useId();

  return (
    <div className="flex items-start gap-4 p-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <label htmlFor={inputId} className="font-semibold text-neutral-800 cursor-pointer">
            {title}
          </label>
          <span
            className={`badge text-xs ${value ? 'badge-success' : 'badge-neutral'}`}
            aria-hidden="true"
          >
            {value ? 'On' : 'Off'}
          </span>
        </div>
        <p id={descriptionId} className="text-sm text-neutral-600 mt-0.5">
          {locked && lockedReason ? lockedReason : description}
        </p>
      </div>

      <span className="relative inline-flex flex-shrink-0 mt-1">
        <input
          id={inputId}
          type="checkbox"
          role="switch"
          data-testid={testId}
          checked={value}
          disabled={locked}
          aria-describedby={descriptionId}
          onChange={(event) => onValueChange(event.target.checked)}
          className="peer absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10 m-0"
        />
        <span
          aria-hidden="true"
          className={[
            'w-14 h-8 rounded-full border-2 transition-colors flex items-center px-0.5',
            'peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-calm-600 peer-focus-visible:outline-offset-2',
            value ? 'bg-calm-600 border-calm-600 justify-end' : 'bg-neutral-200 border-neutral-500 justify-start',
            locked ? 'opacity-70' : '',
          ].join(' ')}
        >
          <span className="w-6 h-6 rounded-full bg-white border border-neutral-400 shadow" />
        </span>
      </span>
    </div>
  );
}
