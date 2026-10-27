import { useOnlineStatus } from '../../hooks/useOnlineStatus';

/**
 * The thin bar along the foot of every screen in the design: whether the app
 * is connected, how many alerts are waiting, and the accessibility promise.
 * Connection state is a word, not only the coloured dot.
 */
export default function StatusBar({ alertCount }: { alertCount: number }) {
  const online = useOnlineStatus();

  return (
    <footer
      role="contentinfo"
      className="sticky bottom-0 z-30 border-t border-neutral-200 bg-neutral-50 px-4 lg:px-6 py-2 flex flex-wrap items-center justify-between gap-x-6 gap-y-1 text-sm text-neutral-600"
    >
      <p className="m-0 flex items-center gap-x-3 gap-y-1 flex-wrap">
        <span className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${online ? 'bg-success-600' : 'bg-warning-600'}`}
            aria-hidden="true"
          />
          {online ? 'Online · synced just now' : 'Offline · changes will sync when you reconnect'}
        </span>
        {alertCount > 0 && (
          <span className="text-alert-600 font-medium">
            {alertCount} active alert{alertCount === 1 ? '' : 's'}
          </span>
        )}
      </p>
      <p className="m-0 hidden md:block">WCAG 2.2 AA · No sound required</p>
    </footer>
  );
}
