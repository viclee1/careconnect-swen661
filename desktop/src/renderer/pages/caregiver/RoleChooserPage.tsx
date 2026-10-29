import { Icon } from '../../components/Icon';
import { useNavigation } from '../../navigation/NavigationProvider';
import { useAuth, type Role } from '../../state/AuthProvider';
import './caregiver.css';

/**
 * After signing in: who is using CareConnect on this computer. The choice is
 * remembered, and the sidebar can switch it later.
 */
export function RoleChooserPage() {
  const { user, setRole } = useAuth();
  const { navigate } = useNavigation();
  const firstName = user?.name.split(' ')[0];

  function choose(role: Role) {
    setRole(role);
    navigate({ name: role === 'caregiver' ? 'Dashboard' : 'Home' });
  }

  return (
    <div className="auth-layout">
      <header className="auth-header" role="banner">
        <span className="auth-header__logo-btn">
          <span className="auth-header__logo-icon" aria-hidden="true">
            <Icon name="logo" size={24} />
          </span>
          <span className="auth-header__logo-text">
            <strong>CareConnect</strong>
          </span>
        </span>
      </header>

      <main className="auth-main" id="main-content" tabIndex={-1}>
        <div className="auth-card">
          <div className="auth-card__header">
            <h1 className="auth-card__title">{firstName ? `Welcome, ${firstName}` : 'Welcome'}</h1>
            <p className="auth-card__subtitle">Who is using CareConnect right now?</p>
          </div>

          <div className="role-choices">
            <button type="button" className="role-choice" onClick={() => choose('patient')}>
              <Icon name="person" size={28} />
              <span className="role-choice__text">
                <strong>I am the care recipient</strong>
                <span>My day, my medicines, and the people I talk to.</span>
              </span>
            </button>
            <button type="button" className="role-choice" onClick={() => choose('caregiver')}>
              <Icon name="care" size={28} />
              <span className="role-choice__text">
                <strong>I am a caregiver</strong>
                <span>How the day is going, and the medicines and visits I look after.</span>
              </span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
