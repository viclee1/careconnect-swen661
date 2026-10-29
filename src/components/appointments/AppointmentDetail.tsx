import { useId } from 'react';
import { CalendarDays, CheckCircle2, Clock, ExternalLink, Info, User2 } from 'lucide-react';

import {
  directionsUrl,
  escortFirstName,
  locationTypeLabel,
  whenLabel,
  type Appointment,
} from '../../models/appointment';
import { locationIcon } from './locationIcon';

/**
 * The right-hand panel of the Appointments screen, as the web design draws
 * it: "Today" and the kind of visit, the title large, a card with when and
 * where, who is taking the user, the caregiver's note, and a full-width My
 * Day checkbox at the foot.
 */
export default function AppointmentDetail({
  appointment,
  isToday,
  inMyDay,
  onMyDayChange,
}: {
  appointment: Appointment;
  isToday: boolean;
  inMyDay: boolean;
  onMyDayChange: (inMyDay: boolean) => void;
}) {
  const headingId = useId();
  const myDayId = useId();
  const LocationIcon = locationIcon[appointment.location.type];
  const directions = directionsUrl(appointment);
  const escort = escortFirstName(appointment);

  return (
    <article aria-labelledby={headingId} className="space-y-4">
      <p className="m-0 flex items-center gap-3 flex-wrap">
        {isToday && (
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-calm-800 px-3 py-1 text-sm text-white uppercase">
            <CalendarDays className="w-4 h-4" aria-hidden="true" />
            Today
          </span>
        )}
        <span className="text-base text-neutral-600">{locationTypeLabel[appointment.location.type]}</span>
      </p>

      <h2 id={headingId} className="text-2xl md:text-3xl font-normal text-neutral-800 m-0 leading-tight">
        {appointment.title}
      </h2>

      <div className="rounded-xl bg-white p-4 md:p-5 space-y-3">
        <p className="m-0 flex items-start gap-3">
          <Clock className="w-5 h-5 text-calm-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <time dateTime={`${appointment.date}T${appointment.time}`} className="text-lg text-calm-700">
            {whenLabel(appointment)}
          </time>
        </p>
        <div className="flex items-start gap-3">
          <LocationIcon className="w-5 h-5 text-neutral-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="min-w-0">
            <p className="m-0 text-base text-neutral-800">{appointment.location.name}</p>
            {appointment.location.address && (
              <p className="m-0 text-sm text-neutral-600">{appointment.location.address}</p>
            )}
            {directions ? (
              <a
                href={directions}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 min-h-[2.75rem] text-base text-calm-700"
              >
                Get directions
                <span className="sr-only"> to {appointment.location.name} (opens in a new tab)</span>
                <ExternalLink className="w-4 h-4" aria-hidden="true" />
              </a>
            ) : (
              <p className="m-0 mt-1 inline-flex items-center gap-1.5 text-sm text-success-700">
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                No travel needed
              </p>
            )}
          </div>
        </div>
      </div>

      {escort && (
        <p className="m-0 flex items-center gap-3 rounded-xl bg-success-50 px-4 py-3 text-success-800">
          <span className="w-9 h-9 rounded-full bg-success-100 flex items-center justify-center flex-shrink-0" aria-hidden="true">
            <User2 className="w-5 h-5 text-success-700" />
          </span>
          <span>
            <strong>{escort}</strong> is taking you to this appointment
          </span>
        </p>
      )}

      {appointment.notes && (
        <p className="m-0 flex items-start gap-3 rounded-xl bg-white px-4 py-3 text-neutral-700">
          <Info className="w-5 h-5 text-neutral-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <span>{appointment.notes}</span>
        </p>
      )}

      {/* A real checkbox inside the design's big button: Space toggles it,
          its state is announced, and focus stays put. */}
      <label
        htmlFor={myDayId}
        className={[
          'w-full min-h-[3.5rem] flex items-center justify-center gap-3 rounded-xl px-6 text-lg cursor-pointer select-none',
          'has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-calm-600 has-[:focus-visible]:outline-offset-2',
          inMyDay ? 'bg-success-50 text-success-700 border-2 border-success-100' : 'bg-calm-800 text-white hover:bg-calm-900',
        ].join(' ')}
      >
        <input
          id={myDayId}
          type="checkbox"
          checked={inMyDay}
          onChange={(event) => onMyDayChange(event.target.checked)}
          aria-label={`${inMyDay ? 'In My Day' : 'Add to My Day'}: ${appointment.title}`}
          className="w-5 h-5 accent-success-600 cursor-pointer focus-visible:outline-none"
        />
        {inMyDay ? 'In My Day' : 'Add to My Day'}
      </label>
    </article>
  );
}
