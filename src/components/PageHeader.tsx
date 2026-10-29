import type { ReactNode } from 'react';

/**
 * A page's h1 with a line under it, and the page's main action. On a phone the
 * action drops under the title at full width, where a thumb reaches it; from
 * 768px it sits on the right.
 */
export default function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl md:text-3xl font-normal text-neutral-800 leading-tight">{title}</h1>
        <p className="text-neutral-600 mt-1 text-base">{subtitle}</p>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
