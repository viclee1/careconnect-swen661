import { Building2, Home, MapPin, Phone, type LucideIcon } from 'lucide-react';

import type { AppointmentLocationType } from '../../models/appointment';

/** The icon for each kind of visit, in the list and the detail panel. */
export const locationIcon: Record<AppointmentLocationType, LucideIcon> = {
  clinic: MapPin,
  hospital: Building2,
  telephone: Phone,
  home: Home,
};
