import type { ReactNode } from 'react';

/**
 * The title row shared by Contacts and an open conversation on a desktop: the
 * page's h1 and a line under it on the left, the page's main action on the
 * right. On a phone the action drops below the title at full width, where it
 * is easy to reach with a thumb.
 */
export default function ContactsPageHeader({
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
        <h1 className="text-2xl font-bold text-neutral-800">{title}</h1>
        <p className="text-neutral-600 mt-1">{subtitle}</p>
      </div>
      {action && <div className="[&>*]:w-full md:[&>*]:w-auto">{action}</div>}
    </div>
  );
}
