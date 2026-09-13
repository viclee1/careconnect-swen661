import { DailyTask } from '../models/DailyTask';

export interface DailyTasksRepository {
  getTasks(): DailyTask[];
  updateTask(id: string, isDone: boolean): void;
  isNotificationVisible(): boolean;
  dismissNotification(): void;
}

export function createMockDailyTasksRepository(): DailyTasksRepository {
  let notificationVisible = true;
  let tasks: DailyTask[] = [
    {
      id: '1',
      title: 'Take Amlodipine',
      subtitle: '5 mg — 1 tablet with food',
      time: '8:30 am',
      icon: 'medication',
      isDone: false,
    },
    {
      id: '2',
      title: 'Morning check-in',
      subtitle: "Tap to confirm you're doing well",
      time: '9:00 am',
      icon: 'check-box',
      isDone: false,
    },
    {
      id: '3',
      title: 'Blood pressure check',
      subtitle: 'Greenfield Surgery — Dr. Sharma',
      time: '10:30 am',
      icon: 'monitor-heart',
      isDone: false,
    },
    {
      id: '4',
      title: 'Take Metformin',
      subtitle: '500 mg — 1 tablet with lunch',
      time: '12:00 pm',
      icon: 'medication',
      isDone: false,
    },
    {
      id: '5',
      title: 'Video call with Maria',
      subtitle: 'Your daughter will call you',
      time: '3:00 pm',
      icon: 'video-call',
      isDone: false,
    },
    {
      id: '6',
      title: 'Take Atorvastatin',
      subtitle: '20 mg — 1 tablet at night',
      time: '8:00 pm',
      icon: 'medication',
      isDone: false,
    },
    {
      id: '7',
      title: 'Evening check-in',
      subtitle: "Tap to confirm you're doing well",
      time: '9:00 pm',
      icon: 'check-box',
      isDone: false,
    },
  ];

  return {
    getTasks: () => tasks,
    updateTask: (id, isDone) => {
      tasks = tasks.map((t) => (t.id === id ? { ...t, isDone } : t));
    },
    isNotificationVisible: () => notificationVisible,
    dismissNotification: () => {
      notificationVisible = false;
    },
  };
}
