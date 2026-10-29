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
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-neutral-800 leading-tight">{title}</h1>
        <p className="text-neutral-600 mt-1 text-lg">{subtitle}</p>
      </div>
      {action && <div className="[&>*]:w-full md:[&>*]:w-auto">{action}</div>}
    </div>
  );
}
