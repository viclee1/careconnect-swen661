import { useState } from 'react';
import { useNavigation } from '../navigation/NavigationProvider';
import { Icon } from './Icon';

export function TopNotificationHeader({
  showCCBanner = false,
  onShowShortcuts,
}: {
  showCCBanner?: boolean;
  onShowShortcuts?: () => void;
}) {
  const { navigate, back, canGoBack } = useNavigation();
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // Read from the body so the state survives moving between Home and My Day.
  const [highContrast, setHighContrast] = useState(() =>
    document.body.classList.contains('high-contrast'),
  );

  return (
    <div className="top-notification-header">
      {/* Appointment Banner */}
      {!bannerDismissed && (
        <div className="notification-banner notification-banner--appointment" role="region" aria-label="Upcoming appointment notification">
          <div className="notification-banner__icon">
            <Icon name="appointments" size={20} />
          </div>
          <div className="notification-banner__content">
            <strong className="notification-banner__title">Upcoming appointment</strong>
            <p className="notification-banner__body">
              Blood pressure check with Dr. Sharma today at 10:30 am — Greenfield Surgery
            </p>
            <span className="notification-banner__time">Today at 10:30 am</span>
          </div>
          <div className="notification-banner__actions">
            <button
              type="button"
              className="banner-btn"
              onClick={() => setIsPaused(!isPaused)}
              aria-label={isPaused ? 'Resume reminder sound' : 'Pause reminder sound'}
            >
              {isPaused ? '▶ Resume' : '|| Pause'}
            </button>
            <button
              type="button"
              className="banner-btn banner-btn--primary"
              onClick={() => setBannerDismissed(true)}
              aria-label="OK, acknowledge upcoming appointment"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Closed Captions Banner (Home page) */}
      {showCCBanner && (
        <div className="notification-banner notification-banner--cc" role="region" aria-label="Captioned reminder notification">
          <span className="cc-tag">[CC]</span>
          <span className="notification-banner__cc-text">
            Upcoming: Video call with Maria at 3:00 PM — your daughter will call you.
          </span>
        </div>
      )}

      {/* App Toolbar */}
      <div className="app-toolbar" role="toolbar" aria-label="Desktop application controls">
        <div className="app-toolbar__left">
          <button
            type="button"
            className="toolbar-btn"
            disabled={!canGoBack}
            onClick={() => back()}
            aria-label="Go back"
          >
            &lt;
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => window.location.reload()}
            aria-label="Refresh page"
          >
            ↻
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => navigate({ name: 'Home' })}
            aria-label="Go to Home"
          >
            🏠
          </button>
        </div>

        <div className="app-toolbar__search">
          <div className="search-box">
            <Icon name="search" size={16} />
            <input
              type="search"
              className="search-box__input"
              // No shortcut is advertised here: Ctrl/Cmd+F is "Find a contact"
              // and opens the Contacts search, so promising it for this box
              // was untrue.
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search CareConnect"
            />
          </div>
        </div>

        <div className="app-toolbar__right">
          <span className="user-avatar" title="CareConnect User">
            CC
          </span>
          <button
            type="button"
            className="toolbar-icon-btn"
            aria-label="Toggle contrast mode"
            // A toggle has to say whether it is on (WCAG 4.1.2).
            aria-pressed={highContrast}
            onClick={() => {
              setHighContrast(document.body.classList.toggle('high-contrast'));
            }}
          >
            <Icon name="visibility" size={18} />
          </button>
          {onShowShortcuts && (
            <button
              type="button"
              className="toolbar-icon-btn"
              onClick={onShowShortcuts}
              aria-label="View keyboard shortcuts"
            >
              <Icon name="keyboard" size={18} />
            </button>
          )}
          <button
            type="button"
            className="toolbar-icon-btn"
            aria-label="Alerts"
            onClick={() => navigate({ name: 'Settings' })}
          >
            <Icon name="alert" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
