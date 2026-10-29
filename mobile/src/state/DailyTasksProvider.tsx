import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { DailyTask } from '../models/DailyTask';
import { DailyTasksRepository } from '../data/dailyTasksRepository';
import { activityForTask } from '../models/caregiver';
import { useActivityRecorder } from './CaregiverProvider';

interface DailyTasksContextValue {
  tasks: DailyTask[];
  doneCount: number;
  totalCount: number;
  progress: number;
  showNotification: boolean;
  toggleTask: (id: string) => void;
  dismissNotification: () => void;
}

const DailyTasksContext = createContext<DailyTasksContextValue | null>(null);

export function DailyTasksProvider({
  repository,
  children,
}: {
  repository: DailyTasksRepository;
  children: React.ReactNode;
}) {
  const [tasks, setTasks] = useState(() => repository.getTasks());
  const record = useActivityRecorder();
  const [showNotification, setShowNotification] = useState(() => repository.isNotificationVisible());

  const doneCount = useMemo(() => tasks.filter((t) => t.isDone).length, [tasks]);
  const totalCount = tasks.length;
  const progress = totalCount === 0 ? 0 : doneCount / totalCount;

  const toggleTask = useCallback(
    (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (task) {
        const nextDone = !task.isDone;
        repository.updateTask(id, nextDone);
        setTasks(repository.getTasks());
        // Finishing something is news for the caregiver; un-ticking a slip is not.
        if (nextDone) {
          const event = activityForTask(task);
          record(event.kind, event.label);
        }
      }
    },
    [tasks, repository, record]
  );

  const dismissNotification = useCallback(() => {
    repository.dismissNotification();
    setShowNotification(false);
  }, [repository]);

  const value = useMemo(
    () => ({
      tasks,
      doneCount,
      totalCount,
      progress,
      showNotification,
      toggleTask,
      dismissNotification,
    }),
    [tasks, doneCount, totalCount, progress, showNotification, toggleTask, dismissNotification]
  );

  return <DailyTasksContext.Provider value={value}>{children}</DailyTasksContext.Provider>;
}

export function useDailyTasks() {
  const context = useContext(DailyTasksContext);
  if (!context) {
    throw new Error('useDailyTasks must be used within a DailyTasksProvider');
  }
  return context;
}
