import type { Appointment } from './appointment';
import type { Medication } from './medicine';
import { formatTime12 } from '../utils/dates';

/**
 * My Day: everything to do today, in time order.
 *
 * Medicines and visits are not copies kept here: they come from the same
 * stores the Medicines and Appointments screens use, so ticking Metformin on
 * either screen ticks it on both, and a visit added to My Day from
 * Appointments appears here. Only the day's routines (check-in, the call with
 * Maria, bedtime) and whether a visit is done belong to My Day itself.
 */

export type MyDayIcon = 'pill' | 'calendar' | 'video' | 'heart';
export type MyDayCategory = 'Medication' | 'Appointment' | 'Check-in' | 'Call' | 'Rest';

export interface MyDayItem {
  /** `med:<medicine id>`, `appt:<appointment id>`, or a routine's id. */
  id: string;
  title: string;
  description: string;
  /** 24-hour "HH:MM", for ordering; shown with `formatTime12`. */
  time: string;
  category: MyDayCategory;
  icon: MyDayIcon;
  done: boolean;
}

interface Routine {
  id: string;
  title: string;
  description: string;
  time: string;
  category: MyDayCategory;
  icon: MyDayIcon;
}

/** The parts of the day that are not a medicine or a booked visit. */
export const routines: Routine[] = [
  {
    id: 'checkin',
    title: 'Morning check-in',
    description: "Tap to confirm you're doing well",
    time: '09:00',
    category: 'Check-in',
    icon: 'heart',
  },
  {
    id: 'call-maria',
    title: 'Video call with Maria',
    description: 'Your daughter — she will call you',
    time: '15:00',
    category: 'Call',
    icon: 'video',
  },
  {
    id: 'bedtime',
    title: 'Bedtime rest',
    description: 'Wind down for sleep',
    time: '21:30',
    category: 'Rest',
    icon: 'calendar',
  },
];

/** What My Day stores itself: which routines and visits are done, for one day. */
export interface MyDayDone {
  date: string;
  done: Record<string, boolean>;
}

/**
 * Turns whatever is in storage back into today's ticks. Yesterday's ticks, and
 * anything that is not an `id → boolean` pair, are dropped.
 */
export function reviveMyDayDone(stored: unknown, today: string): MyDayDone {
  const fresh = { date: today, done: {} };
  if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return fresh;
  const { date, done } = stored as { date?: unknown; done?: unknown };
  if (date !== today || !done || typeof done !== 'object' || Array.isArray(done)) return fresh;
  return {
    date: today,
    done: Object.fromEntries(
      Object.entries(done as Record<string, unknown>).filter(
        (entry): entry is [string, boolean] => typeof entry[1] === 'boolean',
      ),
    ),
  };
}

export interface MyDaySources {
  medications: Medication[];
  isTaken: (medicationId: string) => boolean;
  appointments: Appointment[];
  isInMyDay: (appointmentId: string) => boolean;
  today: string;
  done: Record<string, boolean>;
}

/**
 * Today's list: one row per medicine (at its first time; a later dose is named
 * in its description, since a medicine is ticked once a day), one per visit
 * today that is on My Day, and the routines — earliest first.
 */
export function buildMyDay({ medications, isTaken, appointments, isInMyDay, today, done }: MyDaySources): MyDayItem[] {
  const medicines = medications
    .filter((medication) => medication.times.length > 0)
    .map((medication): MyDayItem => {
      const [first, ...later] = [...medication.times].sort();
      const details = [medication.dosage, medication.instructions].filter(Boolean).join('. ');
      return {
        id: `med:${medication.id}`,
        title: `Take ${medication.name}`,
        description: later.length ? `${details} — also at ${later.map(formatTime12).join(' and ')}` : details,
        time: first,
        category: 'Medication',
        icon: 'pill',
        done: isTaken(medication.id),
      };
    });

  const visits = appointments
    .filter((appointment) => appointment.date === today && isInMyDay(appointment.id))
    .map((appointment): MyDayItem => ({
      id: `appt:${appointment.id}`,
      title: appointment.title,
      description: appointment.location.name,
      time: appointment.time,
      category: 'Appointment',
      icon: 'calendar',
      done: done[`appt:${appointment.id}`] ?? false,
    }));

  const rest = routines.map((routine): MyDayItem => ({ ...routine, done: done[routine.id] ?? false }));

  return [...medicines, ...visits, ...rest].sort(
    (a, b) => a.time.localeCompare(b.time) || a.title.localeCompare(b.title),
  );
}

/** The medicine id behind a My Day row, or `null` for a routine or a visit. */
export function medicationIdOf(itemId: string): string | null {
  return itemId.startsWith('med:') ? itemId.slice('med:'.length) : null;
}
