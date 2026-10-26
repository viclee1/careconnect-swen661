import type { ReactNode } from 'react';
import { CalendarDays } from 'lucide-react';

/**
 * A date group — Today, Later this week, Coming up. A <section> named by its
 * <h2>, so the cards' <h3>s sit under a real heading (axe heading-order) and
 * a screen-reader user can jump group to group.
 */
export default function AppointmentGroup({
  id,
  label,
  sub,
  highlight = false,
  children,
}: {
  id: string;
  label: string;
  sub?: string;
  highlight?: boolean;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <h2
          id={id}
          className={
            highlight
              ? 'm-0 inline-flex items-center gap-1.5 bg-calm-700 text-white text-sm font-bold px-4 py-1.5 rounded-pill uppercase tracking-wide'
              : 'm-0 text-sm font-bold text-neutral-600 uppercase tracking-widest'
          }
        >
          {highlight && <CalendarDays className="w-4 h-4" aria-hidden="true" />}
          {label}
        </h2>
        {sub && <span className="text-base font-medium text-neutral-700">{sub}</span>}
        <span className="flex-1 h-px bg-neutral-200 min-w-[2rem]" aria-hidden="true" />
      </div>
      <ul className="card-grid" role="list">
        {children}
      </ul>
    </section>
  );
}
