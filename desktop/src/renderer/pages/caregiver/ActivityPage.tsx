import { EmptyState } from '../../components/EmptyState';
import { PageHeader } from '../../components/PageHeader';
import { useCaregiver, type ActivityKind } from '../../state/CaregiverProvider';
import './caregiver.css';

const kindLabel: Record<ActivityKind, string> = {
  med_taken: 'Medicine taken',
  med_untaken: 'Medicine unmarked',
  task_done: 'Task finished',
  check_in: 'Checked in',
};

/** "8:35 AM" — the time an event happened, as the log shows it. */
export function formatTime(at: Date): string {
  return at.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

/** Everything the care recipient has done this session, newest first. */
export function ActivityPage() {
  const { activity } = useCaregiver();

  return (
    <>
      <PageHeader title="Activity" subtitle="Medicines taken, tasks finished and check-ins" />
      <div className="page-body">
        <div className="readable stack">
          {activity.length === 0 ? (
            <EmptyState
              icon="activity"
              title="Nothing yet"
              message="When Margaret takes a medicine, finishes a task or checks in, it appears here."
            />
          ) : (
            <>
              <p role="status">
                {activity.length === 1 ? '1 event' : `${activity.length} events`} this session
              </p>
              <ul className="care-list" aria-label="Activity, newest first">
                {activity.map((event) => (
                  <li key={event.id} className="activity-row">
                    <span className="activity-row__text">
                      <p className="activity-row__label">{event.label}</p>
                      <p className="activity-row__kind">{kindLabel[event.kind]}</p>
                    </span>
                    <time className="activity-row__time" dateTime={event.at.toISOString()}>
                      {formatTime(event.at)}
                    </time>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </>
  );
}
