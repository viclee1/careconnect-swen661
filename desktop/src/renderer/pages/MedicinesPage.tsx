import { AlertBanner } from '../components/AlertBanner';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { useMedicines } from '../state/MedicinesProvider';
import { MedicineRow } from './medicines/MedicineRow';
import './carePages.css';

/**
 * The Medicines page: today's medication tracker, as the React Native client
 * shows it. Check a medicine off and the count updates.
 *
 * The state lives in `MedicinesProvider` above the router, so ticking a dose
 * and going to another page and back does not quietly un-tick it.
 */
export function MedicinesPage() {
  const { medicines, takenCount, totalCount, toggleTaken } = useMedicines();
  const percentage = totalCount === 0 ? 0 : Math.round((takenCount / totalCount) * 100);
  const allTaken = totalCount > 0 && takenCount === totalCount;

  return (
    <>
      <PageHeader title="Medicines" subtitle="Today's medication tracker" />

      <div className="page-body">
        <div className="readable stack">
          {totalCount === 0 ? (
            <EmptyState
              icon="medicines"
              title="No medicines today"
              message="Medicines your care team adds will appear here, with the time to take each one."
            />
          ) : (
            <>
              <div className="medicines__progress">
                {/* The bar is decoration; the sentence beside it is the fact,
                    and as a status region it is announced each time a box is
                    ticked, so a screen-reader user hears "2 of 3 taken". */}
                <div className="progress" aria-hidden="true">
                  <div className="progress__fill" style={{ width: `${percentage}%` }} />
                </div>
                <p className="medicines__count" role="status">
                  {takenCount} of {totalCount} taken
                </p>
              </div>

              {allTaken ? (
                <AlertBanner
                  tone="success"
                  title="All done for today"
                  message="Every medicine on today's list is marked as taken."
                />
              ) : null}

              <fieldset className="medicine-list">
                <legend className="visually-hidden">Mark each medicine as taken</legend>
                {medicines.map((medicine) => (
                  <MedicineRow
                    key={medicine.id}
                    medicine={medicine}
                    onToggle={() => toggleTaken(medicine.id)}
                  />
                ))}
              </fieldset>

              <p className="field__hint">
                Press <kbd>Tab</kbd> to move between medicines and <kbd>Space</kbd> to mark one
                taken or not taken.
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
