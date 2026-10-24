import { useId } from 'react';

/**
 * A labelled slider with its value written out beside the title.
 *
 * A native <input type="range">, so it arrives with arrow keys, Home and End,
 * Page Up and Page Down and the platform's own value announcement. The value is
 * always printed in words or a percentage as well, never left to the thumb
 * position alone.
 */
export default function SettingsSliderRow({
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
    <div className="p-4 space-y-2">
      <div className="flex items-center justify-between gap-4">
        <label htmlFor={inputId} className="font-semibold text-neutral-800">
          {title}
        </label>
        <span className="font-semibold text-calm-700 tabular-nums" aria-hidden="true">
          {valueLabel}
        </span>
      </div>
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
        className="w-full min-h-[2.75rem] accent-calm-600 cursor-pointer"
      />
      <div className="flex justify-between text-sm text-neutral-600" aria-hidden="true">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
      <p id={descriptionId} className="text-sm text-neutral-600">
        {description}
      </p>
    </div>
  );
}
