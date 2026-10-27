import { useState } from 'react';
import { Calendar, Pill, Video, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { AppView } from '../types';
import MockVideoCall from '../components/MockVideoCall';

interface HomeProps {
  view: AppView;
}

export default function Home({ view: _view }: HomeProps) {
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [callSimulated, setCallSimulated] = useState(false);

  // Read tasks from localStorage to sync live progress with Schedule page
  const [tasks] = useState<{ done: boolean }[]>(() => {
    try {
      const raw = localStorage.getItem('careconnect_web_myday_tasks');
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }
    return [
      { done: true },
      { done: false },
      { done: false },
      { done: false },
      { done: false },
      { done: false },
      { done: false },
    ];
  });

  const doneCount = tasks.filter((t) => t.done).length;
  const totalCount = tasks.length || 7;
  const percentage = Math.round((doneCount / totalCount) * 100);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Simulate Incoming Call / Fake Video Call Modal */}
      {callSimulated && <MockVideoCall onClose={() => setCallSimulated(false)} />}

      {/* Top Appointment Banner */}
      {!bannerDismissed && (
        <div className="rounded-xl border-2 border-[#0f5272] bg-[#edf6fa] p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="w-10 h-10 rounded-lg bg-calm-600 text-white flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5" />
            </span>
            <div>
              <strong className="block text-base font-bold text-neutral-900">Upcoming appointment</strong>
              <p className="text-sm text-neutral-700 m-0">
                Blood pressure check with Dr. Sharma today at 10:30 am — Greenfield Surgery
              </p>
              <span className="text-xs text-neutral-500 mt-1 block">Today at 10:30 am</span>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end md:self-center">
            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              className="px-3 py-2 bg-white border border-neutral-300 rounded-lg text-sm font-semibold text-neutral-800 hover:bg-neutral-50 cursor-pointer"
            >
              {isPaused ? '▶ Resume' : '|| Pause'}
            </button>
            <button
              type="button"
              onClick={() => setBannerDismissed(true)}
              className="px-4 py-2 bg-calm-700 text-white rounded-lg text-sm font-bold hover:bg-calm-800 cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Closed Captions Banner */}
      <div className="bg-[#1e293b] text-white rounded-xl px-4 py-3 flex items-center gap-3 text-sm font-medium shadow-sm">
        <span className="bg-[#334155] px-2 py-0.5 rounded text-xs font-bold">
          [CC]
        </span>
        <span>Upcoming: Video call with Maria at 3:00 PM — your daughter will call you.</span>
      </div>

      {/* Greeting & Progress Header linked to Scheduling Page */}
      <Link
        to="/app/schedule"
        className="block no-underline group space-y-3 bg-white border-2 border-neutral-200 hover:border-calm-500 rounded-2xl p-6 shadow-sm transition-all cursor-pointer"
        aria-label={`View My Day schedule: ${doneCount} of ${totalCount} things done`}
      >
        <h1 className="text-3xl font-extrabold text-neutral-900 group-hover:text-calm-700 transition-colors">
          Here's your day, Margaret
        </h1>
        <div className="flex items-center justify-between text-base font-semibold text-neutral-700">
          <span>{doneCount} of {totalCount} things done today</span>
          <span className="text-calm-700 font-bold group-hover:underline flex items-center gap-1">
            View My Day →
          </span>
        </div>

        <div className="w-full bg-neutral-200 h-3 rounded-full overflow-hidden border border-neutral-300">
          <div
            className="bg-calm-700 h-full rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </Link>

      {/* NEXT THING TO DO Featured Card */}
      <section className="bg-white border-2 border-neutral-900 rounded-2xl p-6 shadow-md space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold tracking-wider text-neutral-500 uppercase">
            NEXT THING TO DO
          </span>
          <span className="px-3 py-1 bg-sky-100 text-sky-800 border border-sky-300 rounded-full text-xs font-semibold">
            Coming up
          </span>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-calm-100 text-calm-800 flex items-center justify-center flex-shrink-0">
            <Video className="w-7 h-7" />
          </div>
          <div>
            <span className="text-sm font-semibold text-neutral-500">Appointment 3:00 pm</span>
            <h2 className="text-2xl font-extrabold text-neutral-900 mt-0.5 mb-1">
              Video call with Maria
            </h2>
            <p className="text-neutral-600 text-base m-0">Your daughter — she will call you</p>
          </div>
        </div>

        <div className="space-y-3">
          <Link
            to="/app/contacts/c1"
            className="w-full flex items-center justify-between px-6 py-4 bg-calm-700 hover:bg-calm-800 text-white rounded-xl font-bold text-lg transition-colors no-underline shadow-sm"
          >
            <div className="flex items-center gap-3">
              <Video className="w-5 h-5" />
              <span>Video preview — 3:00 pm</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-semibold">|| Controls</span>
              <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-semibold">CC</span>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setCallSimulated(true)}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-neutral-900 hover:bg-neutral-50 text-neutral-900 rounded-xl font-bold text-lg transition-colors cursor-pointer"
          >
            <Bell className="w-5 h-5 text-calm-700" />
            <span>Simulate incoming call</span>
          </button>
        </div>
      </section>

      {/* Later Today Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-neutral-900">Later today</h2>

        <div className="bg-white border border-neutral-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-yellow-100 text-yellow-800 flex items-center justify-center flex-shrink-0">
            <Pill className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <strong className="block text-lg font-bold text-neutral-900">Atorvastatin</strong>
            <p className="text-sm text-neutral-600 m-0">20 mg — 1 tablet</p>
          </div>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 border border-yellow-300 rounded-lg text-xs font-semibold">
            Medication
          </span>
          <time className="text-base font-bold text-neutral-700 tabular-nums">8:00 pm</time>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <strong className="block text-lg font-bold text-neutral-900">Blood pressure check</strong>
            <p className="text-sm text-neutral-600 m-0">Greenfield Surgery — Dr. Sharma</p>
          </div>
          <span className="px-3 py-1 bg-sky-100 text-sky-800 border border-sky-300 rounded-lg text-xs font-semibold">
            Today
          </span>
          <time className="text-base font-bold text-neutral-700 tabular-nums">10:30 am</time>
        </div>
      </section>
    </div>
  );
}
