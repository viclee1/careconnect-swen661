export interface Segment<T extends string> {
  value: T;
  label: string;
}

/**
 * A row of mutually exclusive choices, built from native radio buttons inside
 * a <fieldset>. The browser supplies everything a keyboard user expects: one
 * Tab stop for the group, arrow keys to move the selection, and "2 of 3"
 * announcements. The selected option is filled *and* checked, so the choice is
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
      <legend className="font-semibold text-neutral-800 mb-2">{legend}</legend>
      <div className="inline-flex flex-wrap rounded-lg border-2 border-calm-600 overflow-hidden">
        {segments.map((segment) => {
          const selected = segment.value === value;
          return (
            <label
              key={segment.value}
              className={[
                'relative inline-flex items-center justify-center min-h-[2.75rem] min-w-[5rem] px-4',
                'font-semibold cursor-pointer select-none',
                'has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-calm-800 has-[:focus-visible]:-outline-offset-4',
                selected ? 'bg-calm-600 text-white' : 'bg-white text-calm-700 hover:bg-calm-50',
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
              {segment.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
