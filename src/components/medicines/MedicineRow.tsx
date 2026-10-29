import { useId } from 'react';
import { Check, Pill } from 'lucide-react';

import { timesSentence, type Medication } from '../../models/medicine';
import { formatTime12 } from '../../utils/dates';

/**
 * One medicine in the list on the left of the Medicines screen, as the design
 * draws it: pill, name, time, and a round tick on the right.
 *
 * Two controls, each doing one thing. The row itself is a button that shows
 * the medicine in the detail panel (aria-current marks the one shown). The
 * round tick is a native checkbox — Tab reaches it, Space ticks it, and the
 * screen reader says "Amlodipine taken, checkbox, checked". Taken is also
 * shown by the strike-through and written out for screen readers, so it
 * never rests on the tick's colour alone.
 */
export default function MedicineRow({
  medication,
  taken,
  selected,
  onSelect,
  onChange,
}: {
  medication: Medication;
  taken: boolean;
  selected: boolean;
  onSelect: () => void;
  onChange: (taken: boolean) => void;
}) {
  const checkboxId = useId();
  const times = [...medication.times].sort();

  return (
    <div
      className={[
        'relative flex items-center gap-3 rounded-xl border-2 p-3 transition-colors',
        selected ? 'border-calm-700 bg-calm-50' : 'border-transparent bg-white hover:border-neutral-300',
      ].join(' ')}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-current={selected ? 'true' : undefined}
        className="flex-1 min-w-0 flex items-center gap-3 text-left rounded-lg"
      >
        <span
          className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-warning-50 ${
            taken ? 'opacity-60' : ''
          }`}
          aria-hidden="true"
        >
          <Pill className="w-5 h-5 text-warning-700" />
        </span>
        <span className="min-w-0">
          <span
            className={[
              'block text-base leading-tight',
              taken ? 'line-through text-neutral-600' : 'text-neutral-800',
            ].join(' ')}
          >
            {medication.name}
            <span className="sr-only">
              , {medication.dosage}, at {timesSentence(times)}, {taken ? 'taken' : 'not taken yet'}
            </span>
          </span>
          <span className="flex flex-wrap gap-1 mt-1" aria-hidden="true">
            {times.map((time) => (
              <span key={time} className="rounded-pill bg-calm-50 px-2 text-sm text-calm-700 tabular-nums">
                {formatTime12(time)}
              </span>
            ))}
          </span>
        </span>
      </button>

      <label htmlFor={checkboxId} className="relative flex-shrink-0 w-11 h-11 flex items-center justify-center cursor-pointer">
        <span className="sr-only">{medication.name} taken</span>
        <input
          id={checkboxId}
          type="checkbox"
          checked={taken}
          onChange={(event) => onChange(event.target.checked)}
          className="peer absolute inset-0 opacity-0 cursor-pointer"
        />
        <span
          className={[
            'w-7 h-7 rounded-full border-2 flex items-center justify-center',
            'peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-calm-600 peer-focus-visible:outline-offset-2',
            taken ? 'border-success-600 bg-success-50 text-success-700' : 'border-neutral-500 bg-white',
          ].join(' ')}
          aria-hidden="true"
        >
          {taken && <Check className="w-4 h-4" strokeWidth={3} />}
        </span>
      </label>
    </div>
  );
}
