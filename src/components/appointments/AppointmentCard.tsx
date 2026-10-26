import { useId } from 'react';
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  ExternalLink,
  Home,
  Info,
  MapPin,
  Phone,
  User2,
  type LucideIcon,
} from 'lucide-react';

import {
  directionsUrl,
  escortFirstName,
  locationTypeLabel,
  whenLabel,
  type Appointment,
  type AppointmentLocationType,
} from '../../models/appointment';

const locationIcon: Record<AppointmentLocationType, LucideIcon> = {
  clinic: MapPin,
  hospital: Building2,
  telephone: Phone,
  home: Home,
};

/**
 * One upcoming visit: when, where, who is taking the user, the caregiver's
 * note, then directions and the My Day checkbox.
 *
 * An <article> labelled by its <h3>, not the team's Card, which is a labelled
 * <section>: eight visits would add eight landmarks to the page.
 */
export default function AppointmentCard({
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
    <article
      aria-labelledby={headingId}
      className={[
        'h-full flex flex-col gap-4 bg-white rounded-xl border-2 shadow-card p-5 md:p-6',
        isToday ? 'border-calm-400' : 'border-neutral-300',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 id={headingId} className="text-xl font-semibold text-neutral-800 leading-tight">
          {appointment.title}
        </h3>
        {isToday && (
          <span className="badge badge-calm flex-shrink-0">
            <CalendarDays className="w-4 h-4" aria-hidden="true" />
            Today
          </span>
        )}
      </div>

      <p className="flex items-start gap-3">
        <Clock className="w-5 h-5 text-neutral-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <time
          dateTime={`${appointment.date}T${appointment.time}`}
          className="text-lg font-bold text-neutral-800 leading-snug"
        >
          {whenLabel(appointment)}
        </time>
      </p>

      <div className="flex items-start gap-3">
        <LocationIcon className="w-5 h-5 text-calm-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="min-w-0">
          <p className="font-semibold text-neutral-800 leading-tight">{appointment.location.name}</p>
          {appointment.location.address && (
            <p className="text-neutral-600 mt-0.5">{appointment.location.address}</p>
          )}
          <p className="text-sm text-neutral-600 mt-0.5 font-medium">
            {locationTypeLabel[appointment.location.type]}
          </p>
        </div>
      </div>

      {escort && (
        <p className="flex items-center gap-3 bg-success-50 rounded-xl px-4 py-3 border border-success-200 text-success-800">
          <User2 className="w-5 h-5 text-success-700 flex-shrink-0" aria-hidden="true" />
          <span>
            <strong>{escort}</strong> is taking you to this appointment
          </span>
        </p>
      )}

      {appointment.notes && (
        <p className="flex items-start gap-3 bg-neutral-50 rounded-xl px-4 py-3 border border-neutral-200 text-neutral-700 leading-relaxed">
          <Info className="w-5 h-5 text-neutral-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <span>{appointment.notes}</span>
        </p>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-3 pt-4 border-t border-neutral-200">
        {directions ? (
          // A link, because it goes somewhere. The browser then offers
          // open-in-new-tab and copy-link for free.
          <a
            href={directions}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 min-h-[2.75rem] px-4 py-2 rounded-lg border-2 border-calm-600 bg-white font-semibold text-calm-700 hover:bg-calm-50 hover:text-calm-800 no-underline"
          >
            <MapPin className="w-4 h-4" aria-hidden="true" />
            Get directions
            <span className="sr-only"> to {appointment.location.name} (opens in a new tab)</span>
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
          </a>
        ) : (
          <span className="inline-flex items-center gap-2 text-sm font-medium text-success-800 bg-success-50 border border-success-200 rounded-lg px-3 py-2 min-h-[2.75rem]">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            No travel needed
          </span>
        )}

        {/* A real checkbox: Space toggles it, its state is announced, and
            focus stays put — a button swapped for a badge would drop focus
            to the page. The whole chip is the click target. */}
        <label
          htmlFor={myDayId}
          className={[
            'ml-auto inline-flex items-center gap-2 min-h-[2.75rem] px-3 py-2 rounded-lg border-2 cursor-pointer font-semibold select-none',
            'has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-calm-600 has-[:focus-visible]:outline-offset-2',
            inMyDay
              ? 'bg-success-50 border-success-600 text-success-800'
              : 'bg-calm-50 border-calm-600 text-calm-800 hover:bg-calm-100',
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
      </div>
    </article>
  );
}
