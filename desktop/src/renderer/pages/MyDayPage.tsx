import { useState, useEffect } from 'react';
import { Icon } from '../components/Icon';
import { TopNotificationHeader } from '../components/TopNotificationHeader';
import { getStoredTasks, saveStoredTasks, type TaskItem } from '../data/tasksData';

export function MyDayPage({ onShowShortcuts }: { onShowShortcuts?: () => void }) {
  const [tasks, setTasks] = useState<TaskItem[]>(getStoredTasks);

  useEffect(() => {
    saveStoredTasks(tasks);
  }, [tasks]);

  const doneCount = tasks.filter((t) => t.done).length;
  const totalCount = tasks.length;
  const percentage = Math.round((doneCount / totalCount) * 100);

  function toggleTask(id: string) {
    setTasks((current) =>
      current.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  }

  return (
    <div className="desktop-page-layout">
      {/* Top Banner & Navigation Header */}
      <TopNotificationHeader onShowShortcuts={onShowShortcuts} />

      {/* Main Content Body */}
      <div className="page-body">
        <div className="readable readable--wide stack">
          {/* Page Title & Subtitle */}
          <div className="myday-header">
            <h1 className="myday-header__title">My Day</h1>
            <p className="myday-header__subtitle">Everything to do — Thursday 4 June</p>

            <div className="myday-progress">
              <div
                className="myday-progress__bar"
                role="progressbar"
                aria-valuenow={doneCount}
                aria-valuemin={0}
                aria-valuemax={totalCount}
                aria-label={`${doneCount} of ${totalCount} done`}
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

          {/* Task List */}
          <ul className="myday-list" role="list">
            {tasks.map((task) => (
              <li key={task.id}>
                {/* A native toggle button: Tab, Enter and Space for free, and
                    aria-pressed announces done or not done. The name is the
                    card's own words (WCAG 2.5.3) rather than an aria-label
                    that said something else. */}
                <button
                  type="button"
                  className={`myday-card ${task.done ? 'myday-card--done' : ''}`}
                  onClick={() => toggleTask(task.id)}
                  aria-pressed={task.done}
                >
                  <span className="myday-card__icon" aria-hidden="true">
                    <Icon name={task.icon} size={22} />
                  </span>

                  <span className="myday-card__info">
                    <strong className="myday-card__title">{task.title}</strong>{' '}
                    <span className="myday-card__desc">{task.description}</span>{' '}
                    <span className="myday-card__time">{task.time}</span>
                  </span>

                  <span className="myday-card__check">
                    {task.done ? (
                      <span className="check-circle check-circle--active" aria-hidden="true">
                        ✓
                      </span>
                    ) : (
                      <span className="check-circle" aria-hidden="true" />
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
