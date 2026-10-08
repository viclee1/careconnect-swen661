import { useState, useId } from 'react';
import { useNavigation } from '../navigation/NavigationProvider';
import { useAuth } from '../state/AuthProvider';
import { Icon } from '../components/Icon';
import { StatusBar } from '../components/StatusBar';

export function SignInPage({ onShowShortcuts }: { onShowShortcuts?: () => void }) {
  const { navigate } = useNavigation();
  const { signIn } = useAuth();
  const errorSummaryId = useId();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [globalError, setGlobalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate() {
    const next: typeof errors = {};
    if (!email.trim()) {
      next.email = 'Please enter your email address.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      next.email = 'Please enter a valid email address.';
    }
    if (!password) {
      next.password = 'Please enter your password.';
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
      const fields: Array<[keyof typeof next, string]> = [['email', 'email-input'], ['password', 'password-input']];
      const first = fields.find(([key]) => next[key]);
      if (first) requestAnimationFrame(() => document.getElementById(first[1])?.focus());
      return;
    }

    setIsSubmitting(true);
    const result = await signIn(email, password);
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
        <div className="auth-card" role="region" aria-label="Sign in form">
          <div className="auth-card__header">
            <h1 className="auth-card__title">Welcome back</h1>
            <p className="auth-card__subtitle">Sign in to your account.</p>
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
              <label className="field__label" htmlFor="email-input">
                Email address
              </label>
              <input
                id="email-input"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'email-input-error' : undefined}
                type="email"
                className="field__input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
              {errors.email && <span className="field__error" id="email-input-error">{errors.email}</span>}
            </div>

            <div className="field">
              <label className="field__label" htmlFor="password-input">
                Password
              </label>
              <input
                id="password-input"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'password-input-error' : undefined}
                type="password"
                className="field__input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              {errors.password && <span className="field__error" id="password-input-error">{errors.password}</span>}

              <div className="auth-form__forgot">
                <button
                  type="button"
                  className="auth-link-btn"
                  onClick={() => alert('Password reset link sent to your email.')}
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn--full auth-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="auth-card__footer">
            New here?{' '}
            <button
              type="button"
              className="auth-link-btn auth-link-btn--bold"
              onClick={() => navigate({ name: 'SignUp' })}
            >
              Create an account
            </button>
          </p>
        </div>
      </main>

      {/* Bottom Status Bar */}
      <StatusBar onShowShortcuts={onShowShortcuts} />
    </div>
  );
}
