import { useState, useId } from 'react';
import { useNavigation } from '../navigation/NavigationProvider';
import { useAuth } from '../state/AuthProvider';
import { Icon } from '../components/Icon';
import { StatusBar } from '../components/StatusBar';

export function SignUpPage({ onShowShortcuts }: { onShowShortcuts?: () => void }) {
  const { navigate } = useNavigation();
  const { signUp } = useAuth();
  const errorSummaryId = useId();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [globalError, setGlobalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate() {
    const next: typeof errors = {};
    if (!name.trim()) {
      next.name = 'Please enter your name.';
    }
    if (!email.trim()) {
      next.email = 'Please enter your email address.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      next.email = 'Please enter a valid email address.';
    }
    if (!password) {
      next.password = 'Please create a password.';
    } else if (password.length < 6) {
      next.password = 'Password must be at least 6 characters.';
    }
    if (!confirmPassword) {
      next.confirmPassword = 'Please confirm your password.';
    } else if (confirmPassword !== password) {
      next.confirmPassword = 'Passwords do not match.';
    }
    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGlobalError('');
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) {
      // Put the user on the first field to fix; its error is its description
      // (WCAG 3.3.1), so a screen reader reads the problem with the field.
      const fields: Array<[keyof typeof next, string]> = [['name', 'name-input'], ['email', 'signup-email-input'], ['password', 'signup-password-input'], ['confirmPassword', 'confirm-password-input']];
      const first = fields.find(([key]) => next[key]);
      if (first) requestAnimationFrame(() => document.getElementById(first[1])?.focus());
      return;
    }

    setIsSubmitting(true);
    const result = await signUp(name, email, password);
    setIsSubmitting(false);

    if (result.error) {
      setGlobalError(result.error);
      return;
    }

    navigate({ name: 'Home' });
  }

  const hasErrors = Object.keys(errors).length > 0 || Boolean(globalError);

  return (
    <div className="auth-layout">
      {/* Header */}
      <header className="auth-header" role="banner">
        <button
          type="button"
          className="auth-header__logo-btn"
          onClick={() => navigate({ name: 'Splash' })}
          aria-label="Go to CareConnect homepage"
        >
          <span className="auth-header__logo-icon" aria-hidden="true">
            <Icon name="logo" size={24} />
          </span>
          <span className="auth-header__logo-text">
            <strong>CareConnect</strong>
          </span>
        </button>
      </header>

      {/* Main Content */}
      <main className="auth-main" id="main-content" tabIndex={-1}>
        <div className="auth-card" role="region" aria-label="Create account form">
          <div className="auth-card__header">
            <h1 className="auth-card__title">Create your account</h1>
            <p className="auth-card__subtitle">
              Free, private, and takes under two minutes.
            </p>
          </div>

          {hasErrors && (
            <div
              id={errorSummaryId}
              className="auth-error-banner"
              role="alert"
              aria-live="assertive"
            >
              {globalError || 'Please correct the errors below to continue.'}
            </div>
          )}

          <form noValidate onSubmit={handleSubmit} className="auth-form">
            <div className="field">
              <label className="field__label" htmlFor="name-input">
                Your name *
              </label>
              <input
                id="name-input"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'name-input-error' : undefined}
                type="text"
                className="field__input"
                placeholder="e.g. Dorothy Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
              <span className="field__hint">This is how CareConnect will greet you.</span>
              {errors.name && <span className="field__error" id="name-input-error">{errors.name}</span>}
            </div>

            <div className="field">
              <label className="field__label" htmlFor="signup-email-input">
                Email address *
              </label>
              <input
                id="signup-email-input"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'signup-email-input-error' : undefined}
                type="email"
                className="field__input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
              {errors.email && <span className="field__error" id="signup-email-input-error">{errors.email}</span>}
            </div>

            <div className="field">
              <label className="field__label" htmlFor="signup-password-input">
                Password *
              </label>
              <input
                id="signup-password-input"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'signup-password-input-error' : undefined}
                type="password"
                className="field__input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <span className="field__hint">At least 6 characters.</span>
              {errors.password && <span className="field__error" id="signup-password-input-error">{errors.password}</span>}
            </div>

            <div className="field">
              <label className="field__label" htmlFor="confirm-password-input">
                Confirm password *
              </label>
              <input
                id="confirm-password-input"
                aria-invalid={Boolean(errors.confirmPassword)}
                aria-describedby={errors.confirmPassword ? 'confirm-password-input-error' : undefined}
                type="password"
                className="field__input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              {errors.confirmPassword && (
                <span className="field__error" id="confirm-password-input-error">{errors.confirmPassword}</span>
              )}
            </div>

            <button
              type="submit"
              className="btn btn--full auth-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="auth-card__footer">
            Already have an account?{' '}
            <button
              type="button"
              className="auth-link-btn auth-link-btn--bold"
              onClick={() => navigate({ name: 'SignIn' })}
            >
              Sign in
            </button>
          </p>
        </div>
      </main>

      {/* Bottom Status Bar */}
      <StatusBar onShowShortcuts={onShowShortcuts} />
    </div>
  );
}
