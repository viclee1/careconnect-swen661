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

/** Maps a navigation menu command back to the destination it opens. */
export const destinationForCommand: Partial<Record<MenuCommand, AppDestination>> =
  Object.fromEntries(destinations.map((entry) => [entry.command, entry.destination]));
