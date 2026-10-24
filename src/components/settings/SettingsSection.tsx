import { useId } from 'react';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

/**
 * A titled group of settings: a real <section> labelled by a real <h2>, so a
 * screen-reader user can move through the page by heading or by region.
 */
export default function SettingsSection({
  Icon,
  title,
  description,
  children,
}: {
  Icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
}) {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className="space-y-2">
      <h2 id={headingId} className="flex items-center gap-2 text-xl font-bold text-neutral-800">
        <Icon className="w-6 h-6 text-calm-600 flex-shrink-0" aria-hidden="true" />
        {title}
      </h2>
      <p className="text-neutral-600">{description}</p>
      <div className="card divide-y-2 divide-neutral-100">{children}</div>
    </section>
  );
}
