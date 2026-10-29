import { useId } from 'react';
import type { ReactNode } from 'react';

/**
 * A titled group of settings drawn as a white card with a small capitalised
 * heading, as the design shows. A real <section> labelled by a real <h2>, so a
 * screen-reader user can move through the page by heading or by region.
 */
export default function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className="rounded-2xl bg-white border border-neutral-200 shadow-card px-4 py-4 md:px-5"
    >
      <h2 id={headingId} className="text-sm font-bold uppercase tracking-wider text-neutral-600">
        {title}
      </h2>
      {description && <p className="text-sm text-neutral-600 mt-1">{description}</p>}
      <div className="divide-y divide-neutral-100">{children}</div>
    </section>
  );
}
