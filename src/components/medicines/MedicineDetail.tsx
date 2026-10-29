import { Check, Pill } from 'lucide-react';

import { timesSentence, type Medication } from '../../models/medicine';

/**
 * The right-hand panel of the Medicines screen: the chosen medicine large,
 * when to take it, whether it has been taken, how to take it, and one big
 * button to mark it — the design's "✓ Taken — tap to undo".
 */
export default function MedicineDetail({
  medication,
  taken,
  onChange,
}: {
  medication: Medication;
  taken: boolean;
  onChange: (taken: boolean) => void;
}) {
  return (
    <section aria-labelledby="medicine-detail-title" className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-warning-50 flex items-center justify-center flex-shrink-0" aria-hidden="true">
          <Pill className="w-8 h-8 md:w-10 md:h-10 text-warning-700" />
        </span>
        <div>
          <h2 id="medicine-detail-title" className="text-2xl md:text-3xl font-normal text-neutral-800 m-0">
            {medication.name}
          </h2>
          <p className="text-base text-neutral-600 m-0">{medication.dosage}</p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 m-0">
        <div className="rounded-xl bg-white p-4">
          <dt className="text-sm uppercase tracking-wide text-neutral-600">When</dt>
          <dd className="m-0 mt-1 text-lg text-calm-700">{timesSentence(medication.times)}</dd>
        </div>
        <div className="rounded-xl bg-white p-4">
          <dt className="text-sm uppercase tracking-wide text-neutral-600">Status</dt>
          <dd className={`m-0 mt-1 text-lg ${taken ? 'text-success-700' : 'text-neutral-800'}`}>
            {taken ? 'Taken ✓' : 'Not taken yet'}
          </dd>
        </div>
      </dl>

      {(medication.instructions || medication.purpose) && (
        <div className="rounded-xl bg-white p-4">
          <h3 className="text-sm uppercase tracking-wide text-neutral-600 font-normal m-0">How to take it</h3>
          {medication.instructions && <p className="text-base text-neutral-800 m-0 mt-1">{medication.instructions}</p>}
          {medication.purpose && <p className="text-sm text-neutral-600 m-0 mt-1">{medication.purpose}</p>}
        </div>
      )}

      <button
        type="button"
        onClick={() => onChange(!taken)}
        className={[
          'w-full min-h-[3.5rem] rounded-xl px-6 text-lg flex items-center justify-center gap-2 transition-colors',
          taken
            ? 'bg-success-50 text-success-700 border-2 border-success-100 hover:bg-success-100'
            : 'bg-calm-800 text-white hover:bg-calm-900',
        ].join(' ')}
      >
        {taken && <Check className="w-5 h-5" aria-hidden="true" />}
        {taken ? 'Taken — tap to undo' : `Mark ${medication.name} as taken`}
      </button>
    </section>
  );
}
