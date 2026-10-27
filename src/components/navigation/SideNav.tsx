import type { AppView } from '../../types';
import NavPanel, { type Orientation } from './NavPanel';
import type { AppAlert } from './useAlerts';

/**
 * The desktop sidebar (1024px and wider), as the web design lays it out.
 * Below 1024px it is display:none — out of the accessibility tree — and the
 * header's Menu button opens the same panel as a drawer (NavDrawer).
 */
export default function SideNav({
  view,
  orientation,
  alerts,
  caption,
}: {
  view: AppView;
  orientation: Orientation;
  alerts: AppAlert[];
  caption?: string;
}) {
  return (
    <nav
      aria-label="Main navigation"
      className={[
        'hidden lg:block order-1 flex-shrink-0 w-[17rem]',
        'bg-white border-r border-neutral-200',
        // Stays in view while the page scrolls, under the sticky header.
        'lg:sticky lg:top-[var(--header-height,4.25rem)] lg:self-start',
        'lg:h-[calc(100dvh-var(--header-height,4.25rem))] overflow-y-auto',
      ].join(' ')}
    >
      <NavPanel view={view} orientation={orientation} alerts={alerts} caption={caption} />
    </nav>
  );
}
