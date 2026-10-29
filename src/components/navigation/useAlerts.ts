import { useMemo } from 'react';

import { useAppointments } from '../../context/appointments';
import { useMedicines } from '../../context/medicines';
import { useMessages } from '../../context/messages';
import { byStartTime } from '../../models/appointment';
import { medicinesCount } from '../../models/medicine';
import { formatTime12, localISODate } from '../../utils/dates';

export interface AppAlert {
  id: string;
  /** The whole alert in words — it is never carried by a sound or a colour. */
  label: string;
  to: string;
}

/**
 * Everything waiting for the user, for the header badge, the sidebar's alerts
 * list and the status bar: unread conversations, medicines still to take and
 * today's visits. Each is a link to where it is dealt with.
 */
export function useAlerts(): AppAlert[] {
  const { contacts, waitingFor } = useMessages();
  const { progress } = useMedicines();
  const { appointments } = useAppointments();

  return useMemo(() => {
    const alerts: AppAlert[] = [];

    for (const contact of contacts) {
      const count = waitingFor(contact.id);
      if (count > 0) {
        alerts.push({
          id: `message-${contact.id}`,
          label: `${count} new message${count === 1 ? '' : 's'} from ${contact.name}`,
          to: `/app/contacts/${contact.id}`,
        });
      }
    }

    const left = progress.total - progress.taken;
    if (left > 0) {
      alerts.push({
        id: 'medicines',
        label: `${medicinesCount(left)} still to take today`,
        to: '/app/medicines',
      });
    }

    const today = localISODate();
    for (const appointment of [...appointments].sort(byStartTime)) {
      if (appointment.date !== today) continue;
      alerts.push({
        id: `appointment-${appointment.id}`,
        label: `${appointment.title} today at ${formatTime12(appointment.time)}`,
        to: '/app/appointments',
      });
    }

    return alerts;
  }, [contacts, waitingFor, progress, appointments]);
}

/** "1 alert" / "3 alerts" */
export function alertsLabel(count: number): string {
  return `${count} alert${count === 1 ? '' : 's'}`;
}
