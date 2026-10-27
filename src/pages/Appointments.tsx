import { useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

import AppointmentBanner from '../components/AppointmentBanner';
import PageHeader from '../components/PageHeader';
import AppointmentDetail from '../components/appointments/AppointmentDetail';
import AppointmentGroup from '../components/appointments/AppointmentGroup';
import AppointmentRow from '../components/appointments/AppointmentRow';
import CalendarExport from '../components/appointments/CalendarExport';
import { useAppointments } from '../context/appointments';
import { groupAppointments, upcomingCount, type Appointment } from '../models/appointment';
import { formatLongDate, localISODate } from '../utils/dates';

/**
 * The Appointments screen, laid out as the web design: upcoming visits in a
 * list on the left, grouped into Today, Later this week and Coming up, and
 * the chosen visit in detail on the right — where it is, who is taking the
 * user, directions and the My Day checkbox. On a phone the detail follows the
 * list. Export to calendar saves every visit as an .ics file with silent,
 * on-screen reminders.
 *
 * Everything is read from this device, so the screen works with no connection.
 */
export default function Appointments() {
  const { appointments, isInMyDay, setInMyDay } = useAppointments();
  const [today] = useState(() => localISODate());
  const groups = useMemo(() => groupAppointments(appointments, today), [appointments, today]);
  const count = upcomingCount(groups);
  const upcoming = [...groups.today, ...groups.thisWeek, ...groups.comingUp];
  const [selectedId, setSelectedId] = useState(() => upcoming[0]?.id);
  const selected = upcoming.find((a) => a.id === selectedId) ?? upcoming[0];

  const renderRows = (list: Appointment[], isToday: boolean) =>
    list.map((appointment) => (
      <li key={appointment.id}>
        <AppointmentRow
          appointment={appointment}
          isToday={isToday}
          selected={appointment.id === selected?.id}
          onSelect={() => setSelectedId(appointment.id)}
        />
      </li>
    ));

  return (
    <div className="space-y-5">
      <PageHeader title="My Appointments" subtitle="Upcoming visits, tests, and calls" />

      <AppointmentBanner />

      {count === 0 || !selected ? (
        <div className="bg-white rounded-xl border-2 border-neutral-300 p-10 text-center space-y-3">
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
        <div className="grid gap-5 md:grid-cols-[minmax(15rem,18rem)_1fr] lg:gap-6">
          <div className="space-y-5">
            <p className="sr-only">
              {count} upcoming visit{count === 1 ? '' : 's'}. Choose one to see the details.
            </p>
            {groups.today.length > 0 && (
              <AppointmentGroup id="group-today" label="Today" sub={formatLongDate(today)} highlight>
                {renderRows(groups.today, true)}
              </AppointmentGroup>
            )}
            {groups.thisWeek.length > 0 && (
              <AppointmentGroup id="group-week" label="Later this week">
                {renderRows(groups.thisWeek, false)}
              </AppointmentGroup>
            )}
            {groups.comingUp.length > 0 && (
              <AppointmentGroup id="group-coming" label="Coming up">
                {renderRows(groups.comingUp, false)}
              </AppointmentGroup>
            )}
            <CalendarExport appointments={upcoming} />
          </div>

          <div className="md:border-l md:border-neutral-200 md:pl-6">
            <AppointmentDetail
              appointment={selected}
              isToday={selected.date === today}
              inMyDay={isInMyDay(selected.id)}
              onMyDayChange={(inMyDay) => setInMyDay(selected.id, inMyDay)}
            />
          </div>
        </div>
      )}

      <p className="text-sm text-neutral-600 text-center pb-2">
        Your caregiver can add or change appointments for you. CareConnect never gives medical advice.
      </p>
    </div>
  );
}
