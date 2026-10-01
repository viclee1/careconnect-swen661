import type { ReactNode } from 'react';

import { Icon, type IconName } from './Icon';

/**
 * Shown in place of a list when there is nothing to show.
 *
 * An empty state always says what happened and what to do next, rather than
 * leaving a blank area the user has to interpret. It is deliberately distinct
 * from an error state: "No messages yet" tells a deaf user that nobody wrote,
 * which is a different fact from "we could not load your messages".
 */
export function EmptyState({
  icon,
  title,
  message,
  action,
}: {
  icon: IconName;
  title: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <Icon name={icon} size={44} />
      <h2 className="empty-state__title">{title}</h2>
      <p className="empty-state__message">{message}</p>
      {action}
    </div>
  );
}
