import { memoryFilters, type MemoryFilter } from '../../models/memory';

/**
 * The category filter, as a native radio group drawn as pills: one Tab stop,
 * arrow keys to move, and "Family, radio button, 2 of 6" announced, all from
 * the browser. Exactly one choice is ever on, which is what radios mean.
 */
export default function MemoryFilters({
  value,
  onChange,
}: {
  value: MemoryFilter;
  onChange: (value: MemoryFilter) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-bold uppercase tracking-wider text-neutral-600 mb-2">
        Show
      </legend>
      <div className="flex flex-wrap gap-2">
        {memoryFilters.map((filter) => (
          <label key={filter.value} className="relative inline-flex">
            <input
              type="radio"
              name="memory-filter"
              value={filter.value}
              checked={value === filter.value}
              onChange={() => onChange(filter.value)}
              className="peer sr-only"
            />
            <span
              className={[
                'inline-flex items-center min-h-[2.75rem] px-4 rounded-pill border-2 font-semibold cursor-pointer select-none transition-colors',
                'border-calm-600 bg-white text-calm-700 hover:bg-calm-50',
                'peer-checked:bg-calm-700 peer-checked:border-calm-700 peer-checked:text-white',
                'peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-calm-800 peer-focus-visible:outline-offset-2',
              ].join(' ')}
            >
              {filter.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
