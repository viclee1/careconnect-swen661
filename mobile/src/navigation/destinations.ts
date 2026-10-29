import type { IconName } from '../components/Icon';

/** The top-level destinations, in the order the Week 3 prototype shows them. */
export type AppDestination =
  | 'Home'
  | 'MyDay'
  | 'Appointments'
  | 'Medicines'
  | 'Memories'
  | 'Contacts';

/** One item of the tab bar or tablet sidebar, for either role. */
export interface TabEntry {
  destination: string;
  icon: IconName;
  /** The cramped label used in the bottom bar — "Appts". */
  shortLabel: string;
  /** The full label used in accessibility announcements — "Appointments". */
  label: string;
}

export interface NavEntry {
  destination: AppDestination;
  icon: IconName;
  /** The cramped label used in the bottom bar — "Appts". */
  shortLabel: string;
  /** The full label used in accessibility announcements — "Appointments". */
  label: string;
  /** The team member building the screen, for the ones not on this branch. */
  owner?: string;
}

export const destinations: NavEntry[] = [
  { destination: 'Home', icon: 'home', shortLabel: 'Home', label: 'Home', owner: 'Justin' },
  { destination: 'MyDay', icon: 'wb-sunny', shortLabel: 'My Day', label: 'My Day', owner: 'Justin' },
  {
    destination: 'Appointments',
    icon: 'event',
    shortLabel: 'Appts',
    label: 'Appointments',
    owner: 'Rehman',
  },
  {
    destination: 'Medicines',
    icon: 'medication',
    shortLabel: 'Medicines',
    label: 'Medicines',
    owner: 'Rehman',
  },
  {
    destination: 'Memories',
    icon: 'photo-album',
    shortLabel: 'Memories',
    label: 'Memories',
    owner: 'Rehman',
  },
  { destination: 'Contacts', icon: 'people-outline', shortLabel: 'Contacts', label: 'Contacts' },
];

/** The caregiver's top-level screens. */
export type CaregiverDestination =
  | 'Dashboard'
  | 'ManageMedicines'
  | 'ManageAppointments'
  | 'Activity'
  | 'Notes';

/** The caregiver's tabs, in the web client's order. */
export const caregiverDestinations: (TabEntry & { destination: CaregiverDestination })[] = [
  { destination: 'Dashboard', icon: 'dashboard', shortLabel: 'Dashboard', label: 'Dashboard' },
  { destination: 'ManageMedicines', icon: 'medication', shortLabel: 'Medicines', label: 'Medicines' },
  { destination: 'ManageAppointments', icon: 'event', shortLabel: 'Appts', label: 'Appointments' },
  { destination: 'Activity', icon: 'timeline', shortLabel: 'Activity', label: 'Activity' },
  { destination: 'Notes', icon: 'note-alt', shortLabel: 'Notes', label: 'Notes' },
];
