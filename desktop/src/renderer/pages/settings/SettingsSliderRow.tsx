import { useId } from 'react';

/**
 * A labelled slider with its current value written out beside the title.
 *
 * A native `<input type="range">`, so it arrives with arrow keys, Home and End,
 * Page Up and Page Down, and the platform's own value announcement — the whole
 * Assignment 7 arrow-key requirement, implemented by not reimplementing it.
 *
 * The value is always printed in words or a percentage as well, never left to
 * the thumb position alone, so someone who cannot judge the thumb precisely
 * still knows exactly where the setting sits.
 */
export function SettingsSliderRow({
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
  minLabel?: string;
  maxLabel?: string;
  /** The sentence a screen reader announces while dragging. */
  valueText: string;
  testId?: string;
}) {
  const labelId = useId();
  const descriptionId = useId();

  return (
    <div className="settings-block">
      <div className="settings-row__title-line">
        <span className="settings-block__title" id={labelId}>
          {title}
        </span>
        <span className="settings-row__state">{valueLabel}</span>
      </div>

      <input
        type="range"
        className="slider"
        data-testid={testId}
        value={value}
        min={min}
        max={max}
        step={step}
        aria-labelledby={labelId}
        aria-describedby={descriptionId}
        aria-valuetext={valueText}
        onChange={(event) => onValueChange(Number(event.target.value))}
      />

      {minLabel || maxLabel ? (
        <div className="slider-ends" aria-hidden="true">
          <span>{minLabel ?? ''}</span>
          <span>{maxLabel ?? ''}</span>
        </div>
      ) : null}

      <p className="settings-block__hint" id={descriptionId}>
        {description}
      </p>
    </div>
  );
}
