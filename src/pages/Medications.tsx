import PageHeader from '../components/PageHeader';
import MedicineProgress from '../components/medicines/MedicineProgress';
import MedicineRow from '../components/medicines/MedicineRow';
import { useMedicines } from '../context/medicines';

/**
 * The Medicines screen: today's medication tracker. Tick a medicine and the
 * count above the list updates and is announced.
 *
 * Each medicine is a native checkbox inside a <fieldset>, as on the desktop
 * app: Tab moves between them and Space ticks one. Ticks are kept above the
 * router and in localStorage, so they survive navigation, a reload and a lost
 * connection, and the caregiver dashboard sees the same ones.
 */
export default function Medications() {
  const { medications, isTaken, setTaken, progress } = useMedicines();

  return (
    <div className="space-y-6 page-container">
      <PageHeader title="Medicines" subtitle="Today’s medication tracker" />

      {medications.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-neutral-300 shadow-card p-10 text-center space-y-2">
          <h2 className="text-xl font-bold text-neutral-800">No medicines today</h2>
          <p className="text-neutral-700">
            Medicines your care team adds will appear here, with the time to take each one.
          </p>
        </div>
      ) : (
        <>
          <MedicineProgress progress={progress} />

          <fieldset>
            <legend className="text-xl font-bold text-neutral-800 mb-1">
              Mark each medicine as taken
            </legend>
            <p className="text-neutral-600 mb-4">
              Press <kbd className="kbd">Tab</kbd> to move between medicines and{' '}
              <kbd className="kbd">Space</kbd> to tick one, or tap anywhere on a card.
            </p>
            <ul className="card-grid" role="list">
              {medications.map((medication) => (
                <li key={medication.id}>
                  <MedicineRow
                    medication={medication}
                    taken={isTaken(medication.id)}
                    onChange={(taken) => setTaken(medication.id, taken)}
                  />
                </li>
              ))}
            </ul>
          </fieldset>
        </>
      )}

      <p className="text-sm text-neutral-600 text-center">
        Always take medicines as prescribed by your doctor. If unsure, ask your caregiver.
      </p>
    </div>
  );
}
