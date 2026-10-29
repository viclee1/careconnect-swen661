import type { Appointment, AppointmentLocationType } from '../data/appointmentsData';
import { daysBetween, formatLongDate, formatTime12 } from '../utils/dates';

export type { Appointment, AppointmentLocationType };

/** How each kind of visit is described under its place name. */
export const locationTypeLabel: Record<AppointmentLocationType, string> = {
  clinic: 'Clinic visit',
  hospital: 'Hospital visit',
  telephone: 'Telephone — no travel needed',
  home: 'Home visit — they come to you',
};

/** "Thursday, 4 June — 2:30 pm" */
export function whenLabel(appointment: Pick<Appointment, 'date' | 'time'>): string {
  return `${formatLongDate(appointment.date)} — ${formatTime12(appointment.time)}`;
}

/** Whether the user has to go somewhere for this visit. */
export function needsTravel(appointment: Appointment): boolean {
  const { type, address } = appointment.location;
  return (type === 'clinic' || type === 'hospital') && Boolean(address);
}

/** A map search for the visit's place, or `null` when there is nowhere to go. */
export function directionsUrl(appointment: Appointment): string | null {
  if (!needsTravel(appointment)) return null;
  const { name, address } = appointment.location;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${address}`)}`;
}

/** Date, then time, earliest first. */
export function byStartTime(a: Appointment, b: Appointment): number {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1;
  if (a.time === b.time) return 0;
  return a.time < b.time ? -1 : 1;
}

export interface AppointmentGroups {
  today: Appointment[];
  thisWeek: Appointment[];
  comingUp: Appointment[];
}

/**
 * Splits upcoming visits into Today, Later this week (the next six days) and
 * Coming up. Past visits are dropped: the screen is about what is next.
 */
export function groupAppointments(appointments: Appointment[], today: string): AppointmentGroups {
  const groups: AppointmentGroups = { today: [], thisWeek: [], comingUp: [] };
  for (const appointment of [...appointments].sort(byStartTime)) {
    const days = daysBetween(today, appointment.date);
    if (days === 0) groups.today.push(appointment);
    else if (days >= 1 && days <= 6) groups.thisWeek.push(appointment);
    else if (days >= 7) groups.comingUp.push(appointment);
  }
  return groups;
}

/** Number of visits still to come, today included. */
export function upcomingCount(groups: AppointmentGroups): number {
  return groups.today.length + groups.thisWeek.length + groups.comingUp.length;
}

/** The first name of whoever is taking the user, for "Joyce is taking you". */
export function escortFirstName(appointment: Appointment): string | null {
  return appointment.caregiver ? appointment.caregiver.split(' ')[0] : null;
}

/** Appointment id → shown on My Day, for the choices the user has made. */
export type MyDayChoices = Record<string, boolean>;

/** Whether a visit is on My Day: the user's own choice, else the caregiver's. */
export function isOnMyDay(appointment: Appointment, choices: MyDayChoices): boolean {
  return choices[appointment.id] ?? appointment.isInMyDay;
}

/**
 * Turns whatever is in storage back into My Day choices. Anything that is not
 * an `id → boolean` pair is dropped instead of crashing the screen.
 */
export function reviveMyDayChoices(stored: unknown): MyDayChoices {
  if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return {};
  return Object.fromEntries(
    Object.entries(stored as Record<string, unknown>).filter(
      (entry): entry is [string, boolean] => typeof entry[1] === 'boolean',
    ),
  );
}
