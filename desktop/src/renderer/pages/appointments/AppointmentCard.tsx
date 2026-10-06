import { useId } from 'react';

import { Icon } from '../../components/Icon';
import type { Appointment } from '../../models/appointment';

/**
 * One upcoming appointment.
 *
 * Not focusable, because there is nothing to do with it: a Tab stop that does
 * nothing when activated is noise for a keyboard user. Screen-reader users
 * reach each card by its heading (`H`) or as a list item instead, and the
 * card's text is real text, so browse mode reads it a line at a time and
 * Ctrl/Cmd+C copies an address.
 */
export function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const headingId = useId();

  return (
    <article
      className="info-card"
      aria-labelledby={headingId}
      data-testid={`appointment-${appointment.id}`}
    >
      <div className="info-card__icon" aria-hidden="true">
        <Icon name="appointments" size={24} />
      </div>
      <div className="info-card__details">
        <h2 id={headingId} className="info-card__title">
          {appointment.doctor}
        </h2>
        <p className="info-card__subtitle">{appointment.specialty}</p>
        <p className="info-card__emphasis">
          <time>{appointment.date}</time> at <time>{appointment.time}</time>
        </p>
        <p className="info-card__meta">{appointment.location}</p>
      </div>
    </article>
  );
}
