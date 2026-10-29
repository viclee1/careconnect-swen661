import { useId } from 'react';
import { Lock, type LucideIcon } from 'lucide-react';

import SettingIcon from './SettingIcon';
import type { SettingTone } from './settingTones';

/**
 * A single on/off preference, built on a real checkbox with role="switch".
 *
 * The native control brings Space to toggle, the focus ring and the "switch,
 * on" announcement; only the skin is ours. The state is also written out as
 * "On" or "Off" beside the switch, because a switch otherwise shows its state
 * by position and colour alone.
 *
 * A locked preference keeps its disabled switch for assistive technology but
 * is drawn as an "Always on" pill with a padlock, so nobody hunts for a way to
 * move a switch that cannot move.
 */
export default function SettingsSwitchRow({
  Icon,
  tone,
  title,
  description,
  value,
  onValueChange,
  locked = false,
  lockedReason,
  testId,
}: {
  Icon: LucideIcon;
  tone: SettingTone;
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
    <div className="flex items-center gap-3 md:gap-4 py-3">
      <SettingIcon Icon={Icon} tone={tone} />
      <div className="flex-1 min-w-0">
        <label htmlFor={inputId} className="font-semibold text-neutral-800 cursor-pointer">
          {title}
        </label>
        <p id={descriptionId} className="text-sm text-neutral-600">
          {locked && lockedReason ? lockedReason : description}
        </p>
      </div>

      <span className="relative inline-flex items-center gap-2 flex-shrink-0">
        {!locked && (
          <span className="text-sm font-semibold text-neutral-700 w-7 text-right" aria-hidden="true">
            {value ? 'On' : 'Off'}
          </span>
        )}
        <span className="relative inline-flex">
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
          {locked ? (
            <span
              aria-hidden="true"
              className="inline-flex items-center gap-1.5 rounded-pill border-2 border-calm-600 bg-calm-50 px-3 py-1 text-sm font-bold text-calm-800 peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-calm-600 peer-focus-visible:outline-offset-2"
            >
              <Lock className="w-3.5 h-3.5" />
              Always on
            </span>
          ) : (
            <span
              aria-hidden="true"
              className={[
                'w-14 h-8 rounded-full border-2 transition-colors flex items-center px-0.5',
                'peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-calm-600 peer-focus-visible:outline-offset-2',
                value ? 'bg-calm-600 border-calm-600 justify-end' : 'bg-neutral-200 border-neutral-500 justify-start',
              ].join(' ')}
            >
              <span className="w-6 h-6 rounded-full bg-white border border-neutral-400 shadow" />
            </span>
          )}
        </span>
      </span>
    </div>
  );
}
