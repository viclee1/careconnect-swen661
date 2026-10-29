import { AlertTriangle, CheckCircle2 } from 'lucide-react';

import { progressSentence, type MedicineProgress as Progress } from '../../models/medicine';

/**
 * The amber pill beside the Medicines title in the design — "3 still to take
 * today", green once everything is taken. It is the page's one status region,
 * so each tick is announced, in the full sentence ("1 of 4 taken. 3 medicines
 * still to take today.") rather than the pill's short form.
 */
export default function MedicineProgress({ progress }: { progress: Progress }) {
  const { allTaken, total, taken } = progress;
  const Icon = allTaken ? CheckCircle2 : AlertTriangle;
  const short = total === 0 ? 'Nothing to take today' : allTaken ? 'All taken today' : `${total - taken} still to take today`;

  return (
    <p
      role="status"
      aria-live="polite"
      className={[
        'm-0 inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2 text-base',
        allTaken ? 'border-success-600 bg-success-50 text-success-700' : 'border-warning-600 bg-warning-50 text-warning-700',
      ].join(' ')}
    >
      <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
      <span aria-hidden="true">{short}</span>
      <span className="sr-only">{progressSentence(progress)}</span>
    </p>
  );
}
