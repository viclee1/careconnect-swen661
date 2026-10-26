import { useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

import PageHeader from '../components/PageHeader';
import AppointmentCard from '../components/appointments/AppointmentCard';
import AppointmentGroup from '../components/appointments/AppointmentGroup';
import CalendarExport from '../components/appointments/CalendarExport';
import { useAppointments } from '../context/appointments';
import { groupAppointments, upcomingCount, type Appointment } from '../models/appointment';
import { formatLongDate, localISODate } from '../utils/dates';

/**
 * The Appointments screen: upcoming visits grouped into Today, Later this week
 * and Coming up, each with where it is, who is taking the user, directions and
 * a My Day checkbox. Export to calendar saves them all as an .ics file with
 * silent, on-screen reminders.
 *
 * One column on a phone, two from 768px. Everything is read from this device,
 * so the screen works with no connection.
 */
export default function Appointments() {
  const { appointments, isInMyDay, setInMyDay } = useAppointments();
  const [today] = useState(() => localISODate());
  const groups = useMemo(() => groupAppointments(appointments, today), [appointments, today]);
  const count = upcomingCount(groups);
  const upcoming = [...groups.today, ...groups.thisWeek, ...groups.comingUp];

  const renderCards = (list: Appointment[], isToday: boolean) =>
    list.map((appointment) => (
      <li key={appointment.id}>
        <AppointmentCard
          appointment={appointment}
          isToday={isToday}
          inMyDay={isInMyDay(appointment.id)}
          onMyDayChange={(inMyDay) => setInMyDay(appointment.id, inMyDay)}
        />
      </li>
    ));

  return (
    <div className="space-y-8 page-container">
      <PageHeader
        title="My Appointments"
        subtitle={
          count === 0
            ? 'Upcoming visits, tests and calls'
            : `${count} upcoming visit${count === 1 ? '' : 's'}, tests and calls included`
        }
      />

      {count > 0 && <CalendarExport appointments={upcoming} />}

      {groups.today.length > 0 && (
        <AppointmentGroup id="group-today" label="Today" sub={formatLongDate(today)} highlight>
          {renderCards(groups.today, true)}
        </AppointmentGroup>
      )}

      {groups.thisWeek.length > 0 && (
        <AppointmentGroup id="group-week" label="Later this week">
          {renderCards(groups.thisWeek, false)}
        </AppointmentGroup>
      )}

      {groups.comingUp.length > 0 && (
        <AppointmentGroup id="group-coming" label="Coming up">
          {renderCards(groups.comingUp, false)}
        </AppointmentGroup>
      )}

      {count === 0 ? (
        <div className="bg-white rounded-xl border-2 border-neutral-300 shadow-card p-10 text-center space-y-3">
          <span
            className="inline-flex w-16 h-16 rounded-full bg-success-100 items-center justify-center mx-auto"
            aria-hidden="true"
          >
            <CheckCircle2 className="w-8 h-8 text-success-700" />
          </span>
          <h2 className="text-xl font-bold text-neutral-800">No upcoming appointments</h2>
          <p className="text-neutral-700">
            You’re all clear. New appointments will appear here when your caregiver books them.
          </p>
        </div>
      ) : (
        <p className="text-sm text-neutral-600 text-center pb-2">
          Your caregiver can add or change appointments for you. CareConnect never gives medical
          advice.
        </p>
      )}
    </div>
  );
}
