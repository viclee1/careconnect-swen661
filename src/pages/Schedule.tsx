import { useState, useEffect } from 'react';
import { Pill, Calendar, Video, Heart } from 'lucide-react';

import AppointmentBanner from '../components/AppointmentBanner';

interface MyDayTask {
  id: string;
  title: string;
  description: string;
  time: string;
  category: string;
  done: boolean;
  icon: 'pill' | 'calendar' | 'video' | 'heart';
}

const defaultTasks: MyDayTask[] = [
  {
    id: 't1',
    title: 'Take Amlodipine',
    description: '5 mg — 1 tablet with food',
    time: '8:30 am',
    category: 'Medication',
    done: true,
    icon: 'pill',
  },
  {
    id: 't2',
    title: 'Morning check-in',
    description: "Tap to confirm you're doing well",
    time: '9:00 am',
    category: 'Check-in',
    done: false,
    icon: 'heart',
  },
  {
    id: 't3',
    title: 'Blood pressure check',
    description: 'Greenfield Surgery — Dr. Sharma',
    time: '10:30 am',
    category: 'Appointment',
    done: false,
    icon: 'calendar',
  },
  {
    id: 't4',
    title: 'Take Metformin',
    description: '500 mg — 1 tablet with lunch',
    time: '12:00 pm',
    category: 'Medication',
    done: false,
    icon: 'pill',
  },
  {
    id: 't5',
    title: 'Video call with Maria',
    description: 'Your daughter — she will call you',
    time: '3:00 pm',
    category: 'Appointment',
    done: false,
    icon: 'video',
  },
  {
    id: 't6',
    title: 'Take Atorvastatin',
    description: '20 mg — 1 tablet',
    time: '8:00 pm',
    category: 'Medication',
    done: false,
    icon: 'pill',
  },
  {
    id: 't7',
    title: 'Bedtime rest',
    description: 'Wind down for sleep',
    time: '9:30 pm',
    category: 'Rest',
    done: false,
    icon: 'calendar',
  },
];

const STORAGE_KEY = 'careconnect_web_myday_tasks';

export default function Schedule() {
  const [tasks, setTasks] = useState<MyDayTask[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const stored = JSON.parse(raw) as MyDayTask[];
        return defaultTasks.map((init) => {
          const found = stored.find((s) => s.id === init.id);
          return found ? { ...init, done: found.done } : init;
        });
      }
    } catch {
      // fallback
    }
    return defaultTasks;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // fallback
    }
  }, [tasks]);

  const doneCount = tasks.filter((t) => t.done).length;
  const totalCount = tasks.length;
  const percentage = Math.round((doneCount / totalCount) * 100);

  function toggleTask(id: string) {
    setTasks((current) =>
      current.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }

  const todayDateStr = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="space-y-6">
      <AppointmentBanner />
      <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Title & Subtitle */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-normal text-neutral-800">My Day</h1>
        <p className="text-neutral-600 text-base font-medium">
          Everything to do — {todayDateStr}
        </p>

        {/* Progress Bar Component */}
        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-sm font-bold text-neutral-700">
            <span>
              {doneCount} of {totalCount} done
            </span>
            <span className="text-calm-700">{percentage}%</span>
          </div>
          <div
            className="w-full bg-neutral-200 h-3 rounded-full overflow-hidden border border-neutral-300"
            role="progressbar"
            aria-valuenow={doneCount}
            aria-valuemin={0}
            aria-valuemax={totalCount}
            aria-label={`${doneCount} of ${totalCount} done`}
          >
            <div
              className="bg-calm-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Task List */}
      <ul className="space-y-3 list-none p-0 m-0" role="list">
        {tasks.map((task) => {
          const isDone = task.done;
          return (
            <li key={task.id}>
              <button
                type="button"
                onClick={() => toggleTask(task.id)}
                aria-pressed={isDone}
                className={`w-full text-left bg-white border-2 rounded-2xl p-5 flex items-center gap-4 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md ${
                  isDone
                    ? 'border-neutral-300 bg-neutral-50'
                    : 'border-neutral-200 hover:border-calm-500'
                }`}
              >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isDone ? 'bg-neutral-200 text-neutral-600' : 'bg-calm-100 text-calm-700'
                }`}>
                  {task.icon === 'pill' && <Pill className="w-6 h-6" />}
                  {task.icon === 'calendar' && <Calendar className="w-6 h-6" />}
                  {task.icon === 'video' && <Video className="w-6 h-6" />}
                  {task.icon === 'heart' && <Heart className="w-6 h-6" />}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <strong className={`text-lg font-bold ${isDone ? 'line-through text-neutral-500' : 'text-neutral-900'}`}>
                      {task.title}
                    </strong>
                    <span className="px-2.5 py-0.5 bg-neutral-100 text-neutral-700 rounded text-xs font-semibold">
                      {task.category}
                    </span>
                  </div>
                  <p className={`text-sm mt-0.5 m-0 ${isDone ? 'text-neutral-500' : 'text-neutral-600'}`}>
                    {task.description}
                  </p>
                </div>

                {/* Time & Check */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className={`text-sm font-bold tabular-nums ${isDone ? 'text-neutral-500' : 'text-calm-700'}`}>
                    {task.time}
                  </span>
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isDone
                      ? 'bg-success-600 border-success-600 text-white font-bold'
                      : 'border-neutral-300 bg-white'
                  }`}>
                    {isDone ? '✓' : ''}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
      </div>
    </div>
  );
}
