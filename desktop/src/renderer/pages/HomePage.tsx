import { useState, useEffect } from 'react';
import { useNavigation } from '../navigation/NavigationProvider';
import { useAuth } from '../state/AuthProvider';
import { Icon } from '../components/Icon';
import { TopNotificationHeader } from '../components/TopNotificationHeader';
import { StatusBar } from '../components/StatusBar';
import { MockVideoCall } from '../components/MockVideoCall';
import { getStoredTasks } from '../data/tasksData';

export function HomePage({ onShowShortcuts }: { onShowShortcuts?: () => void }) {
  const { navigate } = useNavigation();
  const { user } = useAuth();
  const [callSimulated, setCallSimulated] = useState(false);
  const [tasks, setTasks] = useState(getStoredTasks);

  // Keep tasks fresh when returning to home page
  useEffect(() => {
    setTasks(getStoredTasks());
  }, []);

  const userName = user?.name ? user.name.split(' ')[0] : 'Margaret';
  const doneCount = tasks.filter((t) => t.done).length;
  const totalCount = tasks.length;
  const percentage = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <div className="desktop-page-layout">
      {/* Active or Incoming Call Overlay */}
      {callSimulated && <MockVideoCall onClose={() => setCallSimulated(false)} />}

      {/* Top Banner & Navigation Header */}
      <TopNotificationHeader showCCBanner onShowShortcuts={onShowShortcuts} />

      {/* Main Content Body */}
      <div className="page-body">
        <div className="readable readable--wide stack">
          {/* Greeting Header */}
          <div className="home-header">
            <h1 className="home-header__title">
              Here's your day, {userName}
            </h1>
            <p className="home-header__subtitle">
              {doneCount} of {totalCount} things done today
            </p>

            <div className="myday-progress">
              <div
                className="myday-progress__bar"
                role="progressbar"
                aria-valuenow={doneCount}
                aria-valuemin={0}
                aria-valuemax={totalCount}
                aria-label={`${doneCount} of ${totalCount} things done today`}
              >
                <div
                  className="myday-progress__fill"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="myday-progress__label">
                {doneCount} of {totalCount} done
              </span>
            </div>
          </div>

          {/* NEXT THING TO DO Featured Card */}
          <section className="home-next-card" aria-label="Next thing to do">
            <div className="home-next-card__header">
              <span className="home-next-card__eyebrow">NEXT THING TO DO</span>
              <span className="badge badge--coming-up">Coming up</span>
            </div>

            <div className="home-next-card__body">
              <div className="home-next-card__icon" aria-hidden="true">
                <Icon name="video" size={32} />
              </div>

              <div className="home-next-card__details">
                <span className="home-next-card__time">Appointment 3:00 pm</span>
                <h2 className="home-next-card__title">Video call with Maria</h2>
                <p className="home-next-card__desc">Your daughter — she will call you</p>
              </div>
            </div>

            <div className="home-next-card__actions">
              <button
                type="button"
                className="home-action-btn home-action-btn--preview"
                onClick={() => navigate({ name: 'MessageThread', contactId: 'c1' })}
              >
                <Icon name="video" size={20} />
                <span>Video preview — 3:00 pm</span>
                <div className="home-action-btn__tags">
                  <span className="mini-tag">|| Controls</span>
                  <span className="mini-tag">CC</span>
                </div>
              </button>

              <button
                type="button"
                className="home-action-btn home-action-btn--simulate"
                onClick={() => setCallSimulated(true)}
              >
                <Icon name="notify" size={20} />
                <span>Simulate incoming call</span>
              </button>
            </div>
          </section>

          {/* Later Today Section */}
          <section className="home-later-section" aria-label="Later today">
            <h2 className="home-later-section__title">Later today</h2>

            <div className="home-task-card">
              <div className="home-task-card__icon" aria-hidden="true">
                <Icon name="medicines" size={24} />
              </div>

              <div className="home-task-card__info">
                <strong className="home-task-card__name">Atorvastatin</strong>
                <p className="home-task-card__meta">20 mg — 1 tablet</p>
              </div>

              <span className="badge badge--medication">Medication</span>
              <time className="home-task-card__time">8:00 pm</time>
            </div>
          </section>
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar onShowShortcuts={onShowShortcuts} />
    </div>
  );
}
