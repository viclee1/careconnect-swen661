import { useAuth } from '../state/AuthProvider';

export function StatusBar({ onShowShortcuts }: { onShowShortcuts?: () => void }) {
  const { user, isSignedIn } = useAuth();

  return (
    <footer className="status-bar" role="contentinfo" aria-label="Application status">
      <div className="status-bar__left">
        {isSignedIn ? (
          <>
            <span className="status-bar__item">
              <span className="status-bar__dot status-bar__dot--online" aria-hidden="true" />
              Connected · synced just now
            </span>
            <span className="status-bar__divider" aria-hidden="true">|</span>
            <span className="status-bar__item">
              Care Recipient · {user?.name ? `${user.name}'s plan` : "Margaret's plan"}
            </span>
            <span className="status-bar__divider" aria-hidden="true">|</span>
            <span className="status-bar__item status-bar__item--alert">
              3 active alerts
            </span>
          </>
        ) : (
          <span className="status-bar__item">
            <span className="status-bar__dot status-bar__dot--offline" aria-hidden="true" />
            Not signed in
          </span>
        )}
      </div>

      <div className="status-bar__right">
        <span className="status-bar__item">Zoom 100%</span>
        {onShowShortcuts ? (
          <button
            type="button"
            className="status-bar__shortcut-btn"
            onClick={onShowShortcuts}
            aria-label="Open keyboard shortcuts guide"
          >
            Press Ctrl/ for shortcuts
          </button>
        ) : (
          <span className="status-bar__item">Press Ctrl/ for shortcuts</span>
        )}
      </div>
    </footer>
  );
}
