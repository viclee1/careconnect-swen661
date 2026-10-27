import { whenLabel, type Appointment } from '../../models/appointment';
import { locationIcon } from './locationIcon';

/**
 * One visit in the list on the left of the Appointments screen: icon, title,
 * when, and a "Today" pill. Choosing it shows the visit in the detail panel;
 * aria-current marks the one shown.
 */
export default function AppointmentRow({
  appointment,
  isToday,
  selected,
  onSelect,
}: {
  appointment: Appointment;
  isToday: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = locationIcon[appointment.location.type];

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={selected ? 'true' : undefined}
      className={[
        'w-full flex items-start gap-3 rounded-xl border-2 p-3 text-left transition-colors',
        selected ? 'border-calm-700 bg-calm-50' : 'border-transparent bg-white hover:border-neutral-300',
      ].join(' ')}
    >
      <span className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0" aria-hidden="true">
        <Icon className="w-5 h-5 text-calm-700" />
      </span>
      <span className="min-w-0">
        <span className="block text-base text-neutral-800 leading-snug">{appointment.title}</span>
        <span className="block text-sm text-neutral-600">{whenLabel(appointment)}</span>
        {isToday && (
          <span className="inline-block mt-1 rounded-pill bg-calm-50 px-2.5 text-sm text-calm-700">Today</span>
        )}
      </span>
    </button>
  );
}
