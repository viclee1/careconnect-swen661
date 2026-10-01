import { useNavigation } from '../navigation/NavigationProvider';
import { Icon } from '../components/Icon';
import { StatusBar } from '../components/StatusBar';

export function SplashPage({ onShowShortcuts }: { onShowShortcuts?: () => void }) {
  const { navigate } = useNavigation();

  return (
    <div className="splash-layout">
      {/* Top Header */}
      <header className="splash-header" role="banner">
        <div className="splash-header__logo">
          <span className="splash-header__logo-icon" aria-hidden="true">
            <Icon name="logo" size={24} />
          </span>
          <span className="splash-header__logo-text">
            <strong>CareConnect</strong>
          </span>
        </div>

        <nav aria-label="Account actions">
          <div className="splash-header__actions">
            <button
              type="button"
              className="btn btn--outlined splash-nav-btn"
              onClick={() => navigate({ name: 'SignIn' })}
            >
              Sign in
            </button>
            <button
              type="button"
              className="btn splash-nav-btn splash-nav-btn--primary"
              onClick={() => navigate({ name: 'SignUp' })}
            >
              Sign up
            </button>
          </div>
        </nav>
      </header>

      {/* Main Hero Section */}
      <main className="splash-main" id="main-content" tabIndex={-1}>
        <div className="splash-hero">
          <div className="splash-hero__content">
            <div className="splash-badge">
              <span className="splash-badge__icon" aria-hidden="true">
                <Icon name="accessibility" size={16} />
              </span>
              <span>Fully accessible — no sound required</span>
            </div>

            <h1 className="splash-hero__title">
              Your daily companion for calm, confident care.
            </h1>

            <p className="splash-hero__subtitle">
              For people who need a little help remembering, and the people who care for them.
            </p>

            <div className="splash-hero__buttons">
              <button
                type="button"
                className="btn splash-btn-primary"
                onClick={() => navigate({ name: 'SignUp' })}
              >
                Get started — it's free →
              </button>
              <button
                type="button"
                className="btn splash-btn-secondary"
                onClick={() => navigate({ name: 'SignIn' })}
              >
                I already have an account
              </button>
            </div>
          </div>

          <div className="splash-hero__card" role="region" aria-label="Hearing accessibility features">
            <h2 className="splash-card__title">Built for hearing accessibility</h2>

            <ul className="splash-card__list">
              <li className="splash-card__item">
                <div className="splash-card__icon splash-card__icon--orange">
                  <Icon name="visibility" size={22} />
                </div>
                <div>
                  <strong className="splash-card__item-title">Visual alerts</strong>
                  <p className="splash-card__item-text">
                    Flashing banners for every notification — no sound needed
                  </p>
                </div>
              </li>

              <li className="splash-card__item">
                <div className="splash-card__icon splash-card__icon--blue">
                  <Icon name="captions" size={22} />
                </div>
                <div>
                  <strong className="splash-card__item-title">Captions everywhere</strong>
                  <p className="splash-card__item-text">
                    Adjustable text for all audio &amp; video content
                  </p>
                </div>
              </li>

              <li className="splash-card__item">
                <div className="splash-card__icon splash-card__icon--yellow">
                  <Icon name="notify" size={22} />
                </div>
                <div>
                  <strong className="splash-card__item-title">Screen flash &amp; desktop alerts</strong>
                  <p className="splash-card__item-text">
                    The screen flashes and a banner pops for every reminder — no sound
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </main>

      {/* Bottom Status Bar */}
      <StatusBar onShowShortcuts={onShowShortcuts} />
    </div>
  );
}
