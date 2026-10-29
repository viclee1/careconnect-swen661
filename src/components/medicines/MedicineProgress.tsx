import { CheckCircle2, AlertCircle } from 'lucide-react';

import { progressSentence, type MedicineProgress as Progress } from '../../models/medicine';

/**
 * "2 of 4 taken" with a bar. The sentence is the fact and lives in one
 * status region that is always on the page, so each tick is announced; the
 * bar is a native <progress> named by its own label, for people who scan by
 * form control.
 */
export default function MedicineProgress({ progress }: { progress: Progress }) {
  const { allTaken } = progress;
  const Icon = allTaken ? CheckCircle2 : AlertCircle;

  return (
    <div
      className={[
        'rounded-xl border-2 p-4 md:p-5 space-y-3',
        allTaken ? 'border-success-300 bg-success-50' : 'border-warm-300 bg-warm-50',
      ].join(' ')}
    >
      <p
        role="status"
        aria-live="polite"
        className={[
          'flex items-start gap-3 text-lg font-semibold',
          allTaken ? 'text-success-800' : 'text-warm-800',
        ].join(' ')}
      >
        <Icon
          className={['w-6 h-6 flex-shrink-0 mt-0.5', allTaken ? 'text-success-700' : 'text-warm-700'].join(' ')}
          aria-hidden="true"
        />
        <span>{progressSentence(progress)}</span>
      </p>
      <div className="flex items-center gap-3">
        <label id="medicine-progress-label" htmlFor="medicine-progress" className="text-sm font-semibold text-neutral-700 whitespace-nowrap">
          Taken today
        </label>
        <progress
          id="medicine-progress"
          // The <label> alone names it in browsers; aria-labelledby makes the
          // name the same in tools that only read ARIA.
          aria-labelledby="medicine-progress-label"
          max={progress.total || 1}
          value={progress.taken}
          className="medicine-progress flex-1"
        >
          {progress.percent}%
        </progress>
        <span className="text-sm font-semibold text-neutral-700 tabular-nums" aria-hidden="true">
          {progress.percent}%
        </span>
      </div>
    </div>
  );
}
