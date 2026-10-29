import {
  Activity,
  BookOpen,
  CalendarDays,
  Home,
  LayoutDashboard,
  ListChecks,
  Pill,
  Settings2,
  ShieldCheck,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import type { AppView } from '../../types';

export interface NavItem {
  to: string;
  label: string;
  Icon: LucideIcon;
}

/** One list per role, used by every navigation surface so they never differ. */
export const navItems: Record<AppView, NavItem[]> = {
  patient: [
    { to: '/app', label: 'Home', Icon: Home },
    { to: '/app/my-day', label: 'My Day', Icon: ListChecks },
    { to: '/app/appointments', label: 'Appointments', Icon: CalendarDays },
    { to: '/app/medicines', label: 'Medicines', Icon: Pill },
    { to: '/app/memories', label: 'Memories', Icon: BookOpen },
    { to: '/app/contacts', label: 'Contacts', Icon: Users },
  ],
  caregiver: [
    { to: '/app', label: 'Dashboard', Icon: LayoutDashboard },
    { to: '/app/manage-medicines', label: 'Medicines', Icon: Pill },
    { to: '/app/manage-appointments', label: 'Appointments', Icon: CalendarDays },
    { to: '/app/activity', label: 'Activity', Icon: Activity },
    { to: '/app/caregiver', label: 'Notes', Icon: ShieldCheck },
  ],
};

/** Below the main list, as the design pins it to the foot of the sidebar. */
export const settingsItem: NavItem = { to: '/app/settings', label: 'Settings', Icon: Settings2 };
