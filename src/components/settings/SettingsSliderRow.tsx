import { useId } from 'react';
import type { LucideIcon } from 'lucide-react';

import SettingIcon from './SettingIcon';
import type { SettingTone } from './settingTones';

/**
 * A labelled slider with its value written out under the middle of the track,
 * between the two ends' labels, as the design draws it.
 *
 * A native <input type="range">, so it arrives with arrow keys, Home and End,
 * Page Up and Page Down and the platform's own value announcement. The value is
 * always printed in words or a percentage as well, never left to the thumb
 * position alone.
 */
export default function SettingsSliderRow({
  Icon,
  tone,
  title,
  valueLabel,
  description,
  value,
  min,
  max,
  step,
  onValueChange,
  minLabel,
  maxLabel,
  valueText,
  testId,
}: {
  Icon?: LucideIcon;
  tone?: SettingTone;
  title: string;
  valueLabel: string;
  description: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onValueChange: (next: number) => void;
  minLabel: string;
  maxLabel: string;
  /** What a screen reader announces as the value. */
  valueText: string;
  testId?: string;
}) {
  const inputId = useId();
  const descriptionId = useId();

  return (
    <div className="flex items-start gap-3 md:gap-4 py-3">
      {Icon && tone && <SettingIcon Icon={Icon} tone={tone} />}
      <div className="flex-1 min-w-0">
        <label htmlFor={inputId} className="font-semibold text-neutral-800">
          {title}
        </label>
        <input
          id={inputId}
          type="range"
          data-testid={testId}
          value={value}
          min={min}
          max={max}
          step={step}
          aria-describedby={descriptionId}
          aria-valuetext={valueText}
          onChange={(event) => onValueChange(Number(event.target.value))}
          className="block w-full min-h-[2.75rem] accent-calm-600 cursor-pointer"
        />
        <div className="grid grid-cols-3 text-sm text-neutral-600" aria-hidden="true">
          <span>{minLabel}</span>
          <span className="text-center font-bold text-calm-700 tabular-nums">{valueLabel}</span>
          <span className="text-right">{maxLabel}</span>
        </div>
        <p id={descriptionId} className="text-sm text-neutral-600 mt-1">
          {description}
        </p>
      </div>
    </div>
  );
}
