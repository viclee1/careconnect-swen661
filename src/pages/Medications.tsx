import { useState } from 'react';

import AppointmentBanner from '../components/AppointmentBanner';
import CaptionStrip from '../components/CaptionStrip';
import PageHeader from '../components/PageHeader';
import MedicineDetail from '../components/medicines/MedicineDetail';
import MedicineProgress from '../components/medicines/MedicineProgress';
import MedicineRow from '../components/medicines/MedicineRow';
import { useMedicines } from '../context/medicines';
import type { Medication } from '../models/medicine';
import { formatTime12 } from '../utils/dates';

/** The next medicine still to take — later today if any, else the first one left. */
function nextToTake(medications: Medication[], isTaken: (id: string) => boolean): Medication | undefined {
  const now = new Date();
  const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const left = medications.filter((m) => !isTaken(m.id));
  return left.find((m) => m.times.some((t) => t >= hhmm)) ?? left[0];
}

/**
 * The Medicines screen, laid out as the web design: today's medicines in a
 * list on the left, the chosen one in detail on the right (stacked below on a
 * phone), the "still to take" count beside the title, and the reminder for
 * the next medicine written out as a caption under the appointment alert.
 *
 * Each row's tick is a native checkbox, so Tab moves between medicines and
 * Space ticks one. Ticks are kept above the router and in localStorage, so
 * they survive navigation, a reload and a lost connection, and the caregiver
 * dashboard sees the same ones.
 */
export default function Medications() {
  const { medications, isTaken, setTaken, progress } = useMedicines();
  const [selectedId, setSelectedId] = useState(() => medications[0]?.id);
  const selected = medications.find((m) => m.id === selectedId) ?? medications[0];
  const reminder = nextToTake(medications, isTaken);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Medicines"
        subtitle="Today’s medication tracker"
        action={medications.length > 0 && <MedicineProgress progress={progress} />}
      />

      <div className="space-y-1">
        <AppointmentBanner />
        {reminder && (
          <CaptionStrip>
            Reminder: {reminder.name}, {reminder.dosage} — take at {formatTime12([...reminder.times].sort()[0])}.{' '}
            {reminder.instructions}
          </CaptionStrip>
        )}
      </div>

      {medications.length === 0 || !selected ? (
        <div className="bg-white rounded-xl border-2 border-neutral-300 p-10 text-center space-y-2">
          <h2 className="text-xl font-bold text-neutral-800">No medicines today</h2>
          <p className="text-neutral-700">
            Medicines your care team adds will appear here, with the time to take each one.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-[minmax(15rem,18rem)_1fr] lg:gap-6">
          <section aria-labelledby="medicine-list-title">
            <h2 id="medicine-list-title" className="sr-only">
              Today’s medicines
            </h2>
            <p className="text-sm text-neutral-600 mb-3">Tick the circle once you’ve taken a medicine.</p>
            <ul className="list-none p-0 m-0 space-y-2" role="list">
              {medications.map((medication) => (
                <li key={medication.id}>
                  <MedicineRow
                    medication={medication}
                    taken={isTaken(medication.id)}
                    selected={medication.id === selected.id}
                    onSelect={() => setSelectedId(medication.id)}
                    onChange={(taken) => setTaken(medication.id, taken)}
                  />
                </li>
              ))}
            </ul>
          </section>

          <div className="md:border-l md:border-neutral-200 md:pl-6">
            <MedicineDetail
              medication={selected}
              taken={isTaken(selected.id)}
              onChange={(taken) => setTaken(selected.id, taken)}
            />
          </div>
        </div>
      )}

      <p className="text-sm text-neutral-600 text-center">
        Always take medicines as prescribed by your doctor. If unsure, ask your caregiver.
      </p>
    </div>
  );
}
