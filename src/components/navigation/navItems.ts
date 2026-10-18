import {
  Activity,
  BookOpen,
  Calendar,
  CalendarDays,
  Home,
  LayoutDashboard,
  Phone,
  Pill,
  ShieldCheck,
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
    { to: '/app/schedule', label: 'My Day', Icon: Calendar },
    { to: '/app/appointments', label: 'Appointments', Icon: CalendarDays },
    { to: '/app/medications', label: 'Medicines', Icon: Pill },
    { to: '/app/memories', label: 'Memories', Icon: BookOpen },
    { to: '/app/contacts', label: 'Contacts', Icon: Phone },
  ],
  caregiver: [
    { to: '/app', label: 'Dashboard', Icon: LayoutDashboard },
    { to: '/app/manage-medications', label: 'Medications', Icon: Pill },
    { to: '/app/manage-appointments', label: 'Appointments', Icon: CalendarDays },
    { to: '/app/activity', label: 'Activity', Icon: Activity },
    { to: '/app/caregiver', label: 'Notes', Icon: ShieldCheck },
  ],
};
