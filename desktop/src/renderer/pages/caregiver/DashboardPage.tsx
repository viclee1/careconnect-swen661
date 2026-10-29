import { useEffect, useMemo, type ReactNode } from 'react';

import { Button } from '../../components/Button';
import { Icon, type IconName } from '../../components/Icon';
import { PageHeader } from '../../components/PageHeader';
import { getStoredTasks } from '../../data/tasksData';
import { useNavigation } from '../../navigation/NavigationProvider';
import { useAppointments } from '../../state/AppointmentsProvider';
import { useCaregiver } from '../../state/CaregiverProvider';
import { useMedicines } from '../../state/MedicinesProvider';
import { formatTime } from './ActivityPage';
import '../carePages.css';
import './caregiver.css';

/**
 * The caregiver's home: how the care recipient's day is going, at a glance,
 * with a way into each thing the caregiver looks after.
 */
export function DashboardPage() {
  const { navigate } = useNavigation();
  const { takenCount, totalCount } = useMedicines();
  const { appointments, hasLoaded, isLoading, load } = useAppointments();
  const { activity } = useCaregiver();
  // My Day saves as it is ticked off; read it fresh each time the page opens.
  const tasks = useMemo(() => getStoredTasks(), []);

  useEffect(() => {
    if (!hasLoaded && !isLoading) void load();
  }, [hasLoaded, isLoading, load]);

  const tasksDone = tasks.filter((task) => task.done).length;
  const checkIn = tasks.find((task) => task.category === 'Check-in');
  const next = appointments[0];
  const recent = activity.slice(0, 3);

  return (
    <>
      <PageHeader title="Dashboard" subtitle="How Margaret's day is going" />
      <div className="page-body">
        <div className="readable readable--wide stack">
          <ul className="stat-grid" aria-label="Today at a glance">
            <StatCard icon="medicines" label="Medicines">
              <p className="stat-card__value">
                {takenCount} of {totalCount} taken today
              </p>
              <Button
                className="stat-card__action"
                variant="outlined"
                label="Manage medicines"
                onClick={() => navigate({ name: 'ManageMedicines' })}
              />
            </StatCard>
            <StatCard icon="myDay" label="My Day">
              <p className="stat-card__value">
                {tasksDone} of {tasks.length} tasks done
              </p>
            </StatCard>
            <StatCard icon="person" label="Check-in">
              <p className="stat-card__value">
                {checkIn?.done ? 'Checked in today' : 'Not checked in yet'}
              </p>
            </StatCard>
            <StatCard icon="appointments" label="Next appointment">
              <p className="stat-card__value">
                {next
                  ? `${next.doctor}, ${next.date} at ${next.time}`
                  : hasLoaded
                    ? 'None booked'
                    : 'Loading…'}
              </p>
              <Button
                className="stat-card__action"
                variant="outlined"
                label="Manage appointments"
                onClick={() => navigate({ name: 'ManageAppointments' })}
              />
            </StatCard>
          </ul>

          <section aria-labelledby="recent-activity-heading" className="stack">
            <h2 id="recent-activity-heading">Recent activity</h2>
            {recent.length === 0 ? (
              <p>Nothing yet today. Medicines taken and tasks finished will appear here.</p>
            ) : (
              <ul className="care-list">
                {recent.map((event) => (
                  <li key={event.id} className="activity-row">
                    <span className="activity-row__text">
                      <p className="activity-row__label">{event.label}</p>
                    </span>
                    <time className="activity-row__time" dateTime={event.at.toISOString()}>
                      {formatTime(event.at)}
                    </time>
                  </li>
                ))}
              </ul>
            )}
            <Button
              className="care-inline-btn"
              variant="outlined"
              label="View all activity"
              onClick={() => navigate({ name: 'Activity' })}
            />
          </section>
        </div>
      </div>
    </>
  );
}

function StatCard({
  icon,
  label,
  children,
}: {
  icon: IconName;
  label: string;
  children: ReactNode;
}) {
  return (
    <li>
      <section className="stat-card" aria-label={label}>
        <h2 className="stat-card__label">
          <Icon name={icon} size={20} />
          {label}
        </h2>
        {children}
      </section>
    </li>
  );
}
