import type { ReactNode } from 'react';

import { Icon, type IconName } from './Icon';

export type AlertTone = 'info' | 'warning' | 'error' | 'success';

const toneIcons: Record<AlertTone, IconName> = {
  info: 'info',
  warning: 'warning',
  error: 'error',
  success: 'success',
};

/**
 * A prominent, always-visible banner.
 *
 * This is the component that satisfies the assigned constraints "No sound-only
 * alerts" and "Clear visual notifications": every alert in CareConnect renders
 * one of these, carrying an icon, a title in words, and a body that says what
 * happened rather than merely that something did.
 *
 * It is never a toast. Nothing in this application disappears on a timer — a
 * user who is reading slowly, or who looked away, must not lose the message.
 * `role="status"` announces it once when it appears and leaves it on screen.
 */
export function AlertBanner({
  title,
  message,
  tone = 'info',
  icon,
  action,
}: {
  title: string;
  message: string;
  tone?: AlertTone;
  /** Overrides the icon the tone would otherwise choose. */
  icon?: IconName;
  /** Optional control underneath, e.g. a "Try again" button. */
  action?: ReactNode;
}) {
  return (
    <div
      className={`banner banner--${tone}`}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      <div className="banner__heading">
        <Icon name={icon ?? toneIcons[tone]} size={24} />
        <h2 className="banner__title">{title}</h2>
      </div>
      <p className="banner__message">{message}</p>
      {action ? <div className="banner__action">{action}</div> : null}
    </div>
  );
}
