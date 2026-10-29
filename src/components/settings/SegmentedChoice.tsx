import { Check } from 'lucide-react';

export interface Segment<T extends string> {
  value: T;
  label: string;
}

/**
 * A row of mutually exclusive choices, built from native radio buttons inside
 * a <fieldset>. The browser supplies everything a keyboard user expects: one
 * Tab stop for the group, arrow keys to move the selection, and "2 of 3"
 * announcements. The options share the row equally, as the design draws them,
 * and the selected one is tinted, outlined *and* ticked, so the choice is
 * legible without colour.
 */
export default function SegmentedChoice<T extends string>({
  name,
  legend,
  segments,
  value,
  onChange,
  disabled = false,
}: {
  /** The radio group's name — unique on the page. */
  name: string;
  legend: string;
  segments: Segment<T>[];
  value: T;
  onChange: (next: T) => void;
  disabled?: boolean;
}) {
  return (
    <fieldset disabled={disabled} className="border-0 p-0 m-0 min-w-0">
      <legend className="text-sm font-semibold text-neutral-700 mb-2">{legend}</legend>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${segments.length}, minmax(0, 1fr))` }}
      >
        {segments.map((segment) => {
          const selected = segment.value === value;
          return (
            <label
              key={segment.value}
              className={[
                'relative inline-flex items-center justify-center gap-1.5 min-h-[2.75rem] px-2 rounded-xl border-2',
                'font-semibold cursor-pointer select-none text-center',
                'has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-calm-800 has-[:focus-visible]:outline-offset-2',
                selected
                  ? 'bg-calm-50 border-calm-600 text-calm-800'
                  : 'bg-white border-neutral-300 text-neutral-700 hover:border-calm-400',
                disabled ? 'opacity-60 cursor-not-allowed' : '',
              ].join(' ')}
            >
              <input
                type="radio"
                name={name}
                value={segment.value}
                data-testid={`segment-${name}-${segment.value}`}
                checked={selected}
                onChange={() => onChange(segment.value)}
                className="sr-only"
              />
              {selected && <Check className="w-4 h-4 flex-shrink-0" aria-hidden="true" />}
              {segment.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
