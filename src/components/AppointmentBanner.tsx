import { useId, useMemo, useState } from 'react';
import { CalendarClock, Pause, Play } from 'lucide-react';

import { useAppointments } from '../context/appointments';
import { useLocalStorageState } from '../hooks/useLocalStorageState';
import { byStartTime } from '../models/appointment';
import { formatTime12, localISODate } from '../utils/dates';

export const DISMISSED_BANNERS_KEY = 'careconnect_dismissed_banners';

const reviveIds = (stored: unknown) =>
  Array.isArray(stored) ? stored.filter((v): v is string => typeof v === 'string') : [];

/**
 * The "Upcoming appointment" visual alert along the top of Home, My Day,
 * Appointments and Medicines in the design — the on-screen stand-in for a
 * reminder tone. It names today's next visit. OK clears it on every screen
 * for the day; Pause stops it repeating without hiding it.
 */
export default function AppointmentBanner() {
  const { appointments } = useAppointments();
  const [dismissed, setDismissed] = useLocalStorageState<string[]>(DISMISSED_BANNERS_KEY, () => [], reviveIds);
  const [paused, setPaused] = useState(false);
  const titleId = useId();

  const today = localISODate();
  const next = useMemo(
    () => [...appointments].sort(byStartTime).find((a) => a.date === today),
    [appointments, today],
  );
  const key = next ? `${next.id}:${today}` : '';

  if (!next || dismissed.includes(key)) return null;

  const time = formatTime12(next.time);

  return (
    <section
      aria-labelledby={titleId}
      className="rounded-xl border-2 border-calm-600 bg-calm-50 px-4 py-3 flex flex-wrap items-start gap-3"
    >
      <CalendarClock className="w-6 h-6 text-calm-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex-1 min-w-[13rem]">
        <h2 id={titleId} className="text-base font-semibold text-calm-800 m-0">
          Upcoming appointment
        </h2>
        <p className="text-sm text-calm-800 m-0">
          {next.title} today at {time} — {next.location.name}
        </p>
        <p className="text-sm text-neutral-600 m-0">
          {paused ? 'Paused — this reminder will not repeat.' : `Today at ${time}`}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-pressed={paused}
          aria-label="Pause reminder"
          className="w-11 h-11 rounded-lg bg-neutral-200 text-neutral-800 flex items-center justify-center hover:bg-neutral-300"
        >
          {paused ? <Play className="w-4 h-4" aria-hidden="true" /> : <Pause className="w-4 h-4" aria-hidden="true" />}
        </button>
        <button
          type="button"
          onClick={() => setDismissed((ids) => [...ids, key])}
          aria-label={`OK, dismiss the reminder for ${next.title}`}
          className="h-11 min-w-[2.75rem] px-3 rounded-lg bg-calm-700 text-white font-semibold hover:bg-calm-800"
        >
          OK
        </button>
      </div>
    </section>
  );
}
