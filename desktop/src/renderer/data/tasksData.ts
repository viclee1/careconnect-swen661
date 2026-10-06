import type { IconName } from '../components/Icon';

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: IconName;
  category: string;
  done: boolean;
}

export const initialTasks: TaskItem[] = [
  {
    id: 't1',
    title: 'Take Amlodipine',
    description: '5 mg — 1 tablet with food',
    time: '8:30 am',
    icon: 'medicines',
    category: 'Medication',
    done: true,
  },
  {
    id: 't2',
    title: 'Morning check-in',
    description: "Tap to confirm you're doing well",
    time: '9:00 am',
    icon: 'check',
    category: 'Check-in',
    done: false,
  },
  {
    id: 't3',
    title: 'Blood pressure check',
    description: 'Greenfield Surgery — Dr. Sharma',
    time: '10:30 am',
    icon: 'care',
    category: 'Appointment',
    done: false,
  },
  {
    id: 't4',
    title: 'Take Metformin',
    description: '500 mg — 1 tablet with lunch',
    time: '12:00 pm',
    icon: 'medicines',
    category: 'Medication',
    done: false,
  },
  {
    id: 't5',
    title: 'Video call with Maria',
    description: 'Your daughter — she will call you',
    time: '3:00 pm',
    icon: 'video',
    category: 'Appointment',
    done: false,
  },
  {
    id: 't6',
    title: 'Take Atorvastatin',
    description: '20 mg — 1 tablet',
    time: '8:00 pm',
    icon: 'medicines',
    category: 'Medication',
    done: false,
  },
  {
    id: 't7',
    title: 'Bedtime rest',
    description: 'Wind down for sleep',
    time: '9:30 pm',
    icon: 'myDay',
    category: 'Rest',
    done: false,
  },
];

const STORAGE_KEY = 'careconnect_desktop_myday_tasks';

export function getStoredTasks(): TaskItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const stored = JSON.parse(raw) as TaskItem[];
      return initialTasks.map((init) => {
        const found = stored.find((s) => s.id === init.id);
        return found ? { ...init, done: found.done } : init;
      });
    }
  } catch {
    // Ignore storage errors
  }
  return initialTasks;
}

export function saveStoredTasks(tasks: TaskItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // Ignore storage errors
  }
}
