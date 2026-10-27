import { useState } from 'react';
import { CalendarDays, Captions, Pause, Phone, Pill, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { AppView } from '../types';
import { useAuth } from '../auth/AuthContext';
import AppointmentBanner from '../components/AppointmentBanner';
import CaptionStrip from '../components/CaptionStrip';
import MockVideoCall from '../components/MockVideoCall';

interface HomeProps {
  view: AppView;
}

export default function Home({ view: _view }: HomeProps) {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'there';
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
    <div className="space-y-6">
      {/* Simulate Incoming Call / Fake Video Call Modal */}
      {callSimulated && <MockVideoCall onClose={() => setCallSimulated(false)} />}

      {/* Visual alert and its caption, full width as in the design */}
      <div className="space-y-1">
        <AppointmentBanner />
        <CaptionStrip>Upcoming: Video call with Maria at 3:00 PM — your daughter will call you.</CaptionStrip>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Greeting & progress, linked to My Day */}
        <section aria-labelledby="home-title" className="space-y-2">
          <h1 id="home-title" className="text-2xl md:text-3xl font-normal text-neutral-800 m-0">
            Here's your day, {firstName}
          </h1>
          <p className="text-base text-neutral-600 m-0 flex flex-wrap items-baseline justify-between gap-2">
            <span>
              {doneCount} of {totalCount} things done today
            </span>
            <Link to="/app/schedule" className="text-calm-700 font-medium">
              View My Day →
            </Link>
          </p>
          <div
            className="w-full bg-neutral-200 h-2.5 rounded-full overflow-hidden"
            role="progressbar"
            aria-label="Things done today"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percentage}
            aria-valuetext={`${doneCount} of ${totalCount} done`}
          >
            <div className="bg-calm-700 h-full rounded-full transition-all duration-300" style={{ width: `${percentage}%` }} />
          </div>
        </section>

        {/* NEXT THING TO DO */}
        <section
          aria-labelledby="next-title"
          className="bg-white border-2 border-calm-700 rounded-2xl p-4 md:p-5 space-y-4"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm tracking-wider text-neutral-600 uppercase">Next thing to do</span>
            <span className="px-3 py-1 bg-calm-50 text-calm-700 rounded-pill text-sm">Coming up</span>
          </div>

          <div className="flex items-start gap-4">
            <span className="w-14 h-14 rounded-xl bg-calm-50 text-calm-800 flex items-center justify-center flex-shrink-0" aria-hidden="true">
              <Phone className="w-6 h-6" />
            </span>
            <div>
              <p className="text-sm text-neutral-600 m-0">
                Appointment <span className="text-calm-700">3:00 pm</span>
              </p>
              <h2 id="next-title" className="text-xl md:text-2xl font-normal text-neutral-800 m-0">
                Video call with Maria
              </h2>
              <p className="text-neutral-600 text-base m-0">Your daughter — she will call you</p>
            </div>
          </div>

          <Link
            to="/app/contacts/c3"
            className="w-full min-h-[5.5rem] flex flex-col items-center justify-center gap-2 px-4 py-4 bg-calm-800 hover:bg-calm-900 text-white rounded-xl no-underline relative"
          >
            <span className="flex items-center gap-2 text-base">
              <Video className="w-5 h-5" aria-hidden="true" />
              Video preview — 3:00 pm
            </span>
            <span className="md:absolute md:right-3 md:bottom-3 flex items-center gap-1.5 text-sm" aria-hidden="true">
              <span className="bg-neutral-900 px-2 py-0.5 rounded flex items-center gap-1">
                <Pause className="w-3.5 h-3.5" /> Controls
              </span>
              <span className="bg-neutral-900 px-2 py-0.5 rounded flex items-center gap-1">
                <Captions className="w-3.5 h-3.5" /> CC
              </span>
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setCallSimulated(true)}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-calm-800 hover:bg-calm-900 text-white rounded-xl text-lg transition-colors"
          >
            <Video className="w-5 h-5" aria-hidden="true" />
            Simulate incoming call
          </button>
        </section>

        {/* Later today */}
        <section aria-labelledby="later-title" className="space-y-3">
          <h2 id="later-title" className="text-xl font-normal text-neutral-800 m-0">
            Later today
          </h2>

          <ul role="list" className="list-none p-0 m-0 space-y-3">
            <li className="bg-white rounded-xl p-4 flex items-center gap-4">
              <span className="w-12 h-12 rounded-xl bg-warning-50 text-warning-700 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                <Pill className="w-6 h-6" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-base text-neutral-800 m-0">Atorvastatin</p>
                <p className="text-sm text-neutral-600 m-0">20 mg — 1 tablet</p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="inline-block px-2.5 py-0.5 bg-warning-50 text-warning-700 rounded-pill text-sm">Medication</span>
                <p className="text-sm text-calm-700 m-0 mt-1 tabular-nums">8:00 pm</p>
              </div>
            </li>
            <li className="bg-white rounded-xl p-4 flex items-center gap-4">
              <span className="w-12 h-12 rounded-xl bg-calm-50 text-calm-700 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                <CalendarDays className="w-6 h-6" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-base text-neutral-800 m-0">Blood pressure check</p>
                <p className="text-sm text-neutral-600 m-0">Greenfield Surgery — Dr. Sharma</p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="inline-block px-2.5 py-0.5 bg-calm-50 text-calm-700 rounded-pill text-sm">Today</span>
                <p className="text-sm text-calm-700 m-0 mt-1 tabular-nums">10:30 am</p>
              </div>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
