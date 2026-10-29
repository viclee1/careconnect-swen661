import type { IconName } from '../components/Icon';
import type { MenuCommand } from '../../shared/ipc';

/** The top-level destinations, in the order the Week 3 prototype shows them. */
export type AppDestination =
  | 'Home'
  | 'MyDay'
  | 'Appointments'
  | 'Medicines'
  | 'Memories'
  | 'Contacts';

export interface NavEntry {
  destination: AppDestination;
  icon: IconName;
  label: string;
  /** The menu command and accelerator that reach this page. */
  command: Extract<MenuCommand, `navigate:${string}`>;
  /** The digit shown beside the label — "Ctrl + 3". */
  digit: string;
}

export const destinations: NavEntry[] = [
  { destination: 'Home', icon: 'home', label: 'Home', command: 'navigate:home', digit: '1' },
  { destination: 'MyDay', icon: 'myDay', label: 'My Day', command: 'navigate:myDay', digit: '2' },
  {
    destination: 'Appointments',
    icon: 'appointments',
    label: 'Appointments',
    command: 'navigate:appointments',
    digit: '3',
  },
  {
    destination: 'Medicines',
    icon: 'medicines',
    label: 'Medicines',
    command: 'navigate:medicines',
    digit: '4',
  },
  {
    destination: 'Memories',
    icon: 'memories',
    label: 'Memories',
    command: 'navigate:memories',
    digit: '5',
  },
  {
    destination: 'Contacts',
    icon: 'contacts',
    label: 'Contacts',
    command: 'navigate:contacts',
    digit: '6',
  },
];

/** The caregiver's top-level pages. */
export type CaregiverDestination =
  | 'Dashboard'
  | 'ManageMedicines'
  | 'ManageAppointments'
  | 'Activity'
  | 'Notes';

export interface CaregiverNavEntry {
  destination: CaregiverDestination;
  icon: IconName;
  label: string;
}

/**
 * The caregiver's sidebar, in the web client's order. Only the Dashboard has a
 * shortcut — Ctrl + 1, the same key as the care recipient's Home — because the
 * native menu names the care recipient's pages and its other accelerators
 * belong to them.
 */
export const caregiverDestinations: CaregiverNavEntry[] = [
  { destination: 'Dashboard', icon: 'dashboard', label: 'Dashboard' },
  { destination: 'ManageMedicines', icon: 'medicines', label: 'Medicines' },
  { destination: 'ManageAppointments', icon: 'appointments', label: 'Appointments' },
  { destination: 'Activity', icon: 'activity', label: 'Activity' },
  { destination: 'Notes', icon: 'notes', label: 'Notes' },
];

/** Maps a navigation menu command back to the destination it opens. */
export const destinationForCommand: Partial<Record<MenuCommand, AppDestination>> =
  Object.fromEntries(destinations.map((entry) => [entry.command, entry.destination]));
