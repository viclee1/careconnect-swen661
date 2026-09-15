import type { Appointment } from '../models/appointment';

/** The upcoming appointments exactly as the Week 5 design carries them. */
export const mockAppointments: Appointment[] = [
  {
    id: 'appt1',
    doctor: 'Dr. Robert Chen',
    specialty: 'Cardiology',
    date: 'Sept 18, 2026',
    time: '10:00 am',
    location: 'Annapolis Medical Center',
  },
  {
    id: 'appt2',
    doctor: 'Dr. Sarah Jenkins',
    specialty: 'Primary Care',
    date: 'Oct 2, 2026',
    time: '2:30 pm',
    location: 'Acuity Health Clinic',
  },
];
