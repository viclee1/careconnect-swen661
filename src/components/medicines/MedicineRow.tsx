import { useId } from 'react';
import { CheckCircle2, Circle, Clock, Pill } from 'lucide-react';

import { timesSentence, type Medication } from '../../models/medicine';
import { formatTime12 } from '../../utils/dates';

/**
 * One medicine, as a native checkbox: Tab reaches it, Space ticks it, and the
 * screen reader says "Amlodipine 5 mg — 1 tablet, checkbox, checked". The
 * label stretches over the whole card, so the card is one large touch target.
 *
 * Taken or not is printed as a word as well as shown by the tick and the
 * strike-through, so the state never rests on colour or an icon alone.
 */
export default function MedicineRow({
  medication,
  taken,
  onChange,
}: {
  medication: Medication;
  taken: boolean;
  onChange: (taken: boolean) => void;
}) {
  const inputId = useId();
  const detailsId = useId();
  const StateIcon = taken ? CheckCircle2 : Circle;

  return (
    <div
      className={[
        'relative h-full flex items-start gap-4 rounded-xl border-2 p-4 md:p-5 shadow-card transition-colors',
        'has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-calm-600 has-[:focus-visible]:outline-offset-2',
        taken ? 'bg-neutral-50 border-success-300' : 'bg-white border-neutral-300 hover:border-calm-400',
      ].join(' ')}
    >
      <input
        id={inputId}
        type="checkbox"
        checked={taken}
        onChange={(event) => onChange(event.target.checked)}
        aria-describedby={detailsId}
        className="peer mt-1 w-6 h-6 flex-shrink-0 accent-success-600 cursor-pointer focus-visible:outline-none"
      />

      <div className="flex-1 min-w-0">
        <label
          htmlFor={inputId}
          className="block cursor-pointer after:absolute after:inset-0 after:content-['']"
        >
          <span
            className={[
              'block text-lg font-bold leading-tight',
              taken ? 'line-through decoration-2 text-neutral-600' : 'text-neutral-800',
            ].join(' ')}
          >
            {medication.name}
          </span>
          <span className="block text-neutral-700 mt-0.5">{medication.dosage}</span>
        </label>

        <div id={detailsId} className="mt-2 space-y-2">
          <p className="flex flex-wrap items-center gap-2 text-sm text-neutral-700">
            <Clock className="w-4 h-4 text-neutral-600" aria-hidden="true" />
            <span className="sr-only">Take at {timesSentence(medication.times)}.</span>
            {[...medication.times].sort().map((time) => (
              <span key={time} className="badge badge-calm text-xs" aria-hidden="true">
                {formatTime12(time)}
              </span>
            ))}
          </p>
          {medication.instructions && (
            <p className="text-sm text-neutral-700">{medication.instructions}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-1 flex-shrink-0" aria-hidden="true">
        <span
          className={[
            'w-11 h-11 rounded-full flex items-center justify-center',
            medication.colour,
          ].join(' ')}
        >
          <Pill className="w-5 h-5 text-neutral-700" />
        </span>
        <span
          className={[
            'inline-flex items-center gap-1 text-xs font-bold whitespace-nowrap',
            taken ? 'text-success-800' : 'text-neutral-700',
          ].join(' ')}
        >
          <StateIcon className="w-3.5 h-3.5" />
          {taken ? 'Taken' : 'Not yet'}
        </span>
      </div>
    </div>
  );
}
