/** A scheduled visit with a care provider. */
export interface Appointment {
  id: string;
  doctor: string;
  specialty: string;
  /** Calendar date as the design prints it — "Sept 18, 2026". */
  date: string;
  /** Time of day as the design prints it — "10:00 am". */
  time: string;
  location: string;
}

/**
 * The single sentence assistive technology announces for this appointment —
 * everything the card shows visually, said as one sentence rather than four
 * separate lines.
 */
export function appointmentSemanticLabel(appointment: Appointment): string {
  return `Appointment with ${appointment.doctor}, ${appointment.specialty}, on ${appointment.date} at ${appointment.time}, at ${appointment.location}`;
}
